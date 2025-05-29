import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { BaseResourceCreator } from './base-resource-creator';
import { StackUtils } from '../stack-utils';

export interface EventBusProps extends Omit<events.EventBusProps, 'eventBusName'> {
    eventBusName: string;
}

export interface EventRuleProps extends Omit<events.RuleProps, 'ruleName'> {
    ruleName: string;
}

/**
 * Creates an EventBridge bus with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 * 3. ARN storage in SSM
 */
export class EventBusCreator extends BaseResourceCreator<events.EventBus> {
    private props: EventBusProps;

    constructor(scope: Construct, id: string, environment: string, props: EventBusProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): events.EventBus {
        const { eventBusName, ...busProps } = this.props;

        return new events.EventBus(this.scope, this.id, {
            ...busProps,
            eventBusName: StackUtils.createResourceName(eventBusName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'eventbus';
    }
}

/**
 * Creates an EventBridge rule with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 */
export class EventRuleCreator extends BaseResourceCreator<events.Rule> {
    private props: EventRuleProps;

    constructor(scope: Construct, id: string, environment: string, props: EventRuleProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): events.Rule {
        const { ruleName, ...ruleProps } = this.props;

        return new events.Rule(this.scope, this.id, {
            ...ruleProps,
            ruleName: StackUtils.createResourceName(ruleName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'rule';
    }
}

/**
 * Helper functions to create EventBridge resources with standard configuration
 */
export function createEventBus(
    scope: Construct,
    id: string,
    environment: string,
    props: EventBusProps
): events.EventBus {
    return new EventBusCreator(scope, id, environment, props).create();
}

export function createEventRule(
    scope: Construct,
    id: string,
    environment: string,
    props: EventRuleProps
): events.Rule {
    return new EventRuleCreator(scope, id, environment, props).create();
}
