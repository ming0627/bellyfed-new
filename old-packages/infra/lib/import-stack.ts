/**
 * Import Stack
 *
 * This stack creates the infrastructure for the bulk data import system,
 * including EventBridge rules, Lambda functions, and SQS queues.
 *
 * The import system follows a hybrid approach that integrates Next.js Server Actions
 * with AWS event-driven architecture using the outbox pattern.
 */

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { EnvironmentConfig } from './environmentConfig.js';

interface ImportStackProps extends cdk.StackProps {
    environment: string;
    vpc: cdk.aws_ec2.IVpc;
    dbSecretArn: string;
    dbClusterArn: string;
    dbName: string;
    eventBus?: events.IEventBus;
}

export class ImportStack extends cdk.Stack {
    public readonly outboxProcessorFunction: lambda.Function;
    public readonly batchProcessorFunction: lambda.Function;
    public readonly importQueue: sqs.Queue;
    public readonly importDlq: sqs.Queue;

    constructor(scope: Construct, id: string, props: ImportStackProps) {
        super(scope, id, props);

        const { environment, vpc, dbSecretArn, dbClusterArn, dbName } = props;

        // Create EventBus if not provided
        const eventBus =
            props.eventBus ||
            new events.EventBus(this, 'ImportEventBus', {
                eventBusName: `bellyfed-import-${environment}`,
            });

        // Create SQS queues for import processing
        this.importDlq = new sqs.Queue(this, 'ImportDLQ', {
            queueName: `bellyfed-import-dlq-${environment}`,
            retentionPeriod: cdk.Duration.days(14),
        });

        this.importQueue = new sqs.Queue(this, 'ImportQueue', {
            queueName: `bellyfed-import-queue-${environment}`,
            visibilityTimeout: cdk.Duration.seconds(300),
            deadLetterQueue: {
                queue: this.importDlq,
                maxReceiveCount: 3,
            },
        });

        // Create CloudWatch log groups
        const outboxProcessorLogGroup = new logs.LogGroup(this, 'OutboxProcessorLogGroup', {
            logGroupName: `/aws/lambda/outbox-processor-${environment}`,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const batchProcessorLogGroup = new logs.LogGroup(this, 'BatchProcessorLogGroup', {
            logGroupName: `/aws/lambda/batch-processor-${environment}`,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create IAM role for Lambda functions
        const lambdaRole = new iam.Role(this, 'ImportLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaVPCAccessExecutionRole'
                ),
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
            ],
        });

        // Add permissions for RDS Data API
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                resources: [dbClusterArn],
            })
        );

        // Add permissions for Secrets Manager
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [dbSecretArn],
            })
        );

        // Add permissions for EventBridge
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: [eventBus.eventBusArn],
            })
        );

        // Add permissions for SQS
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'sqs:SendMessage',
                    'sqs:ReceiveMessage',
                    'sqs:DeleteMessage',
                    'sqs:GetQueueAttributes',
                ],
                resources: [this.importQueue.queueArn, this.importDlq.queueArn],
            })
        );

        // Create Lambda functions
        this.outboxProcessorFunction = new lambda.Function(this, 'OutboxProcessorFunction', {
            functionName: `outbox-processor-${environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/outbox-processor'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(60),
            memorySize: 256,
            environment: {
                DB_SECRET_ARN: dbSecretArn,
                DB_CLUSTER_ARN: dbClusterArn,
                DB_NAME: dbName,
                EVENT_BUS_NAME: eventBus.eventBusName,
                BATCH_SIZE: '10',
            },
            vpc,
            logGroup: outboxProcessorLogGroup,
        });

        this.batchProcessorFunction = new lambda.Function(this, 'BatchProcessorFunction', {
            functionName: `batch-processor-${environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/batch-processor'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(300),
            memorySize: 512,
            environment: {
                DB_SECRET_ARN: dbSecretArn,
                DB_CLUSTER_ARN: dbClusterArn,
                DB_NAME: dbName,
                EVENT_BUS_NAME: eventBus.eventBusName,
            },
            vpc,
            logGroup: batchProcessorLogGroup,
        });

        // Create EventBridge rules
        const restaurantImportRule = new events.Rule(this, 'RestaurantImportRule', {
            eventBus,
            ruleName: `restaurant-import-rule-${environment}`,
            description: 'Rule for restaurant import events',
            eventPattern: {
                source: ['bellyfed.import'],
                detailType: ['RESTAURANT_IMPORTED'],
            },
        });

        const dishImportRule = new events.Rule(this, 'DishImportRule', {
            eventBus,
            ruleName: `dish-import-rule-${environment}`,
            description: 'Rule for dish import events',
            eventPattern: {
                source: ['bellyfed.import'],
                detailType: ['DISH_IMPORTED'],
            },
        });

        // Add targets to rules
        restaurantImportRule.addTarget(new targets.SqsQueue(this.importQueue));

        dishImportRule.addTarget(new targets.SqsQueue(this.importQueue));

        // Add SQS event source to batch processor
        const _eventSourceMapping = new lambda.EventSourceMapping(
            this,
            'BatchProcessorEventSource',
            {
                target: this.batchProcessorFunction,
                eventSourceArn: this.importQueue.queueArn,
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            }
        );

        // Create CloudWatch Events rule for scheduled outbox processing
        new events.Rule(this, 'OutboxProcessorSchedule', {
            schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
            targets: [new targets.LambdaFunction(this.outboxProcessorFunction)],
        });

        // Create CloudWatch alarms and monitoring
        const envConfig = EnvironmentConfig.getInstance(environment);

        // Create SNS topic for alarms
        const alarmTopic = new sns.Topic(this, 'ImportAlarmTopic', {
            topicName: `bellyfed-import-alarms-${environment}`,
            displayName: `Bellyfed Import System Alarms (${environment})`,
        });

        // Add email subscription if configured
        if (envConfig.getAlertEmail()) {
            alarmTopic.addSubscription(
                new subscriptions.EmailSubscription(envConfig.getAlertEmail())
            );
        }

        // Add Slack webhook if configured
        if (envConfig.getSlackWebhookUrl()) {
            // Implementation would depend on your Slack integration approach
            // Typically involves a Lambda function that posts to Slack
            console.log('Slack webhook URL is configured, but implementation is left to the user');
        }

        // Create alarms for the outbox processor
        const outboxErrorsAlarm = new cloudwatch.Alarm(this, 'OutboxProcessorErrorsAlarm', {
            alarmName: `Bellyfed-${environment}-OutboxProcessor-Errors`,
            alarmDescription: 'Alarm for errors in the outbox processor function',
            metric: this.outboxProcessorFunction.metricErrors({
                period: cdk.Duration.minutes(5),
                statistic: 'Sum',
            }),
            threshold: 5,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        outboxErrorsAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

        // Create alarms for the batch processor
        const batchErrorsAlarm = new cloudwatch.Alarm(this, 'BatchProcessorErrorsAlarm', {
            alarmName: `Bellyfed-${environment}-BatchProcessor-Errors`,
            alarmDescription: 'Alarm for errors in the batch processor function',
            metric: this.batchProcessorFunction.metricErrors({
                period: cdk.Duration.minutes(5),
                statistic: 'Sum',
            }),
            threshold: 5,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        batchErrorsAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

        // Create alarm for DLQ messages
        const dlqMessagesAlarm = new cloudwatch.Alarm(this, 'DlqMessagesAlarm', {
            alarmName: `Bellyfed-${environment}-ImportDLQ-Messages`,
            alarmDescription: 'Alarm for messages in the import dead-letter queue',
            metric: this.importDlq.metricApproximateNumberOfMessagesVisible({
                period: cdk.Duration.minutes(5),
                statistic: 'Maximum',
            }),
            threshold: 1,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        dlqMessagesAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

        // Create a dashboard for the import system
        const dashboard = new cloudwatch.Dashboard(this, 'ImportDashboard', {
            dashboardName: `Bellyfed-Import-${environment}`,
        });

        dashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: 'Outbox Processor Invocations and Errors',
                left: [
                    this.outboxProcessorFunction.metricInvocations(),
                    this.outboxProcessorFunction.metricErrors(),
                ],
            }),
            new cloudwatch.GraphWidget({
                title: 'Batch Processor Invocations and Errors',
                left: [
                    this.batchProcessorFunction.metricInvocations(),
                    this.batchProcessorFunction.metricErrors(),
                ],
            }),
            new cloudwatch.GraphWidget({
                title: 'Import Queue and DLQ',
                left: [
                    this.importQueue.metricApproximateNumberOfMessagesVisible(),
                    this.importDlq.metricApproximateNumberOfMessagesVisible(),
                ],
            }),
            new cloudwatch.GraphWidget({
                title: 'Lambda Duration',
                left: [
                    this.outboxProcessorFunction.metricDuration(),
                    this.batchProcessorFunction.metricDuration(),
                ],
            })
        );

        // Outputs
        new cdk.CfnOutput(this, 'ImportEventBusArn', {
            value: eventBus.eventBusArn,
            description: 'ARN of the import event bus',
        });

        new cdk.CfnOutput(this, 'ImportQueueUrl', {
            value: this.importQueue.queueUrl,
            description: 'URL of the import queue',
        });

        new cdk.CfnOutput(this, 'OutboxProcessorFunctionArn', {
            value: this.outboxProcessorFunction.functionArn,
            description: 'ARN of the outbox processor function',
        });

        new cdk.CfnOutput(this, 'BatchProcessorFunctionArn', {
            value: this.batchProcessorFunction.functionArn,
            description: 'ARN of the batch processor function',
        });

        new cdk.CfnOutput(this, 'ImportDashboardUrl', {
            value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${dashboard.dashboardName}`,
            description: 'URL of the import system dashboard',
        });
    }
}
