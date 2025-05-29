import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './environmentConfig.js';
import { BranchName } from './types.js';

export interface DynamoDBStackProps extends cdk.StackProps {
    environment: string;
}

/**
 * Stack for DynamoDB tables used in the Bellyfed application.
 *
 * This stack creates and manages the following:
 * 1. Analytics Table
 *    - Stores real-time analytics data
 *    - View counts, user engagement metrics
 *    - Time-series data
 *
 * 2. Sessions Table
 *    - Stores user session data
 *    - Authentication tokens
 *    - Short-lived data with TTL
 *
 * 3. Cache Table
 *    - Stores frequently accessed data
 *    - API response caching
 *    - Feature flags and configuration
 *
 * The table names and ARNs are stored in SSM Parameter Store
 * for access by other resources.
 */
export class DynamoDBStack extends cdk.Stack {
    public readonly analyticsTable: dynamodb.Table;
    public readonly sessionsTable: dynamodb.Table;
    public readonly cacheTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Initialize EnvironmentConfig with the environment
        const _envConfig = EnvironmentConfig.getInstance(environment as BranchName);

        // Create Analytics Table
        this.analyticsTable = new dynamodb.Table(this, `AnalyticsTable-${environment}`, {
            tableName: `bellyfed-analytics-${environment}`,
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity
            removalPolicy:
                environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            pointInTimeRecovery: environment === 'prod',
        });

        // Add GSI for entity type queries
        this.analyticsTable.addGlobalSecondaryIndex({
            indexName: 'GSI1',
            partitionKey: { name: 'entityType', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'viewCount', type: dynamodb.AttributeType.NUMBER },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // Create Sessions Table with TTL
        this.sessionsTable = new dynamodb.Table(this, `SessionsTable-${environment}`, {
            tableName: `bellyfed-sessions-${environment}`,
            partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Sessions are ephemeral
            timeToLiveAttribute: 'ttl',
        });

        // Create Cache Table with TTL
        this.cacheTable = new dynamodb.Table(this, `CacheTable-${environment}`, {
            tableName: `bellyfed-cache-${environment}`,
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'ttl',
        });

        // Store table information in SSM Parameter Store
        new ssm.StringParameter(this, `AnalyticsTableNameParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/analytics-table-name`,
            description: `Name of the Analytics DynamoDB table in ${environment} environment`,
            stringValue: this.analyticsTable.tableName,
        });

        new ssm.StringParameter(this, `AnalyticsTableArnParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/analytics-table-arn`,
            description: `ARN of the Analytics DynamoDB table in ${environment} environment`,
            stringValue: this.analyticsTable.tableArn,
        });

        new ssm.StringParameter(this, `SessionsTableNameParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/sessions-table-name`,
            description: `Name of the Sessions DynamoDB table in ${environment} environment`,
            stringValue: this.sessionsTable.tableName,
        });

        new ssm.StringParameter(this, `SessionsTableArnParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/sessions-table-arn`,
            description: `ARN of the Sessions DynamoDB table in ${environment} environment`,
            stringValue: this.sessionsTable.tableArn,
        });

        new ssm.StringParameter(this, `CacheTableNameParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/cache-table-name`,
            description: `Name of the Cache DynamoDB table in ${environment} environment`,
            stringValue: this.cacheTable.tableName,
        });

        new ssm.StringParameter(this, `CacheTableArnParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/dynamodb/cache-table-arn`,
            description: `ARN of the Cache DynamoDB table in ${environment} environment`,
            stringValue: this.cacheTable.tableArn,
        });

        // Add tags to resources
        cdk.Tags.of(this.analyticsTable).add('Environment', environment);
        cdk.Tags.of(this.analyticsTable).add('Name', `BellyfedAnalyticsTable-${environment}`);
        cdk.Tags.of(this.sessionsTable).add('Environment', environment);
        cdk.Tags.of(this.sessionsTable).add('Name', `BellyfedSessionsTable-${environment}`);
        cdk.Tags.of(this.cacheTable).add('Environment', environment);
        cdk.Tags.of(this.cacheTable).add('Name', `BellyfedCacheTable-${environment}`);

        // Output table names
        new cdk.CfnOutput(this, `AnalyticsTableName-${environment}`, {
            description: `Analytics DynamoDB table name for ${environment} environment`,
            value: this.analyticsTable.tableName,
        });

        new cdk.CfnOutput(this, `SessionsTableName-${environment}`, {
            description: `Sessions DynamoDB table name for ${environment} environment`,
            value: this.sessionsTable.tableName,
        });

        new cdk.CfnOutput(this, `CacheTableName-${environment}`, {
            description: `Cache DynamoDB table name for ${environment} environment`,
            value: this.cacheTable.tableName,
        });
    }
}
