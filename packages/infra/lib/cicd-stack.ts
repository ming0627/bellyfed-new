// npx cdk deploy BellyfedCicdStack-dev --context environment=dev --exclusively
import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { BootstrapStack } from './bootstrap-stack.js';
import { CONFIG } from './config.js';

export interface CicdStackProps extends cdk.StackProps {
    cicdRegion: string;
    appRegion: string;
    environment: string;
    branchName: string;
}

/**
 * This stack creates a CI/CD pipeline for the backend infrastructure.
 * It handles building and deploying the CDK stacks for the backend services in multiple stages.
 * The frontend application is handled by a separate pipeline in FrontendCicdStack.
 */
export class CicdStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CicdStackProps) {
        const { environment, cicdRegion, appRegion, branchName, ...restProps } = props;
        super(scope, id, {
            ...restProps,
            env: {
                account: props.env?.account,
                region: cicdRegion,
            },
        });

        // Create the multi-stage pipeline
        this.createMultiStagePipeline(environment, branchName, {
            cicdRegion,
            appRegion,
            environment,
            branchName,
        });

        new cdk.CfnOutput(this, 'CICDCreated', {
            value: `CICD resources created in ${cicdRegion} for branch ${branchName}`,
            description: 'CICD Status',
        });

        new cdk.CfnOutput(this, 'EnvironmentValue', {
            value: environment,
            description: 'Current environment',
        });
    }

    private createMultiStagePipeline(env: string, branch: string, props: CicdStackProps): void {
        const sourceOutput = new codepipeline.Artifact();
        const buildOutput = new codepipeline.Artifact('BuildOutput');

        // Artifacts for each deployment stage
        const bootstrapOutput = new codepipeline.Artifact('BootstrapOutput');
        // Note: typesenseBuildOutput removed as Typesense Docker image is now built by CDK
        const infraOutput = new codepipeline.Artifact('InfraOutput');
        const dataOutput = new codepipeline.Artifact('DataOutput');
        const appOutput = new codepipeline.Artifact('AppOutput');
        const frontendOutput = new codepipeline.Artifact('FrontendOutput');

        // Source Action
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: `GitHub_Source_${branch}`,
            owner: CONFIG.github.owner,
            repo: CONFIG.github.repo,
            branch: branch,
            oauthToken: SecretValue.secretsManager(CONFIG.github.oauthSecretName, {
                jsonField: 'github-oauth-token',
            }),
            output: sourceOutput,
            trigger: codepipeline_actions.GitHubTrigger.NONE, // No webhook trigger - using CDK Pipelines instead
        });

        // Build and Test Project
        const buildAndTestProject = new codebuild.PipelineProject(
            this,
            `${env}BuildAndTestProject`,
            {
                buildSpec: codebuild.BuildSpec.fromObject({
                    version: '0.2',
                    phases: {
                        install: {
                            commands: ['npm install -g aws-cdk', 'npm install'],
                            'runtime-versions': {
                                nodejs: 'latest',
                            },
                        },
                        build: {
                            commands: [
                                'npm run build',
                                'echo "All Lambda functions should be built by Lerna as part of npm run build"',
                                'echo "Checking dist directories in all workspaces:"',
                                'find functions packages src/layers -type d -name "dist" | xargs ls -la || echo "No dist directories found"',
                            ],
                        },
                        post_build: {
                            commands: [
                                'echo "Running security scans..."',
                                'npm audit --production || echo "Security vulnerabilities found, but continuing deployment"',
                                'echo "Running linting..."',
                                'npm run lint || echo "Linting issues found, but continuing deployment"',
                            ],
                        },
                    },
                    artifacts: {
                        files: ['**/*'],
                    },
                    cache: {
                        paths: ['node_modules/**/*', '~/.npm/**/*'],
                    },
                }),
                environment: {
                    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                    computeType: codebuild.ComputeType.LARGE,
                    environmentVariables: this.createCommonEnvironmentVariables(props),
                },
                cache: codebuild.Cache.local(
                    codebuild.LocalCacheMode.CUSTOM,
                    codebuild.LocalCacheMode.SOURCE
                ),
            }
        );

        // Bootstrap Deployment Project
        const bootstrapDeployProject = this.createDeploymentProject(
            env,
            'Bootstrap',
            [
                'echo "Deploying Bootstrap resources"',
                'cdk deploy BellyfedBootstrapStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'echo "Note: Using official Typesense Docker image from Docker Hub"',
            ],
            props
        );

        // Note: Using official Typesense Docker image from Docker Hub
        // No build step is needed

        // Infrastructure Deployment Project
        const infraDeployProject = this.createDeploymentProject(
            env,
            'Infrastructure',
            [
                'echo "Deploying Infrastructure resources"',
                'echo "Deploying Logging Stack"',
                'cdk deploy BellyfedLoggingStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'echo "Deploying Network and ECS Infrastructure stacks"',
                'cdk deploy BellyfedNetworkStack-${ENVIRONMENT} BellyfedEcsInfraStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'echo "Deploying Typesense Infrastructure stack"',
                'cdk deploy BellyfedTypesenseInfraStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
            ],
            props
        );

        // Data Resources Deployment Project
        const dataDeployProject = this.createDeploymentProject(
            env,
            'Data',
            [
                'echo "Deploying Data resources"',
                'cdk deploy BellyfedAuroraStack-${ENVIRONMENT} BellyfedDynamoDBStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'cdk deploy BellyfedDbSchemaStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
            ],
            props
        );

        // Frontend Deployment Project - Moved before Application to ensure ECR image is available
        const frontendDeployProject = this.createDeploymentProject(
            env,
            'Frontend',
            [
                'echo "Deploying Frontend resources"',
                'cdk deploy BellyfedFrontendCicdStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
            ],
            props
        );

        // Application Deployment Project
        const appDeployProject = this.createDeploymentProject(
            env,
            'Application',
            [
                'echo "Deploying Application resources"',
                'cdk deploy BellyfedTypesenseServiceStack-${ENVIRONMENT} BellyfedTypesenseLambdaStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'cdk deploy BellyfedLambdaStack-${ENVIRONMENT} BellyfedApiGatewayStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'cdk deploy BellyfedRestaurantEventDrivenStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'cdk deploy BellyfedReviewEventDrivenStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
                'cdk deploy BellyfedFrontendServiceStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
            ],
            props
        );

        // Import System Deployment Project
        const importDeployProject = this.createDeploymentProject(
            env,
            'Import',
            [
                'echo "Deploying Import System resources"',
                'cdk deploy BellyfedImportStack-${ENVIRONMENT} --context environment=${ENVIRONMENT} --require-approval never',
            ],
            props
        );

        // Add deployment policies to all projects using the static method from BootstrapStack
        BootstrapStack.addCdkDeploymentPolicies(bootstrapDeployProject);
        BootstrapStack.addCdkDeploymentPolicies(infraDeployProject);
        BootstrapStack.addCdkDeploymentPolicies(dataDeployProject);
        BootstrapStack.addCdkDeploymentPolicies(appDeployProject);
        BootstrapStack.addCdkDeploymentPolicies(frontendDeployProject);
        BootstrapStack.addCdkDeploymentPolicies(importDeployProject);

        // Create artifact for import deployment
        const importOutput = new codepipeline.Artifact('ImportOutput');

        const stages: codepipeline.StageProps[] = [
            {
                stageName: 'Source',
                actions: [sourceAction],
            },
            {
                stageName: 'BuildAndTest',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Build_and_Test',
                        project: buildAndTestProject,
                        input: sourceOutput,
                        outputs: [buildOutput],
                    }),
                ],
            },
            {
                stageName: 'DeployBootstrap',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Bootstrap',
                        project: bootstrapDeployProject,
                        input: buildOutput,
                        outputs: [bootstrapOutput],
                    }),
                ],
            },
            // Note: Typesense Docker image is now built and pushed automatically by CDK using DockerImageAsset
            {
                stageName: 'DeployInfrastructure',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Infrastructure',
                        project: infraDeployProject,
                        input: buildOutput,
                        outputs: [infraOutput],
                    }),
                ],
            },
            {
                stageName: 'DeployData',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Data',
                        project: dataDeployProject,
                        input: buildOutput,
                        outputs: [dataOutput],
                    }),
                ],
            },
            {
                stageName: 'DeployApplication',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Application',
                        project: appDeployProject,
                        input: buildOutput,
                        outputs: [appOutput],
                    }),
                ],
            },
            {
                stageName: 'DeployImport',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Import',
                        project: importDeployProject,
                        input: buildOutput,
                        outputs: [importOutput],
                    }),
                ],
            },
            {
                stageName: 'DeployFrontend',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Deploy_Frontend',
                        project: frontendDeployProject,
                        input: buildOutput,
                        outputs: [frontendOutput],
                    }),
                ],
            },
        ];

        // Add approval stage for production (master branch) and QA (qa branch) deployments
        if (branch === 'master' || branch === 'qa') {
            stages.splice(4, 0, {
                stageName: 'Approve',
                actions: [
                    new codepipeline_actions.ManualApprovalAction({
                        actionName: `Approve_Deployment_To_${env}`,
                        notificationTopic: new sns.Topic(this, `${env}ApprovalTopic`, {
                            topicName: `bellyfed-${env}-deployment-approval`,
                        }),
                        additionalInformation: `Approve deployment to ${env} environment from ${branch} branch`,
                    }),
                ],
            });
        }

        const pipeline = new codepipeline.Pipeline(this, `${env}InfraPipeline`, {
            pipelineName: `Bellyfed-Infra-${env}`,
            stages,
            crossAccountKeys: true,
            restartExecutionOnUpdate: true,
            pipelineType: codepipeline.PipelineType.V2, // Use V2 pipeline type for latest features
        });

        // Add notifications for pipeline status
        new events.Rule(this, `${env}PipelineNotification`, {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    pipeline: [pipeline.pipelineName],
                    state: ['STARTED', 'SUCCEEDED', 'FAILED'],
                },
            },
            targets: [
                new targets.SnsTopic(
                    new sns.Topic(this, `${env}PipelineNotificationTopic`, {
                        topicName: `bellyfed-${env}-pipeline-notifications`,
                    })
                ),
            ],
        });
    }

    private createDeploymentProject(
        env: string,
        stageName: string,
        deployCommands: string[],
        props: CicdStackProps
    ): codebuild.PipelineProject {
        return new codebuild.PipelineProject(this, `${env}${stageName}DeployProject`, {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: ['npm install -g aws-cdk', 'npm install'],
                        'runtime-versions': {
                            nodejs: 'latest',
                        },
                    },
                    build: {
                        commands: [
                            'echo "Using pre-built artifacts from BuildAndTest stage"',
                            'echo "Verifying builds in all workspaces"',
                            'find functions packages src/layers -type d -name "dist" | xargs ls -la || echo "No dist directories found"',
                            'echo "Performing deployment for stage: ' + stageName + '"',
                            'echo "Environment: $ENVIRONMENT"',
                            ...deployCommands,
                        ],
                    },
                },
                artifacts: {
                    files: ['**/*'],
                },
                cache: {
                    paths: ['node_modules/**/*', '~/.npm/**/*'],
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                computeType: codebuild.ComputeType.LARGE,
                environmentVariables: {
                    ...this.createCommonEnvironmentVariables(props),
                    // Use the environment from props instead of hardcoding
                    ENVIRONMENT: { value: props.environment },
                    AWS_DEFAULT_REGION: { value: props.appRegion },
                    // Add additional environment variables for deployment coordination
                },
            },
            cache: codebuild.Cache.local(
                codebuild.LocalCacheMode.CUSTOM,
                codebuild.LocalCacheMode.SOURCE
            ),
        });
    }

    private createCommonEnvironmentVariables(
        props: CicdStackProps
    ): Record<string, { value: string }> {
        return {
            CDK_DEFAULT_ACCOUNT: { value: this.account },
            CDK_DEFAULT_REGION: { value: props.appRegion },
            ENVIRONMENT: { value: props.environment },
        };
    }
}