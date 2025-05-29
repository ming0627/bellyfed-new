import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { StackUtils } from '../stack-utils';
import { BaseResourceCreator } from './base-resource-creator';

/**
 * Utility for creating SQS queues with standardized configuration.
 *
 * IMPORTANT: This utility should ONLY be used for creating standalone SQS queues that are NOT associated with Lambda functions.
 * For Lambda function queues (including DLQs and retry queues), use the LambdaWithRetry construct instead.
 *
 * Use cases:
 * 1. Application message queues (e.g., event queues, notification queues)
 * 2. Integration queues between services
 * 3. Batch processing queues
 *
 * Do NOT use for:
 * - Lambda function DLQs (use LambdaWithRetry instead)
 * - Lambda function retry queues (use LambdaWithRetry instead)
 *
 * Features:
 * 1. Optional DLQ with standard retention and encryption
 * 2. SQS-managed encryption by default
 * 3. Standard naming convention
 * 4. Handles existing queues gracefully
 *
 * Usage:
 * ```typescript
 * // Creating a standalone application queue
 * const queue = createSqsQueue(this, 'MyQueue', environment, {
 *   queueName: 'my-application-queue',
 *   enableDlq: true,
 *   maxReceiveCount: 3
 * });
 * ```
 */
export interface SqsQueueProps extends Omit<sqs.QueueProps, 'queueName'> {
    queueName: string;
    enableDlq?: boolean;
    maxReceiveCount?: number;
}

/**
 * Creates an SQS queue with standardized configuration:
 * 1. Optional DLQ with standard retention and encryption
 * 2. SQS-managed encryption by default
 * 3. Standard naming convention
 * 4. Handles existing queues gracefully
 */
export class SqsQueueCreator extends BaseResourceCreator<sqs.IQueue> {
    private props: SqsQueueProps;

    constructor(scope: Construct, id: string, environment: string, props: SqsQueueProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): sqs.IQueue {
        const { enableDlq, maxReceiveCount, queueName, ...queueProps } = this.props;
        const physicalQueueName = StackUtils.createResourceName(queueName, this.environment);

        // Create DLQ if enabled
        let deadLetterQueue: sqs.IQueue | undefined;
        if (enableDlq) {
            const dlqId = `${this.id}DLQ`;
            const physicalDlqName = StackUtils.createResourceName(
                `${queueName}-dlq`,
                this.environment
            );

            try {
                // Try to import existing DLQ first
                deadLetterQueue = sqs.Queue.fromQueueAttributes(this.scope, dlqId, {
                    queueName: physicalDlqName,
                    queueArn: `arn:aws:sqs:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:${physicalDlqName}`,
                });
            } catch {
                // If import fails, create new DLQ
                const newDlq = new sqs.Queue(this.scope, dlqId, {
                    queueName: physicalDlqName,
                    retentionPeriod: Duration.days(14),
                    encryption: sqs.QueueEncryption.SQS_MANAGED,
                    removalPolicy: RemovalPolicy.RETAIN,
                });
                // Add standard tags to DLQ
                this.addStandardTags(newDlq);
                deadLetterQueue = newDlq;
            }
        }

        // Create new queue with DLQ configuration
        const newQueue = new sqs.Queue(this.scope, this.id, {
            ...queueProps,
            queueName: physicalQueueName,
            encryption: this.props.encryption || sqs.QueueEncryption.SQS_MANAGED,
            retentionPeriod: this.props.retentionPeriod || Duration.days(4),
            visibilityTimeout: this.props.visibilityTimeout || Duration.seconds(30),
            deadLetterQueue: deadLetterQueue
                ? {
                      queue: deadLetterQueue,
                      maxReceiveCount: maxReceiveCount || 3,
                  }
                : undefined,
            removalPolicy: RemovalPolicy.RETAIN,
        });
        return newQueue;
    }

    protected getResourceType(): string {
        return 'sqs';
    }
}

/**
 * Helper function to create an SQS queue with standard configuration
 */
export function createSqsQueue(
    scope: Construct,
    id: string,
    environment: string,
    props: SqsQueueProps
): sqs.IQueue {
    return new SqsQueueCreator(scope, id, environment, props).create();
}
