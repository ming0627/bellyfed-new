/**
 * Auto-scaling configuration for Bellyfed ECS services
 * Defines scaling policies and CloudWatch alarms
 */

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as applicationautoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import { Construct } from 'constructs';

export interface AutoScalingConfig {
  minCapacity: number;
  maxCapacity: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleInCooldown: cdk.Duration;
  scaleOutCooldown: cdk.Duration;
}

export interface BellyfedAutoScalingProps {
  frontendService: ecs.FargateService;
  backendService: ecs.FargateService;
  docsService: ecs.FargateService;
  environment: string;
  frontendConfig?: AutoScalingConfig;
  backendConfig?: AutoScalingConfig;
  docsConfig?: AutoScalingConfig;
}

export class BellyfedAutoScaling extends Construct {
  public readonly frontendScaling: ecs.ScalableTaskCount;
  public readonly backendScaling: ecs.ScalableTaskCount;
  public readonly docsScaling: ecs.ScalableTaskCount;

  constructor(scope: Construct, id: string, props: BellyfedAutoScalingProps) {
    super(scope, id);

    // Default configurations
    const defaultFrontendConfig: AutoScalingConfig = {
      minCapacity: 2,
      maxCapacity: 10,
      targetCpuUtilization: 70,
      targetMemoryUtilization: 80,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(2),
    };

    const defaultBackendConfig: AutoScalingConfig = {
      minCapacity: 2,
      maxCapacity: 20,
      targetCpuUtilization: 70,
      targetMemoryUtilization: 80,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(2),
    };

    const defaultDocsConfig: AutoScalingConfig = {
      minCapacity: 1,
      maxCapacity: 3,
      targetCpuUtilization: 80,
      targetMemoryUtilization: 85,
      scaleInCooldown: cdk.Duration.minutes(10),
      scaleOutCooldown: cdk.Duration.minutes(5),
    };

    const frontendConfig = { ...defaultFrontendConfig, ...props.frontendConfig };
    const backendConfig = { ...defaultBackendConfig, ...props.backendConfig };
    const docsConfig = { ...defaultDocsConfig, ...props.docsConfig };

    // Frontend Auto Scaling
    this.frontendScaling = props.frontendService.autoScaleTaskCount({
      minCapacity: frontendConfig.minCapacity,
      maxCapacity: frontendConfig.maxCapacity,
    });

    this.frontendScaling.scaleOnCpuUtilization('FrontendCpuScaling', {
      targetUtilizationPercent: frontendConfig.targetCpuUtilization,
      scaleInCooldown: frontendConfig.scaleInCooldown,
      scaleOutCooldown: frontendConfig.scaleOutCooldown,
    });

    this.frontendScaling.scaleOnMemoryUtilization('FrontendMemoryScaling', {
      targetUtilizationPercent: frontendConfig.targetMemoryUtilization,
      scaleInCooldown: frontendConfig.scaleInCooldown,
      scaleOutCooldown: frontendConfig.scaleOutCooldown,
    });

    // Backend Auto Scaling
    this.backendScaling = props.backendService.autoScaleTaskCount({
      minCapacity: backendConfig.minCapacity,
      maxCapacity: backendConfig.maxCapacity,
    });

    this.backendScaling.scaleOnCpuUtilization('BackendCpuScaling', {
      targetUtilizationPercent: backendConfig.targetCpuUtilization,
      scaleInCooldown: backendConfig.scaleInCooldown,
      scaleOutCooldown: backendConfig.scaleOutCooldown,
    });

    this.backendScaling.scaleOnMemoryUtilization('BackendMemoryScaling', {
      targetUtilizationPercent: backendConfig.targetMemoryUtilization,
      scaleInCooldown: backendConfig.scaleInCooldown,
      scaleOutCooldown: backendConfig.scaleOutCooldown,
    });

    // Custom scaling based on request count
    const requestCountMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'RequestCount',
      dimensionsMap: {
        LoadBalancer: 'app/bellyfed-alb-' + props.environment,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
    });

    this.backendScaling.scaleOnMetric('BackendRequestScaling', {
      metric: requestCountMetric,
      scalingSteps: [
        { upper: 100, change: -1 },
        { lower: 500, change: +1 },
        { lower: 1000, change: +2 },
        { lower: 2000, change: +3 },
      ],
      adjustmentType: applicationautoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: cdk.Duration.minutes(3),
    });

    // Docs Auto Scaling (minimal)
    this.docsScaling = props.docsService.autoScaleTaskCount({
      minCapacity: docsConfig.minCapacity,
      maxCapacity: docsConfig.maxCapacity,
    });

    this.docsScaling.scaleOnCpuUtilization('DocsCpuScaling', {
      targetUtilizationPercent: docsConfig.targetCpuUtilization,
      scaleInCooldown: docsConfig.scaleInCooldown,
      scaleOutCooldown: docsConfig.scaleOutCooldown,
    });

    // CloudWatch Alarms for monitoring
    new cloudwatch.Alarm(this, 'FrontendHighCpuAlarm', {
      metric: props.frontendService.metricCpuUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: 'Frontend service high CPU utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'BackendHighCpuAlarm', {
      metric: props.backendService.metricCpuUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: 'Backend service high CPU utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'FrontendHighMemoryAlarm', {
      metric: props.frontendService.metricMemoryUtilization(),
      threshold: 90,
      evaluationPeriods: 2,
      alarmDescription: 'Frontend service high memory utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'BackendHighMemoryAlarm', {
      metric: props.backendService.metricMemoryUtilization(),
      threshold: 90,
      evaluationPeriods: 2,
      alarmDescription: 'Backend service high memory utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Scheduled scaling for predictable traffic patterns
    this.createScheduledScaling(props.environment);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'auto-scaling');
  }

  private createScheduledScaling(environment: string) {
    // Scale up during peak hours (9 AM - 9 PM UTC)
    this.backendScaling.scaleOnSchedule('ScaleUpMorning', {
      schedule: applicationautoscaling.Schedule.cron({
        hour: '9',
        minute: '0',
      }),
      minCapacity: 4,
      maxCapacity: 20,
    });

    // Scale down during off-peak hours (9 PM - 9 AM UTC)
    this.backendScaling.scaleOnSchedule('ScaleDownEvening', {
      schedule: applicationautoscaling.Schedule.cron({
        hour: '21',
        minute: '0',
      }),
      minCapacity: 2,
      maxCapacity: 10,
    });

    // Weekend scaling (reduced capacity)
    this.backendScaling.scaleOnSchedule('WeekendScaling', {
      schedule: applicationautoscaling.Schedule.cron({
        hour: '0',
        minute: '0',
        weekDay: '6', // Saturday
      }),
      minCapacity: 1,
      maxCapacity: 5,
    });

    // Back to normal on Monday
    this.backendScaling.scaleOnSchedule('MondayScaling', {
      schedule: applicationautoscaling.Schedule.cron({
        hour: '6',
        minute: '0',
        weekDay: '1', // Monday
      }),
      minCapacity: 2,
      maxCapacity: 20,
    });
  }
}
