/**
 * CDK Pipelines stack for Bellyfed
 */
import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { FrontendStage } from './stages/frontend-stage';
import { InfraStage } from './stages/infra-stage';
import { CONFIG } from '../config.js';
import {
    FRONTEND_PATH_PATTERNS,
    INFRA_PATH_PATTERNS,
    SHARED_PATH_PATTERNS,
    ROOT_PATH_PATTERNS,
} from './utils/path-filters';
import { createSynthStep, createPipelineOptions, createStageOptions } from './utils/pipeline-utils';

export interface PipelineStackProps extends cdk.StackProps {
    environment: string;
}

/**
 * CDK Pipelines stack for Bellyfed
 *
 * This stack creates two pipelines:
 * 1. Frontend pipeline - for deploying the frontend application
 * 2. Infrastructure pipeline - for deploying the infrastructure
 *
 * Both pipelines are triggered based on the files that were modified in a commit.
 */
export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Create SNS topic for pipeline notifications
        const pipelineNotificationTopic = new sns.Topic(this, 'PipelineNotificationTopic', {
            displayName: `Bellyfed ${environment} Pipeline Notifications`,
            topicName: `bellyfed-${environment}-pipeline-notifications`,
        });

        // Create the frontend pipeline
        const _frontendPipeline = this.createFrontendPipeline(environment);

        // Create the infrastructure pipeline
        const _infraPipeline = this.createInfraPipeline(environment);

        // Create EventBridge rule to send pipeline state change events to SNS
        const pipelineStateChangeRule = new events.Rule(this, 'PipelineStateChangeRule', {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    state: ['FAILED', 'SUCCEEDED', 'STOPPED'],
                    pipeline: [`Bellyfed-Frontend-${environment}`, `Bellyfed-Infra-${environment}`],
                },
            },
        });

        // Add SNS target to the rule
        pipelineStateChangeRule.addTarget(new targets.SnsTopic(pipelineNotificationTopic));

        // Add notifications for pipeline status
        new events.Rule(this, 'FrontendPipelineStatusNotification', {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    pipeline: [`Bellyfed-Frontend-${environment}`],
                    state: ['STARTED', 'SUCCEEDED', 'FAILED'],
                },
            },
            targets: [new targets.SnsTopic(pipelineNotificationTopic)],
        });

        new events.Rule(this, 'InfraPipelineStatusNotification', {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    pipeline: [`Bellyfed-Infra-${environment}`],
                    state: ['STARTED', 'SUCCEEDED', 'FAILED'],
                },
            },
            targets: [new targets.SnsTopic(pipelineNotificationTopic)],
        });

        // Outputs
        new cdk.CfnOutput(this, 'FrontendPipelineName', {
            value: `Bellyfed-Frontend-${environment}`,
            description: 'The name of the frontend pipeline',
        });

        new cdk.CfnOutput(this, 'InfraPipelineName', {
            value: `Bellyfed-Infra-${environment}`,
            description: 'The name of the infrastructure pipeline',
        });

        new cdk.CfnOutput(this, 'NotificationTopicArn', {
            value: pipelineNotificationTopic.topicArn,
            description: 'The ARN of the pipeline notification topic',
        });
    }

    /**
     * Create the frontend pipeline
     * @param environment The environment context
     * @returns The frontend pipeline
     */
    private createFrontendPipeline(environment: string): pipelines.CodePipeline {
        // Create the pipeline
        const pipeline = new pipelines.CodePipeline(this, 'FrontendPipeline', {
            ...createPipelineOptions(environment),
            pipelineName: `Bellyfed-Frontend-${environment}`,
            synth: createSynthStep(environment),
        });

        // Add the frontend stage
        const frontendStage = new FrontendStage(this, 'Frontend', {
            env: {
                account: this.account,
                region: CONFIG.region,
            },
            environment,
        });

        // Add the frontend stage to the pipeline with path filters
        pipeline.addStage(frontendStage, {
            ...createStageOptions(environment),
        });

        return pipeline;
    }

    /**
     * Create the infrastructure pipeline
     * @param environment The environment context
     * @returns The infrastructure pipeline
     */
    private createInfraPipeline(environment: string): pipelines.CodePipeline {
        // Create the pipeline
        const pipeline = new pipelines.CodePipeline(this, 'InfraPipeline', {
            ...createPipelineOptions(environment),
            pipelineName: `Bellyfed-Infra-${environment}`,
            synth: createSynthStep(environment),
        });

        // Add the infrastructure stage
        const infraStage = new InfraStage(this, 'Infra', {
            env: {
                account: this.account,
                region: CONFIG.region,
            },
            environment,
        });

        // Add the infrastructure stage to the pipeline with path filters
        pipeline.addStage(infraStage, {
            ...createStageOptions(environment),
        });

        return pipeline;
    }
}
