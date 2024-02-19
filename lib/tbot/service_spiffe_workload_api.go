/*
 * Teleport
 * Copyright (C) 2024  Gravitational, Inc.
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

package tbot

import (
	"bytes"
	"context"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"math/big"
	"net"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gravitational/trace"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/recovery"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
	workloadpb "github.com/spiffe/go-spiffe/v2/proto/spiffe/workload"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/gravitational/teleport"
	"github.com/gravitational/teleport/api/client/proto"
	"github.com/gravitational/teleport/api/types"
	"github.com/gravitational/teleport/lib/auth"
	"github.com/gravitational/teleport/lib/auth/machineid/machineidv1/experiment"
	"github.com/gravitational/teleport/lib/auth/native"
	"github.com/gravitational/teleport/lib/defaults"
	"github.com/gravitational/teleport/lib/observability/metrics"
	"github.com/gravitational/teleport/lib/reversetunnelclient"
	"github.com/gravitational/teleport/lib/services"
	"github.com/gravitational/teleport/lib/tbot/config"
	"github.com/gravitational/teleport/lib/tbot/identity"
	"github.com/gravitational/teleport/lib/tlsca"
)

// SPIFFEWorkloadAPIService implements a gRPC server that fulfils the SPIFFE
// Workload API specification. It provides X509 SVIDs and trust bundles to
// workloads that connect over the configured listener.
//
// Sources:
// - https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE_Workload_Endpoint.md
// - https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE_Workload_API.md
// - https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE-ID.md
// - https://github.com/spiffe/spiffe/blob/main/standards/X509-SVID.md
type SPIFFEWorkloadAPIService struct {
	workloadpb.UnimplementedSpiffeWorkloadAPIServer

	botCfg         *config.BotConfig
	cfg            *config.SPIFFEWorkloadAPIService
	log            logrus.FieldLogger
	botIdentitySrc botIdentitySrc
	resolver       reversetunnelclient.Resolver
	// rootReloadBroadcaster allows the service to listen for CA rotations and
	// update the trust bundle cache.
	rootReloadBroadcaster *channelBroadcaster
	// trustBundleBroadcast is a channel broadcaster is triggered when the trust
	// bundle cache has been updated and active streams should be renewed.
	trustBundleBroadcast *channelBroadcaster

	// client holds the impersonated client for the service
	// TODO: Rotations/Renewals/Protection
	client auth.ClientI

	trustDomain string

	// trustBundle is protected by trustBundleMu. Use setTrustBundle and
	// getTrustBundle to access it.
	trustBundle   []byte
	trustBundleMu sync.Mutex
}

func (s *SPIFFEWorkloadAPIService) setTrustBundle(trustBundle []byte) {
	s.trustBundleMu.Lock()
	s.trustBundle = trustBundle
	s.trustBundleMu.Unlock()
	// Alert active streaming RPCs to renew their trust bundles
	s.trustBundleBroadcast.broadcast()
}

func (s *SPIFFEWorkloadAPIService) getTrustBundle() []byte {
	s.trustBundleMu.Lock()
	defer s.trustBundleMu.Unlock()
	return s.trustBundle
}

func (s *SPIFFEWorkloadAPIService) fetchBundle(ctx context.Context) error {
	botIdentity := s.botIdentitySrc.BotIdentity()
	client, err := clientForIdentity(
		ctx, s.log, s.botCfg, botIdentity, s.resolver,
	)
	if err != nil {
		return trace.Wrap(err)
	}
	defer client.Close()

	cas, err := client.GetCertAuthorities(ctx, types.SPIFFECA, false)
	if err != nil {
		return trace.Wrap(err)
	}
	trustBundleBytes := &bytes.Buffer{}
	for _, ca := range cas {
		for _, cert := range services.GetTLSCerts(ca) {
			// The values from GetTLSCerts are PEM encoded. We need them to be
			// the bare ASN.1 DER encoded certificate.
			block, _ := pem.Decode(cert)
			trustBundleBytes.Write(block.Bytes)
		}
	}

	s.log.Info("Fetched new trust bundle")
	s.setTrustBundle(trustBundleBytes.Bytes())
	return nil
}

// setup initializes the service, performing tasks such as determining the
// trust domain, fetching the initial trust bundle and creating an impersonated
// client.
func (s *SPIFFEWorkloadAPIService) setup(ctx context.Context) error {
	ctx, span := tracer.Start(ctx, "SPIFFEWorkloadAPIService/setup")
	defer span.End()

	if err := s.fetchBundle(ctx); err != nil {
		return trace.Wrap(err)
	}

	botIdentity := s.botIdentitySrc.BotIdentity()
	client, err := clientForIdentity(
		ctx, s.log, s.botCfg, botIdentity, s.resolver,
	)
	if err != nil {
		return trace.Wrap(err)
	}
	defer client.Close()

	authPing, err := client.Ping(ctx)
	if err != nil {
		return trace.Wrap(err)
	}
	s.trustDomain = authPing.ClusterName

	// Now we need to create a role impersonated identity to leverage the roles
	// that are assigned to the bot.
	// TODO: Debaddify this - based loosely on outputsService.generateIdentity
	// TODO: need to handle renewal etc
	privateKey, publicKey, err := native.GenerateKeyPair()
	if err != nil {
		return trace.Wrap(err)
	}

	roles, err := fetchDefaultRoles(ctx, client, botIdentity)
	if err != nil {
		return trace.Wrap(err)
	}

	certs, err := client.GenerateUserCerts(ctx, proto.UserCertsRequest{
		PublicKey:      publicKey,
		Username:       botIdentity.X509Cert.Subject.CommonName,
		Expires:        time.Now().Add(s.botCfg.CertificateTTL),
		RoleRequests:   roles,
		RouteToCluster: botIdentity.ClusterName,

		// Make sure to specify this is an impersonated cert request. If unset,
		// auth cannot differentiate renewable vs impersonated requests when
		// len(roleRequests) == 0.
		UseRoleRequests: true,
	})
	if err != nil {
		return trace.Wrap(err)
	}

	// The root CA included with the returned user certs will only contain the
	// Teleport User CA. We'll also need the host CA for future API calls.
	localCA, err := client.GetClusterCACert(ctx)
	if err != nil {
		return trace.Wrap(err)
	}

	caCerts, err := tlsca.ParseCertificatePEMs(localCA.TLSCA)
	if err != nil {
		return trace.Wrap(err)
	}

	// Append the host CAs from the auth server.
	for _, cert := range caCerts {
		pemBytes, err := tlsca.MarshalCertificatePEM(cert)
		if err != nil {
			return trace.Wrap(err)
		}
		certs.TLSCACerts = append(certs.TLSCACerts, pemBytes)
	}

	// Do not trust SSH CA certs as returned by GenerateUserCerts() with an
	// impersonated identity. It only returns the SSH UserCA in this context,
	// but we also need the HostCA and can't directly set `includeHostCA` as
	// part of the UserCertsRequest.
	// Instead, copy the SSHCACerts from the primary identity.
	certs.SSHCACerts = botIdentity.SSHCACertBytes

	newIdentity, err := identity.ReadIdentityFromStore(&identity.LoadIdentityParams{
		PrivateKeyBytes: privateKey,
		PublicKeyBytes:  publicKey,
	}, certs)
	if err != nil {
		return trace.Wrap(err)
	}

	impersonatedClient, err := clientForIdentity(
		ctx, s.log, s.botCfg, newIdentity, s.resolver,
	)
	if err != nil {
		return trace.Wrap(err)
	}
	s.client = impersonatedClient
	// Closure is managed by caller of setup

	return nil
}

func createListener(addr string) (net.Listener, error) {
	parsed, err := url.Parse(addr)
	if err != nil {
		return nil, trace.Wrap(err, "parsing %q", addr)
	}

	switch parsed.Scheme {
	case "tcp":
		return net.Listen("tcp", parsed.Host)
	case "unix":
		return net.Listen("unix", parsed.Path)
	default:
		return nil, trace.BadParameter("unsupported scheme %q", parsed.Scheme)
	}
}

func (s *SPIFFEWorkloadAPIService) Run(ctx context.Context) error {
	ctx, span := tracer.Start(ctx, "SPIFFEWorkloadAPIService/Run")
	defer span.End()
	if !experiment.Enabled() {
		return trace.BadParameter("workload identity has not been enabled")
	}

	s.log.Info("Completing pre-run initialization")
	if err := s.setup(ctx); err != nil {
		return trace.Wrap(err)
	}
	defer s.client.Close()
	s.log.Info("Completed pre-run initialization")

	srvMetrics := metrics.CreateGRPCServerMetrics(
		true, prometheus.Labels{
			teleport.TagServer: "tbot-spiffe-workload-api",
		},
	)
	if err := metrics.RegisterPrometheusCollectors(srvMetrics); err != nil {
		return trace.Wrap(err)
	}
	srv := grpc.NewServer(
		grpc.Creds(
			// SPEC (SPIFFE_Workload_endpoint) 3. Transport:
			// - Transport Layer Security MUST NOT be required
			// TODO(noah): We should optionally provide TLS support here down
			// the road.
			insecure.NewCredentials(),
		),
		grpc.ChainUnaryInterceptor(
			recovery.UnaryServerInterceptor(),
			srvMetrics.UnaryServerInterceptor(),
		),
		grpc.ChainStreamInterceptor(
			recovery.StreamServerInterceptor(),
			srvMetrics.StreamServerInterceptor(),
		),
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
		grpc.MaxConcurrentStreams(defaults.GRPCMaxConcurrentStreams),
	)
	workloadpb.RegisterSpiffeWorkloadAPIServer(srv, s)

	lis, err := createListener(s.cfg.Listen)
	if err != nil {
		return trace.Wrap(err, "creating listener")
	}
	defer func() {
		if err := lis.Close(); err != nil {
			s.log.WithError(err).Error("Encountered error closing listener")
		}
	}()
	s.log.WithField("addr", lis.Addr().String()).Info("Listener opened for Workload API endpoint")
	if lis.Addr().Network() == "tcp" {
		s.log.Warn(
			"Workload API endpoint listening on a TCP port. Ensure that only intended hosts can reach this port!",
		)
	}

	// Set off the long running tasks in an errgroup
	eg, egCtx := errgroup.WithContext(ctx)
	eg.Go(func() error {
		// Start the gRPC server
		return srv.Serve(lis)
	})
	eg.Go(func() error {
		// Shutdown the server when the context is cancelled
		<-egCtx.Done()
		s.log.Debug("Shutting down Workload API endpoint")
		srv.Stop()
		s.log.Info("Shut down Workload API endpoint")
		return nil
	})
	eg.Go(func() error {
		// Handle CA rotations
		return s.handleCARotations(egCtx)
	})

	return trace.Wrap(eg.Wait())
}

// handleCARotations listens on a channel subscribed to the bot's CA watcher and
// refetches the trust bundle when a rotation is detected.
func (s *SPIFFEWorkloadAPIService) handleCARotations(ctx context.Context) error {
	ctx, span := tracer.Start(ctx, "SPIFFEWorkloadAPIService/handleCARotations")
	defer span.End()
	reloadCh, unsubscribe := s.rootReloadBroadcaster.subscribe()
	defer unsubscribe()
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-reloadCh:
		}

		s.log.Info("CA rotation detected, fetching trust bundle")
		err := s.fetchBundle(ctx)
		if err != nil {
			return trace.Wrap(err, "updating trust bundle")
		}
	}
}

// serialString returns a human-readable colon-separated string of the serial
// number in hex.
func serialString(serial *big.Int) string {
	hex := serial.Text(16)
	if len(hex)%2 == 1 {
		hex = "0" + hex
	}

	out := strings.Builder{}
	for i := 0; i < len(hex); i += 2 {
		if i != 0 {
			out.WriteString(":")
		}
		out.WriteString(hex[i : i+2])
	}
	return out.String()
}

// fetchX509SVIDs fetches the X.509 SVIDs for the bot's configured SVIDs and
// returns them in the SPIFFE Workload API format.
func (s *SPIFFEWorkloadAPIService) fetchX509SVIDs(
	ctx context.Context,
) ([]*workloadpb.X509SVID, error) {
	ctx, span := tracer.Start(ctx, "SPIFFEWorkloadAPIService/fetchX509SVIDs")
	defer span.End()
	// Fetch this once at the start and share it across all SVIDs to reduce
	// contention on the mutex and to ensure that all SVIDs are using the
	// same trust bundle.
	trustBundle := s.getTrustBundle()
	// TODO(noah): We should probably take inspiration from SPIRE agent's
	// behaviour of pre-fetching the SVIDs rather than doing this for
	// every request.
	res, privateKey, err := config.GenerateSVID(
		ctx,
		s.client.WorkloadIdentityServiceClient(),
		s.cfg.SVIDs,
		// For TTL, we use the one globally configured.
		s.botCfg.CertificateTTL,
	)
	if err != nil {
		return nil, trace.Wrap(err)
	}

	// Convert the private key to PKCS#8 format as per SPIFFE spec.
	pkcs8PrivateKey, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		return nil, trace.Wrap(err)
	}

	// Convert responses from the Teleport API to the SPIFFE Workload API
	// format.
	svids := make([]*workloadpb.X509SVID, len(res.Svids))
	for i, svidRes := range res.Svids {
		svids[i] = &workloadpb.X509SVID{
			// Required. The SPIFFE ID of the SVID in this entry
			SpiffeId: svidRes.SpiffeId,
			// Required. ASN.1 DER encoded certificate chain. MAY include
			// intermediates, the leaf certificate (or SVID itself) MUST come first.
			X509Svid: svidRes.Certificate,
			// Required. ASN.1 DER encoded PKCS#8 private key. MUST be unencrypted.
			X509SvidKey: pkcs8PrivateKey,
			// Required. ASN.1 DER encoded X.509 bundle for the trust domain.
			Bundle: trustBundle,
			Hint:   svidRes.Hint,
		}
		cert, err := x509.ParseCertificate(svidRes.Certificate)
		if err != nil {
			return nil, trace.Wrap(err, "parsing issued svid received from server")
		}
		// Log a message which correlates with the audit log entry and can
		// provide additional metadata about the client.
		s.log.WithFields(logrus.Fields{
			"svid_type":     "x509",
			"spiffe_id":     svidRes.SpiffeId,
			"serial_number": serialString(cert.SerialNumber),
			"hint":          svidRes.Hint,
			"not_after":     cert.NotAfter,
			"not_before":    cert.NotBefore,
			"dns_sans":      cert.DNSNames,
			"ip_sans":       cert.IPAddresses,
			"serial":        cert.SerialNumber,
		}).Info("Issued SVID for workload")
	}

	return svids, nil
}

// FetchX509SVID generates and returns the X.509 SVIDs available to a workload.
// It is a streaming RPC, and sends renewed SVIDs to the client before they
// expire.
// Implements the SPIFFE Workload API FetchX509SVID method.
func (s *SPIFFEWorkloadAPIService) FetchX509SVID(
	_ *workloadpb.X509SVIDRequest,
	srv workloadpb.SpiffeWorkloadAPI_FetchX509SVIDServer,
) error {
	renewCh, unsubscribe := s.trustBundleBroadcast.subscribe()
	defer unsubscribe()
	s.log.Info("FetchX509SVID stream opened by workload")
	defer s.log.Info("FetchX509SVID stream has closed")

	for {
		s.log.Info("Starting to issue X509 SVIDs to workload")

		svids, err := s.fetchX509SVIDs(srv.Context())
		if err != nil {
			return trace.Wrap(err)
		}
		err = srv.Send(&workloadpb.X509SVIDResponse{
			Svids: svids,
		})
		if err != nil {
			return trace.Wrap(err)
		}
		s.log.Debug(
			"Finished issuing SVIDs to workload. Waiting for next renewal interval or CA rotation",
		)

		select {
		case <-srv.Context().Done():
			s.log.Debug("Context closed, stopping SVID stream")
			return nil
		case <-time.After(s.botCfg.RenewalInterval):
			s.log.Debug("Renewal interval reached, renewing SVIDs")
			// Time to renew the certificate
			continue
		case <-renewCh:
			s.log.Debug("Trust bundle has been updated, renewing SVIDs")
			continue
		}
	}
}

// FetchX509Bundles returns the trust bundle for the trust domain. It is a
// streaming RPC, and will send rotated trust bundles to the client for as long
// as the client is connected.
// Implements the SPIFFE Workload API FetchX509SVID method.
func (s *SPIFFEWorkloadAPIService) FetchX509Bundles(
	_ *workloadpb.X509BundlesRequest,
	srv workloadpb.SpiffeWorkloadAPI_FetchX509BundlesServer,
) error {
	s.log.Info("FetchX509Bundles stream opened by workload")
	defer s.log.Info("FetchX509Bundles stream has closed")
	renewCh, unsubscribe := s.trustBundleBroadcast.subscribe()
	defer unsubscribe()

	for {
		s.log.Info("Sending X.509 trust bundles to workload")
		err := srv.Send(&workloadpb.X509BundlesResponse{
			// Bundles keyed by trust domain
			Bundles: map[string][]byte{
				s.trustDomain: s.getTrustBundle(),
			},
		})
		if err != nil {
			return trace.Wrap(err)
		}

		select {
		case <-srv.Context().Done():
			s.log.Debug("Context closed, stopping x.509 trust bundle stream")
			return nil
		case <-renewCh:
			s.log.Debug("Trust bundle has been updated, resending trust bundle")
			continue
		}
	}
}

// FetchJWTSVID implements the SPIFFE Workload API FetchJWTSVID method.
func (s *SPIFFEWorkloadAPIService) FetchJWTSVID(
	ctx context.Context,
	req *workloadpb.JWTSVIDRequest,
) (*workloadpb.JWTSVIDResponse, error) {
	// JWT functionality currently not implemented in Teleport Workload Identity.
	return nil, trace.NotImplemented("method not implemented")
}

// FetchJWTBundles implements the SPIFFE Workload API FetchJWTBundles method.
func (s *SPIFFEWorkloadAPIService) FetchJWTBundles(
	req *workloadpb.JWTBundlesRequest,
	srv workloadpb.SpiffeWorkloadAPI_FetchJWTBundlesServer,
) error {
	// JWT functionality currently not implemented in Teleport Workload Identity.
	return trace.NotImplemented("method not implemented")
}

// ValidateJWTSVID implements the SPIFFE Workload API ValidateJWTSVID method.
func (s *SPIFFEWorkloadAPIService) ValidateJWTSVID(
	ctx context.Context,
	req *workloadpb.ValidateJWTSVIDRequest,
) (*workloadpb.ValidateJWTSVIDResponse, error) {
	// JWT functionality currently not implemented in Teleport Workload Identity.
	return nil, trace.NotImplemented("method not implemented")
}

// String returns a human-readable string that can uniquely identify the
// service.
func (s *SPIFFEWorkloadAPIService) String() string {
	return fmt.Sprintf("%s:%s", config.SPIFFEWorkloadAPIServiceType, s.cfg.Listen)
}
