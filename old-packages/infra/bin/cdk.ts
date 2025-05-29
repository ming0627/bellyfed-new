#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as _codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as process from 'process';
import 'source-map-support/register';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { AuroraStack } from '../lib/aurora-stack';
import { BootstrapStack } from '../lib/bootstrap-stack';
import { CertificateParametersStack } from '../lib/certificate-parameters-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { CicdStack } from '../lib/cicd-stack';
import { CognitoParametersStack } from '../lib/cognito-parameters-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { CONFIG } from '../lib/config';
import { DbSchemaStack } from '../lib/db-schema-stack';
import { DeploymentConfigStack } from '../lib/deployment-config-stack';
import { ReviewEventDrivenStack } from '../lib/review-event-driven-stack';
import { RestaurantEventDrivenStack } from '../lib/restaurant-event-driven-stack';
import { UserAccountEventDrivenStack } from '../lib/user-account-event-driven-stack';

import { DynamoDBStack } from '../lib/dynamodb-stack';
import { EcsInfrastructureStack } from '../lib/ecs/ecs-infrastructure-stack';
import { EcsServiceUpdateStack } from '../lib/ecs/ecs-service-update-stack';
import { EnvironmentConfig } from '../lib/environmentConfig';
import { EventBridgeStack } from '../lib/eventbridge-stack';
import { FrontendCicdStack } from '../lib/frontend-cicd-stack';
import { FrontendServiceStack } from '../lib/frontend-service-stack';
import { GoogleMapsStack } from '../lib/google-maps-stack';
import {
    InfrastructureMonitoringStackProps as IMStackProps,
    InfrastructureMonitoringStack,
} from '../lib/infrastructure-monitoring-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { LoggingStack } from '../lib/logging-stack';
import { NetworkStack } from '../lib/networking-stack';
import { RankingsBucketStack } from '../lib/s3/rankings-bucket-stack';
import { SecretsStack } from '../lib/secrets-stack';
import { SharedResourcesStack } from '../lib/shared-resources-stack';
import { SqsStack } from '../lib/sqs-stack';
import { SSMStack } from '../lib/ssm-stack';
import {
    ApiGatewayStackProps,
    AuroraStackProps,
    BaseStackProps,
    CicdStackProps,
    CognitoStackProps,
    EventBridgeStackProps,
    LambdaStackProps,
    NetworkStackProps,
    SSMStackProps,
} from '../lib/types';

import { TypesenseServiceStack } from '../lib/typesense-service-stack';
import { TypesenseInfrastructureStack } from '../lib/typesense/typesense-infrastructure-stack';
import { TypesenseLambdaStack } from '../lib/typesense/typesense-lambda-stack';
import { StackContext } from '../lib/utils';
import { GlobalTaggingUtils } from '../lib/utils/global-tagging-utils';

const app = new cdk.App();

// Retrieve environment from context
const environmentContext = app.node.tryGetContext('environment');
if (!environmentContext) {
    throw new Error(
        'Environment context is not provided. Please specify the environment using --context environment=<env>'
    );
}

// Retrieve branch context (defaults to environment name if not specified)
const branchContext = app.node.tryGetContext('branch') || environmentContext;

// Get migration name from context, defaulting to 'none' if not specified
const migrationName = app.node.tryGetContext('migration') || 'none';

// Only validate migrations for regular deployments
if (migrationName !== 'none' && !process.env.MIGRATION_NAME) {
    throw new Error(
        `Invalid migration name. Must be set using the MIGRATION_NAME environment variable.`
    );
}

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = CONFIG.region;

// Initialize the StackContext at the start
StackContext.initialize(environmentContext, region, CONFIG.github.repo);

// Initialize GlobalTaggingUtils with common tagging properties
GlobalTaggingUtils.initialize({
    environment: environmentContext,
    repository: CONFIG.github.repo,
    region: region,
});

// Apply common tags to the CDK app
GlobalTaggingUtils.getInstance().applyAppTags(app);

// Initialize EnvironmentConfig with the environment
const envConfig = EnvironmentConfig.getInstance(environmentContext);

const stackEnv = { account, region };

// Variables to hold stack references
let ecsInfraStack: EcsInfrastructureStack | undefined;
let frontendServiceStack: FrontendServiceStack | undefined;

