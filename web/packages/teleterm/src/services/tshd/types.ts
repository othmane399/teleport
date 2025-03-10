/**
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

/* eslint-disable @typescript-eslint/ban-ts-comment*/
// @ts-ignore
import { ResourceKind } from 'e-teleterm/ui/DocumentAccessRequests/NewRequest/useNewRequest';
// @ts-ignore
import { RequestState } from 'e-teleport/services/workflow';
import { SortType } from 'design/DataTable/types';
import { FileTransferListeners } from 'shared/components/FileTransfer';
import { NodeSubKind } from 'shared/services';
import { Timestamp } from 'gen-proto-ts/google/protobuf/timestamp_pb';
import * as apiCluster from 'gen-proto-ts/teleport/lib/teleterm/v1/cluster_pb';
import * as apiDb from 'gen-proto-ts/teleport/lib/teleterm/v1/database_pb';
import * as apiGateway from 'gen-proto-ts/teleport/lib/teleterm/v1/gateway_pb';
import * as apiServer from 'gen-proto-ts/teleport/lib/teleterm/v1/server_pb';
import * as apiKube from 'gen-proto-ts/teleport/lib/teleterm/v1/kube_pb';
import * as apiApp from 'gen-proto-ts/teleport/lib/teleterm/v1/app_pb';
import * as apiLabel from 'gen-proto-ts/teleport/lib/teleterm/v1/label_pb';
import * as apiService from 'gen-proto-ts/teleport/lib/teleterm/v1/service_pb';
import * as apiAuthSettings from 'gen-proto-ts/teleport/lib/teleterm/v1/auth_settings_pb';
import * as apiAccessRequest from 'gen-proto-ts/teleport/lib/teleterm/v1/access_request_pb';
import * as apiUsageEvents from 'gen-proto-ts/teleport/lib/teleterm/v1/usage_events_pb';
import * as apiAccessList from 'gen-proto-ts/teleport/accesslist/v1/accesslist_pb';

import * as uri from 'teleterm/ui/uri';

// We want to reexport both the type and the value of UserType. Because it's in a namespace, we have
// to alias it first to do the reexport.
// https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
import UserType = apiCluster.LoggedInUser_UserType;

export { UserType };

export interface Kube extends apiKube.Kube {
  uri: uri.KubeUri;
}

export interface Server extends apiServer.Server {
  uri: uri.ServerUri;
  subKind: NodeSubKind;
}

export interface App extends apiApp.App {
  uri: uri.AppUri;
  /** Name of the application. */
  name: string;
  /** URI and port the target application is available at. */
  endpointUri: string;
  /** Description of the application. */
  desc: string;
  /** Indicates if the application is an AWS management console. */
  awsConsole: boolean;
  /**
   * The application public address.
   * By default, it is a subdomain of the cluster (e.g., dumper.example.com).
   * Optionally, it can be overridden (by the 'public_addr' field in the app config)
   * with an address available on the internet.
   *
   * Always empty for SAML applications.
   */
  publicAddr: string;
  /**
   * Right now, `friendlyName` is set only for Okta applications.
   * It is constructed from a label value.
   * See more in api/types/resource.go.
   */
  friendlyName: string;
  /** Indicates if the application is a SAML Application (SAML IdP Service Provider). */
  samlApp: boolean;
}

export interface Gateway extends apiGateway.Gateway {
  uri: uri.GatewayUri;
  targetUri: uri.GatewayTargetUri;
  // The type of gatewayCliCommand was repeated here just to refer to the type with the JSDoc.
  gatewayCliCommand: GatewayCLICommand;
}

/**
 * GatewayCLICommand follows the API of os.exec.Cmd from Go.
 * https://pkg.go.dev/os/exec#Cmd
 *
 * @property {string} path - The absolute path to the CLI client of a gateway if the client is
 * in PATH. Otherwise, the name of the program we were trying to find.
 * @property {string[]} argsList - A list containing the name of the program as the first element
 * and the actual args as the other elements.
 * @property {string[]} envList – A list of env vars that need to be set for the command
 * invocation. The elements of the list are in the format of NAME=value.
 * @property {string} preview - A string showing how the invocation of the command would look like
 * if the user was to invoke it manually from the terminal. Should not be actually used to execute
 * anything in the shell.
 */
