/*
 * Teleport
 * Copyright (C) 2023  Gravitational, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package postgres

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/gravitational/trace"
	"github.com/jackc/pgx/v4"
	"github.com/lib/pq"

	"github.com/gravitational/teleport/api/types"
	apiawsutils "github.com/gravitational/teleport/api/utils/aws"
	"github.com/gravitational/teleport/lib/srv/db/common"
	"github.com/gravitational/teleport/lib/srv/db/common/permissions"
)

// connectAsAdmin connect to the database from db route as admin user.
// If useDefaultDatabase is true and a default database is configured for the admin user, it will be used instead.
func (e *Engine) connectAsAdmin(ctx context.Context, sessionCtx *common.Session, useDefaultDatabase bool) (*pgx.Conn, error) {
	loginDatabase := sessionCtx.DatabaseName
	if useDefaultDatabase && sessionCtx.Database.GetAdminUser().DefaultDatabase != "" {
		loginDatabase = sessionCtx.Database.GetAdminUser().DefaultDatabase
	} else {
		e.Log.WithField("database", loginDatabase).Info("Connecting to session database")
	}
	conn, err := e.pgxConnect(ctx, sessionCtx.WithUserAndDatabase(sessionCtx.Database.GetAdminUser().Name, loginDatabase))
	return conn, trace.Wrap(err)
}

// ActivateUser creates or enables the database user.
func (e *Engine) ActivateUser(ctx context.Context, sessionCtx *common.Session) error {
	if sessionCtx.Database.GetAdminUser().Name == "" {
		return trace.BadParameter("Teleport does not have admin user configured for this database")
	}

	if sessionCtx.Database.IsRDS() &&
		sessionCtx.Database.GetEndpointType() == apiawsutils.RDSEndpointTypeReader {
		return trace.BadParameter("auto-user provisioning is not supported for RDS reader endpoints")
	}

	conn, err := e.connectAsAdmin(ctx, sessionCtx, true)
	if err != nil {
		return trace.Wrap(err)
	}
	defer conn.Close(ctx)

	// We could call this once when the database is being initialized but
	// doing it here has a nice "self-healing" property in case the Teleport
	// bookkeeping group or stored procedures get deleted or changed offband.
	err = e.initAutoUsers(ctx, sessionCtx, conn)
	if err != nil {
		return trace.Wrap(err)
	}

	roles, err := prepareRoles(sessionCtx)
	if err != nil {
		return trace.Wrap(err)
	}

	e.Log.WithField("user", sessionCtx.DatabaseUser).WithField("roles", roles).Info("Activating PostgreSQL user")

	_, err = conn.Exec(ctx, activateQuery, sessionCtx.DatabaseUser, roles)
	if err != nil {
		e.Log.WithError(err).Debug("Call teleport_activate_user failed.")
		return trace.Wrap(convertActivateError(sessionCtx, err))
	}

	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			return trace.AlreadyExists("user %q already exists in this PostgreSQL database and is not managed by Teleport", sessionCtx.DatabaseUser)
		}
		return trace.Wrap(err)
	}

	err = e.applyPermissions(ctx, sessionCtx)
	if err != nil {
		e.Log.WithError(err).Warn("Failed to apply permissions.")
		return trace.Wrap(err)
	}
	return nil
}

// TablePermission is the represents a permission for particular database table.
type TablePermission struct {
	Privilege string `json:"privilege"`
	Schema    string `json:"schema"`
	Table     string `json:"table"`
}

type Permissions struct {
	Tables []TablePermission `json:"tables"`
}

var pgTablePerms = map[string]struct{}{
	"SELECT":     {},
	"INSERT":     {},
	"UPDATE":     {},
	"DELETE":     {},
	"TRUNCATE":   {},
	"REFERENCES": {},
	"TRIGGER":    {},
}

func checkPgPermission(objKind, perm string) error {
	// for now, only tables are supported. ignore other kinds of objects.
	if objKind != permissions.ObjectKindTable {
		return nil
	}

	normalized := strings.ToUpper(strings.TrimSpace(perm))
	_, found := pgTablePerms[normalized]
	if !found {
		return trace.BadParameter("unrecognized %q Postgres permission: %q", objKind, perm)
	}
	return nil
}

// convertPermissions converts the permissions into a stable format expected by the stored procedure. It also filters out any unsupported objects.
func convertPermissions(perms permissions.PermissionSet) (*Permissions, error) {
	var out Permissions
	var errors []error
	for permission, objects := range perms {
		for _, obj := range objects {
			if err := checkPgPermission(obj.GetSpec().ObjectKind, permission); err != nil {
				errors = append(errors, err)
				continue
			}
			if obj.GetSpec().ObjectKind == permissions.ObjectKindTable {
				out.Tables = append(out.Tables, TablePermission{
					Privilege: permission,
					Schema:    obj.GetSpec().Schema,
					Table:     obj.GetSpec().Name,
				})
			}
		}
	}
	if len(errors) > 0 {
		return nil, trace.NewAggregate(errors...)
	}
	return &out, nil
}

func (e *Engine) granularPermissionsEnabled(sessionCtx *common.Session) bool {
	allow, _, _ := sessionCtx.Checker.GetDatabasePermissions(sessionCtx.Database)
	if len(allow) == 0 {
		return false
	}

	if len(sessionCtx.DatabaseRoles) > 0 {
		return false
	}

	return true
}

func (e *Engine) applyPermissions(ctx context.Context, sessionCtx *common.Session) error {
	allow, _, err := sessionCtx.Checker.GetDatabasePermissions(sessionCtx.Database)
	if err != nil {
		e.Log.WithError(err).Error("Failed to calculate effective database permissions.")
		return trace.Wrap(err)
	}
	if len(allow) == 0 {
		e.Log.Info("Skipping applying fine-grained permissions: none to apply.")
		return nil
	}

	if len(sessionCtx.DatabaseRoles) > 0 {
		e.Log.WithField("roles", sessionCtx.DatabaseRoles).Error("Cannot apply fine-grained permissions: non-empty list of database roles.")
		return trace.BadParameter("fine-grained database permissions and database roles are mutually exclusive, yet both were provided.")
	}

	rules, err := e.AuthClient.GetDatabaseObjectImportRules(ctx)
	if err != nil {
		return trace.Wrap(err)
	}

	conn, err := e.connectAsAdmin(ctx, sessionCtx, false)
	if err != nil {
		e.Log.WithError(err).Error("Failed to connect to the database.")
		return trace.Wrap(err)
	}
	defer conn.Close(ctx)

	objsFetched, err := fetchDatabaseObjects(ctx, sessionCtx, conn)
	if err != nil {
		return trace.Wrap(err)
	}
	counts, countMap := permissions.CountObjectKinds(objsFetched)
	e.Log.WithField("kind_counts", countMap).WithField("total", len(objsFetched)).Infof("Fetched %v objects from the database (%v).", len(objsFetched), counts)

	objsTagged := permissions.ApplyDatabaseObjectImportRules(rules, sessionCtx.Database, objsFetched)
	counts, countMap = permissions.CountObjectKinds(objsTagged)
	e.Log.WithField("kind_counts", countMap).WithField("total", len(objsFetched)).Infof("Tagged %v database objects (%v).", len(objsTagged), counts)

	permissionSet, err := permissions.CalculatePermissions(sessionCtx.Checker, sessionCtx.Database, objsTagged)
	if err != nil {
		return trace.Wrap(err)
	}
	summary, eventData := permissions.SummarizePermissions(permissionSet)
	e.Log.WithField("user", sessionCtx.DatabaseUser).Infof("Calculated database permissions: %v.", summary)
	e.auditUserPermissions(sessionCtx, eventData)

	perms, err := convertPermissions(permissionSet)
	if err != nil {
		return trace.Wrap(err)
	}

	// teleport_remove_permissions and teleport_update_permissions are created in pg_temp table of the session database.
	// teleport_remove_permissions gets called by teleport_update_permissions as needed.
	_, err = conn.Exec(ctx, removePermissionsProc)
	if err != nil {
		e.Log.WithError(err).Errorf("Creating temporary stored procedure %q failed.", removePermissionsProcName)
		return trace.Wrap(err)
	}

	_, err = conn.Exec(ctx, updatePermissionsProc)
	if err != nil {
		e.Log.WithError(err).Errorf("Creating temporary stored procedure %q failed.", updatePermissionsProcName)
		return trace.Wrap(err)
	}

	_, err = conn.Exec(ctx, updatePermissionsQuery, sessionCtx.DatabaseUser, perms)
	if err != nil {
		var pgErr *pq.Error
		if errors.As(err, &pgErr) {
			if pgErr.Code == common.SQLStatePermissionsChanged {
				e.Log.WithError(err).WithField("user", sessionCtx.DatabaseUser).Error("Permissions have changed, rejecting connection.")
			}
		} else {
			e.Log.WithError(err).WithField("user", sessionCtx.DatabaseUser).Error("Failed to update permissions.")
		}
		return trace.Wrap(err)
	}
	return nil
}

func (e *Engine) removePermissions(ctx context.Context, sessionCtx *common.Session) error {
	if !e.granularPermissionsEnabled(sessionCtx) {
		e.Log.WithField("user", sessionCtx.DatabaseUser).Info("Granular database permissions not enabled, skipping removal step.")
		return nil
	}

	e.Log.WithField("user", sessionCtx.DatabaseUser).Info("Removing permissions from PostgreSQL user")
	conn, err := e.connectAsAdmin(ctx, sessionCtx, false)
	if err != nil {
		return trace.Wrap(err)
	}
	defer conn.Close(ctx)

	// teleport_remove_permissions is created in pg_temp table of the session database.
	_, err = conn.Exec(ctx, removePermissionsProc)
	if err != nil {
		e.Log.WithError(err).Errorf("Creating temporary stored procedure %q failed.", removePermissionsProcName)
		return trace.Wrap(err)
	}

	_, err = conn.Exec(ctx, removePermissionsQuery, sessionCtx.DatabaseUser)
	if err != nil {
		e.Log.WithError(err).WithField("user", sessionCtx.DatabaseUser).Error("Removing permissions from user failed.")
		return trace.Wrap(err)
	}
	return nil
}

// DeactivateUser disables the database user.
func (e *Engine) DeactivateUser(ctx context.Context, sessionCtx *common.Session) error {
	if sessionCtx.Database.GetAdminUser().Name == "" {
		return trace.BadParameter("Teleport does not have admin user configured for this database")
	}

	// removal may yield errors, but we will still attempt to deactivate the user.
	errRemove := trace.Wrap(e.removePermissions(ctx, sessionCtx))

	conn, err := e.connectAsAdmin(ctx, sessionCtx, true)
	if err != nil {
		return trace.NewAggregate(errRemove, trace.Wrap(err))
	}
	defer conn.Close(ctx)

	e.Log.WithField("user", sessionCtx.DatabaseUser).Info("Deactivating PostgreSQL user.")

	_, err = conn.Exec(ctx, deactivateQuery, sessionCtx.DatabaseUser)
	if err != nil {
		return trace.NewAggregate(errRemove, trace.Wrap(err))
	}

	return errRemove
}

// DeleteUser deletes the database user.
func (e *Engine) DeleteUser(ctx context.Context, sessionCtx *common.Session) error {
	if sessionCtx.Database.GetAdminUser().Name == "" {
		return trace.BadParameter("Teleport does not have admin user configured for this database")
	}

	// removal may yield errors, but we will still attempt to delete the user.
	errRemove := trace.Wrap(e.removePermissions(ctx, sessionCtx))

	conn, err := e.connectAsAdmin(ctx, sessionCtx, true)
	if err != nil {
		return trace.NewAggregate(errRemove, trace.Wrap(err))
	}
	defer conn.Close(ctx)

	e.Log.WithField("user", sessionCtx.DatabaseUser).Info("Deleting PostgreSQL user.")

	var state string
	switch {
	case sessionCtx.Database.IsRedshift():
		err = e.deleteUserRedshift(ctx, sessionCtx, conn, &state)
	default:
		err = conn.QueryRow(ctx, deleteQuery, sessionCtx.DatabaseUser).Scan(&state)
	}
	if err != nil {
		return trace.NewAggregate(errRemove, trace.Wrap(err))
	}

	switch state {
	case common.SQLStateUserDropped:
		e.Log.WithField("user", sessionCtx.DatabaseUser).Debug("User deleted successfully.")
	case common.SQLStateUserDeactivated:
		e.Log.WithField("user", sessionCtx.DatabaseUser).Info("Unable to delete user, it was disabled instead.")
	default:
		e.Log.WithField("user", sessionCtx.DatabaseUser).Warn("Unable to determine user deletion state.")
	}

	return errRemove
}

// deleteUserRedshift deletes the Redshift database user.
//
// Failures inside Redshift default procedures are always rethrown exceptions if
// the exception handler completes successfully. Given this, we need to assert
// into the returned error instead of doing this on state returned (like regular
// PostgreSQL).
func (e *Engine) deleteUserRedshift(ctx context.Context, sessionCtx *common.Session, conn *pgx.Conn, state *string) error {
	_, err := conn.Exec(ctx, deleteQuery, sessionCtx.DatabaseUser)
	if err == nil {
		*state = common.SQLStateUserDropped
		return nil
	}

	// Redshift returns SQLSTATE 55006 (object_in_use) when DROP USER fails due
	// to user owning resources.
	// https://docs.aws.amazon.com/redshift/latest/dg/r_DROP_USER.html#r_DROP_USER-notes
	if strings.Contains(err.Error(), "55006") {
		*state = common.SQLStateUserDeactivated
		return nil
	}

	return trace.Wrap(err)
}

// initAutoUsers installs procedures for activating and deactivating users and
// creates the bookkeeping role for auto-provisioned users.
func (e *Engine) initAutoUsers(ctx context.Context, sessionCtx *common.Session, conn *pgx.Conn) error {
	// Create a role/group which all auto-created users will be a part of.
	_, err := conn.Exec(ctx, fmt.Sprintf("create role %q", teleportAutoUserRole))
	if err != nil {
		if !strings.Contains(err.Error(), "already exists") {
			return trace.Wrap(err)
		}
		e.Log.Debugf("PostgreSQL role %q already exists.", teleportAutoUserRole)
	} else {
		e.Log.Debugf("Created PostgreSQL role %q.", teleportAutoUserRole)
	}

	// Install stored procedures for creating and disabling database users.
	for name, sql := range pickProcedures(sessionCtx) {
		_, err := conn.Exec(ctx, sql)
		if err != nil {
			return trace.Wrap(err)
		}
		e.Log.Debugf("Installed PostgreSQL stored procedure %q.", name)
	}
	return nil
}

// pgxConnect connects to the database using pgx driver which is higher-level
// than pgconn and is easier to use for executing queries.
func (e *Engine) pgxConnect(ctx context.Context, sessionCtx *common.Session) (*pgx.Conn, error) {
	config, err := e.getConnectConfig(ctx, sessionCtx)
	if err != nil {
		return nil, trace.Wrap(err)
	}
	pgxConf, err := pgx.ParseConfig("")
	if err != nil {
		return nil, trace.Wrap(err)
	}
	pgxConf.Config = *config
	return pgx.ConnectConfig(ctx, pgxConf)
}

func prepareRoles(sessionCtx *common.Session) (any, error) {
	switch sessionCtx.Database.GetType() {
	case types.DatabaseTypeRDS:
		return append(sessionCtx.DatabaseRoles, "rds_iam"), nil

	case types.DatabaseTypeRedshift:
		// Redshift does not support array. Encode roles in JSON (type text).
		rolesJSON, err := json.Marshal(sessionCtx.DatabaseRoles)
		if err != nil {
			return nil, trace.Wrap(err)
		}
		return string(rolesJSON), nil

	default:
		return sessionCtx.DatabaseRoles, nil
	}
}

func convertActivateError(sessionCtx *common.Session, err error) error {
	switch {
	case strings.Contains(err.Error(), "already exists"):
		return trace.AlreadyExists("user %q already exists in this PostgreSQL database and is not managed by Teleport", sessionCtx.DatabaseUser)

	case strings.Contains(err.Error(), "TP002: User has active connections and roles have changed"):
		return trace.CompareFailed("roles for user %q has changed. Please quit all active connections and try again.", sessionCtx.DatabaseUser)

	default:
		return trace.Wrap(err)
	}
}

func pickProcedures(sessionCtx *common.Session) map[string]string {
	if sessionCtx.Database.IsRedshift() {
		return redshiftProcs
	}
	return procs
}

const (
	// activateProcName is the name of the stored procedure Teleport will use
	// to automatically provision/activate database users.
	activateProcName = "teleport_activate_user"
	// deactivateProcName is the name of the stored procedure Teleport will use
	// to automatically deactivate database users after session ends.
	deactivateProcName = "teleport_deactivate_user"
	// deleteProcName is the name of the stored procedure Teleport will use to
	// automatically delete database users after session ends.
	deleteProcName = "teleport_delete_user"
	// updatePermissionsProcName is the name of the stored procedure Teleport will use
	// to automatically update database permissions.
	updatePermissionsProcName = "pg_temp.teleport_update_permissions"
	// removePermissionsProcName is the name of the stored procedure Teleport will use
	// to automatically remove all database permissions.
	removePermissionsProcName = "pg_temp.teleport_remove_permissions"
	// teleportAutoUserRole is the name of a PostgreSQL role that all Teleport
	// managed users will be a part of.
	teleportAutoUserRole = "teleport-auto-user"
)

var (
	//go:embed sql/activate-user.sql
	activateProc string
	// activateQuery is the query for calling user activation procedure.
	activateQuery = fmt.Sprintf(`call %v($1, $2)`, activateProcName)

	//go:embed sql/deactivate-user.sql
	deactivateProc string
	// deactivateQuery is the query for calling user deactivation procedure.
	deactivateQuery = fmt.Sprintf(`call %v($1)`, deactivateProcName)

	//go:embed sql/delete-user.sql
	deleteProc string
	// deleteQuery is the query for calling user deletion procedure.
	deleteQuery = fmt.Sprintf(`call %v($1)`, deleteProcName)

	//go:embed sql/redshift-activate-user.sql
	redshiftActivateProc string
	//go:embed sql/redshift-deactivate-user.sql
	redshiftDeactivateProc string
	//go:embed sql/redshift-delete-user.sql
	redshiftDeleteProc string

	//go:embed sql/update-permissions.sql
	updatePermissionsProc string
	// updatePermissionsQuery is the query for calling update permissions procedure.
	// the procedure is created on demand in the pg_temp table in the session database.
	updatePermissionsQuery = fmt.Sprintf(`call %v($1, $2::jsonb)`, updatePermissionsProcName)

	//go:embed sql/remove-permissions.sql
	removePermissionsProc string
	// removePermissionsQuery is the query for calling update permissions procedure.
	// the procedure is created on demand in the pg_temp table in the session database.
	removePermissionsQuery = fmt.Sprintf(`call %v($1)`, removePermissionsProcName)

	procs = map[string]string{
		activateProcName:   activateProc,
		deactivateProcName: deactivateProc,
		deleteProcName:     deleteProc,
	}

	redshiftProcs = map[string]string{
		activateProcName:   redshiftActivateProc,
		deactivateProcName: redshiftDeactivateProc,
		deleteProcName:     redshiftDeleteProc,
	}

	ephemeralProcs = map[string]string{
		updatePermissionsProcName: updatePermissionsProc,
		removePermissionsProcName: removePermissionsProc,
	}
)
