import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';

export interface AuroraStackProps extends cdk.StackProps {
    environment: string;
    vpc: ec2.IVpc;
}

/**
 * Stack for Aurora PostgreSQL Serverless v2 database used in the Bellyfed application.
 *
 * This stack creates and manages the following:
 * 1. Aurora Serverless v2 PostgreSQL cluster
 *    - Primary database for all application data
 *    - Autoscaling configuration based on environment
 *    - Encrypted storage
 *    - Credentials managed in Secrets Manager
 *
 * The database endpoints, credentials, and ARNs are stored in
 * SSM Parameter Store for access by other resources.
 *
 * Aurora Serverless v2 benefits:
 * - Automatic scaling based on workload
 * - Pay only for what you use
 * - No need to manage instance types
 * - Scales from 0.5 to 128 ACUs (Aurora Capacity Units)
 * - Compatible with PostgreSQL 13+ (using PostgreSQL 16.8)
 */
export class AuroraStack extends cdk.Stack {
    public readonly dbCluster: rds.DatabaseCluster;
    public readonly dbSecurityGroup: ec2.SecurityGroup;
    public readonly dbSecret: secretsmanager.Secret;
    public readonly clusterArn: string;
    public readonly clusterSecretArn: string;

    constructor(scope: Construct, id: string, props: AuroraStackProps) {
        super(scope, id, props);

        const { environment, vpc } = props;

        // Create a security group for the database
        this.dbSecurityGroup = new ec2.SecurityGroup(this, `PostgresSecurityGroup-${environment}`, {
            vpc,
            description: `Security group for Aurora PostgreSQL in ${environment} environment`,
            allowAllOutbound: true,
        });

        // Create a secret for database credentials
        this.dbSecret = new secretsmanager.Secret(this, `PostgresCredentials-${environment}`, {
            secretName: `bellyfed/${environment}/db/credentials`,
            description: `Credentials for Aurora PostgreSQL in ${environment} environment`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: 'bellyfed_admin',
                }),
                excludePunctuation: true,
                includeSpace: false,
                generateStringKey: 'password',
            },
        });

        // Create a subnet group for the database
        const dbSubnetGroup = new rds.SubnetGroup(this, `PostgresSubnetGroup-${environment}`, {
            description: `Subnet group for Aurora PostgreSQL in ${environment} environment`,
            vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        });

        // Get Aurora configuration from environment config
        const envConfig = CONFIG.getEnvironmentConfig(environment);
        const auroraConfig = envConfig.aurora;

        // Create Aurora PostgreSQL Serverless v2 cluster
        // Following the pattern from AWS CDK documentation
        this.dbCluster = new rds.DatabaseCluster(this, `PostgresCluster-${environment}`, {
            engine: rds.DatabaseClusterEngine.auroraPostgres({
                version: rds.AuroraPostgresEngineVersion.VER_15_3, // Latest version compatible with Serverless v2
            }),
            credentials: rds.Credentials.fromSecret(this.dbSecret),
            // Use the serverlessV2 instance type for the writer
            writer: rds.ClusterInstance.serverlessV2('writer', {
                publiclyAccessible: false,
            }),
            // Remove reader instance to minimize costs
            // We'll rely on the writer instance only
            vpc,
            subnetGroup: dbSubnetGroup,
            defaultDatabaseName: `bellyfed_${environment}`,
            // Configure Serverless v2 capacity (in Aurora Capacity Units - ACUs)
            serverlessV2MinCapacity: auroraConfig.minCapacity, // Minimum ACUs (0.5 is the lowest)
            serverlessV2MaxCapacity: auroraConfig.maxCapacity, // Maximum ACUs
            // Disable deletion protection for all environments to make cleanup easier
            deletionProtection: false,
            // Create a parameter group specifically for PostgreSQL 16
            parameterGroup: new rds.ParameterGroup(this, `PostgresParams-${environment}`, {
                engine: rds.DatabaseClusterEngine.auroraPostgres({
                    version: rds.AuroraPostgresEngineVersion.VER_15_3, // Latest version compatible with Serverless v2
                }),
                description: `Aurora PostgreSQL 16 parameter group for ${environment} environment`,
            }),
            // Minimize backup retention to reduce costs
            backup: {
                retention: cdk.Duration.days(1), // Minimum retention for all environments
                preferredWindow: '02:00-03:00', // During low-usage hours
            },
            preferredMaintenanceWindow: 'Sun:04:00-Sun:05:00', // Weekend maintenance
            // Enable Data API for Lambda integration
            enableDataApi: true,
            // Disable monitoring to reduce costs
            monitoringInterval: cdk.Duration.seconds(0), // Disable monitoring
            // Use standard storage instead of I/O-Optimized to reduce costs
            storageType: rds.DBClusterStorageType.AURORA,
        });

        // Configure scaling configuration using CfnDBCluster
        const cfnCluster = this.dbCluster.node.defaultChild as rds.CfnDBCluster;
        cfnCluster.addPropertyOverride('ServerlessV2ScalingConfiguration', {
            MinCapacity: auroraConfig.minCapacity,
            MaxCapacity: auroraConfig.maxCapacity,
            // Auto-pause is not supported in all PostgreSQL versions
            // Only add SecondsUntilAutoPause for versions that support it
        });

        // Store database information in SSM Parameter Store
        // These parameters will be used by the application to connect to the database
        // Use a custom resource to handle the SSM parameters to avoid export issues during deletion
        const dbHostParam = new ssm.StringParameter(this, `DBHostParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/db/aurora-host`,
            description: `Host name for Aurora PostgreSQL Serverless v2 in ${environment} environment`,
            stringValue: this.dbCluster.clusterEndpoint.hostname,
        });
        // Disable export to avoid dependency issues during deletion
        (dbHostParam.node.defaultChild as cdk.CfnResource).addPropertyOverride('Export', undefined);

        const dbPortParam = new ssm.StringParameter(this, `DBPortParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/db/aurora-port`,
            description: `Port for Aurora PostgreSQL Serverless v2 in ${environment} environment`,
            stringValue: this.dbCluster.clusterEndpoint.port.toString(),
        });
        // Disable export to avoid dependency issues during deletion
        (dbPortParam.node.defaultChild as cdk.CfnResource).addPropertyOverride('Export', undefined);

        // Store the database name in SSM
        const dbNameParam = new ssm.StringParameter(this, `DBNameParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/db/aurora-name`,
            description: `Database name for Aurora PostgreSQL Serverless v2 in ${environment} environment`,
            stringValue: `bellyfed_${environment}`,
        });
        // Disable export to avoid dependency issues during deletion
        (dbNameParam.node.defaultChild as cdk.CfnResource).addPropertyOverride('Export', undefined);

        // Store the secret ARN in SSM for applications to retrieve credentials
        const dbSecretParam = new ssm.StringParameter(this, `DBSecretParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/db/secret`,
            description: `Secret ARN for Aurora PostgreSQL Serverless v2 in ${environment} environment`,
            stringValue: this.dbSecret.secretArn,
        });
        // Disable export to avoid dependency issues during deletion
        (dbSecretParam.node.defaultChild as cdk.CfnResource).addPropertyOverride(
            'Export',
            undefined
        );

        // Store the cluster ARN in SSM for Data API access
        const dbClusterArnParam = new ssm.StringParameter(
            this,
            `DBClusterArnParam-${environment}`,
            {
                parameterName: `/bellyfed/${environment}/db/aurora-cluster-arn`,
                description: `Cluster ARN for Aurora PostgreSQL Serverless v2 Data API in ${environment} environment`,
                stringValue: this.dbCluster.clusterArn,
            }
        );
        // Disable export to avoid dependency issues during deletion
        (dbClusterArnParam.node.defaultChild as cdk.CfnResource).addPropertyOverride(
            'Export',
            undefined
        );

        // Add tags to resources
        cdk.Tags.of(this.dbCluster).add('Environment', environment);
        cdk.Tags.of(this.dbCluster).add('Name', `BellyfedDB-${environment}`);
        cdk.Tags.of(this.dbSecurityGroup).add('Environment', environment);
        cdk.Tags.of(this.dbSecurityGroup).add('Name', `BellyfedDBSG-${environment}`);

        // Initialize the cluster ARN and secret ARN properties
        this.clusterArn = this.dbCluster.clusterArn;
        this.clusterSecretArn = this.dbSecret.secretArn;

        // Output database endpoints
        new cdk.CfnOutput(this, `DBEndpoint-${environment}`, {
            description: `Aurora PostgreSQL Serverless v2 writer endpoint for ${environment} environment`,
            value: this.dbCluster.clusterEndpoint.hostname,
        });

        new cdk.CfnOutput(this, `DBClusterArn-${environment}`, {
            description: `Aurora PostgreSQL Serverless v2 cluster ARN for ${environment} environment`,
            value: this.dbCluster.clusterArn,
        });

        new cdk.CfnOutput(this, `DBSecretArn-${environment}`, {
            description: `Aurora PostgreSQL Serverless v2 secret ARN for ${environment} environment`,
            value: this.dbSecret.secretArn,
        });
    }
}
