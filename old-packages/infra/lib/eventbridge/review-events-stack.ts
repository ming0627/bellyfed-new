/**
 * Review Events Stack
 *
 * This stack creates EventBridge resources for review-related events:
 * - Review event bus
 * - Rules for routing review creation, update, and deletion events
 */

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface ReviewEventsStackProps extends cdk.StackProps {
    reviewProcessorFunction: lambda.Function;
}

export class ReviewEventsStack extends cdk.Stack {
    public readonly eventBus: events.EventBus;

    constructor(scope: Construct, id: string, props: ReviewEventsStackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create a dedicated event bus for review events
        this.eventBus = new events.EventBus(this, `ReviewEventBus-${envName}`, {
            eventBusName: `review-event-bus-${envName}`,
        });

        // Create rule for review creation events
        const reviewCreationRule = new events.Rule(this, `ReviewCreationRule-${envName}`, {
            eventBus: this.eventBus,
            description: 'Rule that captures review creation events',
            eventPattern: {
                source: ['bellyfed.review'],
                detailType: ['ReviewCreated'],
            },
        });

        // Create rule for review update events
        const reviewUpdateRule = new events.Rule(this, `ReviewUpdateRule-${envName}`, {
            eventBus: this.eventBus,
            description: 'Rule that captures review update events',
            eventPattern: {
                source: ['bellyfed.review'],
                detailType: ['ReviewUpdated'],
            },
        });

        // Create rule for review deletion events
        const reviewDeletionRule = new events.Rule(this, `ReviewDeletionRule-${envName}`, {
            eventBus: this.eventBus,
            description: 'Rule that captures review deletion events',
            eventPattern: {
                source: ['bellyfed.review'],
                detailType: ['ReviewDeleted'],
            },
        });

        // Add Lambda function as target for all rules
        reviewCreationRule.addTarget(new targets.LambdaFunction(props.reviewProcessorFunction));

        reviewUpdateRule.addTarget(new targets.LambdaFunction(props.reviewProcessorFunction));

        reviewDeletionRule.addTarget(new targets.LambdaFunction(props.reviewProcessorFunction));

        // Store event bus ARN in SSM Parameter Store
        new ssm.StringParameter(this, `ReviewEventBusArn-${envName}`, {
            parameterName: `/bellyfed/${envName}/eventbridge/review-event-bus-arn`,
            description: 'ARN for the review event bus',
            stringValue: this.eventBus.eventBusArn,
        });

        // Output the event bus ARN
        new cdk.CfnOutput(this, 'ReviewEventBusArn', {
            value: this.eventBus.eventBusArn,
            description: 'Review Event Bus ARN',
            exportName: `ReviewEventBusArn-${envName}`,
        });
    }
}
