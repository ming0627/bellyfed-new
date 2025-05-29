# TECH - Event Flow Architecture

## Overview

This document outlines the event flow architecture in the Bellyfed system, providing comprehensive guidance for implementing event-driven patterns.

**Document Owner:** Infrastructure Team  
**Last Updated:** [Current Date]  
**Target Audience:** Developers, Infrastructure Engineers

## System Architecture

### 1. Event Sources

#### 1.1 Cognito Events

- User Signup
- User Confirmation
- User Login
- Password Change

#### 1.2 API Gateway Events

- REST API calls
- WebSocket connections

#### 1.3 Application Events

- User actions
- System events

### 2. Event Processing Components

#### 2.1 Event Bus (EventBridge)

- Default event bus for AWS service events
- Custom event buses for application events
- Event patterns for routing

#### 2.2 Event Targets

##### Primary Targets

- SQS Queues (for buffering and decoupling)
- Lambda Functions (for processing)
- SNS Topics (for fanout)

##### Secondary Targets

- DynamoDB (for persistence)
- CloudWatch (for monitoring)

### 3. Standard Flow Patterns

#### 3.1 User Signup Flow

```
Cognito → EventBridge → SQS → Lambda → DynamoDB
```

- Queue: ${environment}-user-signup-queue
- DLQ: ${environment}-user-signup-dlq
- Lambda: ProcessUserSignup
- Table: Users

#### 3.2 Data Import Flow

```
API Gateway → EventBridge → SQS → Lambda → DynamoDB
```

- Queue: ${environment}-import-queue
- DLQ: ${environment}-import-dlq
- Lambda: ImportProcessor
- Tables: Various

#### 3.3 Analytics Flow

```
Application → EventBridge → SQS → Lambda → Analytics Store
```

- Queue: ${environment}-analytics-queue
- DLQ: ${environment}-analytics-dlq
- Lambda: AnalyticsProcessor
- Destination: Analytics Store

## Implementation Guidelines

### 1. Error Handling Strategy

#### 1.1 Retry Policy

- Maximum attempts: 3
- Backoff: Exponential
- Maximum delay: 5 minutes

#### 1.2 DLQ Strategy

- Retention period: 14 days
- Alerting: CloudWatch Alarm
- Processing: Manual review and replay

### 2. Monitoring Strategy

#### 2.1 Key Metrics

- SQS Queue Length
- DLQ Message Count
- Lambda Errors
- Processing Latency
- Event Success Rate

#### 2.2 Alert Thresholds

- DLQ Messages: Any messages
- Processing Delay: > 5 minutes
- Error Rate: > 1% of total events

## Implementation Reference

### Code Example

```typescript
import { EventFlowPatterns, validateEventFlow } from '../docs/event-flow-architecture';

// Implementing a new flow
const implementation = {
    source: 'Cognito',
    flow: 'Cognito → EventBridge → SQS → Lambda → DynamoDB',
    queues: getQueueNames('UserSignup', 'dev'),
    lambda: 'ProcessUserSignup',
};

// Validate implementation
validateEventFlow('UserSignup', implementation);
```

## Related Documentation

- [TECH - Infrastructure Setup Guide]()
- [TECH - Monitoring and Alerting Standards]()
- [OPS - Event Flow Troubleshooting Guide]()
- [TECH - AWS Service Integration Patterns]()

## Maintenance and Updates

### Review Schedule

- Quarterly review of flow patterns
- Monthly review of monitoring thresholds
- Weekly review of DLQ contents

### Change Process

1. Propose changes via pull request
2. Infrastructure team review
3. Update documentation
4. Update monitoring if required

---

**Note:** This documentation is maintained in sync with the code in `event-flow-architecture.ts`. For implementation details, refer to the TypeScript interfaces and configurations in that file.
