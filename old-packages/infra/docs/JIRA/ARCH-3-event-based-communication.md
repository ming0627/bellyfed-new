# ARCH-3: Standardize Event-Based Communication

## Summary

Implement event-based communication between components to reduce direct dependencies and improve system resilience.

## Description

Currently, components have direct dependencies on each other, making the system less flexible and harder to maintain. This task involves implementing event-based communication between components using EventBridge to reduce direct dependencies and improve system resilience.

## Acceptance Criteria

- [ ] Define standard event schemas for key system events
- [ ] Implement EventBridge event bus for component communication
- [ ] Create event producers for key system components
- [ ] Implement event consumers with appropriate error handling
- [ ] Update existing code to use event-based communication
- [ ] Add unit tests for event producers and consumers
- [ ] Update documentation to reflect the new approach

## Technical Details

The implementation should follow this pattern:

```typescript
// Event schema
export interface ComponentUpdatedEvent {
    version: string;
    timestamp: string;
    componentId: string;
    componentType: string;
    status: 'CREATED' | 'UPDATED' | 'DELETED';
    metadata: Record<string, any>;
}

// Event producer
export class EventProducer {
    constructor(private eventBus: events.IEventBus) {}

    async emitComponentUpdated(
        component: IComponent,
        status: 'CREATED' | 'UPDATED' | 'DELETED'
    ): Promise<void> {
        const event: ComponentUpdatedEvent = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            componentId: component.id,
            componentType: component.type,
            status,
            metadata: component.metadata,
        };

        await this.eventBus.putEvents({
            Entries: [
                {
                    Source: 'bellyfed.component',
                    DetailType: 'ComponentUpdated',
                    Detail: JSON.stringify(event),
                },
            ],
        });
    }
}

// Event consumer
export class EventConsumer {
    constructor(private eventBus: events.IEventBus) {
        this.eventBus.addRule('ComponentUpdatedRule', {
            eventPattern: {
                source: ['bellyfed.component'],
                detailType: ['ComponentUpdated'],
            },
            targets: [new targets.LambdaFunction(this.handleComponentUpdated)],
        });
    }

    private handleComponentUpdated(event: ComponentUpdatedEvent): void {
        // Handle the event
        console.log(`Component ${event.componentId} was ${event.status}`);
    }
}
```

## Benefits

- Reduced direct dependencies between components
- Improved system resilience
- Better scalability
- Clearer component boundaries
- Easier to add new components
- Improved testability

## Priority

Medium

## Estimated Story Points

13

## Dependencies

None - can be implemented independently of other tasks

## Attachments

- [Typesense Decoupling Improvements](../TODO/typesense-decoupling-improvements.md)
- [Event-Driven Architecture](../ARCHITECTURE/event-driven/event-flows.md)
