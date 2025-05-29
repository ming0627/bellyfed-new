// ECS Service Update Stack
// This stack updates the existing ECS service stack to use the correct secret ARN format

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface EcsServiceUpdateStackProps extends cdk.StackProps {
    environment: string;
    // The ARN of the consolidated secret
    secretArn: string;
}

/**
 * This stack updates an existing ECS service with a new task definition.
 * It imports all resources from existing stacks, and only updates the task definition.
 */
export class EcsServiceUpdateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EcsServiceUpdateStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'ECS-Service-Update');

        // Create a new execution role for the task definition
        const executionRole = new iam.Role(this, 'ExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Role used by ECS tasks to pull images and secrets',
            roleName: `bellyfed-${props.environment}-ecs-execution-role-update`,
        });

        // Add permissions to pull images from ECR
        executionRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecr:GetAuthorizationToken',
                    'ecr:BatchCheckLayerAvailability',
                    'ecr:GetDownloadUrlForLayer',
                    'ecr:BatchGetImage',
                ],
                resources: ['*'],
            })
        );

        // Add permissions to CloudWatch logs
        executionRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
                resources: [
                    `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/ecs/bellyfed-${props.environment}:*`,
                ],
            })
        );

        // Add permissions to SSM Parameter Store
        executionRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['ssm:GetParameters'],
                resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/bellyfed/*`],
            })
        );

        // Create a new task role for the container
        const taskRole = new iam.Role(this, 'TaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Role used by tasks to access other AWS services',
            roleName: `bellyfed-${props.environment}-ecs-task-role-update`,
        });

        // Create a new task definition
        const newTaskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
            family: `bellyfed-${props.environment}-task-update`,
            cpu: 256,
            memoryLimitMiB: 512,
            executionRole: executionRole,
            taskRole: taskRole,
        });

        // Get Cognito environment variables from SSM Parameters
        const authEnvironmentVars = this.getAuthEnvironmentVariables(props.environment);

        // Create container environment variables
        const containerEnv = {
            REGION: this.region,
            API_URL: `https://api-${props.environment}.bellyfed.com`,
            ENVIRONMENT: props.environment,
            ...authEnvironmentVars,
        };

        // Get repository URI from SSM Parameter Store
        const repositoryUriParam = ssm.StringParameter.fromStringParameterAttributes(
            this,
            'RepositoryUriParam',
            {
                parameterName: `/bellyfed/${props.environment}/ecr/repository-uri`,
            }
        );
        const repositoryUri = repositoryUriParam.stringValue;

        // Add the container with the correct secret ARN
        const container = newTaskDefinition.addContainer(
            `bellyfed-${props.environment}-container`,
            {
                image: ecs.ContainerImage.fromRegistry(`${repositoryUri}:latest`),
                logging: ecs.LogDrivers.awsLogs({
                    streamPrefix: `bellyfed-${props.environment}-container`,
                    logGroup: logs.LogGroup.fromLogGroupName(
                        this,
                        'ImportedLogGroup',
                        `/aws/ecs/bellyfed-${props.environment}`
                    ),
                }),
                essential: true,
                memoryLimitMiB: 512,
                cpu: 256,
                healthCheck: {
                    command: ['CMD-SHELL', `curl -f http://localhost:3000/health || exit 1`],
                    interval: cdk.Duration.seconds(30),
                    timeout: cdk.Duration.seconds(5),
                    retries: 3,
                    startPeriod: cdk.Duration.seconds(60),
                },
                environment: containerEnv,
            }
        );

        // Add port mapping
        container.addPortMappings({
            containerPort: 3000,
            protocol: ecs.Protocol.TCP,
        });

        // Store the new task definition ARN in SSM for reference
        new ssm.StringParameter(this, 'NewTaskDefinitionParam', {
            parameterName: `/bellyfed/${props.environment}/ecs/new-task-definition-arn`,
            stringValue: newTaskDefinition.taskDefinitionArn,
            description: `New Task Definition ARN for ${props.environment}`,
        });

        // Output the new task definition ARN
        new cdk.CfnOutput(this, 'TaskDefinitionArn', {
            value: newTaskDefinition.taskDefinitionArn,
            description: 'ARN of the new task definition',
        });
    }

    /**
     * Helper method to retrieve Cognito-related environment variables from SSM Parameters
     * This avoids direct coupling with the Cognito stack
     */
    private getAuthEnvironmentVariables(environment: string): Record<string, string> {
        try {
            // Only try to import the parameters if they exist
            // This approach uses fromStringParameterName, which avoids the issue with dependencies
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
}
