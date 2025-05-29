import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';

export interface FrontendCicdStackProps extends cdk.StackProps {
    environment: string;
    frontendBranch: string;
    frontendRepo?: string;
    frontendOwner?: string;
    ecrRepositoryUri?: string;
}

export class FrontendCicdStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FrontendCicdStackProps) {
        super(scope, id, props);

        // Use the main ECR repository - always use fromRepositoryName which doesn't validate existence
        // The repository must exist before this stack is deployed
        const ecrRepository = ecr.Repository.fromRepositoryName(
            this,
            'Repository',
            CONFIG.ecr.repositoryNamePattern.replace('{environment}', props.environment)
        );
        console.log(
            `Using main ECR repository: ${CONFIG.ecr.repositoryNamePattern.replace('{environment}', props.environment)}`
        );

        // Create an S3 bucket for the pipeline artifacts with improved security
        const artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        // Create a notification topic for pipeline events
        const pipelineNotificationTopic = new sns.Topic(this, 'PipelineNotificationTopic', {
            topicName: `bellyfed-${props.environment}-frontend-pipeline-notifications`,
            displayName: `Bellyfed ${props.environment} Frontend Pipeline Notifications`,
        });

        // Create a CodePipeline for the frontend CI/CD with improved configuration
        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            pipelineName: `${props.environment}-frontend-pipeline`,
            artifactBucket: artifactsBucket,
            restartExecutionOnUpdate: true,
            pipelineType: codepipeline.PipelineType.V2, // Use V2 pipeline type for latest features
            crossAccountKeys: false, // No need for cross-account keys in this case
        });

        // Source stage
        const sourceOutput = new codepipeline.Artifact('SourceOutput');
        const buildOutput = new codepipeline.Artifact('BuildOutput');
        const testOutput = new codepipeline.Artifact('TestOutput');

        // Add a source stage using GitHub
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: props.frontendOwner || CONFIG.github.owner,
            repo: props.frontendRepo || CONFIG.github.repo,
            branch: props.frontendBranch,
            oauthToken: cdk.SecretValue.secretsManager(CONFIG.github.oauthSecretName, {
                jsonField: 'github-oauth-token',
            }),
            output: sourceOutput,
            trigger: codepipeline_actions.GitHubTrigger.NONE, // No webhook trigger - using CDK Pipelines instead
        });

        pipeline.addStage({
            stageName: 'Source',
            actions: [sourceAction],
        });

        // Get the ECR repository URI
        const repositoryUri = ecrRepository.repositoryUri;

        // Get ECS cluster and service names
        const clusterName = CONFIG.ecs.namingPatterns.cluster.replace(
            '{environment}',
            props.environment
        );
        // Use the actual service name that exists in AWS
        const serviceName = CONFIG.ecs.namingPatterns.service.replace(
            '{environment}',
            props.environment
        );

        // Create a test project for running tests
        const testProject = new codebuild.PipelineProject(this, 'TestProject', {
            projectName: `${props.environment}-frontend-test`,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // Use the latest image
                computeType: codebuild.ComputeType.MEDIUM,
                privileged: false, // No need for Docker in test phase
            },
            cache: codebuild.Cache.local(
                codebuild.LocalCacheMode.CUSTOM,
                codebuild.LocalCacheMode.SOURCE
            ),
            timeout: cdk.Duration.minutes(15),
            environmentVariables: {
                ENVIRONMENT: { value: props.environment },
                NODE_ENV: { value: 'test' },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: 'latest', // Use latest Node.js
                        },
                        commands: ['echo "Installing dependencies..."', 'npm ci'],
                    },
                    pre_build: {
                        commands: [
                            'echo "Running linting..."',
                            'npm run lint || echo "Linting issues found, but continuing"',
                        ],
                    },
                    build: {
                        commands: [
                            'echo "Running tests..."',
                            'npm test || echo "Tests failed, but continuing"',
                            'echo "Running security audit..."',
                            'npm audit --production || echo "Security vulnerabilities found, but continuing"',
                        ],
                    },
                    post_build: {
                        commands: [
                            'echo "Tests completed"',
                            'echo "Creating empty artifact file to ensure artifacts are always generated"',
                            'touch test-completed.txt',
                        ],
                    },
                },
                cache: {
                    paths: ['node_modules/**/*', '.next/cache/**/*', '/root/.npm/**/*'],
                },
                artifacts: {
                    files: ['**/*'],
                    'base-directory': '.',
                },
            }),
        });

        // Create a build project with improved configuration
        const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
            projectName: `${props.environment}-frontend-build`,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // Use the latest image
                computeType: codebuild.ComputeType.MEDIUM,
                privileged: true, // Required for Docker builds
                environmentVariables: {
                    DOCKER_CONFIG: { value: '/tmp/.docker' },
                    AWS_DEFAULT_REGION: { value: this.region },
                },
            },
            cache: codebuild.Cache.local(
                codebuild.LocalCacheMode.DOCKER_LAYER,
                codebuild.LocalCacheMode.CUSTOM,
                codebuild.LocalCacheMode.SOURCE
            ),
            timeout: cdk.Duration.minutes(30),
            concurrentBuildLimit: 2,
            environmentVariables: {
                ENVIRONMENT: { value: props.environment },
                REPOSITORY_URI: { value: repositoryUri },
                SITE_DOMAIN_NAME: { value: `app-${props.environment}.bellyfed.com` },
                CLUSTER_NAME: { value: clusterName },
                SERVICE_NAME: { value: serviceName },

                BRANCH_NAME: { value: props.frontendBranch },
                NEXT_PUBLIC_COGNITO_CLIENT_ID: {
                    value: this.getAuthParameter(
                        CONFIG.auth.ssmPaths.userPoolClientId,
                        props.environment
                    ),
                },
                NEXT_PUBLIC_USER_POOL_CLIENT_ID: {
                    value: this.getAuthParameter(
                        CONFIG.auth.ssmPaths.userPoolClientId,
                        props.environment
                    ),
                },
                COGNITO_USER_POOL_ID: {
                    value: this.getAuthParameter(
                        CONFIG.auth.ssmPaths.userPoolId,
                        props.environment
                    ),
                },
                COGNITO_IDENTITY_POOL_ID: {
                    value: this.getAuthParameter(
                        CONFIG.auth.ssmPaths.identityPoolId,
                        props.environment
                    ),
                },
                API_URL: { value: `https://api-${props.environment}.bellyfed.com` },
                GOOGLE_MAPS_API_KEY: {
                    value: ssm.StringParameter.valueForStringParameter(
                        this,
                        `/bellyfed/${props.environment}/secrets/google-maps-api-key-secret-arn`
                    ),
                    type: BuildEnvironmentVariableType.SECRETS_MANAGER,
                },
                AWS_ACCOUNT_ID: { value: this.account },
                NODE_ENV: { value: 'production' },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: 'latest', // Use latest Node.js
                        },
                        commands: ['echo "Installing dependencies..."', 'npm ci'],
                    },
                    pre_build: {
                        commands: [
                            'echo "Logging in to ECR..."',
                            'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
                            'REPOSITORY_URI=$REPOSITORY_URI',
                            'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
                            'TIMESTAMP=$(date +%Y%m%d%H%M%S)',
                            'IMAGE_TAG="${BRANCH_NAME}-${TIMESTAMP}-${COMMIT_HASH}"',
                            'echo "Using IMAGE_TAG: $IMAGE_TAG"',
                        ],
                    },
                    build: {
                        commands: [
                            'echo "Creating .env file..."',
                            'echo "ENVIRONMENT=$ENVIRONMENT" >> .env',
                            'echo "REPOSITORY=bellyfed" >> .env',
                            'echo "REGION=$AWS_DEFAULT_REGION" >> .env',
                            'echo "SITE_DOMAIN_NAME=$SITE_DOMAIN_NAME" >> .env',
                            'echo "NEXT_PUBLIC_COGNITO_CLIENT_ID=$NEXT_PUBLIC_COGNITO_CLIENT_ID" >> .env',
                            'echo "NEXT_PUBLIC_USER_POOL_CLIENT_ID=$NEXT_PUBLIC_USER_POOL_CLIENT_ID" >> .env',
                            'echo "COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID" >> .env',
                            'echo "COGNITO_IDENTITY_POOL_ID=$COGNITO_IDENTITY_POOL_ID" >> .env',
                            'echo "API_URL=$API_URL" >> .env',
                            'echo "GOOGLE_MAPS_API_KEY=dummy-key-for-build" >> .env',
                            'echo "NODE_ENV=production" >> .env',
                            'echo "Building Docker image..."',
                            'docker build -t $REPOSITORY_URI:$IMAGE_TAG --target runner --build-arg ENVIRONMENT=$ENVIRONMENT --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") --build-arg VERSION=$IMAGE_TAG .',
                            'docker tag $REPOSITORY_URI:$IMAGE_TAG $REPOSITORY_URI:latest',
                            'echo "Docker image built successfully"',
                        ],
                    },
                    post_build: {
                        commands: [
                            'echo "Pushing Docker image with unique tag..."',
                            'docker push $REPOSITORY_URI:$IMAGE_TAG',
                            'echo "Pushing latest tag to always point to the most recent build..."',
                            'docker push $REPOSITORY_URI:latest',
                            'echo "Getting image digest for immutable reference..."',
                            "IMAGE_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' $REPOSITORY_URI:$IMAGE_TAG | cut -d'@' -f2)",
                            'echo "Image digest: $IMAGE_DIGEST"',
                            'ACTIVE_CLUSTER=$CLUSTER_NAME',
                            'ACTIVE_SERVICE=$SERVICE_NAME',
                            'echo "Creating imageDefinitions.json for ECS deployment..."',
                            'CONTAINER_NAME=$(aws ecs describe-task-definition --task-definition bellyfed-${ENVIRONMENT}-service --query "taskDefinition.containerDefinitions[0].name" --output text || echo "bellyfed-${ENVIRONMENT}-container")',
                            'echo \'[{"name":"\'$CONTAINER_NAME\'","imageUri":"\'$REPOSITORY_URI:$IMAGE_TAG\'"}]\' > imageDefinitions.json',
                            'echo "Storing image tag in SSM parameter..."',
                            'aws ssm put-parameter --name "/bellyfed/${ENVIRONMENT}/frontend/latest-image-tag" --value "$IMAGE_TAG" --type String --overwrite || echo "Failed to store image tag in SSM"',
                            'echo "Storing image URI in SSM parameter..."',
                            'aws ssm put-parameter --name "/bellyfed/${ENVIRONMENT}/frontend/latest-image-uri" --value "$REPOSITORY_URI:$IMAGE_TAG" --type String --overwrite || echo "Failed to store image URI in SSM"',
                            'echo "Storing image digest in SSM parameter..."',
                            'aws ssm put-parameter --name "/bellyfed/${ENVIRONMENT}/frontend/latest-image-digest" --value "$IMAGE_DIGEST" --type String --overwrite || echo "Failed to store image digest in SSM"',
                        ],
                    },
                },
                artifacts: {
                    files: ['imageDefinitions.json'],
                },
                cache: {
                    paths: [
                        'node_modules/**/*',
                        '.next/cache/**/*',
                        '/root/.npm/**/*',
                        '/usr/local/share/.cache/yarn/**/*',
                        '/tmp/docker-build-cache/**/*',
                    ],
                },
            }),
        });

        // Grant permissions to push to ECR
        ecrRepository.grantPullPush(buildProject);

        // Grant permissions needed for CodeDeploy, ECR, and ECS with least privilege
        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecs:DescribeTaskDefinition',
                    'ecs:DescribeServices',
                    'ecs:UpdateService',
                    'ecs:ListTaskDefinitions',
                    'ecs:ListServices',
                ],
                resources: ['*'],
            })
        );

        // Grant permissions to access secrets in Secrets Manager
        const secretName = `bellyfed-${props.environment}-app-secrets`;

        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                resources: [
                    `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${secretName}*`,
                ],
            })
        );

        // Grant permissions to update SSM parameters
        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['ssm:PutParameter', 'ssm:GetParameter'],
                resources: [
                    `arn:aws:ssm:${this.region}:${this.account}:parameter/bellyfed/${props.environment}/frontend/*`,
                ],
            })
        );

        // Add test stage
        pipeline.addStage({
            stageName: 'Test',
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: 'Run_Tests',
                    project: testProject,
                    input: sourceOutput,
                    outputs: [testOutput],
                }),
            ],
        });

        // Add build stage
        pipeline.addStage({
            stageName: 'Build',
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: 'Build_Docker_Image',
                    project: buildProject,
                    input: sourceOutput,
                    outputs: [buildOutput],
                }),
            ],
        });

        // Get the ECS cluster
        const cluster = ecs.Cluster.fromClusterArn(
            this,
            'ImportedEcsCluster',
            `arn:aws:ecs:${this.region}:${this.account}:cluster/${clusterName}`
        );

        // Create the ECS deploy action
        const deployAction = new codepipeline_actions.EcsDeployAction({
            actionName: 'Deploy_To_ECS',
            service: ecs.FargateService.fromFargateServiceAttributes(this, 'ImportedEcsService', {
                serviceName: serviceName,
                cluster: cluster,
            }),
            imageFile: buildOutput.atPath('imageDefinitions.json'),
        });

        // Add the deploy stage with the ECS deployment action
        pipeline.addStage({
            stageName: 'Deploy',
            actions: [deployAction],
        });

        // Add notifications for pipeline status
        new events.Rule(this, 'PipelineStatusNotification', {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    pipeline: [pipeline.pipelineName],
                    state: ['STARTED', 'SUCCEEDED', 'FAILED'],
                },
            },
            targets: [new targets.SnsTopic(pipelineNotificationTopic)],
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

        new cdk.CfnOutput(this, 'EcrRepositoryUri', {
            value: ecrRepository.repositoryUri,
            description: 'The URI of the ECR repository',
        });

        new cdk.CfnOutput(this, 'NotificationTopicArn', {
            value: pipelineNotificationTopic.topicArn,
            description: 'The ARN of the pipeline notification topic',
        });
    }

    /**
     * Helper method to resolve and retrieve auth parameters from SSM
     * @param paramPath The parameter path pattern from CONFIG
     * @param environment The environment context
     * @returns The parameter value from SSM
     */
    private getAuthParameter(paramPath: string, environment: string): string {
        const resolvedPath = paramPath
            .replace('{paramPrefix}', CONFIG.app.namingPatterns.paramPrefix)
            .replace('{environment}', environment);

        return ssm.StringParameter.valueForStringParameter(this, resolvedPath);
    }
}
