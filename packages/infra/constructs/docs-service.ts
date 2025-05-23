/**
 * CDK Construct for Bellyfed Documentation ECS Service
 * Creates Fargate service for Nextra documentation site
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BellyfedDocsServiceProps {
  cluster: ecs.Cluster;
  vpc: ec2.IVpc;
  securityGroup: ec2.SecurityGroup;
  taskExecutionRole: iam.Role;
  logGroup: logs.LogGroup;
  repository: ecr.Repository;
  environment: string;
  desiredCount?: number;
  cpu?: number;
  memory?: number;
}

export class BellyfedDocsService extends Construct {
  public readonly service: ecs.FargateService;
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props: BellyfedDocsServiceProps) {
    super(scope, id);

    // Task Role for the docs service
    const taskRole = new iam.Role(this, 'DocsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for Bellyfed documentation service',
    });

    // Add permissions for CloudWatch metrics and logs
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    // Task Definition
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'DocsTaskDef', {
      family: `bellyfed-docs-${props.environment}`,
      cpu: props.cpu || 256,
      memoryLimitMiB: props.memory || 512,
      executionRole: props.taskExecutionRole,
      taskRole: taskRole,
    });

    // Container Definition
    const container = this.taskDefinition.addContainer('docs', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.logGroup,
        streamPrefix: 'docs',
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3001',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      healthCheck: {
        command: ['CMD-SHELL', 'node healthcheck.js || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
      stopTimeout: cdk.Duration.seconds(30),
      startTimeout: cdk.Duration.seconds(120),
      user: 'nextjs',
      workingDirectory: '/app',
    });

    // Port mapping
    container.addPortMappings({
      containerPort: 3001,
      protocol: ecs.Protocol.TCP,
      name: 'http',
    });

    // Fargate Service
    this.service = new ecs.FargateService(this, 'DocsService', {
      cluster: props.cluster,
      taskDefinition: this.taskDefinition,
      serviceName: `bellyfed-docs-${props.environment}`,
      desiredCount: props.desiredCount || 1,
      assignPublicIp: false,
      securityGroups: [props.securityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      enableExecuteCommand: true,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      enableLogging: true,
      cloudMapOptions: {
        name: 'docs',
        cloudMapNamespace: props.cluster.defaultCloudMapNamespace,
        dnsRecordType: cdk.aws_servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    // Circuit Breaker
    this.service.enableDeploymentAlarms();

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'docs');
    cdk.Tags.of(this).add('Service', 'documentation');
  }
}
