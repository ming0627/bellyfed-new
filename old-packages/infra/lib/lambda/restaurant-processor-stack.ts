/**
 * Restaurant Processor Lambda Stack
 *
 * This stack creates the Lambda function for processing restaurant events:
 * - Restaurant processor Lambda function
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

export interface RestaurantProcessorStackProps extends cdk.StackProps {
    restaurantCreationQueue: sqs.Queue;
    restaurantUpdateQueue: sqs.Queue;
}

export class RestaurantProcessorStack extends cdk.Stack {
    public readonly processorFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: RestaurantProcessorStackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create log group for Lambda function
        const logGroup = new logs.LogGroup(this, `RestaurantProcessorLogGroup-${envName}`, {
            logGroupName: `/aws/lambda/restaurant-processor-${envName}`,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create IAM role for Lambda function
        const lambdaRole = new iam.Role(this, `RestaurantProcessorRole-${envName}`, {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for Restaurant Processor Lambda function',
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
                    props.restaurantCreationQueue.queueArn,
                    props.restaurantUpdateQueue.queueArn,
                ],
            })
        );

        // Add EventBridge permissions
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: [
                    `arn:aws:events:${this.region}:${this.account}:event-bus/restaurant-event-bus-${envName}`,
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
        this.processorFunction = new lambda.Function(
            this,
            `RestaurantProcessorFunction-${envName}`,
            {
                functionName: `restaurant-processor-${envName}`,
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: 'index.handler',
                code: lambda.Code.fromAsset('functions/restaurant-processor'),
                role: lambdaRole,
                timeout: cdk.Duration.seconds(300),
                memorySize: 256,
                environment: {
                    NODE_ENV: envName === 'prod' ? 'production' : 'development',
                    DB_SECRET_NAME: `/bellyfed/${envName}/db/credentials`,
                    RESTAURANT_EVENT_BUS_NAME: `restaurant-event-bus-${envName}`,
                },
                logGroup,
            }
        );

        // Add SQS event source
        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.restaurantCreationQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        this.processorFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(props.restaurantUpdateQueue, {
                batchSize: 10,
                maxBatchingWindow: cdk.Duration.seconds(30),
            })
        );

        // Store Lambda ARN in SSM Parameter Store
        new ssm.StringParameter(this, `RestaurantProcessorFunctionArn-${envName}`, {
            parameterName: `/bellyfed/${envName}/lambda/restaurant-processor-arn`,
            description: 'ARN for the restaurant processor Lambda function',
            stringValue: this.processorFunction.functionArn,
        });

        // Output the Lambda function ARN
        new cdk.CfnOutput(this, 'RestaurantProcessorFunctionArn', {
            value: this.processorFunction.functionArn,
            description: 'Restaurant Processor Lambda Function ARN',
            exportName: `RestaurantProcessorFunctionArn-${envName}`,
        });
    }
}
