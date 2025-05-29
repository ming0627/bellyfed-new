# Outbox Processor Implementation Guide

**Document Type:** DEV
**Last Updated:** December 2024
**Owner:** Backend Team
**Reviewers:** Architecture Team

## Overview

This document provides a guide for implementing the outbox processor in the Bellyfed application. The outbox processor is a Lambda function that polls the database for pending outbox events and publishes them to EventBridge.

## What is the Outbox Processor?

The outbox processor is a key component of the outbox pattern implementation. It:

1. Polls the database for pending outbox events
2. Marks events as processing
3. Publishes events to EventBridge
4. Marks events as processed
5. Handles failures and retries

## Implementation

### Lambda Function

The outbox processor is implemented as a Lambda function in `packages/infra/functions/outbox-processor/index.ts`:

```typescript
// packages/infra/functions/outbox-processor/index.ts
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION });
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'default';
const BATCH_SIZE = 10;

export const handler = async (event: any, context: any) => {
    try {
        console.log('Starting outbox processor');

        // Get pending events
        const pendingEvents = await prisma.outboxEvent.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: BATCH_SIZE,
        });

        if (pendingEvents.length === 0) {
            console.log('No pending events found');
            return { processed: 0 };
        }

        console.log(`Found ${pendingEvents.length} pending events`);

        // Mark events as processing
        const eventIds = pendingEvents.map((event) => event.id);
        await prisma.outboxEvent.updateMany({
            where: { id: { in: eventIds } },
            data: { status: 'PROCESSING' },
        });

        // Process events
        const results = await Promise.allSettled(
            pendingEvents.map(async (event) => {
                try {
                    // Parse payload
                    const payload = JSON.parse(event.payload);

                    // Create EventBridge event
                    const command = new PutEventsCommand({
                        Entries: [
                            {
                                EventBusName: EVENT_BUS_NAME,
                                Source: 'bellyfed.outbox',
                                DetailType: event.eventType,
                                Detail: JSON.stringify({
                                    ...payload,
                                    aggregateId: event.aggregateId,
                                    eventId: event.id,
                                }),
                            },
                        ],
                    });

                    // Publish event to EventBridge
                    const result = await eventBridge.send(command);

                    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
                        throw new Error(`Failed to publish event: ${JSON.stringify(result)}`);
                    }

                    // Mark event as processed
                    await prisma.outboxEvent.update({
                        where: { id: event.id },
                        data: {
                            status: 'PROCESSED',
                            processedAt: new Date(),
                        },
                    });

                    return { eventId: event.id, success: true };
                } catch (error) {
                    console.error(`Error processing event ${event.id}:`, error);

                    // Mark event as failed
                    await prisma.outboxEvent.update({
                        where: { id: event.id },
                        data: { status: 'FAILED' },
                    });

                    return { eventId: event.id, success: false, error };
                }
            })
        );

        const successful = results.filter(
            (result) => result.status === 'fulfilled' && result.value.success
        ).length;
        const failed = results.filter(
            (result) => result.status === 'rejected' || !result.value.success
        ).length;

        console.log(`Processed ${successful} events successfully, ${failed} failed`);

        return { processed: successful, failed };
    } catch (error) {
        console.error('Error in outbox processor:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};
```

### Infrastructure

The outbox processor is deployed as a Lambda function with a CloudWatch Events rule that triggers it on a schedule:

```typescript
// packages/infra/lib/outbox-processor-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class OutboxProcessorStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create Lambda function
        const outboxProcessor = new lambda.Function(this, 'OutboxProcessor', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('functions/outbox-processor'),
            timeout: cdk.Duration.seconds(30),
            environment: {
                EVENT_BUS_NAME: 'bellyfed-events',
                DATABASE_URL: process.env.DATABASE_URL || '',
            },
        });

        // Grant permissions to publish to EventBridge
        outboxProcessor.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: ['*'],
            })
        );

        // Create CloudWatch Events rule to trigger the Lambda function
        const rule = new events.Rule(this, 'OutboxProcessorRule', {
            schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
        });

        // Add the Lambda function as a target for the rule
        rule.addTarget(new targets.LambdaFunction(outboxProcessor));
    }
}
```

## Monitoring

The outbox processor is monitored using CloudWatch:

1. **Metrics**: Lambda invocations, event processing counts, etc.
2. **Logs**: Detailed logs from the outbox processor Lambda
3. **Alarms**: Alarms for failed event processing

```typescript
// packages/infra/lib/outbox-processor-stack.ts
// Add CloudWatch alarm for failed events
const failedEventsAlarm = new cloudwatch.Alarm(this, 'FailedEventsAlarm', {
    metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Errors',
        dimensionsMap: {
            FunctionName: outboxProcessor.functionName,
        },
    }),
    threshold: 1,
    evaluationPeriods: 1,
    alarmDescription: 'Alarm if outbox processor fails to process events',
});
```

## Error Handling and Retries

The outbox processor implements error handling and retries:

1. **Event Status**: Events are marked as PENDING, PROCESSING, PROCESSED, or FAILED
2. **Failed Events**: Failed events are marked as FAILED and can be retried
3. **Retry Logic**: A separate process can retry failed events

```typescript
// packages/infra/functions/outbox-processor-retry/index.ts
export const handler = async (event: any, context: any) => {
    try {
        console.log('Starting outbox processor retry');

        // Get failed events
        const failedEvents = await prisma.outboxEvent.findMany({
            where: { status: 'FAILED' },
            orderBy: { createdAt: 'asc' },
            take: BATCH_SIZE,
        });

        if (failedEvents.length === 0) {
            console.log('No failed events found');
            return { processed: 0 };
        }

        console.log(`Found ${failedEvents.length} failed events`);

        // Mark events as pending for reprocessing
        const eventIds = failedEvents.map((event) => event.id);
        await prisma.outboxEvent.updateMany({
            where: { id: { in: eventIds } },
            data: { status: 'PENDING' },
        });

        return { requeued: failedEvents.length };
    } catch (error) {
        console.error('Error in outbox processor retry:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};
```

## Cleanup

The outbox processor includes a cleanup function that removes processed events after a certain period:

```typescript
// packages/infra/functions/outbox-processor-cleanup/index.ts
export const handler = async (event: any, context: any) => {
    try {
        console.log('Starting outbox processor cleanup');

        // Get processed events older than 7 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        // Delete processed events
        const result = await prisma.outboxEvent.deleteMany({
            where: {
                status: 'PROCESSED',
                processedAt: {
                    lt: cutoffDate,
                },
            },
        });

        console.log(`Deleted ${result.count} processed events`);

        return { deleted: result.count };
    } catch (error) {
        console.error('Error in outbox processor cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};
```

## Best Practices

1. **Batch Processing**: Process events in batches to improve performance
2. **Idempotency**: Ensure event consumers are idempotent to handle duplicate events
3. **Monitoring**: Set up monitoring and alerting for the outbox processor
4. **Error Handling**: Implement proper error handling and retries
5. **Cleanup**: Implement a cleanup process for processed events
6. **Logging**: Include detailed logging for debugging and monitoring
7. **Security**: Implement proper security controls for the outbox processor
8. **Testing**: Test the outbox processor thoroughly

## References

- [Outbox Pattern Implementation](../../ARCHITECTURE/event-driven/outbox-pattern.md)
- [Event-Driven Architecture](../../ARCHITECTURE/event-driven/event-flows.md)
- [Server Actions Guide](../frontend/server-actions-guide.md)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [AWS EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)

---

**Labels:** development, backend, outbox-pattern, lambda, eventbridge
