import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import { BaseStackProps } from './types.js';

export interface DbSchemaStackProps extends BaseStackProps {
    vpc: ec2.IVpc;
    dbSecretArn: string;
    dbClusterArn: string;
    dbName: string;
}

/**
 * Stack for database schema creation and update Lambda function.
 *
 * This stack creates and manages the following:
 * 1. Lambda function to execute database schema creation and updates
 *    - Executes SQL scripts to create/update database schema
 *    - Runs in the same VPC as the database
 *    - Has permissions to access the database
 *    - Uses direct PostgreSQL connection for better compatibility
 */
export class DbSchemaStack extends cdk.Stack {
    public readonly schemaFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: DbSchemaStackProps) {
        super(scope, id, props);

        const { environment, vpc, dbSecretArn, dbName } = props;

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'DbSchema');

        // Create log group for Lambda function
        const logGroup = new logs.LogGroup(this, 'SchemaLogGroup', {
            logGroupName: `/aws/lambda/bellyfed-db-schema-${environment}`,
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create IAM role for Lambda function
        const lambdaRole = new iam.Role(this, 'SchemaLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: `Role for Bellyfed database schema Lambda in ${environment} environment`,
        });

        // Add permissions to access database secrets
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [dbSecretArn],
            })
        );

        // Add permissions for Lambda to write logs
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
                resources: [logGroup.logGroupArn, `${logGroup.logGroupArn}:*`],
            })
        );

        // Add permissions for Lambda to access VPC
        lambdaRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaVPCAccessExecutionRole'
            )
        );

        // Create Lambda function without bundling
        this.schemaFunction = new lambda.Function(this, 'SchemaFunction', {
            functionName: `bellyfed-db-schema-${environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/db-schema')),
            role: lambdaRole,
            timeout: cdk.Duration.minutes(15), // Increased timeout to handle database resuming
            memorySize: 1024, // Increased memory for better performance
            environment: {
                DB_SECRET_ARN: dbSecretArn,
                DB_NAME: dbName,
                NODE_ENV: environment === 'dev' ? 'development' : 'production', // For detailed error reporting in dev
            },
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            logGroup,
        });

        // Store function ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'SchemaFunctionArnParam', {
            parameterName: `/bellyfed/${environment}/lambda/db-schema-function-arn`,
            stringValue: this.schemaFunction.functionArn,
            description: `ARN for database schema Lambda function in ${environment} environment`,
        });

        // Output function ARN
        new cdk.CfnOutput(this, 'SchemaFunctionArn', {
            value: this.schemaFunction.functionArn,
            description: `ARN for database schema Lambda function in ${environment} environment`,
        });
    }
}
