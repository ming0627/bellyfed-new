/**
 * Infrastructure deployment stage for CDK Pipelines
 */
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { BootstrapStack } from '../../bootstrap-stack';
import { NetworkStack } from '../../networking-stack';
import { AuroraStack } from '../../aurora-stack';
import { DbSchemaStack } from '../../db-schema-stack';
import { LoggingStack } from '../../logging-stack';
import { DynamoDBStack } from '../../dynamodb-stack';
import { SharedResourcesStack } from '../../shared-resources-stack';
import { RankingsBucketStack } from '../../s3/rankings-bucket-stack';
import { CognitoStack } from '../../cognito-stack';
import { CognitoParametersStack } from '../../cognito-parameters-stack';
import { LambdaStack, LambdaStackProps } from '../../lambda-stack';
import { ApiGatewayStack, APIGatewayStackProps } from '../../api-gateway-stack';
import { EventBridgeStack } from '../../eventbridge-stack';
import { SqsStack } from '../../sqs-stack';
import { RestaurantEventDrivenStack } from '../../restaurant-event-driven-stack';
import { ReviewEventDrivenStack } from '../../review-event-driven-stack';
import { UserAccountEventDrivenStack } from '../../user-account-event-driven-stack';
import { EcsInfrastructureStack } from '../../ecs/ecs-infrastructure-stack';
import { TypesenseInfrastructureStack } from '../../typesense/typesense-infrastructure-stack';
import { TypesenseServiceStack, TypesenseServiceStackProps } from '../../typesense-service-stack';
import { TypesenseLambdaStack } from '../../typesense/typesense-lambda-stack';
import { ImportStack } from '../../import-stack';
import { CONFIG } from '../../config';
import { EnvironmentConfig } from '../../environmentConfig';
import { GlobalTaggingUtils } from '../../utils/global-tagging-utils';

// Extended interfaces with vpc property
interface _ExtendedLambdaStackProps extends LambdaStackProps {
    vpc: ec2.IVpc;
}

interface _ExtendedAPIGatewayStackProps extends APIGatewayStackProps {
    vpc: ec2.IVpc;
}

interface _ExtendedTypesenseServiceStackProps extends TypesenseServiceStackProps {
    vpc: ec2.IVpc;
    cluster: cdk.aws_ecs.ICluster;
    executionRole: cdk.aws_iam.IRole;
    taskRole: cdk.aws_iam.IRole;
    serviceSecurityGroup: ec2.ISecurityGroup;
    logGroup: cdk.aws_logs.ILogGroup;
    fileSystem: cdk.aws_efs.IFileSystem;
    accessPoint: cdk.aws_efs.IAccessPoint;
    containerPort: number;
    cpu: number;
    memoryLimitMiB: number;
    desiredCount: number;
    minCapacity: number;
    maxCapacity: number;
}

export interface InfraStageProps extends cdk.StageProps {
    environment: string;
}

/**
 * Stage for deploying infrastructure resources
 */
export class InfraStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: InfraStageProps) {
        super(scope, id, props);

        const { environment } = props;
        const region = CONFIG.region;

        // Initialize the GlobalTaggingUtils with common tagging properties
        GlobalTaggingUtils.initialize({
            environment,
            repository: CONFIG.github.repo,
            region,
        });

        // Initialize EnvironmentConfig with the environment
        const envConfig = EnvironmentConfig.getInstance(environment);

        // Helper function to create and tag stacks
        const createStack = <T extends cdk.Stack>(stack: T): T => {
            GlobalTaggingUtils.getInstance().applyTags(stack);
            return stack;
        };

        // Create BootstrapStack
        const _bootstrapStack = createStack(
            new BootstrapStack(this, `BellyfedBootstrapStack-${environment}`, {
                env: props.env,
                environment,
                branchName: environment,
            })
        );

        // Create NetworkStack
        const networkStack = createStack(
            new NetworkStack(this, `BellyfedNetworkStack-${environment}`, {
                env: props.env,
                config: CONFIG,
                environment,
                envConfig,
            })
        );

        // Create AuroraStack
        const auroraStack = createStack(
            new AuroraStack(this, `BellyfedAuroraStack-${environment}`, {
                env: props.env,
                environment,
                vpc: networkStack.vpc,
            })
        );

        // Add dependency to ensure VPC is created before Aurora
        auroraStack.addDependency(networkStack);

