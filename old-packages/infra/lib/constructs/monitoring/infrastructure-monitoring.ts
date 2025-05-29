import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface InfrastructureMonitoringProps {
    environmentName: string;
    eventBuses: events.IEventBus[];
    queues: { queue: sqs.IQueue; dlq?: sqs.IQueue }[];
    api?: apigateway.RestApi;
    alarmsTopic: sns.ITopic;
    apiLatencyThresholdMs?: number;
    queueDepthThreshold?: number;
    eventDeliveryDelayThresholdSec?: number;
    importMonitoringTables?: string[];
}

export class InfrastructureMonitoring extends Construct {
    constructor(scope: Construct, id: string, props: InfrastructureMonitoringProps) {
        super(scope, id);

        // Default thresholds
        const apiLatencyThreshold = props.apiLatencyThresholdMs || 1000;
        const queueDepthThreshold = props.queueDepthThreshold || 100;
        const eventDeliveryDelayThreshold = props.eventDeliveryDelayThresholdSec || 60;

        // API Gateway Monitoring
        if (props.api) {
            this.createApiGatewayAlarms(props.api, apiLatencyThreshold, props.alarmsTopic);
        }

        // SQS Queue Monitoring
        props.queues.forEach(({ queue, dlq }) => {
            this.createQueueAlarms(queue, queueDepthThreshold, props.alarmsTopic);
            if (dlq) {
                this.createDLQAlarms(dlq, props.alarmsTopic);
            }
        });

        // EventBridge Monitoring for all buses
        props.eventBuses.forEach((eventBus) => {
            this.createEventBridgeAlarms(eventBus, eventDeliveryDelayThreshold, props.alarmsTopic);
        });

        // Create Import Monitoring Dashboard if tables are specified
        if (props.importMonitoringTables && props.importMonitoringTables.length > 0) {
            this.createImportMonitoringDashboard(
                props.environmentName,
                props.importMonitoringTables
            );
        }
    }