export type GatewayCLICommand = apiGateway.GatewayCLICommand;

export type AccessRequest = apiAccessRequest.AccessRequest;
export type ResourceId = apiAccessRequest.ResourceID;
export type AccessRequestReview = apiAccessRequest.AccessRequestReview;
export type AccessList = apiAccessList.AccessList;

export interface GetServersResponse extends apiService.GetServersResponse {
  agents: Server[];
}

export interface GetDatabasesResponse extends apiService.GetDatabasesResponse {
  agents: Database[];
}

export interface GetKubesResponse extends apiService.GetKubesResponse {
  agents: Kube[];
}

export interface GetAppsResponse extends apiService.GetAppsResponse {
  agents: App[];
}

export type GetRequestableRolesResponse =
  apiService.GetRequestableRolesResponse;

export type ReportUsageEventRequest = apiUsageEvents.ReportUsageEventRequest;

// Available types are listed here:
// https://github.com/gravitational/teleport/blob/v9.0.3/lib/defaults/defaults.go#L513-L530
//
// The list below can get out of sync with what tsh actually implements.
export type GatewayProtocol =
  | 'postgres'
  | 'mysql'
  | 'mongodb'
  | 'cockroachdb'
  | 'redis'
  | 'sqlserver';

export interface Database extends apiDb.Database {
  uri: uri.DatabaseUri;
}

export interface Cluster extends apiCluster.Cluster {
  /**
   * The URI of the cluster.
   *
   * For root clusters, it has the form of `/clusters/:rootClusterId` where `rootClusterId` is the
   * name of the profile, that is the hostname of the proxy used to connect to the root cluster.
   * `rootClusterId` is not equal to the name of the root cluster.
   *
   * For leaf clusters, it has the form of `/clusters/:rootClusterId/leaves/:leafClusterId` where
   * `leafClusterId` is equal to the `name` property of the cluster.
   */
  uri: uri.ClusterUri;
  /**
   * loggedInUser is present if the user has logged in to the cluster at least once. This
   * includes a situation in which the cert has expired. If the cluster was added to the app but the
   * user is yet to log in, loggedInUser is not present.
   */
  loggedInUser?: LoggedInUser;
  /**
   * Address of the proxy used to connect to this cluster. Always includes port number. Present only
   * for root clusters.
   *
   * @example
   * "teleport-14-ent.example.com:3090"
   */
  proxyHost: string;
}

/**
 * LoggedInUser describes loggedInUser field available on root clusters.
 *
 * loggedInUser is present if the user has logged in to the cluster at least once. This
 * includes a situation in which the cert has expired. If the cluster was added to the app but the
 * user is yet to log in, loggedInUser is not present.
 */
export type LoggedInUser = apiCluster.LoggedInUser & {
  assumedRequests?: Record<string, AssumedRequest>;
  /**
   * acl is available only after the cluster details are fetched, as acl is not stored on disk.
   */
  acl?: apiCluster.ACL;
};
export type AuthProvider = apiAuthSettings.AuthProvider;
export type AuthSettings = apiAuthSettings.AuthSettings;

export interface FileTransferRequest extends apiService.FileTransferRequest {
  serverUri: uri.ServerUri;
}

export type WebauthnCredentialInfo = apiService.CredentialInfo;
export type WebauthnLoginPrompt =
  | WebauthnLoginTapPrompt
  | WebauthnLoginRetapPrompt
  | WebauthnLoginPinPrompt
  | WebauthnLoginCredentialPrompt;
export type WebauthnLoginTapPrompt = { type: 'tap' };
export type WebauthnLoginRetapPrompt = { type: 'retap' };
export type WebauthnLoginPinPrompt = {
  type: 'pin';
  onUserResponse(pin: string): void;
};
export type WebauthnLoginCredentialPrompt = {
  type: 'credential';
  data: { credentials: WebauthnCredentialInfo[] };
  onUserResponse(index: number): void;
};
export type LoginPasswordlessRequest =
  Partial<apiService.LoginPasswordlessRequest>;

