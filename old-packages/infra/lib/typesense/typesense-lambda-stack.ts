// Typesense Lambda Stack
// Creates Lambda functions for Typesense dish sync and search

import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface TypesenseLambdaStackProps extends cdk.StackProps {
    environment: string;
    vpc: ec2.IVpc;
    rdsSecretArn: string;
    rdsResourceArn: string;
    rdsDatabase: string;
    typesenseSecurityGroup: ec2.ISecurityGroup;
}

export class TypesenseLambdaStack extends cdk.Stack {
    public readonly dishSyncFunction: lambda.Function;
    public readonly dishSearchFunction: lambda.Function;
    public readonly dishSearchApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: TypesenseLambdaStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Typesense-Lambda');

        // Create log groups with appropriate retention
        const dishSyncLogGroup = new logs.LogGroup(this, 'DishSyncLogGroup', {
            logGroupName: `/aws/lambda/typesense-dish-sync-${props.environment}`,
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const dishSearchLogGroup = new logs.LogGroup(this, 'DishSearchLogGroup', {
            logGroupName: `/aws/lambda/typesense-dish-search-${props.environment}`,
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create IAM role for the Lambda functions
        const lambdaRole = new iam.Role(this, 'TypesenseLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            roleName: `typesense-lambda-role-${props.environment}`,
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaVPCAccessExecutionRole'
                ),
            ],
        });

        // Add permissions to access RDS Data API
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                resources: [props.rdsResourceArn],
            })
        );

        // Add permissions to access Secrets Manager
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [props.rdsSecretArn],
            })
        );

        // Add permissions to access SSM parameters
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['ssm:GetParameter', 'ssm:GetParameters'],
                resources: [
                    `arn:aws:ssm:${this.region}:${this.account}:parameter/bellyfed/${props.environment}/typesense/*`,
                ],
            })
        );

        // Create the dish sync Lambda function
        // For Lambda functions in a VPC, AWS uses Fargate under the hood
        // We need to ensure we use valid CPU and memory combinations for Fargate
        // For memorySize 1024, we need to use a valid CPU value
        this.dishSyncFunction = new lambda.Function(this, 'DishSyncFunction', {
            functionName: `typesense-dish-sync-${props.environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/typesense-dish-sync'),
            role: lambdaRole,
            timeout: cdk.Duration.minutes(5),
            // Use 1024 MB (1 GB) which is a valid combination with 0.5 vCPU for Fargate
            memorySize: 1024,
            environment: {
                ENVIRONMENT: props.environment,
                RDS_SECRET_ARN: props.rdsSecretArn,
                RDS_RESOURCE_ARN: props.rdsResourceArn,
                RDS_DATABASE: props.rdsDatabase,
            },
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [props.typesenseSecurityGroup],
            logGroup: dishSyncLogGroup,
        });

        // Create the dish search Lambda function
        // For Lambda functions in a VPC, AWS uses Fargate under the hood
        // We need to ensure we use valid CPU and memory combinations for Fargate
        // For 0.25 vCPU (256), valid memory values are 0.5GB, 1GB, and 2GB
        this.dishSearchFunction = new lambda.Function(this, 'DishSearchFunction', {
            functionName: `typesense-dish-search-${props.environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/typesense-dish-search'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            // Use 512 MB (0.5 GB) which is a valid combination with 0.25 vCPU for Fargate
            memorySize: 512,
            environment: {
                ENVIRONMENT: props.environment,
            },
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [props.typesenseSecurityGroup],
            logGroup: dishSearchLogGroup,
        });

        // Create a scheduled event to trigger the dish sync function
        const syncSchedule = new events.Rule(this, 'DishSyncSchedule', {
            ruleName: `typesense-dish-sync-schedule-${props.environment}`,
            schedule: events.Schedule.rate(cdk.Duration.hours(1)),
            description: 'Scheduled event to sync dishes to Typesense',
        });

        syncSchedule.addTarget(new targets.LambdaFunction(this.dishSyncFunction));

        // Create API Gateway for dish search
        this.dishSearchApi = new apigateway.RestApi(this, 'DishSearchApi', {
            restApiName: `typesense-dish-search-api-${props.environment}`,
            description: 'API for searching dishes using Typesense',
            deployOptions: {
                stageName: 'v1',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
            },
        });

        // Create API Gateway resource and method
        const dishesResource = this.dishSearchApi.root.addResource('dishes');
        const searchResource = dishesResource.addResource('search');

        searchResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(this.dishSearchFunction, {
                proxy: true,
            }),
            {
                apiKeyRequired: false,
                methodResponses: [
                    {
                        statusCode: '200',
                        responseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': true,
                            'method.response.header.Access-Control-Allow-Methods': true,
                            'method.response.header.Access-Control-Allow-Headers': true,
                        },
                        responseModels: {
                            'application/json': apigateway.Model.EMPTY_MODEL,
                        },
                    },
                    {
                        statusCode: '400',
                        responseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': true,
                            'method.response.header.Access-Control-Allow-Methods': true,
                            'method.response.header.Access-Control-Allow-Headers': true,
                        },
                        responseModels: {
                            'application/json': apigateway.Model.ERROR_MODEL,
                        },
                    },
                    {
                        statusCode: '500',
                        responseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': true,
                            'method.response.header.Access-Control-Allow-Methods': true,
                            'method.response.header.Access-Control-Allow-Headers': true,
                        },
                        responseModels: {
                            'application/json': apigateway.Model.ERROR_MODEL,
                        },
                    },
                ],
            }
        );

        // Outputs
        new cdk.CfnOutput(this, 'DishSyncFunctionArn', {
            value: this.dishSyncFunction.functionArn,
            description: 'ARN of the dish sync Lambda function',
            exportName: `Typesense-${props.environment}-DishSyncFunctionArn`,
        });

        new cdk.CfnOutput(this, 'DishSearchFunctionArn', {
            value: this.dishSearchFunction.functionArn,
            description: 'ARN of the dish search Lambda function',
            exportName: `Typesense-${props.environment}-DishSearchFunctionArn`,
        });

        new cdk.CfnOutput(this, 'DishSearchApiUrl', {
            value: `${this.dishSearchApi.url}dishes/search`,
            description: 'URL of the dish search API',
            exportName: `Typesense-${props.environment}-DishSearchApiUrl`,
        });
    }
}
