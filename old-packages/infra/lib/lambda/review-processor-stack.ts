/**
 * Review Processor Lambda Stack
 *
 * This stack creates the Lambda function for processing review events:
 * - Review processor Lambda function
 * - IAM role with necessary permissions
 * - CloudWatch log group
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface ReviewProcessorStackProps extends cdk.StackProps {
    reviewCreationQueue: sqs.Queue;
    reviewUpdateQueue: sqs.Queue;
    reviewDeletionQueue: sqs.Queue;
}

export class ReviewProcessorStack extends cdk.Stack {
    public readonly processorFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: ReviewProcessorStackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create log group for Lambda function
        const logGroup = new logs.LogGroup(this, `ReviewProcessorLogGroup-${envName}`, {
            logGroupName: `/aws/lambda/review-processor-${envName}`,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create IAM role for Lambda function
        const lambdaRole = new iam.Role(this, `ReviewProcessorRole-${envName}`, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for Review Processor Lambda function',
        });

        // Add permissions to the role
        lambdaRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
        );

        // Add SQS permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
                resources: [
                    props.reviewCreationQueue.queueArn,
                    props.reviewUpdateQueue.queueArn,
                    props.reviewDeletionQueue.queueArn,
                ],
            })
        );

        // Add EventBridge permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: [
                    `arn:aws:events:${this.region}:${this.account}:event-bus/review-event-bus-${envName}`,
                ],
            })
        );

        // Add Secrets Manager permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [
                    `arn:aws:secretsmanager:${this.region}:${this.account}:secret:bellyfed/${envName}/*`,
                ],
            })
        );

        // Add RDS permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'rds-data:ExecuteStatement',
                    'rds-data:BatchExecuteStatement',
                    'rds-data:BeginTransaction',
                    'rds-data:CommitTransaction',
                    'rds-data:RollbackTransaction',
                ],
                resources: [
                    `arn:aws:rds:${this.region}:${this.account}:cluster:bellyfed-${envName}-*`,
                ],
            })
        );

        // Create Lambda function
        this.processorFunction = new lambda.Function(this, `ReviewProcessorFunction-${envName}`, {
            functionName: `review-processor-${envName}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/review-processor'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(300),
            memorySize: 256,
            environment: {
                NODE_ENV: envName === 'prod' ? 'production' : 'development',
                DB_SECRET_NAME: `/bellyfed/${envName}/db/credentials`,
                REVIEW_EVENT_BUS_NAME: `review-event-bus-${envName}`,
            },
            logGroup,
        });

        // Add SQS event sources
        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.reviewCreationQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.reviewUpdateQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.reviewDeletionQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        // Store Lambda ARN in SSM Parameter Store
        new ssm.StringParameter(this, `ReviewProcessorFunctionArn-${envName}`, {
            parameterName: `/bellyfed/${envName}/lambda/review-processor-arn`,
            description: 'ARN for the review processor Lambda function',
            stringValue: this.processorFunction.functionArn,
        });

        // Output the Lambda function ARN
        new cdk.CfnOutput(this, 'ReviewProcessorFunctionArn', {
            value: this.processorFunction.functionArn,
            description: 'Review Processor Lambda Function ARN',
            exportName: `ReviewProcessorFunctionArn-${envName}`,
        });
    }
}
