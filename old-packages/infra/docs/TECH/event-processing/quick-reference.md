# Event Processing Quick Reference

## Event Bus Naming

| Domain/Context        | Event Bus Name                 | Description                         |
| --------------------- | ------------------------------ | ----------------------------------- |
| User Domain           | `bellyfed-domain-user-${env}`  | Business events related to users    |
| Auth Domain           | `bellyfed-domain-auth-${env}`  | Authentication/authorization events |
| System Infrastructure | `bellyfed-infra-system-${env}` | System operations, imports          |
| Analytics             | `bellyfed-analytics-${env}`    | Metrics, usage data                 |

## Available Event Buses

| Bus Name              | Pattern                        | Use Case                            |
| --------------------- | ------------------------------ | ----------------------------------- |
| User Domain           | `bellyfed-domain-user-${env}`  | Business events related to users    |
| Auth Domain           | `bellyfed-domain-auth-${env}`  | Authentication/authorization events |
| System Infrastructure | `bellyfed-infra-system-${env}` | System operations, imports          |
| Analytics             | `bellyfed-analytics-${env}`    | Metrics, usage data                 |

## Common Event Patterns

### User Events

```typescript
{
  source: ['bellyfed.user'],
  detail-type: ['ProfileUpdated', 'PreferencesChanged']
}
```

### Auth Events

```typescript
{
  source: ['bellyfed.auth'],
  detail-type: ['LoginAttempt', 'PasswordChanged']
}
```

### Analytics Events

```typescript
{
  source: ['bellyfed.analytics'],
  detail-type: ['PageView', 'FeatureUsage']
}
```

## Quick Tips

1. Always use the most specific event bus
2. Include timestamp in event details
3. Keep event payloads small
4. Use dead-letter queues for critical events
5. Monitor event delivery failures

See [Event Bus Architecture](../../architecture/event-bus-architecture.md) for detailed documentation.
