import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface SharedResourcesStackProps extends cdk.StackProps {
    environment: string;
    slackWebhookUrl?: string;
}

export class SharedResourcesStack extends cdk.Stack {
    public readonly centralizedDLQTopic: sns.ITopic;

    constructor(scope: Construct, id: string, props: SharedResourcesStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Import existing DLQ topic instead of creating a new one
        this.centralizedDLQTopic = sns.Topic.fromTopicArn(
            this,
            'CentralizedDLQTopic',
            `arn:aws:sns:ap-southeast-1:590184067494:staging-centralized-dlq-topic-${environment}`
        );

        // Add Slack notification if webhook URL is provided
        if (props.slackWebhookUrl) {
            this.centralizedDLQTopic.addSubscription(
                new subscriptions.UrlSubscription(props.slackWebhookUrl)
            );
        }
    }

    /**
     * Subscribe a DLQ to the centralized SNS topic
     * @param dlq The DLQ to subscribe
     */
    public subscribeDLQ(dlq: sqs.IQueue): void {
        // Create subscription from DLQ to SNS topic
        this.centralizedDLQTopic.addSubscription(new subscriptions.SqsSubscription(dlq));

        // Grant permissions for SNS to send messages to SQS
        dlq.grantSendMessages(new iam.ServicePrincipal('sns.amazonaws.com'));
    }
}
