# Event Bus Architecture

## Overview

This document outlines the event bus architecture used in the Bellyfed platform, detailing the organization of different event types and their respective handling patterns.

## Table of Contents

- [Event Bus Categories](#event-bus-categories)
- [Naming Conventions](#naming-conventions)
- [Event Patterns](#event-patterns)
- [Best Practices](#best-practices)
- [Implementation Examples](#implementation-examples)

## Event Bus Categories

### Domain Events (`bellyfed-domain-*`)

Core business domain events that represent state changes in the system.

#### User Domain Bus

- **Name Pattern**: `bellyfed-domain-user-${environment}`
- **Purpose**: Handles user-related business events
- **Event Types**:
    - Profile updates
    - Preference changes
    - Account state changes
    - User interactions with core features

#### Auth Domain Bus

- **Name Pattern**: `bellyfed-domain-auth-${environment}`
- **Purpose**: Authentication and authorization events
- **Event Types**:
    - Login attempts
    - Password changes
    - Permission updates
    - Session management

### Infrastructure Events (`bellyfed-infra-*`)

System-level and operational events.

#### System Infrastructure Bus

- **Name Pattern**: `bellyfed-infra-system-${environment}`
- **Purpose**: System operations and maintenance
- **Event Types**:
    - Data imports/exports
    - System maintenance
    - Resource scaling events
    - Health checks

### Analytics Events (`bellyfed-analytics-*`)

Events related to business intelligence and user behavior.

#### Analytics Bus

- **Name Pattern**: `bellyfed-analytics-${environment}`
- **Purpose**: Tracking and analysis of user behavior and system metrics
- **Event Types**:
    - Page views
    - Feature usage metrics
    - User engagement data
    - Business metrics
    - Performance data

## Naming Conventions

### Event Bus Names

```
[service-name]-[category]-[domain]-[environment]
```

- **service-name**: Always 'bellyfed'
- **category**: One of: domain, infra, analytics
- **domain**: Specific domain area (user, auth, system)
- **environment**: Deployment environment (dev, staging, prod)

### Event Names

```
[domain].[entity].[action]
```

Example: `user.profile.updated`, `auth.password.changed`

## Event Patterns

### Domain Events

```typescript
{
  source: ['bellyfed.user'],
  detail-type: ['ProfileUpdated', 'PreferencesChanged']
}
```

### Infrastructure Events

```typescript
{
  source: ['bellyfed.system'],
  detail-type: ['ImportStarted', 'MaintenanceScheduled']
}
```

### Analytics Events

```typescript
{
  source: ['bellyfed.analytics'],
  detail-type: ['PageView', 'FeatureUsage', 'UserBehavior']
}
```

## Best Practices

### Event Publishing

1. **Event Bus Selection**

    - Use the most specific event bus for your use case
    - Avoid cross-domain event publishing
    - Consider event volume and criticality

2. **Event Design**

    - Keep events small and focused
    - Include necessary context but avoid over-sharing
    - Use consistent naming patterns

3. **Error Handling**
    - Implement dead-letter queues for failed events
    - Set appropriate retry policies
    - Monitor event delivery failures

### Event Consumption

1. **Processing**

    - Use appropriate timeout values for your use case
    - Implement idempotent consumers
    - Handle partial failures gracefully

2. **Scaling**
    - Monitor event volumes
    - Set appropriate batch sizes
    - Configure concurrent execution limits

## Implementation Examples

### Publishing to Domain Bus

```typescript
// Example of publishing a user profile update event
const event = {
    source: 'bellyfed.user',
    detailType: 'ProfileUpdated',
    detail: {
        userId: 'user123',
        updatedFields: ['name', 'email'],
        timestamp: new Date().toISOString(),
    },
};

await eventBridge
    .putEvents({
        Entries: [
            {
                ...event,
                EventBusName: `bellyfed-domain-user-${environment}`,
            },
        ],
    })
    .promise();
```

### Publishing to Analytics Bus

```typescript
// Example of publishing a feature usage event
const event = {
    source: 'bellyfed.analytics',
    detailType: 'FeatureUsage',
    detail: {
        featureId: 'search',
        userId: 'user123',
        duration: 120,
        timestamp: new Date().toISOString(),
    },
};

await eventBridge
    .putEvents({
        Entries: [
            {
                ...event,
                EventBusName: `bellyfed-analytics-${environment}`,
            },
        ],
    })
    .promise();
```

## Related Documentation

- [Event Processing Guide](../engineering/event-processing/overview.md)
- [Event Quick Reference](../engineering/event-processing/quick-reference.md)
- [Event Schema Definitions](../engineering/event-processing/schemas.md)
