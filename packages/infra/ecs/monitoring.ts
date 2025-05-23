/**
 * CloudWatch monitoring and alerting for Bellyfed ECS services
 * Creates dashboards, alarms, and log insights queries
 */

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export interface BellyfedMonitoringProps {
  cluster: ecs.Cluster;
  frontendService: ecs.FargateService;
  backendService: ecs.FargateService;
  docsService: ecs.FargateService;
  loadBalancer: elbv2.ApplicationLoadBalancer;
  environment: string;
  alertEmail?: string;
  enableDetailedMonitoring?: boolean;
}

export class BellyfedMonitoring extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: BellyfedMonitoringProps) {
    super(scope, id);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `bellyfed-alerts-${props.environment}`,
      displayName: `Bellyfed Alerts - ${props.environment}`,
    });

    if (props.alertEmail) {
      this.alertTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(props.alertEmail)
      );
    }

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `Bellyfed-${props.environment}`,
    });

    this.createServiceMetrics(props);
    this.createLoadBalancerMetrics(props);
    this.createAlarms(props);
    this.createLogInsights(props);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'monitoring');
  }

  private createServiceMetrics(props: BellyfedMonitoringProps) {
    // ECS Service Metrics
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'ECS Service CPU Utilization',
        left: [
          props.frontendService.metricCpuUtilization(),
          props.backendService.metricCpuUtilization(),
          props.docsService.metricCpuUtilization(),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'ECS Service Memory Utilization',
        left: [
          props.frontendService.metricMemoryUtilization(),
          props.backendService.metricMemoryUtilization(),
          props.docsService.metricMemoryUtilization(),
        ],
        width: 12,
        height: 6,
      })
    );

    // Task Count Metrics
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Running Task Count',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/ECS',
            metricName: 'RunningTaskCount',
            dimensionsMap: {
              ServiceName: props.frontendService.serviceName,
              ClusterName: props.cluster.clusterName,
            },
            label: 'Frontend Tasks',
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/ECS',
            metricName: 'RunningTaskCount',
            dimensionsMap: {
              ServiceName: props.backendService.serviceName,
              ClusterName: props.cluster.clusterName,
            },
            label: 'Backend Tasks',
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/ECS',
            metricName: 'RunningTaskCount',
            dimensionsMap: {
              ServiceName: props.docsService.serviceName,
              ClusterName: props.cluster.clusterName,
            },
            label: 'Docs Tasks',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private createLoadBalancerMetrics(props: BellyfedMonitoringProps) {
    // Load Balancer Metrics
    const requestCountMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'RequestCount',
      dimensionsMap: {
        LoadBalancer: props.loadBalancer.loadBalancerFullName,
      },
      statistic: 'Sum',
    });

    const responseTimeMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'TargetResponseTime',
      dimensionsMap: {
        LoadBalancer: props.loadBalancer.loadBalancerFullName,
      },
      statistic: 'Average',
    });

    const errorRateMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'HTTPCode_ELB_5XX_Count',
      dimensionsMap: {
        LoadBalancer: props.loadBalancer.loadBalancerFullName,
      },
      statistic: 'Sum',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Load Balancer Request Count',
        left: [requestCountMetric],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Load Balancer Response Time',
        left: [responseTimeMetric],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Load Balancer Error Rate',
        left: [errorRateMetric],
        width: 8,
        height: 6,
      })
    );
  }

  private createAlarms(props: BellyfedMonitoringProps) {
    // High CPU Utilization Alarms
    new cloudwatch.Alarm(this, 'FrontendHighCpuAlarm', {
      metric: props.frontendService.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: 'Frontend service high CPU utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    new cloudwatch.Alarm(this, 'BackendHighCpuAlarm', {
      metric: props.backendService.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: 'Backend service high CPU utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    // High Memory Utilization Alarms
    new cloudwatch.Alarm(this, 'FrontendHighMemoryAlarm', {
      metric: props.frontendService.metricMemoryUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: 'Frontend service high memory utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    new cloudwatch.Alarm(this, 'BackendHighMemoryAlarm', {
      metric: props.backendService.metricMemoryUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      alarmDescription: 'Backend service high memory utilization',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    // Service Health Alarms
    new cloudwatch.Alarm(this, 'FrontendServiceDownAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'RunningTaskCount',
        dimensionsMap: {
          ServiceName: props.frontendService.serviceName,
          ClusterName: props.cluster.clusterName,
        },
      }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 2,
      alarmDescription: 'Frontend service has no running tasks',
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    // Load Balancer Error Rate Alarm
    new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'HTTPCode_ELB_5XX_Count',
        dimensionsMap: {
          LoadBalancer: props.loadBalancer.loadBalancerFullName,
        },
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'High error rate on load balancer',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));

    // Response Time Alarm
    new cloudwatch.Alarm(this, 'HighResponseTimeAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'TargetResponseTime',
        dimensionsMap: {
          LoadBalancer: props.loadBalancer.loadBalancerFullName,
        },
        statistic: 'Average',
      }),
      threshold: 2, // 2 seconds
      evaluationPeriods: 3,
      alarmDescription: 'High response time on load balancer',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(this.alertTopic));
  }

  private createLogInsights(props: BellyfedMonitoringProps) {
    // Create Log Insights queries for common debugging scenarios
    const logGroups = [
      `/ecs/bellyfed-frontend`,
      `/ecs/bellyfed-backend`,
      `/ecs/bellyfed-docs`,
    ];

    // Error analysis query
    new logs.QueryDefinition(this, 'ErrorAnalysisQuery', {
      queryDefinitionName: `bellyfed-errors-${props.environment}`,
      queryString: `
        fields @timestamp, @message
        | filter @message like /ERROR/
        | sort @timestamp desc
        | limit 100
      `,
      logGroups: logGroups.map(name => 
        logs.LogGroup.fromLogGroupName(this, `LogGroup-${name.replace(/[^a-zA-Z0-9]/g, '')}`, name)
      ),
    });

    // Performance analysis query
    new logs.QueryDefinition(this, 'PerformanceAnalysisQuery', {
      queryDefinitionName: `bellyfed-performance-${props.environment}`,
      queryString: `
        fields @timestamp, @message
        | filter @message like /response_time/
        | stats avg(response_time) by bin(5m)
        | sort @timestamp desc
      `,
      logGroups: logGroups.map(name => 
        logs.LogGroup.fromLogGroupName(this, `PerfLogGroup-${name.replace(/[^a-zA-Z0-9]/g, '')}`, name)
      ),
    });
  }
}
