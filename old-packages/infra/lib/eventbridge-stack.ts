// Filename: lib/eventbridge-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { LambdaStack } from './lambda-stack';

/**
 * Stack for EventBridge event buses and rules.
 *
 * This stack manages:
 * 1. Domain Event Buses:
 *    - User domain events (user.registered, etc.)
 *    - Auth domain events (auth.login, auth.logout, etc.)
 *    - System domain events (system.health, system.error, etc.)
 * 2. Analytics Event Bus:
 *    - Handles establishment creation events
 *    - Routes events to analytics processor Lambda
 *
 * Features:
 * - Environment-prefixed bus and rule names
 * - Standard event patterns
 * - Lambda function targets
 * - SQS queue targets for asynchronous processing
 */
interface EventBusConfig {
    id: string;
    description: string;
    rules: EventRuleConfig[];
}

interface EventRuleConfig {
    id: string;
    description: string;
    eventPattern: {
        source: string[];
        'detail-type': string[];
    };
    targets: string[];
}

interface EventBridgeStackProps extends cdk.StackProps {
    environment: string;
    lambdaStack: LambdaStack;
}

export class EventBridgeStack extends cdk.Stack {
    public readonly eventBuses: events.IEventBus[] = [];
    private readonly envName: string;
    private readonly lambdaStack: LambdaStack;

    constructor(scope: Construct, id: string, props: EventBridgeStackProps) {
        super(scope, id, props);

        this.envName = props.environment;
        this.lambdaStack = props.lambdaStack;

        // Create event buses and standard rules
        this.createEventBuses();

        // Add domain-specific event buses
        this.createDomainEventBuses();

        // Setup user registration event handling
        this.setupUserRegistrationEvents();
    }

    private createEventBuses(): void {
        // Log the event bus creation
        console.log(`Creating event buses for environment: ${this.envName}`);
        const eventBusConfigs: EventBusConfig[] = [
            {
                id: 'AnalyticsEventBus',
                description: 'Event bus for analytics events',
                rules: [
                    {
                        id: 'EstablishmentCreateRule',
                        description: 'Rule for handling establishment creation events',
                        eventPattern: {
                            source: ['establishment-writer'],
                            'detail-type': ['ESTABLISHMENT_CREATE'],
                        },
                        targets: ['analyticsProcessor'],
                    },
                ],
            },
        ];

        // Create event buses and rules
        for (const busConfig of eventBusConfigs) {
            const eventBus = new events.EventBus(this, busConfig.id, {
                eventBusName: `bellyfed-${busConfig.id.toLowerCase()}-${this.envName}`,
            });

            // Add description as a tag
            cdk.Tags.of(eventBus).add('Description', String(busConfig.description));
            this.eventBuses.push(eventBus);

            // Export the analytics event bus ARN
            if (busConfig.id === 'AnalyticsEventBus') {
                new cdk.CfnOutput(this, 'MainAnalyticsEventBusArn', {
                    value: eventBus.eventBusArn,
                    description: 'ARN of the analytics event bus',
                    exportName: `${this.stackName}-EventBus-analytics`,
                });
            }

            // Create rules for the event bus
            for (const ruleConfig of busConfig.rules) {
                const ruleName = `bellyfed-${ruleConfig.id.toLowerCase()}-${this.envName}`;
                const ruleTargets: targets.LambdaFunction[] = [];

                // Process targets and collect valid ones
                for (const targetId of ruleConfig.targets) {
                    const lambdaFunction = this.lambdaStack.getHandler(targetId);
                    if (lambdaFunction) {
                        ruleTargets.push(new targets.LambdaFunction(lambdaFunction));
                    } else {
                        console.warn(
                            `Warning: Lambda function "${targetId}" not found. Skipping this target.`
                        );
                        // Use console.warn instead of throwing an error to allow the synth to continue
                    }
                }

                // Only create the rule if we have at least one valid target
                if (ruleTargets.length > 0) {
                    new events.Rule(this, ruleConfig.id, {
                        ruleName,
                        description: String(ruleConfig.description),
                        eventBus,
                        eventPattern: {
                            source: ruleConfig.eventPattern.source,
                            detailType: ruleConfig.eventPattern['detail-type'],
                        },
                        targets: ruleTargets,
                    });
                }
            }
        }
    }

