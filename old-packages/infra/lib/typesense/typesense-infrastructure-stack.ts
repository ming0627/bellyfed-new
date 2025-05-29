// Typesense Infrastructure Stack
// Creates the infrastructure needed for Typesense search service
// This includes security groups, IAM roles, and CloudWatch components

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { SsmResourceExporter } from '../constructs/ssm/ssm-resource-exporter';
import { EnvironmentConfig } from '../environmentConfig.js';

export interface TypesenseInfrastructureStackProps extends cdk.StackProps {
    environment: string;
    // VPC to deploy Typesense into
    vpc: ec2.IVpc;
    // ECS cluster to deploy Typesense into
    cluster?: ecs.ICluster;
    // Port the Typesense container listens on
    containerPort: number;
    // Health check path for the target group
    healthCheckPath?: string; // Optional, defaults to '/health'
}

export class TypesenseInfrastructureStack extends cdk.Stack {
    public readonly vpc: ec2.IVpc;
    public readonly cluster: ecs.ICluster;
    public readonly executionRole: iam.Role;
    public readonly taskRole: iam.Role;
    public readonly logGroup: logs.LogGroup;
    public readonly serviceSecurityGroup: ec2.SecurityGroup;
    public readonly fileSystem: efs.FileSystem;
    public readonly accessPoint: efs.AccessPoint;

    constructor(scope: Construct, id: string, props: TypesenseInfrastructureStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Typesense-Infrastructure');

        // Get environment-specific configuration
        const envConfig = EnvironmentConfig.getInstance(props.environment);
        const typesenseConfig = envConfig.getConfig().typesense;

        // Create SSM Resource Exporter for storing resource ARNs in SSM
        const resourceExporter = new SsmResourceExporter(this, 'ResourceExporter', {
            environment: props.environment,
        });

        // Use provided VPC
        this.vpc = props.vpc;

        // Use provided cluster or create a new one if not provided
        if (props.cluster) {
            this.cluster = props.cluster;
        } else {
            this.cluster = new ecs.Cluster(this, 'Cluster', {
                vpc: this.vpc,
                clusterName: `bellyfed-typesense-${props.environment}`,
                containerInsights: typesenseConfig.containerInsights,
            });
        }

        // Create security group for Typesense service
        this.serviceSecurityGroup = new ec2.SecurityGroup(this, 'TypesenseSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for Typesense service',
            allowAllOutbound: true,
        });

        // Allow inbound traffic on the Typesense port from within the VPC
        this.serviceSecurityGroup.addIngressRule(
            ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
            ec2.Port.tcp(props.containerPort),
            'Allow traffic from within VPC to Typesense'
        );

        // Allow inbound NFS traffic (port 2049) for EFS mount
        this.serviceSecurityGroup.addIngressRule(
            ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
            ec2.Port.tcp(2049),
            'Allow NFS traffic for EFS mount'
        );

        // Create CloudWatch Log Group
        this.logGroup = new logs.LogGroup(this, 'LogGroup', {
            logGroupName: `/aws/ecs/typesense-${props.environment}`,
            retention: this.getLogRetention(typesenseConfig.logRetentionDays),
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust as needed for prod
        });

