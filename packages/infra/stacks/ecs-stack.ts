/**
 * AWS CDK Stack for Bellyfed ECS Infrastructure
 * Creates ECS cluster, services, load balancers, and auto-scaling configuration
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface ECSStackProps extends cdk.StackProps {
  environment: string;
  domainName?: string;
  certificateArn?: string;
  vpcId?: string;
  enableAutoScaling?: boolean;
  enableLogging?: boolean;
}

export class ECSStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly vpc: ec2.IVpc;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly frontendService: ecs.FargateService;
  public readonly backendService: ecs.FargateService;
  public readonly docsService: ecs.FargateService;

  constructor(scope: Construct, id: string, props: ECSStackProps) {
    super(scope, id, props);

    // VPC Configuration
    this.vpc = props.vpcId
      ? ec2.Vpc.fromLookup(this, 'ExistingVPC', { vpcId: props.vpcId })
      : new ec2.Vpc(this, 'BellyfedVPC', {
          maxAzs: 3,
          natGateways: 2,
          enableDnsHostnames: true,
          enableDnsSupport: true,
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
        });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'BellyfedCluster', {
      vpc: this.vpc,
      clusterName: `bellyfed-cluster-${props.environment}`,
      containerInsights: true,
      enableFargateCapacityProviders: true,
    });

    // ECR Repositories
    const frontendRepo = new ecr.Repository(this, 'FrontendRepo', {
      repositoryName: 'bellyfed-frontend',
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 10,
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
      ],
    });

    const backendRepo = new ecr.Repository(this, 'BackendRepo', {
      repositoryName: 'bellyfed-backend',
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 10,
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
      ],
    });

    const docsRepo = new ecr.Repository(this, 'DocsRepo', {
      repositoryName: 'bellyfed-docs',
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 5,
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
      ],
    });

    // EFS File System for shared storage
    const fileSystem = new efs.FileSystem(this, 'BellyfedEFS', {
      vpc: this.vpc,
      encrypted: true,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // EFS Access Point for logs
    const logsAccessPoint = new efs.AccessPoint(this, 'LogsAccessPoint', {
      fileSystem,
      path: '/logs',
      creationInfo: {
        ownerUid: 1001,
        ownerGid: 1001,
        permissions: '755',
      },
    });

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'BellyfedALB', {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: `bellyfed-alb-${props.environment}`,
    });

    // Security Groups
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );

    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS services',
      allowAllOutbound: true,
    });

    ecsSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow traffic from ALB'
    );

    // Task Execution Role
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Add permissions for SSM parameters and ECR
    taskExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssm:GetParameters',
        'ssm:GetParameter',
        'ssm:GetParametersByPath',
        'secretsmanager:GetSecretValue',
        'kms:Decrypt',
      ],
      resources: ['*'],
    }));

    // CloudWatch Log Groups
    const frontendLogGroup = new logs.LogGroup(this, 'FrontendLogGroup', {
      logGroupName: '/ecs/bellyfed-frontend',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const backendLogGroup = new logs.LogGroup(this, 'BackendLogGroup', {
      logGroupName: '/ecs/bellyfed-backend',
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const docsLogGroup = new logs.LogGroup(this, 'DocsLogGroup', {
      logGroupName: '/ecs/bellyfed-docs',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Import ECS Service constructs
    const { BellyfedFrontendService } = require('../constructs/frontend-service');
    const { BellyfedBackendService } = require('../constructs/backend-service');
    const { BellyfedDocsService } = require('../constructs/docs-service');

    // Create ECS Services
    this.frontendService = new BellyfedFrontendService(this, 'FrontendService', {
      cluster: this.cluster,
      vpc: this.vpc,
      securityGroup: ecsSecurityGroup,
      taskExecutionRole,
      logGroup: frontendLogGroup,
      repository: frontendRepo,
      environment: props.environment,
    }).service;

    this.backendService = new BellyfedBackendService(this, 'BackendService', {
      cluster: this.cluster,
      vpc: this.vpc,
      securityGroup: ecsSecurityGroup,
      taskExecutionRole,
      logGroup: backendLogGroup,
      repository: backendRepo,
      fileSystem,
      accessPoint: logsAccessPoint,
      environment: props.environment,
    }).service;

    this.docsService = new BellyfedDocsService(this, 'DocsService', {
      cluster: this.cluster,
      vpc: this.vpc,
      securityGroup: ecsSecurityGroup,
      taskExecutionRole,
      logGroup: docsLogGroup,
      repository: docsRepo,
      environment: props.environment,
    }).service;

    // Configure Load Balancer Listeners and Target Groups
    const httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'Not Found',
      }),
    });

    // Frontend Target Group
    const frontendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'FrontendTargetGroup', {
      vpc: this.vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Backend Target Group
    const backendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'BackendTargetGroup', {
      vpc: this.vpc,
      port: 4000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Docs Target Group
    const docsTargetGroup = new elbv2.ApplicationTargetGroup(this, 'DocsTargetGroup', {
      vpc: this.vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Attach services to target groups
    frontendTargetGroup.addTarget(this.frontendService);
    backendTargetGroup.addTarget(this.backendService);
    docsTargetGroup.addTarget(this.docsService);

    // Configure listener rules
    httpListener.addAction('FrontendAction', {
      priority: 100,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/']),
      ],
      action: elbv2.ListenerAction.forward([frontendTargetGroup]),
    });

    httpListener.addAction('BackendAction', {
      priority: 200,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/*', '/trpc/*']),
      ],
      action: elbv2.ListenerAction.forward([backendTargetGroup]),
    });

    httpListener.addAction('DocsAction', {
      priority: 300,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/docs/*']),
      ],
      action: elbv2.ListenerAction.forward([docsTargetGroup]),
    });

    // Auto Scaling Configuration
    if (props.enableAutoScaling !== false) {
      // Frontend Auto Scaling
      const frontendScaling = this.frontendService.autoScaleTaskCount({
        minCapacity: 2,
        maxCapacity: 10,
      });

      frontendScaling.scaleOnCpuUtilization('FrontendCpuScaling', {
        targetUtilizationPercent: 70,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });

      frontendScaling.scaleOnMemoryUtilization('FrontendMemoryScaling', {
        targetUtilizationPercent: 80,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });

      // Backend Auto Scaling
      const backendScaling = this.backendService.autoScaleTaskCount({
        minCapacity: 2,
        maxCapacity: 20,
      });

      backendScaling.scaleOnCpuUtilization('BackendCpuScaling', {
        targetUtilizationPercent: 70,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });

      backendScaling.scaleOnMemoryUtilization('BackendMemoryScaling', {
        targetUtilizationPercent: 80,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });

      // Docs Auto Scaling (minimal)
      const docsScaling = this.docsService.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 3,
      });

      docsScaling.scaleOnCpuUtilization('DocsCpuScaling', {
        targetUtilizationPercent: 80,
        scaleInCooldown: cdk.Duration.minutes(10),
        scaleOutCooldown: cdk.Duration.minutes(5),
      });
    }

    // CloudWatch Alarms
    new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: this.cluster.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: 'High CPU utilization in ECS cluster',
    });

    new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      metric: this.cluster.metricMemoryUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: 'High memory utilization in ECS cluster',
    });

    // Output important values
    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster Name',
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
    });

    new cdk.CfnOutput(this, 'VPCId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'FrontendRepoURI', {
      value: frontendRepo.repositoryUri,
      description: 'Frontend ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'BackendRepoURI', {
      value: backendRepo.repositoryUri,
      description: 'Backend ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'DocsRepoURI', {
      value: docsRepo.repositoryUri,
      description: 'Docs ECR Repository URI',
    });

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Stack', 'ECS');
  }
}
