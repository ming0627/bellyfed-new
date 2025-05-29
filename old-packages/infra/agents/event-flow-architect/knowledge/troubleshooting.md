# Event Flow Troubleshooting Guide

Version: v1.0.0
Last Updated: 2024-12-09 11:16:36 +08:00
Status: Active

## Overview

Problem resolution guides for common event flow issues in the Bellyfed platform.

## Common Issues

### 1. Event Processing Failures

#### Symptoms

- Events in DLQ
- Increased error rates
- Processing timeouts

#### Diagnosis

1. Check CloudWatch logs
2. Review error patterns
3. Analyze message attributes
4. Verify permissions

#### Resolution

1. Review error logs:

```typescript
console.error('Event processing failed:', {
    eventType: event.type,
    error:
        error instanceof Error
            ? {
                  message: error.message,
                  stack: error.stack,
              }
            : error,
    context: {
        requestId: context.awsRequestId,
        timestamp: new Date().toISOString(),
    },
});
```

2. Common fixes:
    - Update IAM permissions
    - Adjust timeout settings
    - Fix validation logic
    - Update error handling

### 2. Event Bus Routing Issues

#### Symptoms

- Events not reaching targets
- Incorrect routing
- Missing events

#### Diagnosis

1. Verify event patterns
2. Check bus permissions
3. Review target configuration
4. Monitor event metrics

#### Resolution

1. Update event patterns:

```json
{
    "source": ["restaurant-query"],
    "detail-type": ["RESTAURANT_GET"],
    "detail": {
        "status": ["SUCCESS", "FAILURE"]
    }
}
```

2. Fix permissions:

```typescript
new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['events:PutEvents'],
    resources: [`arn:aws:events:${region}:${account}:event-bus/bellyfed-analytics-${environment}`],
});
```

### 3. Queue Processing Issues

#### Symptoms

- Long queue depth
- Message timeout
- Visibility timeout issues

#### Diagnosis

1. Monitor queue metrics
2. Check consumer health
3. Review processing logic
4. Analyze throughput

#### Resolution

1. Optimize processing:

```typescript
const queueProcessor = async (event: SQSEvent) => {
    const startTime = Date.now();

    try {
        await Promise.all(
            event.Records.map(async (record) => {
                console.log('Processing message:', {
                    messageId: record.messageId,
                    startTime: new Date().toISOString(),
                });

                await processMessage(record);

                console.log('Message processed:', {
                    messageId: record.messageId,
                    duration: Date.now() - startTime,
                });
            })
        );
    } catch (error) {
        console.error('Queue processing failed:', {
            error: error instanceof Error ? error.message : error,
            duration: Date.now() - startTime,
        });
        throw error;
    }
};
```

2. Adjust queue settings:
    - Increase visibility timeout
    - Enable long polling
    - Adjust batch size
    - Update retry policy

## Performance Issues

### 1. High Latency

#### Symptoms

- Slow event processing
- Increased response times
- Timeouts

#### Diagnosis

1. Monitor processing times
2. Check resource utilization
3. Review concurrent executions
4. Analyze bottlenecks

#### Resolution

1. Implement performance logging:

```typescript
const measurePerformance = async <T>(
    operation: () => Promise<T>,
    context: { name: string; metadata?: Record<string, unknown> }
): Promise<T> => {
    const startTime = Date.now();

    try {
        const result = await operation();

        console.log('Performance metrics:', {
            operation: context.name,
            duration: Date.now() - startTime,
            metadata: context.metadata,
            timestamp: new Date().toISOString(),
        });

        return result;
    } catch (error) {
        console.error('Operation failed:', {
            operation: context.name,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : error,
            metadata: context.metadata,
        });
        throw error;
    }
};
```

2. Optimize resources:
    - Increase memory allocation
    - Enable provisioned concurrency
    - Implement caching
    - Optimize database queries
