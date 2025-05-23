/**
 * ECS Cluster configuration for Bellyfed
 * Defines cluster settings, capacity providers, and service discovery
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BellyfedClusterConfigProps {
  vpc: ec2.IVpc;
  environment: string;
  enableContainerInsights?: boolean;
  enableServiceDiscovery?: boolean;
  enableCapacityProviders?: boolean;
}

export class BellyfedClusterConfig extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly namespace?: servicediscovery.PrivateDnsNamespace;
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: BellyfedClusterConfigProps) {
    super(scope, id);

    // CloudWatch Log Group for cluster
    this.logGroup = new logs.LogGroup(this, 'ClusterLogGroup', {
      logGroupName: `/aws/ecs/cluster/bellyfed-${props.environment}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: `bellyfed-cluster-${props.environment}`,
      containerInsights: props.enableContainerInsights !== false,
      enableFargateCapacityProviders: props.enableCapacityProviders !== false,
    });

    // Service Discovery Namespace
    if (props.enableServiceDiscovery !== false) {
      this.namespace = new servicediscovery.PrivateDnsNamespace(this, 'ServiceDiscovery', {
        name: `bellyfed-${props.environment}.local`,
        vpc: props.vpc,
        description: `Service discovery namespace for Bellyfed ${props.environment}`,
      });

      // Associate namespace with cluster
      this.cluster.addDefaultCloudMapNamespace({
        name: `bellyfed-${props.environment}.local`,
        type: servicediscovery.NamespaceType.DNS_PRIVATE,
        vpc: props.vpc,
      });
    }

    // Capacity Providers
    if (props.enableCapacityProviders !== false) {
      this.configureCapacityProviders();
    }

    // Cluster Settings
    this.configureClusterSettings(props);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'ecs-cluster');
  }

  private configureCapacityProviders() {
    // Fargate capacity provider
    const fargateCapacityProvider = new ecs.CfnCapacityProvider(this, 'FargateCapacityProvider', {
      name: `bellyfed-fargate-${this.node.addr}`,
      fargateCapacityProviderProperties: {
        platformVersion: 'LATEST',
      },
    });

    // Fargate Spot capacity provider
    const fargateSpotCapacityProvider = new ecs.CfnCapacityProvider(this, 'FargateSpotCapacityProvider', {
      name: `bellyfed-fargate-spot-${this.node.addr}`,
      fargateCapacityProviderProperties: {
        platformVersion: 'LATEST',
      },
    });

    // Associate capacity providers with cluster
    new ecs.CfnClusterCapacityProviderAssociations(this, 'CapacityProviderAssociations', {
      cluster: this.cluster.clusterName,
      capacityProviders: [
        fargateCapacityProvider.name!,
        fargateSpotCapacityProvider.name!,
      ],
      defaultCapacityProviderStrategy: [
        {
          capacityProvider: fargateCapacityProvider.name!,
          weight: 1,
          base: 1,
        },
        {
          capacityProvider: fargateSpotCapacityProvider.name!,
          weight: 4,
        },
      ],
    });
  }

  private configureClusterSettings(props: BellyfedClusterConfigProps) {
    // Cluster configuration
    const clusterSettings = [
      {
        name: 'containerInsights',
        value: props.enableContainerInsights !== false ? 'enabled' : 'disabled',
      },
    ];

    // Apply settings using escape hatch
    const cfnCluster = this.cluster.node.defaultChild as ecs.CfnCluster;
    cfnCluster.clusterSettings = clusterSettings;

    // Configure logging
    cfnCluster.configuration = {
      executeCommandConfiguration: {
        logging: 'OVERRIDE',
        logConfiguration: {
          cloudWatchLogGroupName: this.logGroup.logGroupName,
          cloudWatchEncryptionEnabled: true,
        },
      },
    };
  }

  public addService(serviceProps: {
    serviceName: string;
    taskDefinition: ecs.TaskDefinition;
    desiredCount?: number;
    enableServiceDiscovery?: boolean;
  }) {
    const service = new ecs.FargateService(this, serviceProps.serviceName, {
      cluster: this.cluster,
      taskDefinition: serviceProps.taskDefinition,
      serviceName: serviceProps.serviceName,
      desiredCount: serviceProps.desiredCount || 1,
      enableExecuteCommand: true,
      enableLogging: true,
      cloudMapOptions: serviceProps.enableServiceDiscovery !== false && this.namespace ? {
        name: serviceProps.serviceName,
        cloudMapNamespace: this.namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      } : undefined,
    });

    return service;
  }

  public getClusterMetrics() {
    return {
      cpuUtilization: this.cluster.metricCpuUtilization(),
      memoryUtilization: this.cluster.metricMemoryUtilization(),
      runningTasksCount: this.cluster.metric('RunningTasksCount'),
      pendingTasksCount: this.cluster.metric('PendingTasksCount'),
      activeServicesCount: this.cluster.metric('ActiveServicesCount'),
    };
  }
}
