// ECS Service Constructor
// A reusable constructor for creating ECS services (Frontend and Typesense)
// This is not a stack, but a construct that can be used within stacks

import * as cdk from 'aws-cdk-lib';
import * as autoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface EcsServiceConstructorProps {
    environment: string;
    // --- References to Infrastructure ---
    vpc: ec2.IVpc;
    cluster: ecs.ICluster;
    executionRole: iam.IRole;
    taskRole: iam.IRole;
    serviceSecurityGroup: ec2.ISecurityGroup;
    logGroup: logs.ILogGroup;
    // Optional ALB security group and target group (for frontend services)
    albSecurityGroup?: ec2.ISecurityGroup;
    targetGroup?: elbv2.IApplicationTargetGroup;
    // --- Service Configuration ---
    containerPort: number;
    containerName: string;
    // Image configuration - either ECR repository or Docker Hub image
    ecrRepository?: ecr.IRepository;
    imageTag?: string;
    dockerHubImage?: string;
    // Health check for the container definition itself
    containerHealthCheck?: ecs.HealthCheck;
    // Optional environment variables for the container
    envVars?: { [key: string]: string };
    // Map of secret names (key) to Secret Manager ARN or full ARN (value)
    secretArns?: { [key: string]: string };
    // Optional secrets in ECS Secret format
    secrets?: { [key: string]: ecs.Secret };
    // --- Scaling Configuration ---
    cpu: number;
    memoryLimitMiB: number;
    desiredCount: number;
    maxCapacity: number;
    minCapacity: number;
    cpuTargetUtilizationPercent?: number;
    memoryTargetUtilizationPercent?: number;
    // --- Service Type ---
    serviceType: 'frontend' | 'typesense';
}

export class EcsServiceConstructor extends Construct {
    public readonly service: ecs.FargateService;
    public readonly taskDefinition: ecs.TaskDefinition;
    public readonly container: ecs.ContainerDefinition;

