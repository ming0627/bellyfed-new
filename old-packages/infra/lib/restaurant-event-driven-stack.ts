/**
 * Restaurant Event-Driven Architecture Stack
 *
 * This stack orchestrates the creation of all components needed for the
 * event-driven architecture for restaurant operations:
 * - SQS queues for restaurant events
 * - EventBridge for routing events
 * - Lambda function for processing events
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { RestaurantSqsStack } from './sqs/restaurant-sqs-stack';
import { RestaurantProcessorStack } from './lambda/restaurant-processor-stack';
import { RestaurantEventsStack } from './eventbridge/restaurant-events-stack';

export interface RestaurantEventDrivenStackProps extends cdk.StackProps {
    environment: string;
    vpc: cdk.aws_ec2.IVpc;
}

export class RestaurantEventDrivenStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RestaurantEventDrivenStackProps) {
        super(scope, id, props);

        const envName = props.environment;

        // Create SQS queues for restaurant events
        const sqsStack = new RestaurantSqsStack(this, `RestaurantSqsStack-${envName}`, {
            env: props.env,
        });

        // Create Lambda function for processing restaurant events
        const processorStack = new RestaurantProcessorStack(
            this,
            `RestaurantProcessorStack-${envName}`,
            {
                env: props.env,
                restaurantCreationQueue: sqsStack.creationQueue,
                restaurantUpdateQueue: sqsStack.updateQueue,
            }
        );

        // Create EventBridge resources for restaurant events
        const eventsStack = new RestaurantEventsStack(this, `RestaurantEventsStack-${envName}`, {
            env: props.env,
            restaurantProcessorFunction: processorStack.processorFunction,
        });

        // Add dependency to ensure SQS queues are created before Lambda function
        processorStack.node.addDependency(sqsStack);

        // Add dependency to ensure Lambda function is created before EventBridge rules
        eventsStack.node.addDependency(processorStack);

        // We don't need to set the event bus name here as it's already set in the Lambda function
        // This was causing a circular dependency

        // Output the stack resources
        new cdk.CfnOutput(this, 'RestaurantEventDrivenStackName', {
            value: this.stackName,
            description: 'Restaurant Event-Driven Architecture Stack Name',
            exportName: `RestaurantEventDrivenStackName-${envName}`,
        });
    }
}
