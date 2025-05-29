/**
 * Review SQS Stack
 *
 * This stack creates SQS queues for review-related operations:
 * - review-creation-queue: Primary queue for review creation events
 * - review-creation-dlq: Dead letter queue for failed review creation events
 * - review-update-queue: Primary queue for review update events
 * - review-update-dlq: Dead letter queue for failed review update events
 * - review-deletion-queue: Primary queue for review deletion events
 * - review-deletion-dlq: Dead letter queue for failed review deletion events
 */

import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export class ReviewSqsStack extends cdk.Stack {
    public readonly creationQueue: sqs.Queue;
    public readonly creationDlq: sqs.Queue;
    public readonly updateQueue: sqs.Queue;
    public readonly updateDlq: sqs.Queue;
    public readonly deletionQueue: sqs.Queue;
    public readonly deletionDlq: sqs.Queue;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const envName = process.env.ENVIRONMENT || 'dev';

        // Create DLQ for review creation
        this.creationDlq = new sqs.Queue(this, `ReviewCreationDLQ-${envName}`, {
            queueName: `review-creation-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
        });

        // Create main queue for review creation with DLQ
        this.creationQueue = new sqs.Queue(this, `ReviewCreationQueue-${envName}`, {
            queueName: `review-creation-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes, matching Lambda execution timeout
            retentionPeriod: cdk.Duration.days(4),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            deadLetterQueue: {
                queue: this.creationDlq,
                maxReceiveCount: 3, // After 3 failed processing attempts, send to DLQ
            },
        });

        // Create DLQ for review update
        this.updateDlq = new sqs.Queue(this, `ReviewUpdateDLQ-${envName}`, {
            queueName: `review-update-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
        });

        // Create main queue for review update with DLQ
        this.updateQueue = new sqs.Queue(this, `ReviewUpdateQueue-${envName}`, {
            queueName: `review-update-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes, matching Lambda execution timeout
            retentionPeriod: cdk.Duration.days(4),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            deadLetterQueue: {
                queue: this.updateDlq,
                maxReceiveCount: 3, // After 3 failed processing attempts, send to DLQ
            },
        });

        // Create DLQ for review deletion
        this.deletionDlq = new sqs.Queue(this, `ReviewDeletionDLQ-${envName}`, {
            queueName: `review-deletion-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
        });

        // Create main queue for review deletion with DLQ
        this.deletionQueue = new sqs.Queue(this, `ReviewDeletionQueue-${envName}`, {
            queueName: `review-deletion-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300), // 5 minutes, matching Lambda execution timeout
            retentionPeriod: cdk.Duration.days(4),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            deadLetterQueue: {
                queue: this.deletionDlq,
                maxReceiveCount: 3, // After 3 failed processing attempts, send to DLQ
            },
        });

        // Store queue URLs in SSM Parameter Store for reference by other stacks and the frontend
        new ssm.StringParameter(this, `ReviewCreationQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-creation-queue-url`,
            description: 'URL for the review creation SQS queue',
            stringValue: this.creationQueue.queueUrl,
        });

        new ssm.StringParameter(this, `ReviewCreationDlqUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-creation-dlq-url`,
            description: 'URL for the review creation dead-letter SQS queue',
            stringValue: this.creationDlq.queueUrl,
        });

        new ssm.StringParameter(this, `ReviewUpdateQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-update-queue-url`,
            description: 'URL for the review update SQS queue',
            stringValue: this.updateQueue.queueUrl,
        });

        new ssm.StringParameter(this, `ReviewUpdateDlqUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-update-dlq-url`,
            description: 'URL for the review update dead-letter SQS queue',
            stringValue: this.updateDlq.queueUrl,
        });

        new ssm.StringParameter(this, `ReviewDeletionQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-deletion-queue-url`,
            description: 'URL for the review deletion SQS queue',
            stringValue: this.deletionQueue.queueUrl,
        });

        new ssm.StringParameter(this, `ReviewDeletionDlqUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/review-deletion-dlq-url`,
            description: 'URL for the review deletion dead-letter SQS queue',
            stringValue: this.deletionDlq.queueUrl,
        });

        // Output the queue URLs
        new cdk.CfnOutput(this, 'ReviewCreationQueueUrl', {
            value: this.creationQueue.queueUrl,
            description: 'Review Creation Queue URL',
            exportName: `ReviewCreationQueueUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'ReviewCreationDlqUrl', {
            value: this.creationDlq.queueUrl,
            description: 'Review Creation DLQ URL',
            exportName: `ReviewCreationDlqUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'ReviewUpdateQueueUrl', {
            value: this.updateQueue.queueUrl,
            description: 'Review Update Queue URL',
            exportName: `ReviewUpdateQueueUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'ReviewUpdateDlqUrl', {
            value: this.updateDlq.queueUrl,
            description: 'Review Update DLQ URL',
            exportName: `ReviewUpdateDlqUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'ReviewDeletionQueueUrl', {
            value: this.deletionQueue.queueUrl,
            description: 'Review Deletion Queue URL',
            exportName: `ReviewDeletionQueueUrl-${envName}`,
        });

        new cdk.CfnOutput(this, 'ReviewDeletionDlqUrl', {
            value: this.deletionDlq.queueUrl,
            description: 'Review Deletion DLQ URL',
            exportName: `ReviewDeletionDlqUrl-${envName}`,
        });
    }
}