        // Create DbSchemaStack
        const dbSchemaStack = createStack(
            new DbSchemaStack(this, `BellyfedDbSchemaStack-${environment}`, {
                env: props.env,
                environment,
                vpc: networkStack.vpc,
                dbSecretArn: auroraStack.dbSecret.secretArn,
                dbClusterArn: auroraStack.clusterArn,
                dbName: `bellyfed_${environment}`,
            })
        );

        // Add dependency to ensure Aurora is created before DB Schema
        dbSchemaStack.addDependency(auroraStack);

        // Create LoggingStack
        const loggingStack = createStack(
            new LoggingStack(this, `BellyfedLoggingStack-${environment}`, {
                env: props.env,
                environment,
                slackWebhookUrl: envConfig.getSlackWebhookUrl(),
            })
        );

        // Create DynamoDBStack
        const _dynamoDBStack = createStack(
            new DynamoDBStack(this, `BellyfedDynamoDBStack-${environment}`, {
                env: props.env,
                environment,
            })
        );

        // Create SharedResourcesStack
        const sharedResourcesStack = createStack(
            new SharedResourcesStack(this, `BellyfedSharedResourcesStack-${environment}`, {
                env: props.env,
                environment,
            })
        );

        // Add dependency
        sharedResourcesStack.addDependency(networkStack);

        // Create RankingsBucketStack
        const rankingsBucketStack = createStack(
            new RankingsBucketStack(this, `BellyfedRankingsBucketStack-${environment}`, {
                env: props.env,
                environment,
            })
        );

        // Add dependency on network stack
        rankingsBucketStack.addDependency(networkStack);

        // Create CognitoStack
        const cognitoStack = createStack(
            new CognitoStack(this, `BellyfedCognitoStack-${environment}`, {
                env: props.env,
                environment,
                cicdRegion: CONFIG.cicdRegion,
            })
        );

        // Create CognitoParametersStack
        const cognitoParametersStack = createStack(
            new CognitoParametersStack(this, `BellyfedCognitoParametersStack-${environment}`, {
                env: props.env,
                environment,
                userPoolId: cognitoStack.userPool.userPoolId,
                userPoolClientId: cognitoStack.userPoolClient.userPoolClientId,
                identityPoolId: cognitoStack.identityPool.ref,
            })
        );

        // Add dependency to ensure Cognito resources are created first
        cognitoParametersStack.addDependency(cognitoStack);

        // Create LambdaStack
        const lambdaStack = createStack(
            new LambdaStack(this, `BellyfedLambdaStack-${environment}`, {
                env: props.env,
                environment,
                centralizedLogging: loggingStack.centralizedLogging,
            } as LambdaStackProps)
        );

        // Add dependency to ensure Logging stack is created before Lambda stack
        lambdaStack.addDependency(loggingStack);

        // Add dependency to ensure Cognito parameters are available to Lambda functions
        lambdaStack.addDependency(cognitoParametersStack);

        // Create EventBridgeStack
        const eventBridgeStack = createStack(
            new EventBridgeStack(this, `BellyfedEventBridgeStack-${environment}`, {
                env: props.env,
                environment,
                lambdaStack,
            })
        );

        // Create ApiGatewayStack
        const apiGatewayStack = createStack(
            new ApiGatewayStack(this, `BellyfedApiGatewayStack-${environment}`, {
                env: props.env,
                environment,
                centralizedLogging: loggingStack.centralizedLogging,
            } as APIGatewayStackProps)
        );

        // Add dependency to ensure Logging stack is created before API Gateway stack
        apiGatewayStack.addDependency(loggingStack);

        // Add dependencies to ensure Lambda functions are created before API Gateway
        apiGatewayStack.addDependency(lambdaStack);

        // Create SqsStack
        createStack(
            new SqsStack(this, `BellyfedSqsStack-${environment}`, {
                env: props.env,
                environment,
            })
        );

        // Create RestaurantEventDrivenStack
        const restaurantEventDrivenStack = createStack(
            new RestaurantEventDrivenStack(
                this,
                `BellyfedRestaurantEventDrivenStack-${environment}`,
                {
                    env: props.env,
                    environment,
                    vpc: networkStack.vpc,
                }
            )
        );

        // Add dependencies to ensure required resources are created first
        restaurantEventDrivenStack.addDependency(networkStack);
        restaurantEventDrivenStack.addDependency(auroraStack);
        restaurantEventDrivenStack.addDependency(dbSchemaStack);

