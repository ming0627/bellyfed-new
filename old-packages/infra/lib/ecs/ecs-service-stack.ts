// ECS Service Stack
// A stack that uses the EcsServiceConstructor to create an ECS service

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';
import { SsmResourceExporter } from '../constructs/ssm';
import { addRankingsS3Permissions } from '../iam/rankings-iam-policies';
import {
    addTypesenseEnvironmentVariables,
    addTypesensePermissions,
} from '../typesense/typesense-utils';
import { EcsServiceConstructor } from './ecs-service-constructor';

export interface EcsServiceStackProps extends cdk.StackProps {
    environment: string;
    // --- References to Infrastructure ---
    vpc: ec2.IVpc;
    cluster: ecs.ICluster; // Use ICluster for imported cluster
    ecrRepository: ecr.IRepository; // Use IRepository
    executionRole: iam.IRole; // Use IRole
    taskRole: iam.IRole; // Use IRole
    albSecurityGroup: ec2.ISecurityGroup; // Use ISecurityGroup
    serviceSecurityGroup: ec2.ISecurityGroup; // Use ISecurityGroup
    targetGroup: elbv2.IApplicationTargetGroup; // Use IApplicationTargetGroup
    logGroup: logs.ILogGroup; // Use ILogGroup
    // --- Service Configuration ---
    imageTag: string; // Tag of the image to deploy (e.g., 'latest', 'v1.2.3')
    dockerHubImage?: string; // Optional Docker Hub image to use instead of ECR
    containerPort: number;
    containerName: string; // Logical name for the container
    // Health check for the container definition itself
    containerHealthCheck?: ecs.HealthCheck;
    // Optional environment variables for the container
    envVars?: { [key: string]: string };
    // Map of secret names (key) to Secret Manager ARN or full ARN (value)
    secretArns?: { [key: string]: string };
    // Optional secrets in ECS Secret format
    secrets?: { [key: string]: ecs.Secret };
    // --- Scaling Configuration ---
    cpu: number; // CPU units for the task
    memoryLimitMiB: number; // Memory limit for the task
    desiredCount: number; // Initial number of tasks
    maxCapacity: number; // Max tasks for scaling
    minCapacity: number; // Min tasks for scaling
    cpuTargetUtilizationPercent?: number; // Optional: Target CPU utilization for scaling (default: 70)
    memoryTargetUtilizationPercent?: number; // Optional: Target Memory utilization for scaling (default: 70)
    // --- Service Type ---
    serviceType: 'frontend' | 'typesense'; // Type of service to create
}

export class EcsServiceStack extends cdk.Stack {
    public readonly service: ecs.FargateService;
    public readonly taskDefinition: ecs.TaskDefinition;
    public readonly container: ecs.ContainerDefinition;
    public readonly serviceConstructor: EcsServiceConstructor;

    constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'ECS-Service');

        // Create SSM Resource Exporter for storing resource ARNs in SSM
        const resourceExporter = new SsmResourceExporter(this, 'ResourceExporter', {
            environment: props.environment,
        });

        // Get environment variables specific to the service type
        const serviceEnvVars = this.getServiceEnvironmentVariables(props);

        // Merge with the provided environment variables
        const combinedEnvVars = {
            ...(props.envVars || {}),
            ...serviceEnvVars,
        };

        // Get container name based on service type if not provided
        const containerName =
            props.containerName ||
            `bellyfed-${props.environment}-${props.serviceType === 'frontend' ? 'container' : 'typesense'}`;

        // Create the service constructor
        this.serviceConstructor = new EcsServiceConstructor(this, 'ServiceConstructor', {
            environment: props.environment,
            vpc: props.vpc,
            cluster: props.cluster,
            executionRole: props.executionRole,
            taskRole: props.taskRole,
            serviceSecurityGroup: props.serviceSecurityGroup,
            albSecurityGroup: props.albSecurityGroup,
            targetGroup: props.targetGroup,
            logGroup: props.logGroup,
            containerPort: props.containerPort,
            containerName: containerName,
            ecrRepository: props.ecrRepository,
            imageTag: props.imageTag,
            dockerHubImage: props.dockerHubImage,
            envVars: combinedEnvVars,
            secretArns: props.secretArns,
            secrets: props.secrets,
            cpu: props.cpu,
            memoryLimitMiB: props.memoryLimitMiB,
            desiredCount: props.desiredCount || 1,
            minCapacity: props.minCapacity || 1,
            maxCapacity: props.maxCapacity || 2,
            cpuTargetUtilizationPercent: props.cpuTargetUtilizationPercent,
            memoryTargetUtilizationPercent: props.memoryTargetUtilizationPercent,
            serviceType: props.serviceType,
            containerHealthCheck: props.containerHealthCheck,
        });

        // Set the service and task definition from the constructor
        this.service = this.serviceConstructor.service;
        this.taskDefinition = this.serviceConstructor.taskDefinition;
        this.container = this.serviceConstructor.container;

        // Add service-specific permissions and configurations
        if (props.serviceType === 'frontend') {
            // Add Typesense permissions to the task role
            addTypesensePermissions(this.taskDefinition.taskRole, props.environment);

            // Add Rankings S3 bucket permissions to the task role
            addRankingsS3Permissions(this.taskDefinition.taskRole, props.environment);

            // Add Typesense environment variables to the container
            addTypesenseEnvironmentVariables(this, this.container, props.environment);
        }

        // Store task definition ARN in SSM
        resourceExporter.exportTaskDefinition(this.taskDefinition);

        // Store service name in SSM
        resourceExporter.exportEcsService(
            this.service,
            props.serviceType === 'typesense' ? 'typesense-service' : undefined
        );

        // Store deployment coordinator configuration in SSM - always disabled
        new ssm.StringParameter(this, 'DeploymentCoordinatorEnabled', {
            parameterName: `/bellyfed/${props.environment}/deployment/coordinator-enabled`,
            stringValue: 'false',
            description: 'Indicates that deployment coordinator is disabled for this environment',
        });

        // Add CloudWatch alarms for the service
        this.createCloudWatchAlarms(props);

        // --- Outputs (without exports) ---
        new cdk.CfnOutput(this, 'ServiceNameOutput', {
            value: this.service.serviceName,
            description: 'ECS Service Name',
        });

        new cdk.CfnOutput(this, 'TaskDefinitionArnOutput', {
            value: this.taskDefinition.taskDefinitionArn,
            description: 'ECS Task Definition ARN',
        });
    }

    /**
     * Helper method to retrieve Cognito-related environment variables from SSM Parameters
     * This avoids direct coupling with the Cognito stack
     */
    private getAuthEnvironmentVariables(environment: string): Record<string, string> {
        try {
            // Only try to import the parameters if they exist
            // This approach uses lookupOrThrow, which avoids the issue with dependencies
            const authEnvVars: Record<string, string> = {};

            try {
                // Get user pool ID
                const userPoolIdPath = CONFIG.auth.ssmPaths.userPoolId
                    .replace('{paramPrefix}', CONFIG.app.namingPatterns.paramPrefix)
                    .replace('{environment}', environment);

                const userPoolIdParam = ssm.StringParameter.fromStringParameterName(
                    this,
                    'ImportedUserPoolId',
                    userPoolIdPath
                );
                // Set the standardized environment variable name
                authEnvVars.NEXT_PUBLIC_USER_POOL_ID = userPoolIdParam.stringValue;

                // Get client ID
                const clientIdPath = CONFIG.auth.ssmPaths.userPoolClientId
                    .replace('{paramPrefix}', CONFIG.app.namingPatterns.paramPrefix)
                    .replace('{environment}', environment);

                const clientIdParam = ssm.StringParameter.fromStringParameterName(
                    this,
                    'ImportedClientId',
                    clientIdPath
                );
                // Set the standardized environment variable name
                // Use both environment variable names for backward compatibility
                authEnvVars.NEXT_PUBLIC_COGNITO_CLIENT_ID = clientIdParam.stringValue;
                authEnvVars.NEXT_PUBLIC_USER_POOL_CLIENT_ID = clientIdParam.stringValue;

                // Get identity pool ID
                const identityPoolIdPath = CONFIG.auth.ssmPaths.identityPoolId
                    .replace('{paramPrefix}', CONFIG.app.namingPatterns.paramPrefix)
                    .replace('{environment}', environment);

                const identityPoolIdParam = ssm.StringParameter.fromStringParameterName(
                    this,
                    'ImportedIdentityPoolId',
                    identityPoolIdPath
                );
                // Set the standardized environment variable name
                authEnvVars.NEXT_PUBLIC_IDENTITY_POOL_ID = identityPoolIdParam.stringValue;
            } catch (error: unknown) {
                console.warn(`Could not retrieve Cognito parameters: ${error}`);
                // Return empty object if parameters can't be found
                return {};
            }

            return authEnvVars;
        } catch (error: unknown) {
            console.warn(`Error setting up auth environment variables: ${error}`);
            return {};
        }
    }

    /**
     * Gets environment variables specific to the service type
     */
    private getServiceEnvironmentVariables(props: EcsServiceStackProps): Record<string, string> {
        const envVars: Record<string, string> = {
            REGION: this.region,
            ENVIRONMENT: props.environment,
        };

        if (props.serviceType === 'frontend') {
            // Add frontend-specific environment variables
            envVars.API_URL = `https://api-${props.environment}.bellyfed.com`;

            // Use a hardcoded S3 bucket name to avoid cross-stack references
            // In a real deployment, this would be retrieved from SSM Parameter Store
            const s3BucketName = `bellyfed-rankings-${props.environment}`;
            console.log(`Using S3 bucket name: ${s3BucketName}`);
            envVars.AWS_S3_BUCKET = s3BucketName;

            // Use hardcoded Cognito parameters to avoid cross-stack references
            // In a real deployment, these would be retrieved from SSM Parameter Store
            envVars.NEXT_PUBLIC_USER_POOL_ID = `ap-southeast-1_${props.environment}123456`;
            envVars.NEXT_PUBLIC_COGNITO_CLIENT_ID = `${props.environment}abcdefghijklm`;
            envVars.NEXT_PUBLIC_USER_POOL_CLIENT_ID = `${props.environment}abcdefghijklm`;
            envVars.NEXT_PUBLIC_IDENTITY_POOL_ID = `ap-southeast-1:${props.environment}-1234-5678-9012-3456789abcdef`;
        }

        return envVars;
    }

    /**
     * Creates CloudWatch alarms for the service
     */
    private createCloudWatchAlarms(props: EcsServiceStackProps): void {
        // Add alarm for high CPU utilization
        new cdk.aws_cloudwatch.Alarm(this, 'HighCpuAlarm', {
            metric: this.service.metricCpuUtilization(),
            threshold: 85,
            evaluationPeriods: 2,
            datapointsToAlarm: 2,
            alarmDescription: `High CPU utilization for ${props.serviceType} service`,
            alarmName: `${props.environment}-bellyfed-${props.serviceType}-high-cpu`,
            comparisonOperator: cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        });
    }
}
