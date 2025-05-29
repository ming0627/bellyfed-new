import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { createSnsTopic } from './utils/resource-creators';

// Export the interface
export interface InfrastructureMonitoringStackProps extends cdk.StackProps {
    environment: string;
    eventBusNames: string[];
    queueNames?: string[];
    apiGatewayRef?: apigateway.RestApi;
    slackWebhookUrl?: string;
}

export class InfrastructureMonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: InfrastructureMonitoringStackProps) {
        super(scope, id, props);

        // Create SNS Topic for alarms using the SNS creator with environment-specific name
        const alarmsTopic = createSnsTopic(this, 'AlarmsTopic', props.environment, {
            topicName: `${props.environment}-infrastructure-alarms`,
            displayName: `${props.environment} Infrastructure Alarms`,
        });

        // Add Slack notification if webhook URL is provided
        if (props.slackWebhookUrl) {
            alarmsTopic.addSubscription(new subscriptions.UrlSubscription(props.slackWebhookUrl));
        }

        // Add email subscription for alarms
        alarmsTopic.addSubscription(new subscriptions.EmailSubscription('alerts@bellyfed.com'));

        // Get EventBus references from SSM parameters if available
        if (props.eventBusNames && props.eventBusNames.length > 0) {
            // Instead of trying to import event buses directly with tokens,
            // we'll create a more robust approach that handles unresolved tokens

            // First, filter out any event bus names that might contain tokens
            // This is a defensive approach to avoid the token resolution error
            const validEventBusNames = props.eventBusNames.filter((busName) => {
                // Check if the name contains any token-like patterns
                const containsTokens = busName.includes('${') || busName.includes('Token[');
                if (containsTokens) {
                    console.warn(`Skipping event bus with name containing tokens: ${busName}`);
                }
                return !containsTokens;
            });

            // Now process only the valid event bus names
            const eventBuses = validEventBusNames.map((busName, index) => {
                try {
                    // Try to get the event bus ARN from SSM Parameter Store
                    const parameterName = `/bellyfed/${props.environment}/eventbridge/eventbus-${busName}-arn`;

                    // Use a try-catch to handle potential SSM parameter not found errors
                    try {
                        const eventBusArn = cdk.aws_ssm.StringParameter.valueForStringParameter(
                            this,
                            parameterName
                        );

                        return events.EventBus.fromEventBusArn(
                            this,
                            `ImportedEventBus${index}`,
                            eventBusArn
                        );
                    } catch (ssmError) {
                        console.warn(
                            `Warning: Could not import event bus with name ${busName} from SSM. Error: ${ssmError}`
                        );
                        throw ssmError; // Re-throw to be caught by the outer try-catch
                    }
                } catch (error: unknown) {
                    // Return a dummy event bus that won't be used
                    return events.EventBus.fromEventBusName(
                        this,
                        `DummyEventBus${index}`,
                        'dummy-event-bus'
                    );
                }
            });

            // Create alarms for all valid event buses
            eventBuses.forEach((eventBus) => {
                // Skip dummy event buses
                if (eventBus.eventBusName !== 'dummy-event-bus') {
                    try {
                        this.createEventBridgeAlarms(eventBus, alarmsTopic);
                    } catch (error: unknown) {
                        console.warn(
                            `Warning: Could not create alarms for event bus ${eventBus.eventBusName}. Error: ${error}`
                        );
                    }
                }
            });
        }

        // If API Gateway is provided, create alarms for it
        if (props.apiGatewayRef) {
            this.createApiGatewayAlarms(props.apiGatewayRef, alarmsTopic);
        }

        // If queue names are provided, create alarms for them
        if (props.queueNames && props.queueNames.length > 0) {
            props.queueNames.forEach((queueName, index) => {
                // Determine if this is a DLQ based on the name
                const isDLQ =
                    queueName.toLowerCase().includes('dlq') ||
                    queueName.toLowerCase().includes('dead-letter');

                try {
                    // Get queue ARN from SSM Parameter Store
                    const parameterName = `/bellyfed/${props.environment}/sqs/${queueName}-arn`;
                    const queueArn = cdk.aws_ssm.StringParameter.valueForStringParameter(
                        this,
                        parameterName
                    );

                    // Import the queue using the ARN
                    const queue = sqs.Queue.fromQueueArn(this, `ImportedQueue${index}`, queueArn);

                    // Create different alarms based on whether it's a DLQ or regular queue
                    if (isDLQ) {
                        this.createDLQAlarms(queue, alarmsTopic);
                    } else {
                        this.createQueueAlarms(queue, alarmsTopic);
                    }
                } catch (error: unknown) {
                    // Log the error but don't fail the deployment
                    console.warn(
                        `Warning: Could not import queue with name ${queueName} from SSM. Error: ${error}`
                    );
                }
            });
        }