        // Create ReviewEventDrivenStack
        const reviewEventDrivenStack = createStack(
            new ReviewEventDrivenStack(this, `BellyfedReviewEventDrivenStack-${environment}`, {
                env: props.env,
                environment,
                vpc: networkStack.vpc,
            })
        );

        // Add dependencies for review event-driven stack
        reviewEventDrivenStack.addDependency(networkStack);
        reviewEventDrivenStack.addDependency(auroraStack);
        reviewEventDrivenStack.addDependency(dbSchemaStack);

        // Create UserAccountEventDrivenStack
        const userAccountEventDrivenStack = createStack(
            new UserAccountEventDrivenStack(
                this,
                `BellyfedUserAccountEventDrivenStack-${environment}`,
                {
                    env: props.env,
                    environment,
                }
            )
        );

        // Add dependencies to ensure required resources are created first
        userAccountEventDrivenStack.addDependency(networkStack);
        userAccountEventDrivenStack.addDependency(auroraStack);
        userAccountEventDrivenStack.addDependency(dbSchemaStack);
        userAccountEventDrivenStack.addDependency(cognitoStack);

        // Create ECS Infrastructure Stack
        const ecsInfraStack = createStack(
            new EcsInfrastructureStack(this, `BellyfedEcsInfraStack-${environment}`, {
                env: props.env,
                environment,
                vpc: networkStack.vpc,
                vpcId: networkStack.vpc.vpcId,
                domainName: 'bellyfed.com',
                siteDomainName: `app-${environment}.bellyfed.com`,
                ecrRepositoryName: CONFIG.ecr.repositoryNamePattern.replace(
                    '{environment}',
                    environment
                ),
                containerPort: 3000,
                healthCheckPath: '/',
            })
        );

        // Add dependencies
        ecsInfraStack.addDependency(networkStack);
        ecsInfraStack.addDependency(rankingsBucketStack);

        // Create Typesense Infrastructure Stack
        const typesenseInfraStack = createStack(
            new TypesenseInfrastructureStack(this, `BellyfedTypesenseInfraStack-${environment}`, {
                env: props.env,
                environment,
                vpc: ecsInfraStack.vpc,
                cluster: ecsInfraStack.cluster,
                containerPort: envConfig.getTypesenseConfig().containerPort,
                healthCheckPath: '/health',
            })
        );

        // Add dependencies
        typesenseInfraStack.addDependency(networkStack);
        typesenseInfraStack.addDependency(ecsInfraStack);

        // Create Typesense Service Stack
        const typesenseServiceStack = createStack(
            new TypesenseServiceStack(this, `BellyfedTypesenseServiceStack-${environment}`, {
                env: props.env,
                environment,
            } as TypesenseServiceStackProps)
        );

        // Add dependencies
        typesenseServiceStack.addDependency(typesenseInfraStack);
        typesenseServiceStack.addDependency(ecsInfraStack);

        // Create Typesense Lambda Stack
        const typesenseLambdaStack = createStack(
            new TypesenseLambdaStack(this, `BellyfedTypesenseLambdaStack-${environment}`, {
                env: props.env,
                environment,
                vpc: ecsInfraStack.vpc,
                rdsSecretArn: auroraStack.clusterSecretArn,
                rdsResourceArn: auroraStack.clusterArn,
                rdsDatabase: 'bellyfed',
                typesenseSecurityGroup: typesenseInfraStack.serviceSecurityGroup,
            })
        );

        // Add dependencies
        typesenseLambdaStack.addDependency(typesenseInfraStack);
        typesenseLambdaStack.addDependency(typesenseServiceStack);
        typesenseLambdaStack.addDependency(auroraStack);

        // Create Import Stack
        const importStack = createStack(
            new ImportStack(this, `BellyfedImportStack-${environment}`, {
                env: props.env,
                environment,
                vpc: networkStack.vpc,
                dbSecretArn: auroraStack.dbSecret.secretArn,
                dbClusterArn: auroraStack.clusterArn,
                dbName: `bellyfed_${environment}`,
                eventBus: eventBridgeStack.eventBus,
            })
        );

        // Add dependencies to ensure required resources are created first
        importStack.addDependency(networkStack);
        importStack.addDependency(auroraStack);
        importStack.addDependency(dbSchemaStack);
        importStack.addDependency(eventBridgeStack);
    }
}
