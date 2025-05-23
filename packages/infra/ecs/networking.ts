/**
 * Networking configuration for Bellyfed ECS infrastructure
 * Defines VPC, subnets, NAT gateways, and network security
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BellyfedNetworkingProps {
  environment: string;
  vpcCidr?: string;
  maxAzs?: number;
  natGateways?: number;
  enableVpcFlowLogs?: boolean;
  enableDnsHostnames?: boolean;
  enableDnsSupport?: boolean;
}

export class BellyfedNetworking extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly privateSubnets: ec2.ISubnet[];
  public readonly isolatedSubnets: ec2.ISubnet[];
  public readonly flowLogsRole?: cdk.aws_iam.Role;

  constructor(scope: Construct, id: string, props: BellyfedNetworkingProps) {
    super(scope, id);

    // VPC Configuration
    this.vpc = new ec2.Vpc(this, 'VPC', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr || '10.0.0.0/16'),
      maxAzs: props.maxAzs || 3,
      natGateways: props.natGateways || 2,
      enableDnsHostnames: props.enableDnsHostnames !== false,
      enableDnsSupport: props.enableDnsSupport !== false,
      vpcName: `bellyfed-vpc-${props.environment}`,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
        DynamoDB: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      },
    });

    // Store subnet references
    this.publicSubnets = this.vpc.publicSubnets;
    this.privateSubnets = this.vpc.privateSubnets;
    this.isolatedSubnets = this.vpc.isolatedSubnets;

    // VPC Endpoints for AWS services
    this.createVpcEndpoints();

    // VPC Flow Logs
    if (props.enableVpcFlowLogs !== false) {
      this.createVpcFlowLogs(props.environment);
    }

    // Network ACLs
    this.createNetworkAcls();

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'networking');
  }

  private createVpcEndpoints() {
    // ECR API endpoint
    this.vpc.addInterfaceEndpoint('ECRApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      privateDnsEnabled: true,
    });

    // ECR Docker endpoint
    this.vpc.addInterfaceEndpoint('ECRDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      privateDnsEnabled: true,
    });

    // CloudWatch Logs endpoint
    this.vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      privateDnsEnabled: true,
    });

    // CloudWatch Monitoring endpoint
    this.vpc.addInterfaceEndpoint('CloudWatchEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH,
      privateDnsEnabled: true,
    });

    // ECS endpoint
    this.vpc.addInterfaceEndpoint('ECSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECS,
      privateDnsEnabled: true,
    });

    // ECS Agent endpoint
    this.vpc.addInterfaceEndpoint('ECSAgentEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECS_AGENT,
      privateDnsEnabled: true,
    });

    // ECS Telemetry endpoint
    this.vpc.addInterfaceEndpoint('ECSTelemetryEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
      privateDnsEnabled: true,
    });

    // SSM endpoint
    this.vpc.addInterfaceEndpoint('SSMEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      privateDnsEnabled: true,
    });

    // Secrets Manager endpoint
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      privateDnsEnabled: true,
    });

    // KMS endpoint
    this.vpc.addInterfaceEndpoint('KMSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.KMS,
      privateDnsEnabled: true,
    });
  }

  private createVpcFlowLogs(environment: string) {
    // CloudWatch Log Group for VPC Flow Logs
    const flowLogsGroup = new logs.LogGroup(this, 'VpcFlowLogsGroup', {
      logGroupName: `/aws/vpc/flowlogs/bellyfed-${environment}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM Role for VPC Flow Logs
    this.flowLogsRole = new cdk.aws_iam.Role(this, 'VpcFlowLogsRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('vpc-flow-logs.amazonaws.com'),
      inlinePolicies: {
        flowLogsDeliveryRolePolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogGroups',
                'logs:DescribeLogStreams',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // VPC Flow Logs
    new ec2.FlowLog(this, 'VpcFlowLogs', {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
      destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogsGroup, this.flowLogsRole),
      trafficType: ec2.FlowLogTrafficType.ALL,
    });
  }

  private createNetworkAcls() {
    // Public Subnet Network ACL
    const publicNetworkAcl = new ec2.NetworkAcl(this, 'PublicNetworkAcl', {
      vpc: this.vpc,
      networkAclName: 'bellyfed-public-nacl',
    });

    // Allow HTTP/HTTPS inbound
    publicNetworkAcl.addEntry('AllowHttpInbound', {
      ruleNumber: 100,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.tcpPort(80),
      direction: ec2.TrafficDirection.INGRESS,
    });

    publicNetworkAcl.addEntry('AllowHttpsInbound', {
      ruleNumber: 110,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.tcpPort(443),
      direction: ec2.TrafficDirection.INGRESS,
    });

    // Allow ephemeral ports inbound (for return traffic)
    publicNetworkAcl.addEntry('AllowEphemeralInbound', {
      ruleNumber: 120,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.tcpPortRange(1024, 65535),
      direction: ec2.TrafficDirection.INGRESS,
    });

    // Allow all outbound
    publicNetworkAcl.addEntry('AllowAllOutbound', {
      ruleNumber: 100,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.allTraffic(),
      direction: ec2.TrafficDirection.EGRESS,
    });

    // Associate with public subnets
    this.publicSubnets.forEach((subnet, index) => {
      new ec2.NetworkAclEntry(this, `PublicSubnetAssociation${index}`, {
        networkAcl: publicNetworkAcl,
        ruleNumber: 200 + index,
        cidr: ec2.AclCidr.anyIpv4(),
        traffic: ec2.AclTraffic.allTraffic(),
        direction: ec2.TrafficDirection.INGRESS,
      });
    });

    // Private Subnet Network ACL
    const privateNetworkAcl = new ec2.NetworkAcl(this, 'PrivateNetworkAcl', {
      vpc: this.vpc,
      networkAclName: 'bellyfed-private-nacl',
    });

    // Allow traffic from VPC CIDR
    privateNetworkAcl.addEntry('AllowVpcInbound', {
      ruleNumber: 100,
      cidr: ec2.AclCidr.ipv4(this.vpc.vpcCidrBlock),
      traffic: ec2.AclTraffic.allTraffic(),
      direction: ec2.TrafficDirection.INGRESS,
    });

    // Allow ephemeral ports from internet (for outbound connections)
    privateNetworkAcl.addEntry('AllowEphemeralFromInternet', {
      ruleNumber: 110,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.tcpPortRange(1024, 65535),
      direction: ec2.TrafficDirection.INGRESS,
    });

    // Allow all outbound
    privateNetworkAcl.addEntry('AllowAllOutbound', {
      ruleNumber: 100,
      cidr: ec2.AclCidr.anyIpv4(),
      traffic: ec2.AclTraffic.allTraffic(),
      direction: ec2.TrafficDirection.EGRESS,
    });
  }

  public createSecurityGroup(name: string, description: string, allowAllOutbound: boolean = true): ec2.SecurityGroup {
    return new ec2.SecurityGroup(this, name, {
      vpc: this.vpc,
      description,
      allowAllOutbound,
      securityGroupName: `bellyfed-${name.toLowerCase()}`,
    });
  }

  public getAvailabilityZones(): string[] {
    return this.vpc.availabilityZones;
  }

  public getVpcEndpoints() {
    return {
      s3: this.vpc.node.findChild('S3') as ec2.GatewayVpcEndpoint,
      dynamodb: this.vpc.node.findChild('DynamoDB') as ec2.GatewayVpcEndpoint,
    };
  }
}