        // Create Aurora RDS Alarms
        const dbClusterIdentifier = `postgres-cluster-${props.environment}`;
        const rdsNamespace = 'AWS/RDS';

        // CPU Utilization alarm
        const rdsHighCpuAlarm = new cloudwatch.Alarm(this, 'RdsHighCpuAlarm', {
            alarmName: `${props.environment}-rds-high-cpu`,
            alarmDescription: 'High CPU utilization for Aurora PostgreSQL',
            metric: new cloudwatch.Metric({
                namespace: rdsNamespace,
                metricName: 'CPUUtilization',
                dimensionsMap: {
                    DBClusterIdentifier: dbClusterIdentifier,
                },
                statistic: 'Average',
                period: cdk.Duration.minutes(5),
            }),
            threshold: 80,
            evaluationPeriods: 3,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            datapointsToAlarm: 3,
            treatMissingData: cloudwatch.TreatMissingData.MISSING,
        });

        // Database Connections alarm
        const rdsConnectionsAlarm = new cloudwatch.Alarm(this, 'RdsConnectionsAlarm', {
            alarmName: `${props.environment}-rds-connections`,
            alarmDescription: 'High number of database connections',
            metric: new cloudwatch.Metric({
                namespace: rdsNamespace,
                metricName: 'DatabaseConnections',
                dimensionsMap: {
                    DBClusterIdentifier: dbClusterIdentifier,
                },
                statistic: 'Maximum',
                period: cdk.Duration.minutes(5),
            }),
            threshold: 80, // Adjust based on your connection limits
            evaluationPeriods: 3,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            datapointsToAlarm: 2,
            treatMissingData: cloudwatch.TreatMissingData.MISSING,
        });

        // Low Free Storage Space alarm
        const rdsStorageAlarm = new cloudwatch.Alarm(this, 'RdsStorageAlarm', {
            alarmName: `${props.environment}-rds-storage`,
            alarmDescription: 'Low free storage space',
            metric: new cloudwatch.Metric({
                namespace: rdsNamespace,
                metricName: 'FreeStorageSpace',
                dimensionsMap: {
                    DBClusterIdentifier: dbClusterIdentifier,
                },
                statistic: 'Minimum',
                period: cdk.Duration.minutes(5),
            }),
            threshold: 10240, // 10GB in MB
            evaluationPeriods: 3,
            comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
            datapointsToAlarm: 3,
            treatMissingData: cloudwatch.TreatMissingData.MISSING,
        });

