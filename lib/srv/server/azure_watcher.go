/*
Copyright 2022 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package server

import (
	"context"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute/v3"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/gravitational/trace"

	usageeventsv1 "github.com/gravitational/teleport/api/gen/proto/go/usageevents/v1"
	"github.com/gravitational/teleport/api/types"
	"github.com/gravitational/teleport/api/types/installers"
	"github.com/gravitational/teleport/lib/cloud/azure"
	"github.com/gravitational/teleport/lib/services"
)

const azureEventPrefix = "azure/"

// AzureInstances contains information about discovered Azure virtual machines.
type AzureInstances struct {
	// Region is the Azure region where the instances are located.
	Region string
	// SubscriptionID is the subscription ID for the instances.
	SubscriptionID string
	// ResourceGroup is the resource group for the instances.
	ResourceGroup string
	// ScriptName is the name of the script to execute on the instances to
	// install Teleport.
	ScriptName string
	// PublicProxyAddr is the address of the proxy the discovered node should use
	// to connect to the cluster.
	PublicProxyAddr string
	// Parameters are the parameters passed to the installation script.
	Parameters []string
	// Instances is a list of discovered Azure virtual machines.
	Instances []*armcompute.VirtualMachine
	// ClientID is the client ID of the managed identity to use for installation.
	ClientID string
}

// MakeEvents generates MakeEvents for these instances.
func (instances *AzureInstances) MakeEvents() map[string]*usageeventsv1.ResourceCreateEvent {
	resourceType := types.DiscoveredResourceNode
	if instances.ScriptName == installers.InstallerScriptNameAgentless {
		resourceType = types.DiscoveredResourceAgentlessNode
	}
	events := make(map[string]*usageeventsv1.ResourceCreateEvent, len(instances.Instances))
	for _, inst := range instances.Instances {
		events[azureEventPrefix+aws.StringValue(inst.ID)] = &usageeventsv1.ResourceCreateEvent{
			ResourceType:   resourceType,
			ResourceOrigin: types.OriginCloud,
			CloudProvider:  types.CloudAzure,
		}
	}
	return events
}

type azureClientGetter interface {
	GetAzureVirtualMachinesClient(subscription string) (azure.VirtualMachinesClient, error)
}

// NewAzureWatcher creates a new Azure watcher instance.
func NewAzureWatcher(ctx context.Context, fetchersFn func() []Fetcher, opts ...Option) (*Watcher, error) {
	cancelCtx, cancelFn := context.WithCancel(ctx)
	watcher := Watcher{
		fetchersFn:    fetchersFn,
		ctx:           cancelCtx,
		cancel:        cancelFn,
		pollInterval:  time.Minute,
		triggerFetchC: make(<-chan struct{}),
		InstancesC:    make(chan Instances),
	}
	for _, opt := range opts {
		opt(&watcher)
	}
	return &watcher, nil
}

// MatchersToAzureInstanceFetchers converts a list of Azure VM Matchers into a list of Azure VM Fetchers.
func MatchersToAzureInstanceFetchers(matchers []types.AzureMatcher, clients azureClientGetter) []Fetcher {
	ret := make([]Fetcher, 0)
	for _, matcher := range matchers {
		for _, subscription := range matcher.Subscriptions {
			for _, resourceGroup := range matcher.ResourceGroups {
				fetcher := newAzureInstanceFetcher(azureFetcherConfig{
					Matcher:           matcher,
					Subscription:      subscription,
					ResourceGroup:     resourceGroup,
					AzureClientGetter: clients,
				})
				ret = append(ret, fetcher)
			}
		}
	}
	return ret
}

type azureFetcherConfig struct {
	Matcher           types.AzureMatcher
	Subscription      string
	ResourceGroup     string
	AzureClientGetter azureClientGetter
}

type azureInstanceFetcher struct {
	AzureClientGetter azureClientGetter
	Regions           []string
	Subscription      string
	ResourceGroup     string
	Labels            types.Labels
	Parameters        map[string]string
	ClientID          string
}

func newAzureInstanceFetcher(cfg azureFetcherConfig) *azureInstanceFetcher {
	ret := &azureInstanceFetcher{
		AzureClientGetter: cfg.AzureClientGetter,
		Regions:           cfg.Matcher.Regions,
		Subscription:      cfg.Subscription,
		ResourceGroup:     cfg.ResourceGroup,
		Labels:            cfg.Matcher.ResourceTags,
	}

	if cfg.Matcher.Params != nil {
		ret.Parameters = map[string]string{
			"token":           cfg.Matcher.Params.JoinToken,
			"scriptName":      cfg.Matcher.Params.ScriptName,
			"publicProxyAddr": cfg.Matcher.Params.PublicProxyAddr,
		}
		ret.ClientID = cfg.Matcher.Params.Azure.ClientID
	}

	return ret
}

func (*azureInstanceFetcher) GetMatchingInstances(_ []types.Server, _ bool) ([]Instances, error) {
	return nil, trace.NotImplemented("not implemented for azure fetchers")
}

// GetInstances fetches all Azure virtual machines matching configured filters.
func (f *azureInstanceFetcher) GetInstances(ctx context.Context, _ bool) ([]Instances, error) {
	client, err := f.AzureClientGetter.GetAzureVirtualMachinesClient(f.Subscription)
	if err != nil {
		return nil, trace.Wrap(err)
	}
	instancesByRegion := make(map[string][]*armcompute.VirtualMachine)
	for _, region := range f.Regions {
		instancesByRegion[region] = []*armcompute.VirtualMachine{}
	}

	vms, err := client.ListVirtualMachines(ctx, f.ResourceGroup)
	if err != nil {
		return nil, trace.Wrap(err)
	}

	for _, vm := range vms {
		location := aws.StringValue(vm.Location)
		if _, ok := instancesByRegion[location]; !ok {
			continue
		}
		vmTags := make(map[string]string, len(vm.Tags))
		for key, value := range vm.Tags {
			vmTags[key] = aws.StringValue(value)
		}
		if match, _, _ := services.MatchLabels(f.Labels, vmTags); !match {
			continue
		}
		instancesByRegion[location] = append(instancesByRegion[location], vm)
	}

	var instances []Instances
	for region, vms := range instancesByRegion {
		if len(vms) > 0 {
			instances = append(instances, Instances{Azure: &AzureInstances{
				SubscriptionID:  f.Subscription,
				Region:          region,
				ResourceGroup:   f.ResourceGroup,
				Instances:       vms,
				ScriptName:      f.Parameters["scriptName"],
				PublicProxyAddr: f.Parameters["publicProxyAddr"],
				Parameters:      []string{f.Parameters["token"]},
				ClientID:        f.ClientID,
			}})
		}
	}

	return instances, nil
}