export type TshdClient = {
  listRootClusters: (abortSignal?: TshAbortSignal) => Promise<Cluster[]>;
  listLeafClusters: (clusterUri: uri.RootClusterUri) => Promise<Cluster[]>;
  getKubes: (params: GetResourcesParams) => Promise<GetKubesResponse>;
  getApps: (params: GetResourcesParams) => Promise<GetAppsResponse>;
  getDatabases: (params: GetResourcesParams) => Promise<GetDatabasesResponse>;
  listDatabaseUsers: (dbUri: uri.DatabaseUri) => Promise<string[]>;
  assumeRole: (
    clusterUri: uri.RootClusterUri,
    requestIds: string[],
    dropIds: string[]
  ) => Promise<void>;
  getRequestableRoles: (
    params: GetRequestableRolesParams
  ) => Promise<GetRequestableRolesResponse>;
  getServers: (params: GetResourcesParams) => Promise<GetServersResponse>;
  getAccessRequests: (
    clusterUri: uri.RootClusterUri
  ) => Promise<AccessRequest[]>;
  getAccessRequest: (
    clusterUri: uri.RootClusterUri,
    requestId: string
  ) => Promise<AccessRequest>;
  reviewAccessRequest: (
    clusterUri: uri.RootClusterUri,
    params: ReviewAccessRequestParams
  ) => Promise<AccessRequest>;
  createAccessRequest: (
    params: CreateAccessRequestParams
  ) => Promise<AccessRequest>;
  deleteAccessRequest: (
    clusterUri: uri.RootClusterUri,
    requestId: string
  ) => Promise<void>;
  createAbortController: () => TshAbortController;
  addRootCluster: (addr: string) => Promise<Cluster>;

  listGateways: () => Promise<Gateway[]>;
  createGateway: (params: CreateGatewayParams) => Promise<Gateway>;
  removeGateway: (gatewayUri: uri.GatewayUri) => Promise<void>;
  setGatewayTargetSubresourceName: (
    gatewayUri: uri.GatewayUri,
    targetSubresourceName: string
  ) => Promise<Gateway>;
  setGatewayLocalPort: (
    gatewayUri: uri.GatewayUri,
    localPort: string
  ) => Promise<Gateway>;

  getCluster: (clusterUri: uri.RootClusterUri) => Promise<Cluster>;
  getAuthSettings: (clusterUri: uri.RootClusterUri) => Promise<AuthSettings>;
  removeCluster: (clusterUri: uri.RootClusterUri) => Promise<void>;
  loginLocal: (
    params: LoginLocalParams,
    abortSignal?: TshAbortSignal
  ) => Promise<void>;
  loginSso: (
    params: LoginSsoParams,
    abortSignal?: TshAbortSignal
  ) => Promise<void>;
  loginPasswordless: (
    params: LoginPasswordlessParams,
    abortSignal?: TshAbortSignal
  ) => Promise<void>;
  logout: (clusterUri: uri.RootClusterUri) => Promise<void>;
  transferFile: (
    options: FileTransferRequest,
    abortSignal?: TshAbortSignal
  ) => FileTransferListeners;
  reportUsageEvent: (event: ReportUsageEventRequest) => Promise<void>;

  createConnectMyComputerRole: (
    rootClusterUri: uri.RootClusterUri
  ) => Promise<CreateConnectMyComputerRoleResponse>;
  createConnectMyComputerNodeToken: (
    clusterUri: uri.RootClusterUri
  ) => Promise<CreateConnectMyComputerNodeTokenResponse>;
  waitForConnectMyComputerNodeJoin: (
    rootClusterUri: uri.RootClusterUri,
    abortSignal: TshAbortSignal
  ) => Promise<WaitForConnectMyComputerNodeJoinResponse>;
  deleteConnectMyComputerNode: (
    clusterUri: uri.RootClusterUri
  ) => Promise<void>;
  getConnectMyComputerNodeName: (uri: uri.RootClusterUri) => Promise<string>;

  updateHeadlessAuthenticationState: (
    params: UpdateHeadlessAuthenticationStateParams,
    abortSignal?: TshAbortSignal
  ) => Promise<void>;

  listUnifiedResources: (
    params: apiService.ListUnifiedResourcesRequest,
    abortSignal?: TshAbortSignal
  ) => Promise<ListUnifiedResourcesResponse>;

  getUserPreferences: (
    params: apiService.GetUserPreferencesRequest,
    abortSignal?: TshAbortSignal
  ) => Promise<UserPreferences>;
  updateUserPreferences: (
    params: apiService.UpdateUserPreferencesRequest,
    abortSignal?: TshAbortSignal
  ) => Promise<UserPreferences>;
  getSuggestedAccessLists: (
    params: apiService.GetSuggestedAccessListsRequest,
    abortSignal?: TshAbortSignal
  ) => Promise<AccessList[]>;
  promoteAccessRequest: (
    params: PromoteAccessRequestParams,
    abortSignal?: TshAbortSignal
  ) => Promise<AccessRequest>;

  updateTshdEventsServerAddress: (address: string) => Promise<void>;
};