let typesenseInfraStack: TypesenseInfrastructureStack | undefined;
let typesenseServiceStack: TypesenseServiceStack | undefined;
let typesenseLambdaStack: TypesenseLambdaStack | undefined;

// Helper function to create and tag stacks
const createStack = <T extends cdk.Stack>(stack: T): T => {
    GlobalTaggingUtils.getInstance().applyTags(stack);
    return stack;
};

// Create BootstrapStack for all deployments
// This ensures foundational resources are always available
const bootstrapStack = createStack(
    new BootstrapStack(app, `BellyfedBootstrapStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
        branchName: branchContext,
    })
);

// Create Deployment Config Stack
// This ensures the parameter is created before the CICD stack
const deploymentConfigProps = {
    env: stackEnv,
    environment: environmentContext,
    // Always deploy infrastructure stack
    deployInfraStack: true,
};

const deploymentConfigStack = createStack(
    new DeploymentConfigStack(
        app,
        `BellyfedDeploymentConfigStack-${environmentContext}`,
        deploymentConfigProps
    )
);

// Create a single CICD stack for the current environment
// Determine the branch name based on environment
let branchName: string;
if (environmentContext === 'prod') {
    branchName = 'master';
} else if (environmentContext === 'dev') {
    branchName = 'develop';
} else {
    branchName = environmentContext;
}

// Create CICD stack properties
const cicdProps: CicdStackProps = {
    env: { ...stackEnv, region: CONFIG.cicdRegion },
    cicdRegion: CONFIG.cicdRegion,
    appRegion: region,
    environment: environmentContext,
    branchName: branchName,
};

// Create a single CICD stack
const cicdStack = createStack(
    new CicdStack(app, `BellyfedCicdStack-${environmentContext}`, cicdProps)
);

// Add dependency to ensure DeploymentConfigStack is deployed first
if (deploymentConfigStack) {
    cicdStack.addDependency(deploymentConfigStack);
}

// Add dependency on bootstrap stack
cicdStack.addDependency(bootstrapStack);

// Regular deployment - create resources for the specified environment

// Create Certificate Parameters Stack to store certificate and hosted zone values
// This allows the CloudFront stack to retrieve these values during deployment
const certificateParametersProps = {
    env: stackEnv,
    environment: environmentContext,
    domainName: 'bellyfed.com',
    // Get values from context if available
    certificateArn: app.node.tryGetContext('certificateArn'),
    hostedZoneId: 'Z05895961O4U27Y58ZXM1',
};

const certificateParametersStack = createStack(
    new CertificateParametersStack(
        app,
        `BellyfedCertificateParametersStack-${environmentContext}`,
        certificateParametersProps
    )
);

// Create Certificate Stack for DNS validation
const certificateProps = {
    env: stackEnv,
    environment: environmentContext,
    domainName: 'bellyfed.com',
};

const certificateStack = createStack(
    new CertificateStack(app, `BellyfedCertificateStack-${environmentContext}`, certificateProps)
);

// Add dependency to ensure certificate parameters are created first
certificateStack.addDependency(certificateParametersStack);

// Create SSM Stack since others depend on it
const ssmProps: SSMStackProps = {
    env: stackEnv,
    environment: environmentContext,
    description: 'SSM Parameters including Secret ARNs',
};

const ssmStack = createStack(new SSMStack(app, `BellyfedSSMStack-${environmentContext}`, ssmProps));

// Add dependency to ensure certificates are created before other stacks
ssmStack.addDependency(certificateStack);

// Create network stack
const networkProps: NetworkStackProps = {
    env: stackEnv,
    config: CONFIG,
    environment: environmentContext,
    envConfig,
};

const networkStack = createStack(
    new NetworkStack(app, `BellyfedNetworkStack-${environmentContext}`, networkProps)
);

// Create Aurora PostgreSQL Stack
const auroraProps: AuroraStackProps = {
    env: stackEnv,
    environment: environmentContext,
    vpc: networkStack.vpc,
};

const auroraStack = createStack(
    new AuroraStack(app, `BellyfedAuroraStack-${environmentContext}`, auroraProps)
);

// Add dependency to ensure VPC is created before Aurora
auroraStack.addDependency(networkStack);

// Create Database Schema Stack for creating and updating database schema
const dbSchemaProps = {
    env: stackEnv,
    environment: environmentContext,
    vpc: networkStack.vpc,
    dbSecretArn: auroraStack.dbSecret.secretArn,
    dbClusterArn: auroraStack.clusterArn,
    dbName: `bellyfed_${environmentContext}`,
};

const dbSchemaStack = createStack(
    new DbSchemaStack(app, `BellyfedDbSchemaStack-${environmentContext}`, dbSchemaProps)
);

// Add dependency to ensure Aurora is created before DB Schema
dbSchemaStack.addDependency(auroraStack);

// Create Google Maps Integration Stack
const googleMapsProps = {
    env: stackEnv,
    environment: environmentContext,
    dbSecretArn: auroraStack.dbSecret.secretArn,
    dbClusterArn: auroraStack.clusterArn,
    dbName: `bellyfed_${environmentContext}`,
};

const googleMapsStack = createStack(
    new GoogleMapsStack(app, `BellyfedGoogleMapsStack-${environmentContext}`, googleMapsProps)
);

// Add dependency to ensure Aurora is created before Google Maps Integration
googleMapsStack.addDependency(auroraStack);
googleMapsStack.addDependency(dbSchemaStack);

// Create Logging Stack for centralized error logging
const loggingStack = createStack(
    new LoggingStack(app, `BellyfedLoggingStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
        slackWebhookUrl: envConfig.getSlackWebhookUrl(),
    })
);