        // Add RDS alarms to SNS topic
        rdsHighCpuAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
        rdsConnectionsAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
        rdsStorageAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));

        // Create a dashboard for Aurora metrics
        const rdsDashboard = new cloudwatch.Dashboard(this, 'RdsDashboard', {
            dashboardName: `${props.environment}-aurora-metrics`,
        });

        rdsDashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: 'Aurora CPU Utilization',
                left: [
                    new cloudwatch.Metric({
                        namespace: rdsNamespace,
                        metricName: 'CPUUtilization',
                        dimensionsMap: {
                            DBClusterIdentifier: dbClusterIdentifier,
                        },
                        statistic: 'Average',
                        period: cdk.Duration.minutes(1),
                    }),
                ],
                width: 12,
                height: 6,
            }),
            new cloudwatch.GraphWidget({
                title: 'Aurora Connections',
                left: [
                    new cloudwatch.Metric({
                        namespace: rdsNamespace,
                        metricName: 'DatabaseConnections',
                        dimensionsMap: {
                            DBClusterIdentifier: dbClusterIdentifier,
                        },
                        statistic: 'Average',
                        period: cdk.Duration.minutes(1),
                    }),
                ],
                width: 12,
                height: 6,
            })
        );

        rdsDashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: 'Aurora Free Storage Space',
                left: [
                    new cloudwatch.Metric({
                        namespace: rdsNamespace,
                        metricName: 'FreeStorageSpace',
                        dimensionsMap: {
                            DBClusterIdentifier: dbClusterIdentifier,
                        },
                        statistic: 'Minimum',
                        period: cdk.Duration.minutes(1),
                    }),
                ],
                width: 12,
                height: 6,
            }),
            new cloudwatch.GraphWidget({
                title: 'Aurora Read/Write Latency',
                left: [
                    new cloudwatch.Metric({
                        namespace: rdsNamespace,
                        metricName: 'ReadLatency',
                        dimensionsMap: {
                            DBClusterIdentifier: dbClusterIdentifier,
                        },
                        statistic: 'Average',
                        period: cdk.Duration.minutes(1),
                    }),
                ],
                right: [
                    new cloudwatch.Metric({
                        namespace: rdsNamespace,
                        metricName: 'WriteLatency',
                        dimensionsMap: {
                            DBClusterIdentifier: dbClusterIdentifier,
                        },
                        statistic: 'Average',
                        period: cdk.Duration.minutes(1),
                    }),
                ],
                width: 12,
                height: 6,
            })
        );
    }

    private createEventBridgeAlarms(eventBus: events.IEventBus, alarmsTopic: sns.ITopic): void {
        // Create EventBridge alarms with stable IDs
        const invocationsMetric = new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/Events',
            metricName: 'Invocations',
            dimensionsMap: {
                EventBusName: eventBus.eventBusName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });

        // Use a stable ID for the alarm that doesn't rely on uniqueId
        // This avoids the issue with unresolved tokens
        const alarmId = `EventBusFailedInvocationsAlarm-${eventBus.node.id}`;
        new cdk.aws_cloudwatch.Alarm(this, alarmId, {
            metric: invocationsMetric,
            threshold: 1,
            evaluationPeriods: 1,
            comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: `Failed invocations detected for EventBus ${eventBus.eventBusName}`,
            treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createApiGatewayAlarms(api: apigateway.RestApi, alarmsTopic: sns.ITopic): void {
        // Create API Gateway alarms with stable IDs
        const latencyMetric = new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensionsMap: {
                ApiName: api.restApiName,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
        });

        // Use a stable ID that doesn't rely on uniqueId
        const alarmId = `ApiGatewayLatencyAlarm-${api.node.id}`;
        new cdk.aws_cloudwatch.Alarm(this, alarmId, {
            metric: latencyMetric,
            threshold: 1000,
            evaluationPeriods: 3,
            comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: `High latency detected for API Gateway ${api.restApiName}`,
            treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private getQueueNameFromArn(arn: string): string {
        // ARN format: arn:aws:sqs:region:account:queue-name
        const queueName = arn.split(':').pop() || '';
        // Queue name format: environment-name
        return queueName;
    }

    private createQueueAlarms(queue: sqs.IQueue, alarmsTopic: sns.ITopic): void {
        const queueName = this.getQueueNameFromArn(queue.queueArn);

        // Create SQS queue alarms with stable IDs
        const queueDepthMetric = new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/SQS',
            metricName: 'ApproximateNumberOfMessagesVisible',
            dimensionsMap: {
                QueueName: queueName,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
        });

        // Use a stable ID that doesn't rely on uniqueId
        const alarmId = `QueueDepthAlarm-${queue.node.id}`;
        new cdk.aws_cloudwatch.Alarm(this, alarmId, {
            metric: queueDepthMetric,
            threshold: 100,
            evaluationPeriods: 3,
            comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: `High message count detected for queue ${queueName}`,
            treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
    }

    private createDLQAlarms(dlq: sqs.IQueue, alarmsTopic: sns.ITopic): void {
        const queueName = this.getQueueNameFromArn(dlq.queueArn);

        // Create DLQ alarms with stable IDs
        const dlqDepthMetric = new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/SQS',
            metricName: 'ApproximateNumberOfMessagesVisible',
            dimensionsMap: {
                QueueName: queueName,
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
        });

        // Use a stable ID that doesn't rely on uniqueId
        const alarmId = `DLQNotEmptyAlarm-${dlq.node.id}`;
        new cdk.aws_cloudwatch.Alarm(this, alarmId, {
            metric: dlqDepthMetric,
            threshold: 0,
            evaluationPeriods: 1,
            comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: `Messages detected in DLQ ${queueName}`,
            treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        }).addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(alarmsTopic));
    }
}
