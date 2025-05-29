import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Properties for the DeploymentCoordinator construct
 */
export interface DeploymentCoordinatorProps {
    /**
     * The environment name (e.g., 'dev', 'prod')
     */
    environment: string;

    /**
     * The ECR repository to monitor for image pushes
     */
    ecrRepository: ecr.IRepository;

    /**
     * The ECS service to coordinate deployments for
     */
    ecsService: ecs.IBaseService;

    /**
     * The ECS cluster containing the service
     */
    ecsCluster: ecs.ICluster;

    // No deployment configuration parameters needed
}

/**
 * A construct that coordinates deployments between ECR and ECS
 * to ensure proper sequencing and prevent deployment issues.
 */
export class DeploymentCoordinator extends Construct {
    /**
     * The DynamoDB table used to track deployment status
     */
    public readonly deploymentTable: dynamodb.Table;

    /**
     * The Lambda function that handles deployment coordination
     */
    public readonly coordinatorFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: DeploymentCoordinatorProps) {
        super(scope, id);

        // Set default values - hardcoded now
        const deploymentCooldown = 60;
        const enableCircuitBreaker = true;
        const enableRollback = true;

        // Create a DynamoDB table to track deployment status
        this.deploymentTable = new dynamodb.Table(this, 'DeploymentTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ttl',
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
        });

        // Add GSI for status queries
        this.deploymentTable.addGlobalSecondaryIndex({
            indexName: 'status-index',
            partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
        });

        // Create a Lambda function to coordinate deployments
        this.coordinatorFunction = new lambda.Function(this, 'CoordinatorFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
                const AWS = require('aws-sdk');
                const dynamodb = new AWS.DynamoDB.DocumentClient();
                const ecs = new AWS.ECS();
                const ssm = new AWS.SSM();

                exports.handler = async (event) => {
                    console.log('Received event:', JSON.stringify(event, null, 2));

                    // Extract parameters from environment variables
                    const {
                        DEPLOYMENT_TABLE,
                        ECS_CLUSTER,
                        ECS_SERVICE,
                        ENVIRONMENT,
                        DEPLOYMENT_COOLDOWN,
                        ENABLE_CIRCUIT_BREAKER,
                        ENABLE_ROLLBACK,
                        DEPLOYMENT_LOCK_PARAM
                    } = process.env;

                    // Handle different event types
                    if (event.source === 'aws.ecr' && event.detail.action === 'PUSH') {
                        // Handle ECR image push event
                        return handleImagePush(event);
                    } else if (event.source === 'aws.ecs' &&
                              (event.detail.eventName === 'UpdateService' ||
                               event.detail.eventName === 'DeploymentCompleted' ||
                               event.detail.eventName === 'DeploymentFailed')) {
                        // Handle ECS deployment events
                        return handleDeploymentEvent(event);
                    } else if (event.source === 'aws.ecs' && event.detail.eventName === 'TaskStateChange') {
                        // Handle ECS task state changes
                        return handleTaskStateChange(event);
                    } else {
                        console.log('Unhandled event type');
                        return { statusCode: 200, body: 'Unhandled event type' };
                    }

                    // Handle ECR image push
                    async function handleImagePush(event) {
                        const repositoryName = event.detail.repository;
                        const imageTag = event.detail.tag;

                        console.log(\`New image pushed to \${repositoryName}:\${imageTag}\`);

                        // Check if we're in a deployment cooldown period
                        const canDeploy = await checkDeploymentCooldown();
                        if (!canDeploy) {
                            console.log('In deployment cooldown period, skipping deployment');
                            return { statusCode: 200, body: 'In cooldown period' };
                        }

                        // Acquire deployment lock
                        const lockAcquired = await acquireDeploymentLock();
                        if (!lockAcquired) {
                            console.log('Could not acquire deployment lock, another deployment is in progress');
                            return { statusCode: 200, body: 'Lock not acquired' };
                        }

                        try {
                            // Record deployment start
                            const deploymentId = \`\${repositoryName}-\${imageTag}-\${Date.now()}\`;
                            await recordDeployment(deploymentId, 'STARTED', {
                                repository: repositoryName,
                                imageTag: imageTag
                            });

                            // Trigger ECS deployment
                            const deploymentResult = await triggerEcsDeployment(imageTag);

                            // Record deployment progress
                            await recordDeployment(deploymentId, 'IN_PROGRESS', {
                                repository: repositoryName,
                                imageTag: imageTag,
                                deploymentId: deploymentResult.deploymentId
                            });

                            return {
                                statusCode: 200,
                                body: \`Deployment started: \${deploymentId}\`
                            };
                        } catch (error: unknown) {
                            console.error('Error starting deployment:', error);

                            // Release lock on error
                            await releaseDeploymentLock();

                            return {
                                statusCode: 500,
                                body: \`Error starting deployment: \${error.message}\`
                            };
                        }
                    }

                    // Handle ECS deployment events
                    async function handleDeploymentEvent(event) {
                        const eventName = event.detail.eventName;

                        if (eventName === 'DeploymentCompleted') {
                            // Deployment succeeded
                            const deploymentId = event.detail.deploymentId;

                            // Find the deployment record
                            const deployment = await findDeploymentByEcsDeploymentId(deploymentId);

                            if (deployment) {
                                // Update deployment status
                                await recordDeployment(deployment.id, 'SUCCEEDED', {
                                    ...deployment,
                                    completedAt: Date.now()
                                });

                                // Release deployment lock
                                await releaseDeploymentLock();
                            }
                        } else if (eventName === 'DeploymentFailed') {
                            // Deployment failed
                            const deploymentId = event.detail.deploymentId;

                            // Find the deployment record
                            const deployment = await findDeploymentByEcsDeploymentId(deploymentId);

                            if (deployment) {
                                // Update deployment status
                                await recordDeployment(deployment.id, 'FAILED', {
                                    ...deployment,
                                    failedAt: Date.now(),
                                    reason: event.detail.reason || 'Unknown failure'
                                });

                                // Release deployment lock
                                await releaseDeploymentLock();

                                // Handle rollback if enabled
                                if (ENABLE_ROLLBACK === 'true') {
                                    await handleRollback(deployment);
                                }
                            }
                        }

                        return { statusCode: 200, body: 'Processed deployment event' };
                    }

                    // Handle ECS task state changes
                    async function handleTaskStateChange(event) {
                        // Implementation for task state monitoring
                        return { statusCode: 200, body: 'Processed task state change' };
                    }

                    // Check if we're in a deployment cooldown period
                    async function checkDeploymentCooldown() {
                        const cooldownPeriod = parseInt(DEPLOYMENT_COOLDOWN, 10) * 1000; // Convert to ms
                        const now = Date.now();
                        const cooldownThreshold = now - cooldownPeriod;

                        // Query for recent successful deployments
                        const params = {
                            TableName: DEPLOYMENT_TABLE,
                            IndexName: 'status-index',
                            KeyConditionExpression: '#status = :status AND #timestamp > :timestamp',
                            ExpressionAttributeNames: {
                                '#status': 'status',
                                '#timestamp': 'timestamp'
                            },
                            ExpressionAttributeValues: {
                                ':status': 'SUCCEEDED',
                                ':timestamp': cooldownThreshold
                            },
                            Limit: 1
                        };

                        const result = await dynamodb.query(params).promise();

                        // If we found a recent deployment, we're in cooldown
                        return result.Items.length === 0;
                    }

                    // Acquire deployment lock using SSM parameter
                    async function acquireDeploymentLock() {
                        try {
                            const lockValue = \`\${Date.now()}\`;

                            // Try to create the parameter if it doesn't exist
                            try {
                                await ssm.putParameter({
                                    Name: DEPLOYMENT_LOCK_PARAM,
                                    Value: lockValue,
                                    Type: 'String',
                                    Overwrite: false
                                }).promise();

                                return true;
                            } catch (error: unknown) {
                                if (error.code === 'ParameterAlreadyExists') {
                                    // Parameter exists, check if lock is stale
                                    const getResult = await ssm.getParameter({
                                        Name: DEPLOYMENT_LOCK_PARAM
                                    }).promise();

                                    const lockTimestamp = parseInt(getResult.Parameter.Value, 10);
                                    const now = Date.now();

                                    // If lock is older than 30 minutes, consider it stale
                                    if (now - lockTimestamp > 30 * 60 * 1000) {
                                        // Override stale lock
                                        await ssm.putParameter({
                                            Name: DEPLOYMENT_LOCK_PARAM,
                                            Value: lockValue,
                                            Type: 'String',
                                            Overwrite: true
                                        }).promise();

                                        return true;
                                    }

                                    // Lock is active
                                    return false;
                                }

                                throw error;
                            }
                        } catch (error: unknown) {
                            console.error('Error acquiring deployment lock:', error);
                            return false;
                        }
                    }

                    // Release deployment lock
                    async function releaseDeploymentLock() {
                        try {
                            await ssm.deleteParameter({
                                Name: DEPLOYMENT_LOCK_PARAM
                            }).promise();

                            return true;
                        } catch (error: unknown) {
                            console.error('Error releasing deployment lock:', error);
                            return false;
                        }
                    }

                    // Record deployment in DynamoDB
                    async function recordDeployment(id, status, details) {
                        const timestamp = Date.now();
                        const ttl = Math.floor(timestamp / 1000) + (90 * 24 * 60 * 60); // 90 days TTL

                        const item = {
                            id,
                            timestamp,
                            status,
                            environment: ENVIRONMENT,
                            ttl,
                            ...details
                        };

                        await dynamodb.put({
                            TableName: DEPLOYMENT_TABLE,
                            Item: item
                        }).promise();

                        return item;
                    }

                    // Find deployment by ECS deployment ID
                    async function findDeploymentByEcsDeploymentId(ecsDeploymentId) {
                        const params = {
                            TableName: DEPLOYMENT_TABLE,
                            FilterExpression: 'deploymentId = :deploymentId',
                            ExpressionAttributeValues: {
                                ':deploymentId': ecsDeploymentId
                            }
                        };

                        const result = await dynamodb.scan(params).promise();

                        return result.Items.length > 0 ? result.Items[0] : null;
                    }

                    // Trigger ECS deployment
                    async function triggerEcsDeployment(imageTag) {
                        // Get current task definition
                        const describeServicesResult = await ecs.describeServices({
                            cluster: ECS_CLUSTER,
                            services: [ECS_SERVICE]
                        }).promise();

                        const service = describeServicesResult.services[0];
                        const taskDefinitionArn = service.taskDefinition;

                        // Get task definition details
                        const describeTaskDefResult = await ecs.describeTaskDefinition({
                            taskDefinition: taskDefinitionArn
                        }).promise();

                        const taskDef = describeTaskDefResult.taskDefinition;

                        // Create new task definition revision with updated image
                        const containerDef = taskDef.containerDefinitions[0]; // Assuming single container
                        const newContainerDef = {
                            ...containerDef,
                            image: \`\${containerDef.image.split(':')[0]}:\${imageTag}\`
                        };

                        const registerTaskDefResult = await ecs.registerTaskDefinition({
                            family: taskDef.family,
                            taskRoleArn: taskDef.taskRoleArn,
                            executionRoleArn: taskDef.executionRoleArn,
                            networkMode: taskDef.networkMode,
                            containerDefinitions: [newContainerDef, ...taskDef.containerDefinitions.slice(1)],
                            volumes: taskDef.volumes,
                            placementConstraints: taskDef.placementConstraints,
                            requiresCompatibilities: taskDef.requiresCompatibilities,
                            cpu: taskDef.cpu,
                            memory: taskDef.memory
                        }).promise();

                        // Update service to use new task definition
                        const updateServiceParams = {
                            cluster: ECS_CLUSTER,
                            service: ECS_SERVICE,
                            taskDefinition: registerTaskDefResult.taskDefinition.taskDefinitionArn,
                            deploymentConfiguration: {
                                maximumPercent: 200,
                                minimumHealthyPercent: 50
                            }
                        };

                        // Add circuit breaker configuration if enabled
                        if (ENABLE_CIRCUIT_BREAKER === 'true') {
                            updateServiceParams.deploymentConfiguration.deploymentCircuitBreaker = {
                                enable: true,
                                rollback: ENABLE_ROLLBACK === 'true'
                            };
                        }

                        const updateServiceResult = await ecs.updateService(updateServiceParams).promise();

                        return {
                            deploymentId: updateServiceResult.service.deployments[0].id,
                            taskDefinitionArn: registerTaskDefResult.taskDefinition.taskDefinitionArn
                        };
                    }

                    // Handle rollback for failed deployments
                    async function handleRollback(deployment) {
                        try {
                            console.log(\`Initiating rollback for failed deployment: \${deployment.id}\`);

                            // Get previous successful deployment
                            const params = {
                                TableName: DEPLOYMENT_TABLE,
                                IndexName: 'status-index',
                                KeyConditionExpression: '#status = :status',
                                ExpressionAttributeNames: {
                                    '#status': 'status'
                                },
                                ExpressionAttributeValues: {
                                    ':status': 'SUCCEEDED'
                                },
                                Limit: 1,
                                ScanIndexForward: false // Get most recent first
                            };

                            const result = await dynamodb.query(params).promise();

                            if (result.Items.length === 0) {
                                console.log('No previous successful deployment found for rollback');
                                return;
                            }

                            const previousDeployment = result.Items[0];

                            // Trigger rollback deployment
                            await ecs.updateService({
                                cluster: ECS_CLUSTER,
                                service: ECS_SERVICE,
                                taskDefinition: previousDeployment.taskDefinitionArn,
                                forceNewDeployment: true
                            }).promise();

                            console.log(\`Rollback initiated to previous deployment: \${previousDeployment.id}\`);

                            // Record rollback
                            await recordDeployment(
                                \`rollback-\${deployment.id}\`,
                                'ROLLBACK_INITIATED',
                                {
                                    originalDeploymentId: deployment.id,
                                    rollbackToDeploymentId: previousDeployment.id,
                                    rollbackToTaskDefinition: previousDeployment.taskDefinitionArn
                                }
                            );
                        } catch (error: unknown) {
                            console.error('Error during rollback:', error);
                        }
                    }
                };
            `),
            environment: {
                DEPLOYMENT_TABLE: this.deploymentTable.tableName,
                ECS_CLUSTER: props.ecsCluster.clusterName,
                ECS_SERVICE: props.ecsService.serviceName,
                ENVIRONMENT: props.environment,
                DEPLOYMENT_COOLDOWN: deploymentCooldown.toString(),
                ENABLE_CIRCUIT_BREAKER: enableCircuitBreaker.toString(),
                ENABLE_ROLLBACK: enableRollback.toString(),
                DEPLOYMENT_LOCK_PARAM: `/bellyfed/${props.environment}/deployment/lock`,
            },
            timeout: cdk.Duration.minutes(5),
            memorySize: 256,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // Grant permissions to the Lambda function
        this.deploymentTable.grantReadWriteData(this.coordinatorFunction);

        // Grant ECS permissions
        this.coordinatorFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecs:DescribeServices',
                    'ecs:UpdateService',
                    'ecs:DescribeTaskDefinition',
                    'ecs:RegisterTaskDefinition',
                    'ecs:ListTasks',
                    'ecs:DescribeTasks',
                ],
                resources: ['*'], // Scope down in production
            })
        );

        // Grant SSM permissions for deployment lock
        this.coordinatorFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['ssm:PutParameter', 'ssm:GetParameter', 'ssm:DeleteParameter'],
                resources: [
                    `arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/bellyfed/${props.environment}/deployment/*`,
                ],
            })
        );

        // Create EventBridge rules to trigger the Lambda function

        // Rule for ECR image push events
        const ecrPushRule = new events.Rule(this, 'EcrPushRule', {
            eventPattern: {
                source: ['aws.ecr'],
                detailType: ['ECR Image Action'],
                detail: {
                    action: ['PUSH'],
                    repository: [props.ecrRepository.repositoryName],
                    result: ['SUCCESS'],
                },
            },
            description: `Trigger deployment coordinator when images are pushed to ${props.ecrRepository.repositoryName}`,
        });

        ecrPushRule.addTarget(new targets.LambdaFunction(this.coordinatorFunction));

        // Rule for ECS deployment events
        const ecsDeploymentRule = new events.Rule(this, 'EcsDeploymentRule', {
            eventPattern: {
                source: ['aws.ecs'],
                detailType: ['ECS Deployment State Change'],
                detail: {
                    eventName: ['DeploymentCompleted', 'DeploymentFailed'],
                    clusterArn: [props.ecsCluster.clusterArn],
                    serviceName: [props.ecsService.serviceName],
                },
            },
            description: `Monitor deployment status for ${props.ecsService.serviceName}`,
        });

        ecsDeploymentRule.addTarget(new targets.LambdaFunction(this.coordinatorFunction));

        // Rule for ECS task state changes
        const ecsTaskRule = new events.Rule(this, 'EcsTaskRule', {
            eventPattern: {
                source: ['aws.ecs'],
                detailType: ['ECS Task State Change'],
                detail: {
                    clusterArn: [props.ecsCluster.clusterArn],
                    group: [`service:${props.ecsService.serviceName}`],
                },
            },
            description: `Monitor task state changes for ${props.ecsService.serviceName}`,
        });

        ecsTaskRule.addTarget(new targets.LambdaFunction(this.coordinatorFunction));

        // Store configuration in SSM Parameter Store
        new ssm.StringParameter(this, 'DeploymentCoordinatorConfig', {
            parameterName: `/bellyfed/${props.environment}/deployment/coordinator-config`,
            stringValue: JSON.stringify({
                deploymentTableName: this.deploymentTable.tableName,
                functionName: this.coordinatorFunction.functionName,
                ecrRepository: props.ecrRepository.repositoryName,
                ecsService: props.ecsService.serviceName,
                ecsCluster: props.ecsCluster.clusterName,
                enableCircuitBreaker,
                enableRollback,
                deploymentCooldown,
            }),
            description: `Configuration for the deployment coordinator for ${props.environment}`,
        });
    }
}
