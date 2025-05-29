import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { BaseResourceCreator } from './base-resource-creator';
import { StackUtils } from '../stack-utils';

export interface SnsTopicProps extends Omit<sns.TopicProps, 'topicName'> {
    topicName: string;
}

/**
 * Creates an SNS topic with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 * 3. ARN storage in SSM
 */
export class SnsTopicCreator extends BaseResourceCreator<sns.Topic> {
    private props: SnsTopicProps;

    constructor(scope: Construct, id: string, environment: string, props: SnsTopicProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): sns.Topic {
        const { topicName, ...topicProps } = this.props;

        return new sns.Topic(this.scope, this.id, {
            ...topicProps,
            topicName: StackUtils.createResourceName(topicName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'sns';
    }
}

/**
 * Helper function to create an SNS topic with standard configuration
 */
export function createSnsTopic(
    scope: Construct,
    id: string,
    environment: string,
    props: SnsTopicProps
): sns.Topic {
    return new SnsTopicCreator(scope, id, environment, props).create();
}
