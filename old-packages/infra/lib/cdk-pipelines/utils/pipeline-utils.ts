/**
 * Utility functions for CDK Pipelines
 */
import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { CONFIG } from '../../config.js';

/**
 * Create a CodeBuild environment with common settings
 * @param props Additional environment properties
 * @returns CodeBuild environment
 */
export function createBuildEnvironment(
    props?: Partial<codebuild.BuildEnvironment>
): codebuild.BuildEnvironment {
    return {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.MEDIUM,
        privileged: true,
        ...props,
    };
}

/**
 * Create a synth step for CDK Pipelines
 * @param environment The environment context
 * @returns ShellStep for synth
 */
export function createSynthStep(environment: string): pipelines.ShellStep {
    return new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub(
            `${CONFIG.github.owner}/${CONFIG.github.repo}`,
            getBranchForEnvironment(environment),
            {
                authentication: cdk.SecretValue.secretsManager(CONFIG.github.oauthSecretName, {
                    jsonField: 'github-oauth-token',
                }),
            }
        ),
        commands: [
            'corepack enable',
            'corepack prepare pnpm@latest --activate',
            'pnpm install --frozen-lockfile',
            'pnpm run build',
            `npx cdk synth --context environment=${environment}`,
        ],
        primaryOutputDirectory: 'packages/infra/cdk.out',
    });
}

/**
 * Get the branch name for a given environment
 * @param environment The environment context
 * @returns The branch name
 */
export function getBranchForEnvironment(environment: string): string {
    if (environment === 'prod') {
        return 'main';
    } else if (environment === 'dev') {
        return 'develop';
    } else {
        return environment;
    }
}

/**
 * Create common pipeline options
 * @param environment The environment context
 * @returns CodePipeline options
 */
export function createPipelineOptions(
    environment: string
): Omit<pipelines.CodePipelineProps, 'synth'> {
    return {
        pipelineName: `Bellyfed-${environment}`,
        crossAccountKeys: true,
        selfMutation: true,
        dockerEnabledForSynth: true,
        dockerEnabledForSelfMutation: true,
        publishAssetsInParallel: true,
        codeBuildDefaults: {
            buildEnvironment: createBuildEnvironment(),
            timeout: cdk.Duration.minutes(30),
            cache: codebuild.Cache.local(
                codebuild.LocalCacheMode.DOCKER_LAYER,
                codebuild.LocalCacheMode.CUSTOM,
                codebuild.LocalCacheMode.SOURCE
            ),
        },
    };
}

/**
 * Create common stage options
 * @param environment The environment context
 * @returns Stage options
 */
export function createStageOptions(_environment: string): pipelines.AddStageOpts {
    return {};
}