    constructor(scope: Construct, id: string, props: EcsServiceConstructorProps) {
        super(scope, id);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add(
            'Service',
            `${props.serviceType === 'frontend' ? 'Frontend' : 'Typesense'}`
        );

        // --- Task Definition ---
        const namingPatterns =
            props.serviceType === 'frontend'
                ? CONFIG.ecs.namingPatterns
                : CONFIG.typesense.namingPatterns;

        this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
            family: namingPatterns.taskDefinition.replace('{environment}', props.environment),
            cpu: props.cpu,
            memoryLimitMiB: this.validateMemoryForCpu(props.cpu, props.memoryLimitMiB),
            executionRole: props.executionRole,
            taskRole: props.taskRole,
        });

        // If using ECR, grant permissions to pull from the repository
        if (props.ecrRepository && props.imageTag) {
            props.ecrRepository.grantPull(this.taskDefinition.executionRole!);
        }

        // Import secrets if provided
        const containerSecrets = this.setupSecrets(props);

        // --- Container Definition ---
        // Determine container image source
        let containerImage: ecs.ContainerImage;
        if (props.ecrRepository && props.imageTag) {
            // Use ECR repository
            containerImage = ecs.ContainerImage.fromEcrRepository(
                props.ecrRepository,
                props.imageTag
            );
            console.log(
                `Using image from ECR repository: ${props.ecrRepository.repositoryName}:${props.imageTag}`
            );
        } else if (props.dockerHubImage) {
            // Use Docker Hub image
            containerImage = ecs.ContainerImage.fromRegistry(props.dockerHubImage);
            console.log(`Using Docker Hub image: ${props.dockerHubImage}`);
        } else {
            throw new Error('Either ecrRepository+imageTag or dockerHubImage must be provided');
        }

        // Prepare environment variables
        const combinedEnvVars = {
            ...(props.envVars || {}),
            AWS_REGION: cdk.Stack.of(this).region,
        };

        // Get health check configuration
        const healthCheckConfig = props.containerHealthCheck || this.getDefaultHealthCheck(props);

        // Create container
        this.container = this.taskDefinition.addContainer(props.containerName, {
            image: containerImage,
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: props.containerName,
                logGroup: props.logGroup,
            }),
            essential: true,
            memoryLimitMiB: props.memoryLimitMiB,
            cpu: props.cpu,
            healthCheck: healthCheckConfig,
            environment: combinedEnvVars,
            secrets: containerSecrets,
        });

        // Add port mapping
        this.container.addPortMappings({
            containerPort: props.containerPort,
            protocol: ecs.Protocol.TCP,
        });

        // --- ECS Service ---
        // Create service props
        const serviceProps: ecs.FargateServiceProps = {
            cluster: props.cluster,
            taskDefinition: this.taskDefinition,
            desiredCount: props.desiredCount,
            assignPublicIp: false,
            securityGroups: [props.serviceSecurityGroup],
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            // Use different health check grace period and deployment configuration for Typesense
            healthCheckGracePeriod:
                props.serviceType === 'typesense'
                    ? cdk.Duration.seconds(300)
                    : cdk.Duration.seconds(180),
            // For Typesense, use more conservative deployment settings to prevent multiple tasks
            // from accessing the same EFS volume simultaneously
            minHealthyPercent: 0,
            maxHealthyPercent: props.serviceType === 'typesense' ? 100 : 200,
            deploymentController: {
                type: ecs.DeploymentControllerType.ECS,
            },
            serviceName: namingPatterns.service.replace('{environment}', props.environment),
            circuitBreaker: {
                rollback: true, // Always enable circuit breaker with rollback
            },
        };

        this.service = new ecs.FargateService(this, 'Service', serviceProps);

        // Attach to target group if provided (frontend service)
        if (props.targetGroup) {
            this.service.attachToApplicationTargetGroup(props.targetGroup);
        }

        // Set up auto scaling
        this.setupAutoScaling(props);
    }

    /**
     * Validates and adjusts memory values to ensure they are compatible with the CPU value
     * according to AWS Fargate requirements
     */
    private validateMemoryForCpu(cpu: number, memoryLimitMiB: number): number {
        if (cpu === 256 && memoryLimitMiB < 512) return 512;
        if (cpu === 256 && memoryLimitMiB < 1024) return 1024;
        if (cpu === 256 && memoryLimitMiB > 2048) return 2048;
        if (cpu === 512 && memoryLimitMiB < 1024) return 1024;
        if (cpu === 512 && memoryLimitMiB > 4096) return 4096;
        if (cpu === 1024 && memoryLimitMiB < 2048) return 2048;
        if (cpu === 1024 && memoryLimitMiB > 8192) return 8192;
        if (cpu === 2048 && memoryLimitMiB < 4096) return 4096;
        if (cpu === 2048 && memoryLimitMiB > 16384) return 16384;
        return memoryLimitMiB;
    }

    /**
     * Sets up secrets for the container
     */
    private setupSecrets(
        props: EcsServiceConstructorProps
    ): { [key: string]: ecs.Secret } | undefined {
        // Import the app secrets by name
        let appSecrets: secretsmanager.ISecret | undefined;
        let containerSecrets: { [key: string]: ecs.Secret } | undefined;

        // Check if we have secretArns provided
        if (props.secretArns && Object.keys(props.secretArns).length > 0) {
            // Get the first secret ARN as our app secrets
            // We assume all secrets are in the same consolidated secret
            const secretName = `bellyfed-${props.environment}-app-secrets`;
            console.log(`Importing app secrets from: ${secretName}`);

            // Import the secret by name (the "Secret name" you see in the console)
            appSecrets = secretsmanager.Secret.fromSecretNameV2(this, 'AppSecrets', secretName);

            // Grant the execution role permission to read the secret
            if (this.taskDefinition.executionRole) {
                appSecrets.grantRead(this.taskDefinition.executionRole);

                // Also add SSM parameter permissions if needed
                this.taskDefinition.executionRole.addToPrincipalPolicy(
                    new iam.PolicyStatement({
                        actions: ['ssm:GetParameters'],
                        resources: [
                            `arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/*`,
                        ],
                    })
                );
            } else {
                console.warn(
                    'Execution role not found on task definition, cannot add secret policies.'
                );
            }

            // Create a map of secrets for the container
            containerSecrets = {};
            for (const key of Object.keys(props.secretArns)) {
                containerSecrets[key] = ecs.Secret.fromSecretsManager(appSecrets, key);
            }

            console.log(`Added secrets to container: ${Object.keys(containerSecrets).join(', ')}`);
        } else if (props.secrets && Object.keys(props.secrets).length > 0) {
            console.log(`Using provided secrets: ${Object.keys(props.secrets).join(', ')}`);
            containerSecrets = props.secrets;
        } else {
            console.log('No secrets provided for container');
        }

        return containerSecrets;
    }

    /**
     * Gets the default health check configuration based on service type
     */
    private getDefaultHealthCheck(props: EcsServiceConstructorProps): ecs.HealthCheck {
        if (props.serviceType === 'frontend') {
            return {
                command: [...CONFIG.ecs.container.healthCheck.command],
                interval: cdk.Duration.seconds(CONFIG.ecs.container.healthCheck.interval),
                timeout: cdk.Duration.seconds(CONFIG.ecs.container.healthCheck.timeout),
                retries: CONFIG.ecs.container.healthCheck.retries,
                startPeriod: cdk.Duration.seconds(CONFIG.ecs.container.healthCheck.startPeriod),
            };
        } else {
            return {
                command: [...CONFIG.typesense.container.healthCheck.command],
                interval: cdk.Duration.seconds(CONFIG.typesense.container.healthCheck.interval),
                timeout: cdk.Duration.seconds(CONFIG.typesense.container.healthCheck.timeout),
                retries: CONFIG.typesense.container.healthCheck.retries,
                startPeriod: cdk.Duration.seconds(
                    CONFIG.typesense.container.healthCheck.startPeriod
                ),
            };
        }
    }

    /**
     * Sets up auto scaling for the service
     */
    private setupAutoScaling(props: EcsServiceConstructorProps): void {
        const scalableTarget = this.service.autoScaleTaskCount({
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity,
        });

        const scalingConfig =
            props.serviceType === 'frontend' ? CONFIG.ecs.scaling : CONFIG.typesense.scaling;

        // CPU utilization scaling
        scalableTarget.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent:
                props.cpuTargetUtilizationPercent ?? scalingConfig.cpuTargetUtilizationPercent,
            scaleInCooldown: cdk.Duration.seconds(scalingConfig.scaleInCooldown),
            scaleOutCooldown: cdk.Duration.seconds(scalingConfig.scaleOutCooldown),
        });

        // Memory utilization scaling
        scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent:
                props.memoryTargetUtilizationPercent ??
                scalingConfig.memoryTargetUtilizationPercent,
            scaleInCooldown: cdk.Duration.seconds(scalingConfig.scaleInCooldown),
            scaleOutCooldown: cdk.Duration.seconds(scalingConfig.scaleOutCooldown),
        });

        // Request count per target scaling (if enough traffic and target group is provided)
        if (
            (props.environment === 'production' || props.environment === 'staging') &&
            props.targetGroup &&
            props.serviceType === 'frontend'
        ) {
            // Check if the target group is an ApplicationTargetGroup
            try {
                const appTargetGroup = props.targetGroup as elbv2.ApplicationTargetGroup;

                scalableTarget.scaleOnRequestCount('RequestScaling', {
                    requestsPerTarget: CONFIG.ecs.scaling.requestsPerTarget,
                    targetGroup: appTargetGroup,
                    scaleInCooldown: cdk.Duration.seconds(CONFIG.ecs.scaling.scaleInCooldown),
                    scaleOutCooldown: cdk.Duration.seconds(CONFIG.ecs.scaling.scaleOutCooldown),
                });
            } catch (error: unknown) {
                console.warn(`Could not set up request count scaling: ${error}`);
            }
        }

        // Schedule scaling for predictable patterns (example: scale down at night, only in production)
        if (props.environment === 'production') {
            // Safely use minCapacity and maxCapacity with default values if undefined
            const minCap = props.minCapacity || 1;
            const maxCap = props.maxCapacity || 2;

            scalableTarget.scaleOnSchedule('ScaleDownAtNight', {
                schedule: autoscaling.Schedule.cron({ hour: '0', minute: '0' }),
                minCapacity: Math.max(1, Math.floor(minCap / 2)),
                maxCapacity: Math.max(1, Math.floor(maxCap / 2)),
            });

            scalableTarget.scaleOnSchedule('ScaleUpInMorning', {
                schedule: autoscaling.Schedule.cron({ hour: '8', minute: '0' }),
                minCapacity: minCap,
                maxCapacity: maxCap,
            });
        }
    }
}
