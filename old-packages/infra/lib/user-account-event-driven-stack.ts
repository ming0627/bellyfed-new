/**
 * User Account Event-Driven Stack
 *
 * This stack creates the event-driven architecture for user account operations:
 * - SQS queues for reliable message delivery
 * - Lambda functions for processing events
 * - EventBridge for event routing
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserAccountSqsStack } from './sqs/user-account-sqs-stack';
import { UserAccountProcessorStack } from './lambda/user-account-processor-stack';
import { UserAccountEventsStack } from './eventbridge/user-account-events-stack';
import { CONFIG } from './config.js';

export interface UserAccountEventDrivenStackProps extends cdk.StackProps {
    environment: string;
}

export class UserAccountEventDrivenStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: UserAccountEventDrivenStackProps) {
        super(scope, id, props);

        const envName = props.environment;

        // Create SQS queues for user account events
        const sqsStack = new UserAccountSqsStack(this, `UserAccountSqsStack-${envName}`);

        // Create Lambda function for processing user account events
        const processorStack = new UserAccountProcessorStack(
            this,
            `UserAccountProcessorStack-${envName}`,
            {
                userRegistrationQueue: sqsStack.registrationQueue,
                userUpdateQueue: sqsStack.updateQueue,
                userDeletionQueue: sqsStack.deletionQueue,
            }
        );

        // Create EventBridge resources for user account events
        const _eventsStack = new UserAccountEventsStack(this, `UserAccountEventsStack-${envName}`, {
            userAccountProcessorFunction: processorStack.processorFunction,
        });

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', envName);
        cdk.Tags.of(this).add('Service', 'UserAccountEventDriven');
        cdk.Tags.of(this).add('ManagedBy', 'CDK');
    }
}
