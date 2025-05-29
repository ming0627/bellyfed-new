/**
 * Restaurant Events Stack
 *
 * This stack creates EventBridge resources for restaurant-related events:
 * - Restaurant event bus
 * - Rules for routing restaurant creation and update events
 */

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface RestaurantEventsStackProps extends cdk.StackProps {
    restaurantProcessorFunction: lambda.Function;
}

export class RestaurantEventsStack extends cdk.Stack {
    public readonly eventBus: events.EventBus;

    constructor(scope: Construct, id: string, props: RestaurantEventsStackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create a dedicated event bus for restaurant events
        this.eventBus = new events.EventBus(this, `RestaurantEventBus-${envName}`, {
            eventBusName: `restaurant-event-bus-${envName}`,
        });

        // Create rule for restaurant creation events
        const restaurantCreationRule = new events.Rule(this, `RestaurantCreationRule-${envName}`, {
            eventBus: this.eventBus,
            description: 'Rule that captures restaurant creation events',
            eventPattern: {
                source: ['bellyfed.restaurant'],
                detailType: ['RestaurantCreated'],
            },
        });

        // Create rule for restaurant update events
        const restaurantUpdateRule = new events.Rule(this, `RestaurantUpdateRule-${envName}`, {
            eventBus: this.eventBus,
            description: 'Rule that captures restaurant update events',
            eventPattern: {
                source: ['bellyfed.restaurant'],
                detailType: ['RestaurantUpdated'],
            },
        });

        // Add Lambda function as target for both rules
        restaurantCreationRule.addTarget(
            new targets.LambdaFunction(props.restaurantProcessorFunction)
        );

        restaurantUpdateRule.addTarget(
            new targets.LambdaFunction(props.restaurantProcessorFunction)
        );

        // Store event bus ARN in SSM Parameter Store
        new ssm.StringParameter(this, `RestaurantEventBusArn-${envName}`, {
            parameterName: `/bellyfed/${envName}/eventbridge/restaurant-event-bus-arn`,
            description: 'ARN for the restaurant event bus',
            stringValue: this.eventBus.eventBusArn,
        });

        // Output the event bus ARN
        new cdk.CfnOutput(this, 'RestaurantEventBusArn', {
            value: this.eventBus.eventBusArn,
            description: 'Restaurant Event Bus ARN',
            exportName: `RestaurantEventBusArn-${envName}`,
        });
    }
}
