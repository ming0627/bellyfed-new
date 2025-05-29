/**
 * Restaurant SQS Stack
 *
 * This stack creates SQS queues for restaurant-related operations:
 * - restaurant-creation-queue: Primary queue for restaurant creation events
 * - restaurant-creation-dlq: Dead letter queue for failed restaurant creation events
 * - restaurant-update-queue: Primary queue for restaurant update events
 * - restaurant-update-dlq: Dead letter queue for failed restaurant update events
 */

import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export class RestaurantSqsStack extends cdk.Stack {
    public readonly creationQueue: sqs.Queue;
    public readonly creationDlq: sqs.Queue;
    public readonly updateQueue: sqs.Queue;
    public readonly updateDlq: sqs.Queue;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create DLQ for restaurant creation
        this.creationDlq = new sqs.Queue(this, `RestaurantCreationDLQ-${envName}`, {
            queueName: `restaurant-creation-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
        });

        // Create main queue for restaurant creation with DLQ
        this.creationQueue = new sqs.Queue(this, `RestaurantCreationQueue-${envName}`, {
            queueName: `restaurant-creation-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes, matching Lambda execution timeout
            retentionPeriod: cdk.Duration.days(4),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            deadLetterQueue: {
                queue: this.creationDlq,
                maxReceiveCount: 3, // After 3 failed processing attempts, send to DLQ
            },
        });

        // Create DLQ for restaurant update
        this.updateDlq = new sqs.Queue(this, `RestaurantUpdateDLQ-${envName}`, {
            queueName: `restaurant-update-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
        });

        // Create main queue for restaurant update with DLQ
        this.updateQueue = new sqs.Queue(this, `RestaurantUpdateQueue-${envName}`, {
            queueName: `restaurant-update-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes, matching Lambda execution timeout
            retentionPeriod: cdk.Duration.days(4),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            deadLetterQueue: {
                queue: this.updateDlq,
                maxReceiveCount: 3, // After 3 failed processing attempts, send to DLQ
            },
        });

        // Store queue URLs in SSM Parameter Store for reference by other stacks and the frontend
        new ssm.StringParameter(this, `RestaurantCreationQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/restaurant-creation-queue-url`,
            description: 'URL for the restaurant creation SQS queue',
            stringValue: this.creationQueue.queueUrl,
        });

        new ssm.StringParameter(this, `RestaurantCreationDlqUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/restaurant-creation-dlq-url`,
            description: 'URL for the restaurant creation dead-letter SQS queue',
            stringValue: this.creationDlq.queueUrl,
        });

        new ssm.StringParameter(this, `RestaurantUpdateQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/restaurant-update-queue-url`,
            description: 'URL for the restaurant update SQS queue',
            stringValue: this.updateQueue.queueUrl,
        });

        new ssm.StringParameter(this, `RestaurantUpdateDlqUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/restaurant-update-dlq-url`,
            description: 'URL for the restaurant update dead-letter SQS queue',
            stringValue: this.updateDlq.queueUrl,
        });

        // Output the queue URLs
        new cdk.CfnOutput(this, 'RestaurantCreationQueueUrl', {
            value: this.creationQueue.queueUrl,
            description: 'Restaurant Creation Queue URL',
            exportName: `RestaurantCreationQueueUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'RestaurantCreationDlqUrl', {
            value: this.creationDlq.queueUrl,
            description: 'Restaurant Creation DLQ URL',
            exportName: `RestaurantCreationDlqUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'RestaurantUpdateQueueUrl', {
            value: this.updateQueue.queueUrl,
            description: 'Restaurant Update Queue URL',
            exportName: `RestaurantUpdateQueueUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'RestaurantUpdateDlqUrl', {
            value: this.updateDlq.queueUrl,
            description: 'Restaurant Update DLQ URL',
            exportName: `RestaurantUpdateDlqUrl-${envName}`,
        });
    }
}