export type TshAbortController = {
  signal: TshAbortSignal;
  abort(): void;
};

export type TshAbortSignal = {
  readonly aborted: boolean;
  addEventListener(cb: (...args: any[]) => void): void;
  removeEventListener(cb: (...args: any[]) => void): void;
};

interface LoginParamsBase {
  clusterUri: uri.RootClusterUri;
}

export interface LoginLocalParams extends LoginParamsBase {
  username: string;
  password: string;
  token?: string;
}

export interface LoginSsoParams extends LoginParamsBase {
  providerType: string;
  providerName: string;
}

export interface LoginPasswordlessParams extends LoginParamsBase {
  onPromptCallback(res: WebauthnLoginPrompt): void;
}

export type CreateGatewayParams = {
  targetUri: uri.GatewayTargetUri;
  port?: string;
  user: string;
  subresource_name?: string;
};

export type GetResourcesParams = {
  clusterUri: uri.ClusterUri;
  // sort is a required field because it has direct implications on performance of ListResources.
  sort: SortType | null;
  // limit cannot be omitted and must be greater than zero, otherwise ListResources is going to
  // return an error.
  limit: number;
  // search is used for regular search.
  search?: string;
  searchAsRoles?: string;
  startKey?: string;
  // query is used for advanced search.
  query?: string;
};

// Compatibility type to make sure teleport.e doesn't break.
// TODO(ravicious): Remove after teleterm.e is updated to use GetResourcesParams.
export type ServerSideParams = GetResourcesParams;

export type ReviewAccessRequestParams = {
  state: RequestState;
  reason: string;
  roles: string[];
  id: string;
  assumeStartTime?: Timestamp;
};

export type CreateAccessRequestParams =
  apiService.CreateAccessRequestRequest & {
    rootClusterUri: uri.RootClusterUri;
  };

export type GetRequestableRolesParams = {
  rootClusterUri: uri.RootClusterUri;
  resourceIds?: { kind: ResourceKind; clusterName: string; id: string }[];
};

export type AssumedRequest = {
  id: string;
  expires: Date;
  roles: string[];
};

export type Label = apiLabel.Label;

export type CreateConnectMyComputerRoleResponse =
  apiService.CreateConnectMyComputerRoleResponse;
export type CreateConnectMyComputerNodeTokenResponse =
  apiService.CreateConnectMyComputerNodeTokenResponse;
export type WaitForConnectMyComputerNodeJoinResponse =
  apiService.WaitForConnectMyComputerNodeJoinResponse & {
    server: Server;
  };

export type ListUnifiedResourcesRequest =
  apiService.ListUnifiedResourcesRequest;
export type ListUnifiedResourcesResponse = {
  resources: UnifiedResourceResponse[];
  nextKey: string;
};
export type UnifiedResourceResponse =
  | { kind: 'server'; resource: Server }
  | {
      kind: 'database';
      resource: Database;
    }
  | { kind: 'kube'; resource: Kube }
  | { kind: 'app'; resource: App };

export type UserPreferences = apiService.UserPreferences;
export type PromoteAccessRequestParams =
  apiService.PromoteAccessRequestRequest & {
    rootClusterUri: uri.RootClusterUri;
  };

export type UpdateHeadlessAuthenticationStateParams = {
  rootClusterUri: uri.RootClusterUri;
  headlessAuthenticationId: string;
  state: apiService.HeadlessAuthenticationState;
};