// Create DynamoDB Stack for high-throughput data
const _dynamoDBStack = createStack(
    new DynamoDBStack(app, `BellyfedDynamoDBStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
    } as BaseStackProps)
);

// Create Shared Resources Stack (S3 buckets, etc.)
const sharedProps: BaseStackProps = {
    env: stackEnv,
    environment: environmentContext,
};

const sharedResourcesStack = createStack(
    new SharedResourcesStack(app, `BellyfedSharedResourcesStack-${environmentContext}`, sharedProps)
);

// Create Rankings Bucket Stack for storing ranking photos
const rankingsBucketStack = createStack(
    new RankingsBucketStack(app, `BellyfedRankingsBucketStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
    })
);

// Add dependency on network stack
rankingsBucketStack.addDependency(networkStack);

// Add dependency
sharedResourcesStack.addDependency(networkStack);

// Helper function to get auth parameters from SSM
const getAuthParameter = (paramPath: string): string | null => {
    const resolvedPath = paramPath
        .replace('{paramPrefix}', CONFIG.app.namingPatterns.paramPrefix)
        .replace('{environment}', environmentContext);

    try {
        return ssm.StringParameter.valueForStringParameter(app, resolvedPath);
    } catch (error: unknown) {
        return null;
    }
};

// Get Cognito parameters from SSM Parameter Store using centralized config
const cognitoClientId = getAuthParameter(CONFIG.auth.ssmPaths.userPoolClientId);
const cognitoUserPoolId = getAuthParameter(CONFIG.auth.ssmPaths.userPoolId);
const cognitoIdentityPoolId = getAuthParameter(CONFIG.auth.ssmPaths.identityPoolId);

// Check if this is a first-time deployment
const isNewEnvironment = !cognitoClientId && !cognitoUserPoolId && !cognitoIdentityPoolId;

// If any parameter is missing but not all (partial state), fail the deployment
if (!isNewEnvironment && (!cognitoClientId || !cognitoUserPoolId || !cognitoIdentityPoolId)) {
    throw new Error(
        `Incomplete Cognito configuration. Some parameters exist but others are missing.\n` +
            `ClientID: ${cognitoClientId ? 'Found' : 'Missing'}\n` +
            `UserPoolID: ${cognitoUserPoolId ? 'Found' : 'Missing'}\n` +
            `IdentityPoolID: ${cognitoIdentityPoolId ? 'Found' : 'Missing'}`
    );
}

if (isNewEnvironment) {
    console.warn(`This appears to be a new environment deployment. No Cognito parameters found.`);
}

// Create environment variables map for Cognito
const authEnvVars = isNewEnvironment
    ? undefined
    : {
          COGNITO_CLIENT_ID: cognitoClientId as string,
          COGNITO_USER_POOL_ID: cognitoUserPoolId as string,
          COGNITO_IDENTITY_POOL_ID: cognitoIdentityPoolId as string,
      };

