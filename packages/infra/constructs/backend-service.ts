/**
 * CDK Construct for Bellyfed Backend ECS Service
 * Creates Fargate service for tRPC backend application
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as efs from 'aws-cdk-lib/aws-efs';
import { Construct } from 'constructs';

export interface BellyfedBackendServiceProps {
  cluster: ecs.Cluster;
  vpc: ec2.IVpc;
  securityGroup: ec2.SecurityGroup;
  taskExecutionRole: iam.Role;
  logGroup: logs.LogGroup;
  repository: ecr.Repository;
  fileSystem: efs.FileSystem;
  accessPoint: efs.AccessPoint;
  environment: string;
  desiredCount?: number;
  cpu?: number;
  memory?: number;
}

export class BellyfedBackendService extends Construct {
  public readonly service: ecs.FargateService;
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props: BellyfedBackendServiceProps) {
    super(scope, id);

    // Task Role for the backend service
    const taskRole = new iam.Role(this, 'BackendTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for Bellyfed backend service',
    });

    // Add permissions for AWS services
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        'ses:SendEmail',
        'ses:SendRawEmail',
        'cognito-idp:*',
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
      ],
      resources: ['*'],
    }));

    // Task Definition
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDef', {
      family: `bellyfed-backend-${props.environment}`,
      cpu: props.cpu || 1024,
      memoryLimitMiB: props.memory || 2048,
      executionRole: props.taskExecutionRole,
      taskRole: taskRole,
    });

    // Add EFS volume
    this.taskDefinition.addVolume({
      name: 'logs',
      efsVolumeConfiguration: {
        fileSystemId: props.fileSystem.fileSystemId,
        transitEncryption: 'ENABLED',
        authorizationConfig: {
          accessPointId: props.accessPoint.accessPointId,
          iam: 'ENABLED',
        },
      },
    });

    // Container Definition
    const container = this.taskDefinition.addContainer('backend', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.logGroup,
        streamPrefix: 'backend',
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        AWS_REGION: cdk.Stack.of(this).region,
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSsmParameter(
          cdk.aws_ssm.StringParameter.fromStringParameterName(
            this,
            'DatabaseUrlParam',
            `/bellyfed/${props.environment}/database-url`
          )
        ),
        JWT_SECRET: ecs.Secret.fromSsmParameter(
          cdk.aws_ssm.StringParameter.fromStringParameterName(
            this,
            'JwtSecretParam',
            `/bellyfed/${props.environment}/jwt-secret`
          )
        ),
        REDIS_URL: ecs.Secret.fromSsmParameter(
          cdk.aws_ssm.StringParameter.fromStringParameterName(
            this,
            'RedisUrlParam',
            `/bellyfed/${props.environment}/redis-url`
          )
        ),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'node healthcheck.js || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(90),
      },
      stopTimeout: cdk.Duration.seconds(30),
      startTimeout: cdk.Duration.seconds(180),
      user: 'backend',
      workingDirectory: '/app',
    });

    // Add EFS mount point
    container.addMountPoints({
      sourceVolume: 'logs',
      containerPath: '/app/logs',
      readOnly: false,
    });

    // Port mapping
    container.addPortMappings({
      containerPort: 4000,
      protocol: ecs.Protocol.TCP,
      name: 'http',
    });

    // Fargate Service
    this.service = new ecs.FargateService(this, 'BackendService', {
      cluster: props.cluster,
      taskDefinition: this.taskDefinition,
      serviceName: `bellyfed-backend-${props.environment}`,
      desiredCount: props.desiredCount || 2,
      assignPublicIp: false,
      securityGroups: [props.securityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      enableExecuteCommand: true,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE',
          weight: 1,
          base: 1,
        },
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 2,
        },
      ],
      enableLogging: true,
      cloudMapOptions: {
        name: 'backend',
        cloudMapNamespace: props.cluster.defaultCloudMapNamespace,
        dnsRecordType: cdk.aws_servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    // Circuit Breaker
    this.service.enableDeploymentAlarms();

    // Allow EFS access
    props.fileSystem.connections.allowDefaultPortFrom(this.service);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'backend');
    cdk.Tags.of(this).add('Service', 'api');
  }
}
