/**
 * User Account Processor Stack
 *
 * This stack creates Lambda functions for processing user account events:
 * - User registration
 * - User profile update
 * - User deletion
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

export interface UserAccountProcessorStackProps extends cdk.NestedStackProps {
    userRegistrationQueue: sqs.Queue;
    userUpdateQueue: sqs.Queue;
    userDeletionQueue: sqs.Queue;
}

export class UserAccountProcessorStack extends cdk.NestedStack {
    public readonly processorFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: UserAccountProcessorStackProps) {
        super(scope, id, props);

        // Get environment name
        const envName = process.env.ENVIRONMENT || 'dev';

        // Create IAM role for Lambda function
        const lambdaRole = new iam.Role(this, `UserAccountProcessorRole-${envName}`, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for user account processor Lambda function',
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
                    props.userRegistrationQueue.queueArn,
                    props.userUpdateQueue.queueArn,
                    props.userDeletionQueue.queueArn,
                ],
            })
        );

        // Add EventBridge permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: [
                    `arn:aws:events:${this.region}:${this.account}:event-bus/user-account-event-bus-${envName}`,
                ],
            })
        );

        // Add Cognito permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'cognito-idp:AdminGetUser',
                    'cognito-idp:AdminUpdateUserAttributes',
                    'cognito-idp:AdminDeleteUser',
                ],
                resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/*`],
            })
        );

        // Add RDS Data API permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                resources: ['*'],
            })
        );

        // Add Secrets Manager permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [
                    `arn:aws:secretsmanager:${this.region}:${this.account}:secret:/bellyfed/${envName}/db/credentials-*`,
                ],
            })
        );

        // Create Lambda function
        this.processorFunction = new lambda.Function(
            this,
            `UserAccountProcessorFunction-${envName}`,
            {
                functionName: `bellyfed-${envName}-user-account-processor`,
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: 'index.handler',
                code: lambda.Code.fromAsset('functions/user-account-processor'),
                timeout: cdk.Duration.seconds(60),
                memorySize: 256,
                role: lambdaRole,
                environment: {
                    NODE_ENV: envName === 'prod' ? 'production' : 'development',
                    DB_SECRET_NAME: `/bellyfed/${envName}/db/credentials`,
                    USER_ACCOUNT_EVENT_BUS_NAME: `user-account-event-bus-${envName}`,
                    USER_POOL_ID: process.env.USER_POOL_ID || 'ap-southeast-1_xlU9zwY43',
                },
            }
        );

        // Create log group with retention
        new logs.LogGroup(this, `UserAccountProcessorLogGroup-${envName}`, {
            logGroupName: `/aws/lambda/${this.processorFunction.functionName}`,
            retention:
                envName === 'prod' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Add SQS event sources
        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.userRegistrationQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.userUpdateQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.userDeletionQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', envName);
        cdk.Tags.of(this).add('Service', 'UserAccountProcessor');
        cdk.Tags.of(this).add('ManagedBy', 'CDK');
    }
}
