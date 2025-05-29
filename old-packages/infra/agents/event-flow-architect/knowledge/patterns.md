# Event Flow Patterns

Version: v1.0.0
Last Updated: 2024-12-09 11:16:36 +08:00
Status: Active

## Overview

Common patterns and solutions for event-driven architectures in the Bellyfed platform.

## Event Bus Patterns

### Domain-Based Event Buses

- User Events: `bellyfed-domain-user-{environment}`
- Auth Events: `bellyfed-domain-auth-{environment}`
- System Events: `bellyfed-infra-system-{environment}`
- Analytics Events: `bellyfed-analytics-{environment}`

### Event Routing Rules

1. Authentication events -> Auth Event Bus
2. User profile events -> User Event Bus
3. System operations -> System Event Bus
4. Analytics tracking -> Analytics Event Bus

## Message Processing Patterns

### Dead Letter Queue Pattern

```typescript
const dlqHandler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        try {
            // Process failed message
            await processFailedMessage(record);

            // Log recovery attempt
            console.log('Successfully processed failed message:', {
                messageId: record.messageId,
                body: record.body,
            });
        } catch (error) {
            console.error('Failed to process DLQ message:', {
                messageId: record.messageId,
                error: error instanceof Error ? error.message : error,
            });
        }
    }
};
```

### Event Validation Pattern

```typescript
interface EventMessage {
    type: string;
    source: string;
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

function validateEvent(event: EventMessage): void {
    if (!event.type || !event.source || !event.data) {
        throw new Error('Invalid event structure');
    }
}
```

## Error Handling Patterns

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
    private failures = 0;
    private lastFailure: number | null = null;
    private readonly threshold = 5;
    private readonly resetTimeout = 60000; // 1 minute

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.isOpen()) {
            throw new Error('Circuit breaker is open');
        }

        try {
            const result = await operation();
            this.reset();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    private isOpen(): boolean {
        if (this.failures >= this.threshold) {
            if (this.lastFailure && Date.now() - this.lastFailure > this.resetTimeout) {
                this.reset();
                return false;
            }
            return true;
        }
        return false;
    }

    private recordFailure(): void {
        this.failures++;
        this.lastFailure = Date.now();
    }

    private reset(): void {
        this.failures = 0;
        this.lastFailure = null;
    }
}
```

## Monitoring Patterns

### Event Tracking Pattern

```typescript
interface EventMetrics {
    eventType: string;
    processingTime: number;
    status: 'SUCCESS' | 'FAILURE';
    error?: string;
}

async function trackEventMetrics(metrics: EventMetrics): Promise<void> {
    console.log('Event Processing Metrics:', {
        type: metrics.eventType,
        duration: metrics.processingTime,
        status: metrics.status,
        error: metrics.error,
        timestamp: new Date().toISOString(),
    });
}
```