    private createApiGatewayAlarms(
        api: apigateway.RestApi,
        latencyThreshold: number,
        alarmsTopic: sns.ITopic
    ): void {
        // P95 Latency Alarm
        new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: 'Latency',
                dimensionsMap: {
                    ApiName: api.restApiName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'p95',
            }),
            threshold: latencyThreshold,
            evaluationPeriods: 3,
            datapointsToAlarm: 2,
            alarmDescription: `API Gateway P95 latency exceeded ${latencyThreshold}ms`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // 4XX Error Rate Alarm
        new cloudwatch.Alarm(this, 'Api4xxErrorAlarm', {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: '4XXError',
                dimensionsMap: {
                    ApiName: api.restApiName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'sum',
            }),
            threshold: 10,
            evaluationPeriods: 2,
            alarmDescription: 'API Gateway 4XX errors exceeded threshold',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // 5XX Error Rate Alarm
        new cloudwatch.Alarm(this, 'Api5xxErrorAlarm', {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: '5XXError',
                dimensionsMap: {
                    ApiName: api.restApiName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'sum',
            }),
            threshold: 5,
            evaluationPeriods: 2,
            alarmDescription: 'API Gateway 5XX errors exceeded threshold',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // Integration Latency Alarm
        new cloudwatch.Alarm(this, 'ApiIntegrationLatencyAlarm', {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: 'IntegrationLatency',
                dimensionsMap: {
                    ApiName: api.restApiName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'p95',
            }),
            threshold: latencyThreshold * 0.8, // 80% of total latency threshold
            evaluationPeriods: 3,
            datapointsToAlarm: 2,
            alarmDescription: `API Gateway integration latency exceeded ${latencyThreshold * 0.8}ms`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createQueueAlarms(
        queue: sqs.IQueue,
        depthThreshold: number,
        alarmsTopic: sns.ITopic
    ): void {
        const queueName = queue.node.id || queue.queueName;

        // Queue Depth Alarm
        new cloudwatch.Alarm(this, `QueueDepthAlarm-${queueName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/SQS',
                metricName: 'ApproximateNumberOfMessagesVisible',
                dimensionsMap: {
                    QueueName: queue.queueName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Average',
            }),
            threshold: depthThreshold,
            evaluationPeriods: 2,
            alarmDescription: `SQS queue depth exceeded ${depthThreshold} messages`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // Age of Oldest Message Alarm
        new cloudwatch.Alarm(this, `QueueOldestMessageAlarm-${queueName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/SQS',
                metricName: 'ApproximateAgeOfOldestMessage',
                dimensionsMap: {
                    QueueName: queue.queueName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Maximum',
            }),
            threshold: 300, // 5 minutes
            evaluationPeriods: 2,
            alarmDescription: 'Messages in queue are not being processed quickly enough',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createDLQAlarms(dlq: sqs.IQueue, alarmsTopic: sns.ITopic): void {
        const queueName = dlq.node.id || dlq.queueName;

        // DLQ Messages Received Alarm
        new cloudwatch.Alarm(this, `DLQMessagesAlarm-${queueName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/SQS',
                metricName: 'NumberOfMessagesReceived',
                dimensionsMap: {
                    QueueName: dlq.queueName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Sum',
            }),
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: 'Messages detected in DLQ',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // DLQ Message Age Alarm
        new cloudwatch.Alarm(this, `DLQMessageAgeAlarm-${queueName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/SQS',
                metricName: 'ApproximateAgeOfOldestMessage',
                dimensionsMap: {
                    QueueName: dlq.queueName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Maximum',
            }),
            threshold: 3600, // 1 hour
            evaluationPeriods: 1,
            alarmDescription: 'Messages in DLQ are not being processed',
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createEventBridgeAlarms(
        eventBus: events.IEventBus,
        deliveryDelayThreshold: number,
        alarmsTopic: sns.ITopic
    ): void {
        const busName = eventBus.eventBusName;
        const sanitizedBusName = busName.replace(/[^a-zA-Z0-9]/g, '');

        // Event Delivery Delay Alarm
        new cloudwatch.Alarm(this, `EventDeliveryDelayAlarm-${sanitizedBusName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/Events',
                metricName: 'DeliveryDelay',
                dimensionsMap: {
                    EventBusName: eventBus.eventBusName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Maximum',
            }),
            threshold: deliveryDelayThreshold,
            evaluationPeriods: 2,
            alarmDescription: `EventBridge delivery delay exceeded ${deliveryDelayThreshold} seconds for bus ${busName}`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));

        // Failed Invocations Alarm
        new cloudwatch.Alarm(this, `EventFailedInvocationsAlarm-${sanitizedBusName}`, {
            metric: new cloudwatch.Metric({
                namespace: 'AWS/Events',
                metricName: 'FailedInvocations',
                dimensionsMap: {
                    EventBusName: eventBus.eventBusName,
                },
                period: cdk.Duration.minutes(5),
                statistic: 'Sum',
            }),
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: `EventBridge rule invocation failures detected for bus ${busName}`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }).addAlarmAction(new cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createImportMonitoringDashboard(environment: string, tables: string[]): void {
        // Create the dashboard
        const dashboard = new cloudwatch.Dashboard(this, 'ImportMonitoringDashboard', {
            dashboardName: `${environment}-import-monitoring`,
        });

        // Define common props for metrics
        const metricProps = {
            namespace: `Bellyfed/${environment}/Import`,
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
        };

        // Success/Failure Rate Widget
        const successFailureWidget = new cloudwatch.GraphWidget({
            title: 'Import Success/Failure Rate',
            width: 24,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: tables.map(
                (table) =>
                    new cloudwatch.Metric({
                        ...metricProps,
                        metricName: 'ImportSuccess',
                        dimensionsMap: { Table: table },
                        color: '#2ca02c',
                        label: `${table} Success`,
                    })
            ),
            right: tables.map(
                (table) =>
                    new cloudwatch.Metric({
                        ...metricProps,
                        metricName: 'ImportFailure',
                        dimensionsMap: { Table: table },
                        color: '#d62728',
                        label: `${table} Failure`,
                    })
            ),
        });

        // Import Progress Widget
        const importProgressWidget = new cloudwatch.GraphWidget({
            title: 'Cumulative Import Progress',
            width: 24,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: true,
            left: tables.map((table) =>
                new cloudwatch.Metric({
                    ...metricProps,
                    metricName: 'ImportSuccess',
                    dimensionsMap: { Table: table },
                    label: table,
                }).with({
                    statistic: 'Sum',
                    period: cdk.Duration.minutes(5),
                })
            ),
        });

        // Lambda Errors Widget
        const lambdaErrorsWidget = new cloudwatch.GraphWidget({
            title: 'Lambda Errors',
            width: 12,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: [
                new cloudwatch.Metric({
                    namespace: 'AWS/Lambda',
                    metricName: 'Errors',
                    dimensionsMap: {
                        FunctionName: `DynamoDBImportFunction-${environment}`,
                    },
                    statistic: 'Sum',
                    period: cdk.Duration.minutes(1),
                }),
            ],
        });

        // SQS DLQ Messages Widget
        const dlqMessagesWidget = new cloudwatch.GraphWidget({
            title: 'DLQ Messages',
            width: 12,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: [
                new cloudwatch.Metric({
                    namespace: 'AWS/SQS',
                    metricName: 'ApproximateNumberOfMessagesVisible',
                    dimensionsMap: {
                        QueueName: `${environment}-import-dlq`,
                    },
                    statistic: 'Maximum',
                    period: cdk.Duration.minutes(1),
                }),
            ],
        });

        // Create text widget for instructions
        const instructionsWidget = new cloudwatch.TextWidget({
            markdown: `# Import Monitoring Dashboard
## Metrics Explanation
* **Success/Failure Rate**: Shows successful and failed imports per table
* **Cumulative Progress**: Total successful imports per table over time
* **Lambda Errors**: Error count from the DynamoDB import function
* **DLQ Messages**: Number of messages in Dead Letter Queue

## Troubleshooting
1. High failure rate? Check Lambda logs
2. Messages in DLQ? Check message attributes for error details
3. No progress? Verify import script is running
4. Lambda errors? Check CloudWatch logs for error details`,
            width: 24,
            height: 8,
        });

        // Add all widgets to dashboard
        dashboard.addWidgets(
            instructionsWidget,
            successFailureWidget,
            importProgressWidget,
            new cloudwatch.Row(lambdaErrorsWidget, dlqMessagesWidget)
        );
    }
}
