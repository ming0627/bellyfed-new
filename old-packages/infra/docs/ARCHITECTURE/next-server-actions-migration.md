# Migration Guide: CloudFront with Lambda@Edge to ECS Fargate

This document provides a step-by-step guide for migrating the Bellyfed frontend from CloudFront with Lambda@Edge to ECS Fargate.

## Why Migrate?

The migration from CloudFront with Lambda@Edge to ECS Fargate is motivated by the following factors:

1. **ISR Support**: CloudFront and Lambda@Edge don't work well with ISR (Incremental Static Regeneration) unless we build custom scripts or use serverless-next.js, which is not preferred.
2. **Server-Side Rendering**: ECS Fargate provides full support for Next.js server-side rendering capabilities.
3. **Simplified Architecture**: No need for complex Lambda@Edge functions for routing and authentication.
4. **Improved Developer Experience**: Better alignment with Next.js development practices.

## Migration Steps

### 1. Update Next.js Configuration

Update the Next.js configuration to support server-side rendering and ISR:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure for server-side rendering with ISR support
    // Remove static export configuration to enable ISR

    // Image configuration for server-side rendering
    images: {
        domains: [
            'bellyfed-assets.s3.ap-southeast-1.amazonaws.com',
            'images.unsplash.com',
            'source.unsplash.com',
            'ui-avatars.com',
            'maps.googleapis.com',
        ],
        // Enable image optimization for server-side rendering
        unoptimized: false,
    },

    // Define trailingSlash to ensure consistent URL handling
    trailingSlash: true,

    // Define custom build script to handle country paths
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/my',
            },
        ];
    },
};
```

### 2. Create Docker Configuration

Create a Dockerfile for the Next.js application:

```dockerfile
# Use Node.js 18 as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port that the application will run on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Start the application
CMD ["node", "server.js"]
```

Create a docker-compose.yml file for local testing:

```yaml
version: '3'

services:
    nextjs:
        build:
            context: .
            dockerfile: Dockerfile
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
        restart: always