// Create Cognito Stack for user authentication
const cognitoProps: CognitoStackProps = {
    env: stackEnv,
    environment: environmentContext,
    cicdRegion: CONFIG.cicdRegion,
    authEnvVars,
};

// Add CloudFormation deployment options to prevent rollback and handle failures gracefully
const cognitoStack = createStack(
    new CognitoStack(app, `BellyfedCognitoStack-${environmentContext}`, cognitoProps)
);

// Create Cognito Parameters Stack to store Cognito IDs in SSM
const cognitoParametersStack = createStack(
    new CognitoParametersStack(app, `BellyfedCognitoParametersStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
        userPoolId: cognitoStack.userPool.userPoolId,
        userPoolClientId: cognitoStack.userPoolClient.userPoolClientId,
        identityPoolId: cognitoStack.identityPool.ref,
    })
);

// Add dependency to ensure Cognito resources are created first
cognitoParametersStack.addDependency(cognitoStack);

// Create Lambda Stack with dependencies to Aurora instead of DynamoDB
const lambdaProps: LambdaStackProps = {
    env: stackEnv,
    environment: environmentContext,
    vpc: networkStack.vpc,
    centralizedLogging: loggingStack.centralizedLogging,
};

const lambdaStack = createStack(
    new LambdaStack(app, `BellyfedLambdaStack-${environmentContext}`, lambdaProps)
);

// Add dependency to ensure Logging stack is created before Lambda stack
lambdaStack.addDependency(loggingStack);

// Add dependency to ensure Cognito parameters are available to Lambda functions
lambdaStack.addDependency(cognitoParametersStack);

// Create EventBridge Stack
const eventBridgeProps: EventBridgeStackProps = {
    env: stackEnv,
    environment: environmentContext,
    lambdaStack: lambdaStack,
};

const eventBridgeStack = createStack(
    new EventBridgeStack(app, `BellyfedEventBridgeStack-${environmentContext}`, eventBridgeProps)
);

// Create API Gateway Stack with Cognito and Lambda integrations
const apiGatewayProps: ApiGatewayStackProps = {
    env: stackEnv,
    environment: environmentContext,
    vpc: networkStack.vpc,
    centralizedLogging: loggingStack.centralizedLogging,
};

const apiGatewayStack = createStack(
    new ApiGatewayStack(app, `BellyfedApiGatewayStack-${environmentContext}`, apiGatewayProps)
);

// Add dependency to ensure Logging stack is created before API Gateway stack
apiGatewayStack.addDependency(loggingStack);

// Add dependencies to ensure certificates, Cognito parameters, and Lambda functions are created before API Gateway
apiGatewayStack.addDependency(certificateStack);
apiGatewayStack.addDependency(cognitoParametersStack);
apiGatewayStack.addDependency(lambdaStack); // Add dependency on Lambda stack to ensure Lambda function ARNs are available

// Create SQS Stack for message queuing
createStack(
    new SqsStack(app, `BellyfedSqsStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
    } as BaseStackProps)
);

// Create Restaurant Event-Driven Architecture Stack
const restaurantEventDrivenStack = createStack(
    new RestaurantEventDrivenStack(
        app,
        `BellyfedRestaurantEventDrivenStack-${environmentContext}`,
        {
            env: stackEnv,
            environment: environmentContext,
            vpc: networkStack.vpc,
        }
    )
);

