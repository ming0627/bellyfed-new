/**
 * User Account SQS Stack
 *
 * This stack creates SQS queues for user account events:
 * - User registration
 * - User profile update
 * - User deletion
 */

import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as _iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';

export class UserAccountSqsStack extends cdk.NestedStack {
    public readonly registrationQueue: sqs.Queue;
    public readonly updateQueue: sqs.Queue;
    public readonly deletionQueue: sqs.Queue;
    public readonly registrationDlq: sqs.Queue;
    public readonly updateDlq: sqs.Queue;
    public readonly deletionDlq: sqs.Queue;

    constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
        super(scope, id, props);

        // Get environment name
        const envName = process.env.ENVIRONMENT || 'dev';

        // Create dead-letter queues
        this.registrationDlq = new sqs.Queue(this, `UserRegistrationDLQ-${envName}`, {
            queueName: `user-registration-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
        });

        this.updateDlq = new sqs.Queue(this, `UserUpdateDLQ-${envName}`, {
            queueName: `user-update-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
        });

        this.deletionDlq = new sqs.Queue(this, `UserDeletionDLQ-${envName}`, {
            queueName: `user-deletion-dlq-${envName}`,
            retentionPeriod: cdk.Duration.days(14),
        });

        // Create main queues
        this.registrationQueue = new sqs.Queue(this, `UserRegistrationQueue-${envName}`, {
            queueName: `user-registration-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300),
            retentionPeriod: cdk.Duration.days(7),
            deadLetterQueue: {
                queue: this.registrationDlq,
                maxReceiveCount: 3,
            },
        });

        this.updateQueue = new sqs.Queue(this, `UserUpdateQueue-${envName}`, {
            queueName: `user-update-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300),
            retentionPeriod: cdk.Duration.days(7),
            deadLetterQueue: {
                queue: this.updateDlq,
                maxReceiveCount: 3,
            },
        });

        this.deletionQueue = new sqs.Queue(this, `UserDeletionQueue-${envName}`, {
            queueName: `user-deletion-queue-${envName}`,
            visibilityTimeout: cdk.Duration.seconds(300),
            retentionPeriod: cdk.Duration.days(7),
            deadLetterQueue: {
                queue: this.deletionDlq,
                maxReceiveCount: 3,
            },
        });

        // Store queue URLs in SSM Parameter Store
        new ssm.StringParameter(this, `UserRegistrationQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/user-registration-queue-url`,
            description: 'URL for the user registration queue',
            stringValue: this.registrationQueue.queueUrl,
        });

        new ssm.StringParameter(this, `UserUpdateQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/user-update-queue-url`,
            description: 'URL for the user update queue',
            stringValue: this.updateQueue.queueUrl,
        });

        new ssm.StringParameter(this, `UserDeletionQueueUrl-${envName}`, {
            parameterName: `/bellyfed/${envName}/sqs/user-deletion-queue-url`,
            description: 'URL for the user deletion queue',
            stringValue: this.deletionQueue.queueUrl,
        });

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', envName);
        cdk.Tags.of(this).add('Service', 'UserAccountSQS');
        cdk.Tags.of(this).add('ManagedBy', 'CDK');
    }
}
