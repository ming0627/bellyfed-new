import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { CONFIG } from '../../config';

/**
 * A construct that creates a Lambda function with retry capabilities using SQS queues
 * and automatic DLQ handling through SNS notifications.
 *
 * This construct is the ONLY place where Lambda-specific DLQs and retry queues should be created.
 * Do not create DLQs in the SQS stack or elsewhere for Lambda functions.
 *
 * Key features:
 * 1. Creates a Lambda function with proper error handling
 * 2. Automatically creates:
 *    - A Dead Letter Queue (DLQ) for failed executions
 *    - A Retry Queue for retry attempts
 *    - CloudWatch alarms for monitoring
 * 3. Sets up proper IAM permissions for queue access
 *
 * Usage:
 * ```typescript
 * const lambda = new LambdaWithRetry(this, 'MyFunction', {
 *   functionName: `${environment}-my-function`,
 *   codePath: './path/to/code',
 *   environment: { ... },
 *   // other props
 * });
 * ```
 *
 * Queue Naming Convention:
 * - DLQ: `${functionName}-dlq`
 * - Retry Queue: `${functionName}-retry`
 *
 * Note: This construct handles all DLQ and retry queue creation for Lambda functions.
 * Do not create separate DLQs in the SQS stack for Lambda functions.
 */
export interface LambdaWithRetryProps {
    functionName: string;
    handlerPath: string;
    codePath: string;
    environment: { [key: string]: string };
    memorySize: number;
    timeout: cdk.Duration;
    maxRetries?: number;
    centralizedSNSTopic?: sns.ITopic;
    retryInterval?: cdk.Duration;
    environmentName: string;
    layers?: lambda.ILayerVersion[];
}

/**
 * A construct that creates a Lambda function with retry capabilities using SQS queues
 * and automatic DLQ handling through SNS notifications
 */
export class LambdaWithRetry extends Construct {
    public readonly lambdaFunction: lambda.Function;
    public readonly retryQueue: sqs.Queue;
    public readonly deadLetterQueue: sqs.Queue;
    private readonly lambdaRole: iam.Role;

    constructor(scope: Construct, id: string, props: LambdaWithRetryProps) {
        super(scope, id);

        const maxRetries = props.maxRetries || CONFIG.lambda.defaultMaxRetries;
        const retryInterval = props.retryInterval || cdk.Duration.seconds(30);

        // Step 1: Create all queues first with stable logical IDs
        const dlq = new sqs.Queue(this, `${props.functionName}DLQ`, {
            queueName: `${props.functionName}-dlq`,
            retentionPeriod: cdk.Duration.days(CONFIG.lambda.dlqRetentionDays),
        });

        const retryQueue = new sqs.Queue(this, `${props.functionName}RetryQueue`, {
            queueName: `${props.functionName}-retry`,
            deadLetterQueue: {
                queue: dlq,
                maxReceiveCount: maxRetries,
            },
            visibilityTimeout: cdk.Duration.seconds(props.timeout.toSeconds() * 2),
            retentionPeriod: cdk.Duration.days(CONFIG.lambda.retryQueueRetentionDays),
        });

        this.deadLetterQueue = dlq;
        this.retryQueue = retryQueue;

        // Step 2: Create the Lambda role with all necessary permissions
        this.lambdaRole = new iam.Role(this, 'LambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
            ],
        });

        // Add SQS permissions
        this.lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'sqs:ReceiveMessage',
                    'sqs:DeleteMessage',
                    'sqs:GetQueueAttributes',
                    'sqs:SendMessage',
                    'sqs:GetQueueUrl',
                    'sqs:ChangeMessageVisibility',
                ],
                resources: [this.retryQueue.queueArn, this.deadLetterQueue.queueArn],
            })
        );

        // Add SSM permissions
        this.lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
                resources: [
                    `arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/bellyfed/*`,
                ],
            })
        );

        // Step 3: Create the Lambda function with DLQ configuration
        this.lambdaFunction = new lambda.Function(this, 'Function', {
            functionName: props.functionName,
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(props.codePath),
            environment: {
                ...props.environment,
                RETRY_QUEUE_URL: this.retryQueue.queueUrl,
                MAX_RETRIES: maxRetries.toString(),
                RETRY_INTERVAL: retryInterval.toSeconds().toString(),
            },
            memorySize: props.memorySize,
            timeout: props.timeout,
            role: this.lambdaRole,
            layers: props.layers || [],
            deadLetterQueue: dlq,
        });

        // Step 4: Create DLQ processor and alarms
        this.createCloudWatchAlarms();
    }

    public addEventSource(): void {
        // Add event source after all resources are created
        this.lambdaFunction.addEventSource(
            new SqsEventSource(this.retryQueue, {
                batchSize: 1,
                maxBatchingWindow: cdk.Duration.seconds(0),
            })
        );
    }

    private createCloudWatchAlarms(): void {
        // Create CloudWatch alarms for monitoring
        new cloudwatch.Alarm(this, 'DLQMessagesAlarm', {
            metric: this.deadLetterQueue.metricApproximateNumberOfMessagesVisible(),
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: `Messages in DLQ for ${this.lambdaFunction.functionName}`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        new cloudwatch.Alarm(this, 'ErrorsAlarm', {
            metric: this.lambdaFunction.metricErrors(),
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: `Errors in ${this.lambdaFunction.functionName}`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
    }
}
