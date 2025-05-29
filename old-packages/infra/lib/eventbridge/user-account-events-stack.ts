/**
 * User Account Events Stack
 *
 * This stack creates EventBridge resources for user account events:
 * - Event bus for user account events
 * - Rules for routing events to the appropriate targets
 */

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export interface UserAccountEventsStackProps extends cdk.NestedStackProps {
    userAccountProcessorFunction: lambda.Function;
}

export class UserAccountEventsStack extends cdk.NestedStack {
    public readonly eventBus: events.EventBus;

    constructor(scope: Construct, id: string, props: UserAccountEventsStackProps) {
        super(scope, id, props);

        // Get environment name
        const envName = process.env.ENVIRONMENT || 'dev';

        // Create event bus
        this.eventBus = new events.EventBus(this, `UserAccountEventBus-${envName}`, {
            eventBusName: `user-account-event-bus-${envName}`,
        });

        // Create rules for user account events
        const userRegistrationRule = new events.Rule(this, `UserRegistrationRule-${envName}`, {
            eventBus: this.eventBus,
            ruleName: `user-registration-rule-${envName}`,
            description: 'Rule for user registration events',
            eventPattern: {
                source: ['bellyfed.user'],
                detailType: ['UserRegistered'],
            },
        });

        const userUpdateRule = new events.Rule(this, `UserUpdateRule-${envName}`, {
            eventBus: this.eventBus,
            ruleName: `user-update-rule-${envName}`,
            description: 'Rule for user update events',
            eventPattern: {
                source: ['bellyfed.user'],
                detailType: ['UserUpdated'],
            },
        });

        const userDeletionRule = new events.Rule(this, `UserDeletionRule-${envName}`, {
            eventBus: this.eventBus,
            ruleName: `user-deletion-rule-${envName}`,
            description: 'Rule for user deletion events',
            eventPattern: {
                source: ['bellyfed.user'],
                detailType: ['UserDeleted'],
            },
        });

        // Add Lambda function as target for rules
        userRegistrationRule.addTarget(
            new targets.LambdaFunction(props.userAccountProcessorFunction)
        );

        userUpdateRule.addTarget(new targets.LambdaFunction(props.userAccountProcessorFunction));

        userDeletionRule.addTarget(new targets.LambdaFunction(props.userAccountProcessorFunction));

        // Store event bus name in SSM Parameter Store
        new ssm.StringParameter(this, `UserAccountEventBusName-${envName}`, {
            parameterName: `/bellyfed/${envName}/eventbridge/user-account-event-bus-name`,
            description: 'Name of the user account event bus',
            stringValue: this.eventBus.eventBusName,
        });

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', envName);
        cdk.Tags.of(this).add('Service', 'UserAccountEvents');
        cdk.Tags.of(this).add('ManagedBy', 'CDK');
    }
}