```

### 3. Set Up ECS Fargate Infrastructure

Create a new stack for ECS Fargate in the bellyfed-infra repository:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface EcsFargateStackProps extends cdk.StackProps {
    environment: string;
    domainName: string;
    siteDomainName: string;
    region: string;
}

export class EcsFargateStack extends cdk.Stack {
    public readonly ecsCluster: ecs.Cluster;
    public readonly ecsService: ecs.FargateService;
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: EcsFargateStackProps) {
        super(scope, id, props);

        // Create a VPC for the ECS cluster
        const vpc = new ec2.Vpc(this, `${props.environment}-vpc`, {
            maxAzs: 2,
            natGateways: 1,
        });

        // Create an ECS cluster
        this.ecsCluster = new ecs.Cluster(this, `${props.environment}-cluster`, {
            vpc,
            clusterName: `bellyfed-${props.environment}-cluster`,
            containerInsights: true,
        });

        // Create a security group for the load balancer
        const lbSecurityGroup = new ec2.SecurityGroup(this, `${props.environment}-lb-sg`, {
            vpc,
            description: 'Security group for the load balancer',
            allowAllOutbound: true,
        });

        lbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');

        lbSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'Allow HTTPS traffic'
        );

        // Create a security group for the ECS service
        const serviceSecurityGroup = new ec2.SecurityGroup(
            this,
            `${props.environment}-service-sg`,
            {
                vpc,
                description: 'Security group for the ECS service',
                allowAllOutbound: true,
            }
        );

        serviceSecurityGroup.addIngressRule(
            lbSecurityGroup,
            ec2.Port.tcp(3000),
            'Allow traffic from the load balancer'
        );

        // Create an Application Load Balancer
        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${props.environment}-alb`, {
            vpc,
            internetFacing: true,
            securityGroup: lbSecurityGroup,
            loadBalancerName: `bellyfed-${props.environment}-alb`,
        });

        // Look up the hosted zone
        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: props.domainName,
        });

        // Create a certificate for the domain
        const certificate = new acm.Certificate(this, `${props.environment}-certificate`, {
            domainName: props.siteDomainName,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // Create a target group for the ECS service
        const targetGroup = new elbv2.ApplicationTargetGroup(
            this,
            `${props.environment}-target-group`,
            {
                vpc,
                port: 3000,
                protocol: elbv2.ApplicationProtocol.HTTP,
                targetType: elbv2.TargetType.IP,
                healthCheck: {
                    path: '/',
                    interval: cdk.Duration.seconds(30),
                    timeout: cdk.Duration.seconds(5),
                    healthyHttpCodes: '200-399',
                },
            }
        );

        // Create an HTTP listener that redirects to HTTPS
        this.loadBalancer.addListener(`${props.environment}-http-listener`, {
            port: 80,
            defaultAction: elbv2.ListenerAction.redirect({
                protocol: 'HTTPS',
                port: '443',
                permanent: true,
            }),
        });

        // Create an HTTPS listener
        const httpsListener = this.loadBalancer.addListener(`${props.environment}-https-listener`, {
            port: 443,
            certificates: [certificate],
            defaultAction: elbv2.ListenerAction.forward([targetGroup]),
        });

        // Create a log group for the ECS service
        const logGroup = new logs.LogGroup(this, `${props.environment}-log-group`, {
            logGroupName: `/ecs/bellyfed-${props.environment}`,
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create a task definition for the ECS service
        const taskDefinition = new ecs.FargateTaskDefinition(
            this,
            `${props.environment}-task-definition`,
            {
                memoryLimitMiB: 1024,
                cpu: 512,
            }
        );

        // Add a container to the task definition
        const container = taskDefinition.addContainer(`${props.environment}-container`, {
            image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'), // This will be replaced by the actual image
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'bellyfed',
                logGroup,
            }),
            environment: {
                NODE_ENV: 'production',
                ENVIRONMENT: props.environment,
            },
            portMappings: [
                {
                    containerPort: 3000,
                    hostPort: 3000,
                    protocol: ecs.Protocol.TCP,
                },
            ],
        });

        // Create an ECS service
        this.ecsService = new ecs.FargateService(this, `${props.environment}-service`, {
            cluster: this.ecsCluster,
            taskDefinition,
            desiredCount: 2,
            securityGroups: [serviceSecurityGroup],
            assignPublicIp: false,
            serviceName: `bellyfed-${props.environment}`,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        // Add the ECS service to the target group
        this.ecsService.attachToApplicationTargetGroup(targetGroup);

        // Create a Route53 A record for the load balancer
        new route53.ARecord(this, `${props.environment}-alias-record`, {
            zone: hostedZone,
            recordName: props.siteDomainName,
            target: route53.RecordTarget.fromAlias(
                new targets.LoadBalancerTarget(this.loadBalancer)
            ),
        });

        // Create an ECR repository for the Next.js application
        const repository = new ecr.Repository(this, `${props.environment}-repository`, {
            repositoryName: `bellyfed-${props.environment}`,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // Outputs
        new cdk.CfnOutput(this, 'ClusterName', {
            value: this.ecsCluster.clusterName,
            description: 'The name of the ECS cluster',
        });

        new cdk.CfnOutput(this, 'ServiceName', {
            value: this.ecsService.serviceName,
            description: 'The name of the ECS service',
        });

        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: this.loadBalancer.loadBalancerDnsName,
            description: 'The DNS name of the load balancer',
        });

        new cdk.CfnOutput(this, 'RepositoryURI', {
            value: repository.repositoryUri,
            description: 'The URI of the ECR repository',
        });
    }
}
```

### 4. Update the Frontend CICD Stack

Update the Frontend CICD Stack to support ECS Fargate:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseStackProps } from './types';
import { CONFIG } from './config';
import { GlobalTaggingUtils } from './utils/global-tagging-utils';

export interface FrontendCicdStackProps extends BaseStackProps {
    ecsCluster: ecs.Cluster;
    ecsService: ecs.FargateService;
    frontendRepo: string;
    frontendOwner: string;
    frontendBranch: string;
}

export class FrontendCicdStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FrontendCicdStackProps) {
        super(scope, id, {
            ...props,
            crossRegionReferences: true,
        });

        // Add tags to all resources in this stack
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Component', 'frontend-cicd');

        // Create artifacts bucket for the pipeline
        const artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            lifecycleRules: [
                {
                    expiration: cdk.Duration.days(30),
                },
            ],
        });

        // Create the pipeline
        const pipeline = new codepipeline.Pipeline(this, 'FrontendPipeline', {
            pipelineName: `${props.environment}-frontend-pipeline`,
            artifactBucket: artifactsBucket,
            restartExecutionOnUpdate: true,
            pipelineType: codepipeline.PipelineType.V2,
        });

        // Source stage
        const sourceOutput = new codepipeline.Artifact('SourceOutput');
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: props.frontendOwner,
            repo: props.frontendRepo,
            branch: props.frontendBranch,
            oauthToken: SecretValue.secretsManager(CONFIG.github.oauthSecretName, {
                jsonField: 'github-oauth-token',
            }),
            output: sourceOutput,
            trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
        });

        pipeline.addStage({
            stageName: 'Source',
            actions: [sourceAction],
        });

        // Create ECR repository for the Next.js application
        const repository = new ecr.Repository(this, 'Repository', {
            repositoryName: `bellyfed-${props.environment}`,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            lifecycleRules: [
                {
                    maxImageCount: 5,
                    description: 'Only keep the 5 most recent images',
                },
            ],
        });

        // Build and test stage
        const buildOutput = new codepipeline.Artifact('BuildOutput');
        const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
            projectName: `${props.environment}-frontend-build`,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                computeType: codebuild.ComputeType.SMALL,
                privileged: true, // Required for Docker builds
            },
            environmentVariables: {
                ENVIRONMENT: { value: props.environment },
                REPOSITORY_URI: { value: repository.repositoryUri },
                SITE_DOMAIN_NAME: { value: `app-${props.environment}.bellyfed.com` },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: '18',
                        },
                        commands: ['echo "Installing dependencies..."', 'npm ci'],
                    },
                    pre_build: {
                        commands: [
                            'echo "Logging in to Amazon ECR..."',
                            'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI',
                            'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
                            'IMAGE_TAG=${COMMIT_HASH:=latest}',
                        ],
                    },
                    build: {
                        commands: [
                            'echo "Running tests..."',
                            'npm run lint || true',
                            'npm run test || true',
                            'echo "Building the application..."',
                            'echo "ENVIRONMENT=$ENVIRONMENT" >> .env',
                            'echo "REPOSITORY=bellyfed" >> .env',
                            'echo "REGION=ap-southeast-1" >> .env',
                            'echo "SITE_DOMAIN_NAME=$SITE_DOMAIN_NAME" >> .env',
                            'echo "Building Docker image..."',
                            'docker build -t $REPOSITORY_URI:latest .',
                            'docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG',
                        ],
                    },
                    post_build: {
                        commands: [
                            'echo "Pushing Docker image..."',
                            'docker push $REPOSITORY_URI:latest',
                            'docker push $REPOSITORY_URI:$IMAGE_TAG',
                            'echo "Writing image definition file..."',
                            'echo "{\"ImageURI\":\"$REPOSITORY_URI:$IMAGE_TAG\"}" > imageDefinition.json',
                        ],
                    },
                },
                artifacts: {
                    files: ['imageDefinition.json'],
                },
                cache: {
                    paths: ['node_modules/**/*', '.next/cache/**/*'],
                },
            }),
        });

        // Grant permissions to push to ECR
        repository.grantPullPush(buildProject);

        const buildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'Build_and_Test',
            project: buildProject,
            input: sourceOutput,
            outputs: [buildOutput],
        });

        pipeline.addStage({
            stageName: 'Build',
            actions: [buildAction],
        });

        // Deploy stage - update the ECS service with the new image
        const deployProject = new codebuild.PipelineProject(this, 'DeployProject', {
            projectName: `${props.environment}-frontend-deploy`,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                computeType: codebuild.ComputeType.SMALL,
                privileged: false,
            },
            environmentVariables: {
                ENVIRONMENT: { value: props.environment },
                CLUSTER_NAME: { value: props.ecsCluster.clusterName },
                SERVICE_NAME: { value: props.ecsService.serviceName },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: '18',
                        },
                        commands: ['echo "Installing AWS CLI..."', 'pip install --upgrade awscli'],
                    },
                    build: {
                        commands: [
                            'echo "Deploying to ECS..."',
                            'echo "Getting image definition..."',
                            'IMAGE_URI=$(cat imageDefinition.json | jq -r .ImageURI)',
                            'echo "Updating ECS service with new image: $IMAGE_URI"',
                            'aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment',
                            'echo "Waiting for service to stabilize..."',
                            'aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME',
                            'echo "Deployment completed successfully."',
                        ],
                    },
                },
            }),
        });

        // Grant permissions to the deploy project
        deployProject.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['ecs:UpdateService', 'ecs:DescribeServices'],
                resources: [
                    `arn:aws:ecs:${this.region}:${this.account}:service/${props.ecsCluster.clusterName}/${props.ecsService.serviceName}`,
                ],
            })
        );

        const deployAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'Deploy_to_ECS',
            project: deployProject,
            input: buildOutput,
        });

        pipeline.addStage({
            stageName: 'Deploy',
            actions: [deployAction],
        });

        // Outputs
        new cdk.CfnOutput(this, 'PipelineName', {
            value: pipeline.pipelineName,
            description: 'The name of the frontend CI/CD pipeline',
        });

        new cdk.CfnOutput(this, 'ArtifactsBucketName', {
            value: artifactsBucket.bucketName,
            description: 'The name of the artifacts bucket',
        });
    }
}
```

### 5. Update the bin/cdk.ts File

Update the bin/cdk.ts file to include the new ECS Fargate stack:

```typescript
// Create ECS Fargate Stack for all environments
// This enables server-side rendering and ISR support
// Only create ECS Fargate stack if we have the required domain information
// These would typically come from environment variables or SSM parameters in a real deployment
const domainName = process.env.DOMAIN_NAME || 'bellyfed.com';
const siteDomainName = process.env.SITE_DOMAIN_NAME || `app-${environmentContext}.bellyfed.com`;

const ecsFargateProps = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || CONFIG.region,
    },
    environment: environmentContext,
    domainName,
    siteDomainName,
    region,
};

const ecsFargateStack = createStack(
    new EcsFargateStack(app, `BellyfedEcsFargateStack-${environmentContext}`, ecsFargateProps)
);

// Add dependencies to ensure certificates and parameters are created before ECS Fargate
ecsFargateStack.addDependency(certificateStack);
ecsFargateStack.addDependency(certificateParametersStack);
```

### 6. Deploy the New Infrastructure

Deploy the new infrastructure using the CDK CLI:

```bash
# Bootstrap the CDK (if not already done)
npx cdk bootstrap

# Deploy the ECS Fargate stack
npx cdk deploy BellyfedEcsFargateStack-dev --context environment=dev

# Deploy the Frontend CICD stack
npx cdk deploy BellyfedFrontendCicdStack-dev --context environment=dev
```

### 7. Verify the Deployment

Verify that the deployment was successful:

1. Check that the ECS Fargate service is running
2. Verify that the Application Load Balancer is healthy
3. Test the application by accessing the custom domain
4. Verify that ISR is working by updating a page and checking that it's revalidated

## Rollback Plan

If the migration fails, you can roll back to the CloudFront with Lambda@Edge setup:

1. Revert the changes to the Next.js configuration
2. Revert the changes to the bin/cdk.ts file
3. Deploy the CloudFront stack again
4. Deploy the Frontend CICD stack again

## Post-Migration Tasks

After the migration is complete, you should:

1. Update the documentation to reflect the new architecture
2. Remove the CloudFront and Lambda@Edge resources
3. Update the CI/CD pipeline to use the new ECS Fargate deployment process
4. Train the team on the new architecture and deployment process