// Create Review Event-Driven Architecture Stack
const reviewEventDrivenStack = createStack(
    new ReviewEventDrivenStack(app, `BellyfedReviewEventDrivenStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
        vpc: networkStack.vpc,
    })
);

// Add dependencies to ensure required resources are created first
restaurantEventDrivenStack.addDependency(networkStack);
restaurantEventDrivenStack.addDependency(auroraStack);
restaurantEventDrivenStack.addDependency(dbSchemaStack);

// Create User Account Event-Driven Architecture Stack
const userAccountEventDrivenStack = createStack(
    new UserAccountEventDrivenStack(
        app,
        `BellyfedUserAccountEventDrivenStack-${environmentContext}`,
        {
            env: stackEnv,
            environment: environmentContext,
        }
    )
);

// Add dependencies to ensure required resources are created first
userAccountEventDrivenStack.addDependency(networkStack);
userAccountEventDrivenStack.addDependency(auroraStack);
userAccountEventDrivenStack.addDependency(dbSchemaStack);
userAccountEventDrivenStack.addDependency(cognitoStack);

// Add dependencies for review event-driven stack
reviewEventDrivenStack.addDependency(networkStack);
reviewEventDrivenStack.addDependency(auroraStack);
reviewEventDrivenStack.addDependency(dbSchemaStack);

// Get event bus names from the event bridge stack
const eventBusNames = eventBridgeStack.eventBuses
    ? eventBridgeStack.eventBuses.map((bus) => bus.eventBusName)
    : [];

// Create Infrastructure Monitoring Stack
// We'll create it even if there are no event bus names, as the stack is now robust enough to handle missing dependencies
try {
    const monitoringProps: IMStackProps = {
        env: stackEnv,
        environment: environmentContext,
        eventBusNames: eventBusNames.length > 0 ? eventBusNames : [],
        slackWebhookUrl: envConfig.getSlackWebhookUrl(),
    };

    const monitoringStack = createStack(
        new InfrastructureMonitoringStack(
            app,
            `BellyfedMonitoringStack-${environmentContext}`,
            monitoringProps
        )
    );

    // Add dependency on EventBridge stack if it exists
    if (eventBridgeStack) {
        monitoringStack.addDependency(eventBridgeStack);
    }
} catch (error: unknown) {
    console.warn(`Warning: Could not create monitoring stack. Error: ${error}`);
}

// Always deploy ECS-related stacks
const skipEcsStacks = false;

// Always update the ECS service stack as part of the regular deployment
const updateEcsService = true;

// Always deploy both infrastructure and service
const updateEcsServiceOnly = false;

if (!skipEcsStacks) {
    // Create Secrets Stack for environment-specific secrets
    const secretsStack = createStack(
        new SecretsStack(app, `BellyfedSecretsStack-${environmentContext}`, {
            env: stackEnv,
            environment: environmentContext,
        })
    );

    // Create ECS Fargate Stack for all environments
    // This enables server-side rendering and ISR support
    // Only create ECS Fargate stack if we have the required domain information
    // These would typically come from environment variables or SSM parameters in a real deployment
    const domainName = process.env.DOMAIN_NAME || 'bellyfed.com';
    const siteDomainName = process.env.SITE_DOMAIN_NAME || `app-${environmentContext}.bellyfed.com`;

    // --- Instantiate new ECS Stacks ---
    // Log the VPC object to verify it exists
    console.log(`NetworkStack VPC check: ${networkStack.vpc ? 'VPC exists' : 'VPC is undefined'}`);
    console.log(`NetworkStack VPC ID: ${networkStack.vpc ? networkStack.vpc.vpcId : 'N/A'}`);

    // Create ECS Infrastructure Stack props with explicit VPC
    const ecsInfraProps = {
        env: stackEnv,
        environment: environmentContext,
        vpc: networkStack.vpc, // Pass the VPC object directly
        vpcId: networkStack.vpc.vpcId, // Also pass the VPC ID as a fallback
        domainName: domainName,
        siteDomainName: siteDomainName,
        ecrRepositoryName: CONFIG.ecr.repositoryNamePattern.replace(
            '{environment}',
            environmentContext
        ),
        containerPort: 3000,
        healthCheckPath: '/',
    };

    // Create a new infrastructure stack
    console.log('Creating new ECS infrastructure stack');
    ecsInfraStack = createStack(
        new EcsInfrastructureStack(
            app,
            `BellyfedEcsInfraStack-${environmentContext}`,
            ecsInfraProps
        )
    );
    ecsInfraStack.addDependency(networkStack);
    ecsInfraStack.addDependency(certificateParametersStack);
    ecsInfraStack.addDependency(certificateStack);
    ecsInfraStack.addDependency(rankingsBucketStack); // Ensure rankings bucket is created before ECS infrastructure

    // If we're in service-only mode, mark the stack as excluded from synthesis
    if (updateEcsServiceOnly) {
        console.log(
            'Infrastructure stack will be included in synthesis but excluded from deployment'
        );
        cdk.Tags.of(ecsInfraStack).add('cdk:skip', 'true');
    }

    // Create a map of secret keys that we want to use from the consolidated secret
    // We don't need to provide the ARNs anymore, just the keys
    const secretArnsMap: { [key: string]: string } = {
        GOOGLE_MAPS_API_KEY: 'dummy', // The value doesn't matter, we just need the key
        JWT_SECRET: 'dummy', // The value doesn't matter, we just need the key
    };

    console.log(`Using secret keys: ${Object.keys(secretArnsMap).join(', ')}`);

    // Log the secret ARN map for debugging
    console.log('Secret ARNs map:', JSON.stringify(secretArnsMap));

    // Deployment configuration is now handled by the Frontend Service Stack directly
    console.log(`Deployment configuration for ${environmentContext} will use default values`);
    // Create Frontend CICD Stack first before ECS Service Stack
    // This ensures the ECR repository is populated with an image before the ECS service tries to use it
    const frontendCicdStack = createStack(
        new FrontendCicdStack(app, `BellyfedFrontendCicdStack-${environmentContext}`, {
            env: stackEnv,
            environment: environmentContext,
            frontendRepo: CONFIG.frontend.repo,
            frontendOwner: CONFIG.frontend.owner,
            frontendBranch:
                CONFIG.frontend.branchMapping[
                    environmentContext as keyof typeof CONFIG.frontend.branchMapping
                ] || branchContext,
            ecrRepositoryUri: ecsInfraStack.repository.repositoryUri,
        })
    );

    // Add dependency to ensure ECS Infrastructure stack is created before Frontend CICD
    frontendCicdStack.addDependency(ecsInfraStack);

    // Now create the Frontend Service Stack with dependency on Frontend CICD Stack
    // This stack is deployed by the infrastructure pipeline (CicdStack)
    // The frontend pipeline (FrontendCicdStack) only updates the Docker image in the ECS service
    frontendServiceStack = createStack(
        new FrontendServiceStack(app, `BellyfedFrontendServiceStack-${environmentContext}`, {
            env: stackEnv,
            environment: environmentContext,
            imageTag: 'latest',
        })
    );
    frontendServiceStack.addDependency(ecsInfraStack);
    frontendServiceStack.addDependency(ssmStack);
    frontendServiceStack.addDependency(secretsStack);
    frontendServiceStack.addDependency(rankingsBucketStack);
    frontendServiceStack.addDependency(frontendCicdStack); // Add dependency on Frontend CICD Stack

    // If we're updating the ECS service stack, create the update stack
    if (updateEcsService) {
        // Create the ECS service update stack
        // Note: We're not cleaning the secretArn here - the EcsServiceUpdateStack will handle it
        const ecsServiceUpdateStack = createStack(
            new EcsServiceUpdateStack(app, `BellyfedEcsServiceUpdateStack-${environmentContext}`, {
                env: stackEnv,
                environment: environmentContext,
                secretArn: secretsStack.secretArn,
            })
        );

        // Add dependencies
        ecsServiceUpdateStack.addDependency(secretsStack);
        ecsServiceUpdateStack.addDependency(ecsInfraStack);
        ecsServiceUpdateStack.addDependency(frontendServiceStack);
    }

    console.log('Using official Typesense Docker image from Docker Hub');
    const typesenseConfig = envConfig.getTypesenseConfig();

    // Create Typesense Infrastructure Stack
    console.log('Creating Typesense infrastructure stack');
    const typesenseInfraProps = {
        env: stackEnv,
        environment: environmentContext,
        vpc: networkStack.vpc,
        cluster: ecsInfraStack.cluster,
        containerPort: typesenseConfig.containerPort,
        healthCheckPath: '/health',
    };

    // Create Typesense Infrastructure Stack with explicit dependency on ECS Infrastructure
    // This ensures that the VPC parameter is properly imported
    // IMPORTANT: We're using the EcsInfraStack VPC for both TypesenseInfraStack and TypesenseServiceStack
    // to ensure subnet compatibility and EFS access
    const updatedTypesenseInfraProps = {
        ...typesenseInfraProps,
        vpc: ecsInfraStack.vpc,
    };

    typesenseInfraStack = createStack(
        new TypesenseInfrastructureStack(
            app,
            `BellyfedTypesenseInfraStack-${environmentContext}`,
            updatedTypesenseInfraProps
        )
    );

    // Add explicit dependencies to ensure proper ordering
    // The NetworkStack creates the VPC
    typesenseInfraStack.addDependency(networkStack);

    // The EcsInfrastructureStack exports the VPC to SSM
    // This dependency is critical to prevent parameter conflicts
    typesenseInfraStack.addDependency(ecsInfraStack);

    // Create Typesense Service Stack
    console.log('Creating Typesense service stack');

    // Create a new security group in the EcsInfraStack VPC for the Typesense service
    // This ensures that the security group and subnets are in the same VPC
    const typesenseServiceSecurityGroup = new ec2.SecurityGroup(
        ecsInfraStack,
        'TypesenseServiceSecurityGroup',
        {
            vpc: ecsInfraStack.vpc,
            description: 'Security group for Typesense service in ECS VPC',
            allowAllOutbound: true,
        }
    );

    // Allow inbound traffic on the Typesense port from within the VPC
    typesenseServiceSecurityGroup.addIngressRule(
        ec2.Peer.ipv4(ecsInfraStack.vpc.vpcCidrBlock),
        ec2.Port.tcp(typesenseConfig.containerPort),
        'Allow traffic from within VPC to Typesense'
    );

    const typesenseServiceProps = {
        env: stackEnv,
        environment: environmentContext,
        // IMPORTANT: Use the same VPC as the EcsInfraStack
        // This ensures that the security group and subnets are in the same VPC
        vpc: ecsInfraStack.vpc,
        cluster: ecsInfraStack.cluster,
        executionRole: typesenseInfraStack.executionRole,
        taskRole: typesenseInfraStack.taskRole,
        // Use the new security group in the EcsInfraStack VPC
        serviceSecurityGroup: typesenseServiceSecurityGroup,
        logGroup: typesenseInfraStack.logGroup,
        fileSystem: typesenseInfraStack.fileSystem,
        accessPoint: typesenseInfraStack.accessPoint,
        containerPort: typesenseConfig.containerPort,
        cpu: typesenseConfig.cpu,
        memoryLimitMiB: typesenseConfig.memoryLimitMiB,
        desiredCount: typesenseConfig.desiredCount,
        minCapacity: typesenseConfig.minCapacity,
        maxCapacity: typesenseConfig.maxCapacity,
    };

    typesenseServiceStack = createStack(
        new TypesenseServiceStack(
            app,
            `BellyfedTypesenseServiceStack-${environmentContext}`,
            typesenseServiceProps
        )
    );
    typesenseServiceStack.addDependency(typesenseInfraStack);
    typesenseServiceStack.addDependency(ecsInfraStack);

    // Add security group rule to allow ECS service to communicate with Typesense
    ecsInfraStack.serviceSecurityGroup.addEgressRule(
        typesenseInfraStack.serviceSecurityGroup,
        ec2.Port.tcp(typesenseConfig.containerPort),
        'Allow traffic from ECS service to Typesense'
    );

    // Create Typesense Lambda Stack for dish search and sync
    console.log('Creating Typesense Lambda stack');
    const typesenseLambdaProps = {
        env: stackEnv,
        environment: environmentContext,
        vpc: ecsInfraStack.vpc, // Use the same VPC as the other Typesense stacks
        rdsSecretArn: auroraStack.clusterSecretArn,
        rdsResourceArn: auroraStack.clusterArn,
        rdsDatabase: 'bellyfed',
        typesenseSecurityGroup: typesenseInfraStack.serviceSecurityGroup,
    };

    typesenseLambdaStack = createStack(
        new TypesenseLambdaStack(
            app,
            `BellyfedTypesenseLambdaStack-${environmentContext}`,
            typesenseLambdaProps
        )
    );
    typesenseLambdaStack.addDependency(typesenseInfraStack);
    typesenseLambdaStack.addDependency(typesenseServiceStack);
    typesenseLambdaStack.addDependency(auroraStack);
}

// Frontend CICD Stack is created before the ECS Service Stack
// This ensures the ECR repository is populated with an image before the ECS service tries to use it

// Import the PipelineStack from the CDK Pipelines implementation
import { PipelineStack } from '../lib/cdk-pipelines';

// Create the PipelineStack for path-based pipeline triggering using CDK Pipelines
// This stack creates two pipelines:
// 1. Frontend pipeline - for deploying the frontend application
// 2. Infrastructure pipeline - for deploying the infrastructure
// Both pipelines are triggered based on the files that were modified in a commit
const _pipelineStack = createStack(
    new PipelineStack(app, `BellyfedPipelineStack-${environmentContext}`, {
        env: stackEnv,
        environment: environmentContext,
    })
);

app.synth();