        // Create execution role for the task
        this.executionRole = new iam.Role(this, 'ExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: `bellyfed-typesense-${props.environment}-execution-role`,
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AmazonECSTaskExecutionRolePolicy'
                ),
            ],
        });

        // Add permissions for SSM Parameter Store access
        this.executionRole.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ['ssm:GetParameters', 'secretsmanager:GetSecretValue', 'kms:Decrypt'],
                resources: ['*'],
            })
        );

        // Create task role for the container
        this.taskRole = new iam.Role(this, 'TaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: `bellyfed-typesense-${props.environment}-task-role`,
        });

        // Add permissions for CloudWatch Logs
        this.taskRole.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ['logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'],
                resources: [this.logGroup.logGroupArn],
            })
        );

        // We'll add EFS permissions after creating the file system

        // Create EFS file system for Typesense data persistence
        this.fileSystem = new efs.FileSystem(this, 'TypesenseFileSystem', {
            vpc: this.vpc,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS, // Move files to infrequent access after 14 days
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
            throughputMode: efs.ThroughputMode.BURSTING,
            removalPolicy: cdk.RemovalPolicy.RETAIN, // Important: Retain the file system on stack deletion to prevent data loss
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroup: this.serviceSecurityGroup,
            fileSystemName: `typesense-data-${props.environment}`,
        });

        // Create access point for the file system
        this.accessPoint = this.fileSystem.addAccessPoint('TypesenseAccessPoint', {
            path: '/typesense-data',
            createAcl: {
                ownerGid: '1000',
                ownerUid: '1000',
                permissions: '755',
            },
            posixUser: {
                gid: '1000',
                uid: '1000',
            },
        });

        // Add permissions for EFS access now that the file system is created
        this.taskRole.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    'elasticfilesystem:ClientMount',
                    'elasticfilesystem:ClientWrite',
                    'elasticfilesystem:ClientRootAccess',
                    'elasticfilesystem:DescribeMountTargets',
                    'elasticfilesystem:DescribeFileSystems',
                ],
                resources: [this.fileSystem.fileSystemArn],
            })
        );

        // Add permissions for EFS access to all file systems
        // This is necessary for the EFS mount helper to work properly
        this.taskRole.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    'elasticfilesystem:DescribeFileSystems',
                    'elasticfilesystem:DescribeMountTargets',
                ],
                resources: ['*'],
            })
        );

        // Store resources in SSM Parameter Store
        // Don't export VPC as it's already exported by the ECS Infrastructure Stack
        // Instead, export with a different name to avoid conflicts
        resourceExporter.exportVpc(this.vpc, 'typesense-vpc-id');

        // Don't export ECS cluster as it's already exported by the ECS Infrastructure Stack
        // Instead, export with a different name to avoid conflicts
        resourceExporter.exportEcsCluster(this.cluster, 'typesense-cluster-name');

        resourceExporter.exportSecurityGroup(
            this.serviceSecurityGroup,
            'typesense-service-security-group'
        );
        resourceExporter.exportLogGroup(this.logGroup, 'typesense-log-group');
        resourceExporter.exportRole(this.executionRole, 'typesense-execution-role');
        resourceExporter.exportRole(this.taskRole, 'typesense-task-role');

        // Store Typesense API key in SSM Parameter Store
        new ssm.StringParameter(this, 'TypesenseApiKey', {
            parameterName: `/bellyfed/${props.environment}/typesense/api-key`,
            stringValue: typesenseConfig.apiKey,
            description: 'API key for Typesense',
            tier: ssm.ParameterTier.STANDARD,
        });

        // Store EFS file system ID in SSM Parameter Store
        new ssm.StringParameter(this, 'TypesenseFileSystemId', {
            parameterName: `/bellyfed/${props.environment}/typesense/file-system-id`,
            stringValue: this.fileSystem.fileSystemId,
            description: 'EFS file system ID for Typesense data',
            tier: ssm.ParameterTier.STANDARD,
        });

        // Store EFS access point ID in SSM Parameter Store
        new ssm.StringParameter(this, 'TypesenseAccessPointId', {
            parameterName: `/bellyfed/${props.environment}/typesense/access-point-id`,
            stringValue: this.accessPoint.accessPointId,
            description: 'EFS access point ID for Typesense data',
            tier: ssm.ParameterTier.STANDARD,
        });

        // Output the security group ID
        new cdk.CfnOutput(this, 'TypesenseSecurityGroupId', {
            value: this.serviceSecurityGroup.securityGroupId,
            description: 'Security group ID for Typesense service',
            exportName: `Typesense-${props.environment}-SecurityGroupId`,
        });

        // Output the EFS file system ID
        new cdk.CfnOutput(this, 'TypesenseFileSystemIdOutput', {
            value: this.fileSystem.fileSystemId,
            description: 'EFS file system ID for Typesense data',
            exportName: `Typesense-${props.environment}-FileSystemId`,
        });
    }

    /**
     * Convert log retention days to CloudWatch LogGroup retention days
     * @param days Number of days to retain logs
     * @returns CloudWatch LogGroup retention days
     */
    private getLogRetention(days: number): logs.RetentionDays {
        switch (days) {
            case 1:
                return logs.RetentionDays.ONE_DAY;
            case 3:
                return logs.RetentionDays.THREE_DAYS;
            case 5:
                return logs.RetentionDays.FIVE_DAYS;
            case 7:
                return logs.RetentionDays.ONE_WEEK;
            case 14:
                return logs.RetentionDays.TWO_WEEKS;
            case 30:
                return logs.RetentionDays.ONE_MONTH;
            case 60:
                return logs.RetentionDays.TWO_MONTHS;
            case 90:
                return logs.RetentionDays.THREE_MONTHS;
            case 120:
                return logs.RetentionDays.FOUR_MONTHS;
            case 150:
                return logs.RetentionDays.FIVE_MONTHS;
            case 180:
                return logs.RetentionDays.SIX_MONTHS;
            case 365:
                return logs.RetentionDays.ONE_YEAR;
            case 400:
                return logs.RetentionDays.THIRTEEN_MONTHS;
            case 545:
                return logs.RetentionDays.EIGHTEEN_MONTHS;
            case 731:
                return logs.RetentionDays.TWO_YEARS;
            case 1827:
                return logs.RetentionDays.FIVE_YEARS;
            case 3653:
                return logs.RetentionDays.TEN_YEARS;
            default:
                return logs.RetentionDays.ONE_WEEK;
        }
    }
}
