// Typesense Service Stack
// Creates an ECS service for the Typesense search engine
// Uses the EcsServiceStack as a base

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { EcsServiceStack } from './ecs/ecs-service-stack';

export interface TypesenseServiceStackProps extends cdk.StackProps {
    environment: string;
}

export class TypesenseServiceStack extends cdk.Stack {
    public readonly service: ecs.FargateService;
    public readonly taskDefinition: ecs.TaskDefinition;
    public readonly container: ecs.ContainerDefinition;

    constructor(scope: Construct, id: string, props: TypesenseServiceStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Typesense-Service');

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

        // Create a dummy security group ID
        // In a real deployment, this would be retrieved from SSM Parameter Store
        const serviceSecurityGroupId = `sg-typesense-${props.environment}`;

        // Import service security group
        const serviceSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'ImportedServiceSecurityGroup',
            serviceSecurityGroupId
        );

        // Import log group
        const logGroup = logs.LogGroup.fromLogGroupName(
            this,
            'ImportedLogGroup',
            CONFIG.typesense.namingPatterns.logGroup.replace('{environment}', props.environment)
        );

        // Get environment config
        const envConfig = CONFIG.getEnvironmentConfig(props.environment);

        // Use a hardcoded API key to avoid cross-stack references
        // In a real deployment, this would be retrieved from SSM Parameter Store
        const apiKey = `ts_${props.environment}_abcdefghijklm`;
        console.log(`Using Typesense API key: ${apiKey}`);

        // Create dummy ALB security group (not used for Typesense but required by interface)
        const dummyAlbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'DummyAlbSecurityGroup',
            serviceSecurityGroup.securityGroupId
        );

        // Create the service stack
        const serviceStack = new EcsServiceStack(this, 'TypesenseService', {
            environment: props.environment,
            vpc,
            cluster,
            ecrRepository: ecr.Repository.fromRepositoryName(
                this,
                'DummyRepository', // Not used, but required by the interface
                'dummy'
            ),
            imageTag: 'latest', // Not used, but required by the interface
            dockerHubImage: CONFIG.typesense.dockerHubImage,
            executionRole,
            taskRole,
            albSecurityGroup: dummyAlbSecurityGroup, // Required by interface but not used
            serviceSecurityGroup,
            // Create a dummy target group (not used for Typesense but required by interface)
            targetGroup: elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(
                this,
                'DummyTargetGroup',
                {
                    targetGroupArn: `arn:aws:elasticloadbalancing:${this.region}:${this.account}:targetgroup/dummy/dummy`,
                }
            ),
            logGroup,
            containerPort: CONFIG.typesense.container.port,
            containerName: CONFIG.typesense.namingPatterns.container.replace(
                '{environment}',
                props.environment
            ),
            cpu: envConfig.typesense.cpu,
            memoryLimitMiB: envConfig.typesense.memoryLimitMiB,
            desiredCount: envConfig.typesense.desiredCount,
            maxCapacity: envConfig.typesense.maxCapacity,
            minCapacity: envConfig.typesense.minCapacity,
            serviceType: 'typesense',
            // Add environment variables
            envVars: {
                TYPESENSE_API_KEY: apiKey,
                TYPESENSE_DATA_DIR: '/data',
                TYPESENSE_ENABLE_CORS: 'true',
            },
        });

        // Set the service and task definition from the service stack
        this.service = serviceStack.service;
        this.taskDefinition = serviceStack.taskDefinition;
        this.container = serviceStack.container;

        // Store Typesense endpoint in SSM
        new ssm.StringParameter(this, 'TypesenseEndpoint', {
            parameterName: `/bellyfed/${props.environment}/typesense/endpoint`,
            stringValue: `http://typesense-${props.environment}.bellyfed.internal:${CONFIG.typesense.container.port}`,
            description: 'Typesense endpoint for internal access',
        });

        // Store Typesense API key in SSM if it was generated
        if (!apiKey.startsWith('ts_')) {
            new ssm.StringParameter(this, 'TypesenseApiKey', {
                parameterName: `/bellyfed/${props.environment}/typesense/api-key`,
                stringValue: apiKey,
                description: 'Typesense API key',
            });
        }
    }
}
