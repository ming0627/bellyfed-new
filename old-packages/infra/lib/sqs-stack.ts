import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';

/**
 * Stack that creates the main application SQS queues for the Bellyfed infrastructure.
 *
 * IMPORTANT: This stack should ONLY create the main application queues.
 * Do NOT create DLQs or retry queues here, as they are handled by:
 * - LambdaWithRetry construct for Lambda functions
 * - SqsCreator utility for standalone queues (if needed)
 *
 * Queue Types Created:
 * 1. Import Queue: For data import operations
 * 2. Write Queue: For write operations
 * 3. Analytics Queue: For analytics events
 * 4. Auth Event Queue: For authentication events
 * 5. Query Queue: For query operations
 * 6. User Signup Queue: For user registration events
 *
 * Each queue:
 * - Has a standardized name prefixed with 'bellyfed-'
 * - Is stored in SSM Parameter Store for cross-stack reference
 * - Has appropriate IAM permissions set up
 *
 * Note: DLQs for Lambda functions that process these queues are created automatically
 * by the LambdaWithRetry construct in the Lambda stack.
 */
interface SqsStackProps extends cdk.StackProps {
    environment: string;
}

export class SqsStack extends cdk.Stack {
    public readonly importQueue: sqs.IQueue;
    public readonly writeQueue: sqs.IQueue;
    public readonly analyticsQueue: sqs.IQueue;
    public readonly authEventQueue: sqs.IQueue;
    public readonly queryQueue: sqs.IQueue;
    public readonly userSignupQueue: sqs.IQueue;

    constructor(scope: Construct, id: string, props: SqsStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Common queue properties
        const commonQueueProps = {
            visibilityTimeout: cdk.Duration.seconds(CONFIG.sqs.defaultVisibilityTimeout),
            retentionPeriod: cdk.Duration.days(CONFIG.sqs.defaultRetentionPeriod),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        };

        // Create main queues using centralized configuration
        this.importQueue = new sqs.Queue(this, 'ImportQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.import}-${environment}`,
        });

        this.writeQueue = new sqs.Queue(this, 'WriteQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.write}-${environment}`,
        });

        this.analyticsQueue = new sqs.Queue(this, 'AnalyticsQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.analytics}-${environment}`,
        });

        this.authEventQueue = new sqs.Queue(this, 'AuthEventQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.authEvent}-${environment}`,
        });

        this.queryQueue = new sqs.Queue(this, 'QueryQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.query}-${environment}`,
        });

        this.userSignupQueue = new sqs.Queue(this, 'UserSignupQueue', {
            ...commonQueueProps,
            queueName: `${CONFIG.sqs.queueNamePrefix}-${CONFIG.sqs.queueNames.userSignup}-${environment}`,
        });

        // Helper function to create SSM parameters with consistent naming
        const createSsmParameter = (id: string, queueName: string, queueArn: string) => {
            const paramPath = CONFIG.ssm.sqsPathPattern
                .replace('{environment}', environment)
                .replace('{queue-name}', queueName);

            new ssm.StringParameter(this, id, {
                parameterName: paramPath,
                stringValue: queueArn,
            });
        };

        // Store queue ARNs in SSM Parameter Store using centralized configuration
        createSsmParameter(
            'ImportQueueArn',
            CONFIG.sqs.queueNames.import,
            this.importQueue.queueArn
        );
        createSsmParameter('WriteQueueArn', CONFIG.sqs.queueNames.write, this.writeQueue.queueArn);
        createSsmParameter(
            'AnalyticsQueueArn',
            CONFIG.sqs.queueNames.analytics,
            this.analyticsQueue.queueArn
        );
        createSsmParameter(
            'AuthEventQueueArn',
            CONFIG.sqs.queueNames.authEvent,
            this.authEventQueue.queueArn
        );
        createSsmParameter('QueryQueueArn', CONFIG.sqs.queueNames.query, this.queryQueue.queueArn);
        createSsmParameter(
            'UserSignupQueueArn',
            CONFIG.sqs.queueNames.userSignup,
            this.userSignupQueue.queueArn
        );

        // Create import user with SQS permissions
        const importUser = new iam.User(this, 'ImportUser', {
            userName: `${CONFIG.app.namingPatterns.resourcePrefix}-import-user-${environment}`,
        });

        // Grant permissions to import user
        this.importQueue.grantSendMessages(importUser);
        this.writeQueue.grantSendMessages(importUser);
    }
}
