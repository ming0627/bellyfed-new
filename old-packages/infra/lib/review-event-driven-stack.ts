/**
 * Review Event-Driven Architecture Stack
 *
 * This stack orchestrates the creation of all components needed for the
 * event-driven architecture for review operations:
 * - SQS queues for review events
 * - EventBridge for routing events
 * - Lambda function for processing events
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { ReviewSqsStack } from './sqs/review-sqs-stack';
import { ReviewProcessorStack } from './lambda/review-processor-stack';
import { ReviewEventsStack } from './eventbridge/review-events-stack';

export interface ReviewEventDrivenStackProps extends cdk.StackProps {
    environment: string;
    vpc: cdk.aws_ec2.IVpc;
}

export class ReviewEventDrivenStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ReviewEventDrivenStackProps) {
        super(scope, id, props);

        const envName = props.environment;

        // Create SQS queues for review events
        const sqsStack = new ReviewSqsStack(this, `ReviewSqsStack-${envName}`, {
            env: props.env,
        });

        // Create Lambda function for processing review events
        const processorStack = new ReviewProcessorStack(this, `ReviewProcessorStack-${envName}`, {
            env: props.env,
            reviewCreationQueue: sqsStack.creationQueue,
            reviewUpdateQueue: sqsStack.updateQueue,
            reviewDeletionQueue: sqsStack.deletionQueue,
        });

        // Create EventBridge resources for review events
        const eventsStack = new ReviewEventsStack(this, `ReviewEventsStack-${envName}`, {
            env: props.env,
            reviewProcessorFunction: processorStack.processorFunction,
        });

        // Add dependency to ensure SQS queues are created before Lambda function
        processorStack.node.addDependency(sqsStack);

        // Add dependency to ensure Lambda function is created before EventBridge rules
        eventsStack.node.addDependency(processorStack);

        // We don't need to set the event bus name here as it's already set in the Lambda function
        // This was causing a circular dependency

        // Output the stack resources
        new cdk.CfnOutput(this, 'ReviewEventDrivenStackName', {
            value: this.stackName,
            description: 'Review Event-Driven Architecture Stack Name',
            exportName: `ReviewEventDrivenStackName-${envName}`,
        });
    }
}
