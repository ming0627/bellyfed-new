# Middleware Layer

## Overview

The middleware layer provides a set of reusable components and utilities for Lambda functions in the Oishiiteru infrastructure. It standardizes common functionality like error handling, input validation, and tracing across all Lambda functions.

## Components

### Middleware

#### 1. Tracing Middleware

Automatically adds a unique trace ID to each request context, enabling distributed tracing across the system.

```typescript
import { tracingMiddleware } from '/opt/nodejs/middlewares';

// Usage
export const handler = middy(baseHandler).use(tracingMiddleware());
```

#### 2. Error Handler

Provides standardized error handling and response formatting.

```typescript
import { errorHandler } from '/opt/nodejs/middlewares';

// Usage
export const handler = middy(baseHandler)
    .use(errorHandler());

// Response Format
{
    "message": "Error message",
    "traceId": "uuid-trace-id",
    "statusCode": 400
}
```

#### 3. Validation

Input validation using Joi schemas.

```typescript
import { validation } from '/opt/nodejs/middlewares';
import * as Joi from 'joi';

const schema = Joi.object({
    id: Joi.string().required(),
});

// Usage
export const handler = middy(baseHandler).use(validation({ schema }));
```

### Utilities

#### 1. EventBridge Utility

Standardized event emission to EventBridge.

```typescript
import { sendToEventBridge, StandardEvent } from '/opt/nodejs/utils';

const event: StandardEvent = {
    event_type: 'USER_ACTION',
    source: 'my-service',
    detail: {
        /* event details */
    },
};

await sendToEventBridge(event, eventBusName, 'USER_ACTION');
```

#### 2. SQS Utility

Simplified SQS message sending.

```typescript
import { sendToSQS } from '/opt/nodejs/utils';

await sendToSQS(queueUrl, message);
```

## Best Practices

1. **Always Include Tracing**

    - Use tracingMiddleware in all Lambda functions
    - Pass traceId to downstream services

2. **Validation**

    - Define schemas for all input parameters
    - Use appropriate Joi validators
    - Keep schemas in a separate file for reusability

3. **Error Handling**

    - Use ApplicationError for business logic errors
    - Include appropriate status codes
    - Always include traceId in error responses

4. **Event Standards**
    - Use StandardEvent interface for all events
    - Include required metadata (timestamp, version)
    - Use consistent event naming

## Implementation Guide

### Setting Up Middleware

1. **Install Dependencies**

    ```bash
    npm install @middy/core joi
    ```

2. **Configure Middleware**

    ```typescript
    import middy from '@middy/core';
    import { tracingMiddleware, errorHandler, validation } from '/opt/nodejs/middlewares';

    export const handler = middy(baseHandler)
        .use(tracingMiddleware())
        .use(errorHandler())
        .use(validation({ schema }));
    ```

3. **Test Implementation**
    - Verify traceId propagation
    - Test error scenarios
    - Validate input handling