    /**
     * Creates domain-specific event buses for different parts of the system
     */
    private createDomainEventBuses(): void {
        const domainBuses = [
            {
                id: 'UserEventBus',
                name: `bellyfed-domain-user-${this.envName}`,
                description: 'Event bus for user domain events',
            },
            {
                id: 'AuthEventBus',
                name: `bellyfed-domain-auth-${this.envName}`,
                description: 'Event bus for authentication domain events',
            },
            {
                id: 'SystemEventBus',
                name: `bellyfed-infra-system-${this.envName}`,
                description: 'Event bus for system infrastructure events',
            },
            {
                id: 'AnalyticsBus',
                name: `bellyfed-analytics-${this.envName}`,
                description: 'Event bus for analytics events',
            },
        ];

        for (const bus of domainBuses) {
            const eventBus = new events.EventBus(this, bus.id, {
                eventBusName: bus.name,
            });

            // Add description as a tag
            cdk.Tags.of(eventBus).add('Description', bus.description);
            this.eventBuses.push(eventBus);

            // Export the analytics event bus ARN
            if (bus.id === 'AnalyticsBus') {
                new cdk.CfnOutput(this, 'DomainAnalyticsEventBusArn', {
                    value: eventBus.eventBusArn,
                    description: 'ARN of the domain analytics event bus',
                    exportName: `${this.stackName}-EventBus-domain-analytics`,
                });
            }
        }
    }

    /**
     * Sets up event handling for user registration events
     */
    private setupUserRegistrationEvents(): void {
        try {
            // Get the user registration SQS queue ARN from SSM
            let userSignupQueueArnParam;
            try {
                userSignupQueueArnParam = ssm.StringParameter.fromStringParameterName(
                    this,
                    'UserSignupQueueArnParameter',
                    `/bellyfed/${this.envName}/sqs/user-signup-queue-arn`
                );
            } catch (error: unknown) {
                console.warn(
                    'User signup queue not found. Skipping user registration event setup.'
                );
                return;
            }

            // Find the User domain event bus
            const userEventBus = this.eventBuses.find(
                (bus) => bus.eventBusName === `bellyfed-domain-user-${this.envName}`
            );

            if (!userEventBus) {
                console.warn('User event bus not found. Skipping user registration event setup.');
                return;
            }

            // Create rule for user.registered events
            const userRegistrationRule = new events.Rule(
                this,
                `UserRegistrationRule-${this.envName}`,
                {
                    eventBus: userEventBus,
                    description: 'Rule that captures user registration events and routes to SQS',
                    eventPattern: {
                        source: ['bellyfed.cognito'],
                        detailType: ['UserRegistered'],
                    },
                }
            );

            // Get the SQS queue ARN and add as target
            const userSignupQueueArn = userSignupQueueArnParam.stringValue;
            const userSignupQueue = sqs.Queue.fromQueueArn(
                this,
                'UserSignupQueueTarget',
                userSignupQueueArn
            );

            userRegistrationRule.addTarget(new targets.SqsQueue(userSignupQueue));

            // Archive events for each bus (with proper event pattern)
            this.eventBuses.forEach((bus, index) => {
                new events.CfnArchive(this, `EventArchive-${index}-${this.envName}`, {
                    sourceArn: bus.eventBusArn,
                    archiveName: `${bus.eventBusName}-archive`,
                    description: `Archive for ${bus.eventBusName}`,
                    retentionDays: 7,
                    eventPattern: '{"account": ["' + this.account + '"]}', // Minimal pattern to match all events
                });
            });
        } catch (error: unknown) {
            console.warn('Error setting up user registration events:', error);
        }
    }

    public getEventBusNames(): string[] {
        return this.eventBuses.map((bus) => bus.eventBusName);
    }

    /**
     * Gets the main event bus (first one in the array)
     * This is used for compatibility with other stacks that expect a single event bus
     */
    public get eventBus(): events.IEventBus {
        if (this.eventBuses.length === 0) {
            throw new Error('No event buses available in EventBridgeStack');
        }
        return this.eventBuses[0];
    }
}
