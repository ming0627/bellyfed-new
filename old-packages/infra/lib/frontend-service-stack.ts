// Frontend Service Stack
// Creates an ECS service for the frontend application
// Uses the EcsServiceStack as a base

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { EcsServiceStack } from './ecs/ecs-service-stack';

export interface FrontendServiceStackProps extends cdk.StackProps {
    environment: string;
    // Optional image tag (defaults to 'latest')
    imageTag?: string;
}

export class FrontendServiceStack extends cdk.Stack {
    public readonly service: ecs.FargateService;
    public readonly taskDefinition: ecs.TaskDefinition;
    public readonly container: ecs.ContainerDefinition;

    constructor(scope: Construct, id: string, props: FrontendServiceStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Frontend-Service');

        // Create a dummy VPC for testing
        // In a real deployment, this would be imported from an existing VPC
        const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
            vpcId: 'vpc-dummy',
            availabilityZones: ['ap-southeast-1a', 'ap-southeast-1b'],
            privateSubnetIds: ['subnet-private1', 'subnet-private2'],
            privateSubnetRouteTableIds: ['rtb-private1', 'rtb-private2'],
            publicSubnetIds: ['subnet-public1', 'subnet-public2'],
            publicSubnetRouteTableIds: ['rtb-public1', 'rtb-public2'],
        });

        // Import ECS cluster
        const cluster = ecs.Cluster.fromClusterAttributes(this, 'ImportedCluster', {
            clusterName: `bellyfed-${props.environment}`,
            vpc: vpc,
            securityGroups: [],
        });

        // Import ECR repository
        const ecrRepository = ecr.Repository.fromRepositoryName(
            this,
            'ImportedRepository',
            CONFIG.ecr.repositoryNamePattern.replace('{environment}', props.environment)
        );

        // Import execution role
        const executionRole = iam.Role.fromRoleName(
            this,
            'ImportedExecutionRole',
            CONFIG.ecs.namingPatterns.executionRole.replace('{environment}', props.environment)
        );

        // Import task role
        const taskRole = iam.Role.fromRoleName(
            this,
            'ImportedTaskRole',
            CONFIG.ecs.namingPatterns.taskRole.replace('{environment}', props.environment)
        );

        // Create dummy security group IDs
        // In a real deployment, these would be retrieved from SSM Parameter Store
        const albSecurityGroupId = `sg-alb-${props.environment}`;
        const serviceSecurityGroupId = `sg-service-${props.environment}`;

        // Import ALB security group
        const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'ImportedAlbSecurityGroup',
            albSecurityGroupId
        );

        // Import service security group
        const serviceSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'ImportedServiceSecurityGroup',
            serviceSecurityGroupId
        );

        // Create a dummy target group ARN
        // In a real deployment, this would be retrieved from SSM Parameter Store
        const targetGroupArn = `arn:aws:elasticloadbalancing:${this.region}:${this.account}:targetgroup/bellyfed-${props.environment}/dummy`;

        // Import target group
        const targetGroup = elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(
            this,
            'ImportedTargetGroup',
            {
                targetGroupArn: targetGroupArn,
            }
        );

        // Import log group
        const logGroup = logs.LogGroup.fromLogGroupName(
            this,
            'ImportedLogGroup',
            CONFIG.ecs.namingPatterns.logGroup.replace('{environment}', props.environment)
        );

        // Get environment config
        const envConfig = CONFIG.getEnvironmentConfig(props.environment);

        // Get auth environment variables
        const authEnvVars = this.getAuthEnvironmentVariables(props.environment);

        // Create the service stack
        const serviceStack = new EcsServiceStack(this, 'FrontendService', {
            environment: props.environment,
            vpc,
            cluster,
            ecrRepository,
            imageTag: props.imageTag || 'latest',
            executionRole,
            taskRole,
            albSecurityGroup,
            serviceSecurityGroup,
            targetGroup,
            logGroup,
            containerPort: CONFIG.ecs.container.port,
            containerName: CONFIG.ecs.namingPatterns.container.replace(
                '{environment}',
                props.environment
            ),
            cpu: envConfig.ecs.cpu,
            memoryLimitMiB: envConfig.ecs.memoryLimitMiB,
            desiredCount: envConfig.ecs.desiredCount,
            maxCapacity: envConfig.ecs.maxCapacity,
            minCapacity: envConfig.ecs.minCapacity,
            serviceType: 'frontend',
            // Add environment variables
            envVars: {
                ...authEnvVars,
                API_URL: `https://api-${props.environment}.bellyfed.com`,
            },
            // Add secret ARNs
            secretArns: {
                GOOGLE_MAPS_API_KEY: 'dummy', // Will be resolved from the app secrets
                JWT_SECRET: 'dummy', // Will be resolved from the app secrets
            },
        });

        // Set the service and task definition from the service stack
        this.service = serviceStack.service;
        this.taskDefinition = serviceStack.taskDefinition;
        this.container = serviceStack.container;
    }

    /**
     * Helper method to get auth environment variables
     * @param environment The environment context
     * @returns Object with auth environment variables
     */
    private getAuthEnvironmentVariables(environment: string): { [key: string]: string } {
        // For now, use hardcoded values to avoid cross-stack reference issues
        // In a real deployment, these would be retrieved from SSM Parameter Store
        return {
            AUTH_URL: `https://auth-${environment}.bellyfed.com`,
            AUTH_AUDIENCE: `bellyfed-${environment}-api`,
            AUTH_CLIENT_ID: `bellyfed-${environment}-client`,
        };
    }
}
