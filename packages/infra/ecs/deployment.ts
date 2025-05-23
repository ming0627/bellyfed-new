/**
 * Deployment configuration for Bellyfed ECS services
 * Handles blue/green deployments, rolling updates, and deployment strategies
 */

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface BellyfedDeploymentProps {
  cluster: ecs.Cluster;
  frontendService: ecs.FargateService;
  backendService: ecs.FargateService;
  docsService: ecs.FargateService;
  environment: string;
  enableBlueGreenDeployment?: boolean;
  enableRollbackAlarms?: boolean;
  notificationTopic?: sns.Topic;
}

export class BellyfedDeployment extends Construct {
  public readonly frontendDeploymentGroup?: codedeploy.EcsDeploymentGroup;
  public readonly backendDeploymentGroup?: codedeploy.EcsDeploymentGroup;
  public readonly docsDeploymentGroup?: codedeploy.EcsDeploymentGroup;
  public readonly deploymentApplication: codedeploy.EcsApplication;

  constructor(scope: Construct, id: string, props: BellyfedDeploymentProps) {
    super(scope, id);

    // CodeDeploy Application
    this.deploymentApplication = new codedeploy.EcsApplication(this, 'DeploymentApplication', {
      applicationName: `bellyfed-${props.environment}`,
    });

    // Create deployment groups if blue/green is enabled
    if (props.enableBlueGreenDeployment) {
      this.createBlueGreenDeployments(props);
    }

    // Configure deployment alarms
    if (props.enableRollbackAlarms) {
      this.createDeploymentAlarms(props);
    }

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'deployment');
  }

  private createBlueGreenDeployments(props: BellyfedDeploymentProps) {
    // IAM Role for CodeDeploy
    const codeDeployRole = new iam.Role(this, 'CodeDeployRole', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployRoleForECS'),
      ],
    });

    // Frontend Deployment Group
    this.frontendDeploymentGroup = new codedeploy.EcsDeploymentGroup(this, 'FrontendDeploymentGroup', {
      application: this.deploymentApplication,
      deploymentGroupName: `bellyfed-frontend-${props.environment}`,
      service: props.frontendService,
      deploymentConfig: codedeploy.EcsDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      role: codeDeployRole,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
        deploymentInAlarm: props.enableRollbackAlarms,
      },
      alarms: props.enableRollbackAlarms ? this.createServiceAlarms('frontend', props) : undefined,
    });

    // Backend Deployment Group
    this.backendDeploymentGroup = new codedeploy.EcsDeploymentGroup(this, 'BackendDeploymentGroup', {
      application: this.deploymentApplication,
      deploymentGroupName: `bellyfed-backend-${props.environment}`,
      service: props.backendService,
      deploymentConfig: codedeploy.EcsDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      role: codeDeployRole,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
        deploymentInAlarm: props.enableRollbackAlarms,
      },
      alarms: props.enableRollbackAlarms ? this.createServiceAlarms('backend', props) : undefined,
    });

    // Docs Deployment Group (simpler deployment)
    this.docsDeploymentGroup = new codedeploy.EcsDeploymentGroup(this, 'DocsDeploymentGroup', {
      application: this.deploymentApplication,
      deploymentGroupName: `bellyfed-docs-${props.environment}`,
      service: props.docsService,
      deploymentConfig: codedeploy.EcsDeploymentConfig.ALL_AT_ONCE,
      role: codeDeployRole,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
      },
    });
  }

  private createServiceAlarms(serviceName: string, props: BellyfedDeploymentProps): cloudwatch.Alarm[] {
    const alarms: cloudwatch.Alarm[] = [];

    // High CPU Alarm
    const cpuAlarm = new cloudwatch.Alarm(this, `${serviceName}HighCpuAlarm`, {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          ServiceName: serviceName === 'frontend' 
            ? props.frontendService.serviceName 
            : serviceName === 'backend'
            ? props.backendService.serviceName
            : props.docsService.serviceName,
          ClusterName: props.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(2),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: `High CPU utilization for ${serviceName} service`,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    alarms.push(cpuAlarm);

    // High Memory Alarm
    const memoryAlarm = new cloudwatch.Alarm(this, `${serviceName}HighMemoryAlarm`, {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'MemoryUtilization',
        dimensionsMap: {
          ServiceName: serviceName === 'frontend' 
            ? props.frontendService.serviceName 
            : serviceName === 'backend'
            ? props.backendService.serviceName
            : props.docsService.serviceName,
          ClusterName: props.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(2),
      }),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: `High memory utilization for ${serviceName} service`,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    alarms.push(memoryAlarm);

    // Service Health Alarm
    const healthAlarm = new cloudwatch.Alarm(this, `${serviceName}ServiceHealthAlarm`, {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'RunningTaskCount',
        dimensionsMap: {
          ServiceName: serviceName === 'frontend' 
            ? props.frontendService.serviceName 
            : serviceName === 'backend'
            ? props.backendService.serviceName
            : props.docsService.serviceName,
          ClusterName: props.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 2,
      alarmDescription: `${serviceName} service has no running tasks`,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });

    alarms.push(healthAlarm);

    return alarms;
  }

  private createDeploymentAlarms(props: BellyfedDeploymentProps) {
    // Deployment failure alarm
    const deploymentFailureAlarm = new cloudwatch.Alarm(this, 'DeploymentFailureAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CodeDeploy',
        metricName: 'Deployments',
        dimensionsMap: {
          ApplicationName: this.deploymentApplication.applicationName,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Deployment failure detected',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Add notification if topic is provided
    if (props.notificationTopic) {
      deploymentFailureAlarm.addAlarmAction(
        new cloudwatch.SnsAction(props.notificationTopic)
      );
    }
  }

  public createDeploymentConfig(configName: string, trafficRoutingConfig: {
    type: 'TimeBasedCanary' | 'TimeBasedLinear' | 'AllAtOnce';
    canaryPercentage?: number;
    canaryInterval?: cdk.Duration;
    linearPercentage?: number;
    linearInterval?: cdk.Duration;
  }) {
    const config: any = {
      deploymentConfigName: configName,
      computePlatform: 'ECS',
    };

    switch (trafficRoutingConfig.type) {
      case 'TimeBasedCanary':
        config.trafficRoutingConfig = {
          type: 'TimeBasedCanary',
          timeBasedCanary: {
            canaryPercentage: trafficRoutingConfig.canaryPercentage || 10,
            canaryInterval: trafficRoutingConfig.canaryInterval?.toMinutes() || 5,
          },
        };
        break;
      case 'TimeBasedLinear':
        config.trafficRoutingConfig = {
          type: 'TimeBasedLinear',
          timeBasedLinear: {
            linearPercentage: trafficRoutingConfig.linearPercentage || 10,
            linearInterval: trafficRoutingConfig.linearInterval?.toMinutes() || 10,
          },
        };
        break;
      case 'AllAtOnce':
        config.trafficRoutingConfig = {
          type: 'AllAtOnce',
        };
        break;
    }

    return new codedeploy.CfnDeploymentConfig(this, `${configName}Config`, config);
  }

  public getDeploymentMetrics() {
    return {
      deploymentCount: new cloudwatch.Metric({
        namespace: 'AWS/CodeDeploy',
        metricName: 'Deployments',
        dimensionsMap: {
          ApplicationName: this.deploymentApplication.applicationName,
        },
        statistic: 'Sum',
      }),
      deploymentDuration: new cloudwatch.Metric({
        namespace: 'AWS/CodeDeploy',
        metricName: 'DeploymentDuration',
        dimensionsMap: {
          ApplicationName: this.deploymentApplication.applicationName,
        },
        statistic: 'Average',
      }),
      deploymentSuccessRate: new cloudwatch.Metric({
        namespace: 'AWS/CodeDeploy',
        metricName: 'DeploymentSuccessRate',
        dimensionsMap: {
          ApplicationName: this.deploymentApplication.applicationName,
        },
        statistic: 'Average',
      }),
    };
  }
}
