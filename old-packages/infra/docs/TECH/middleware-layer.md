# Middleware Layer

## Overview

The middleware layer provides a set of reusable components and utilities for Lambda functions in the Bellyfed infrastructure. It standardizes common functionality like error handling, input validation, and tracing across all Lambda functions.

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

Standardizes error responses and logging across all Lambda functions.

```typescript
import { errorHandler } from '/opt/nodejs/middlewares';

// Usage
export const handler = middy(baseHandler).use(errorHandler());
```

#### 3. Validation Middleware

Provides input validation using JSON Schema.

```typescript
import { validationMiddleware } from '/opt/nodejs/middlewares';

// Usage
export const handler = middy(baseHandler).use(validationMiddleware(schema));
```

### Utilities

#### 1. Logger

Structured logging with consistent format and levels.

```typescript
import { logger } from '/opt/nodejs/utils';

logger.info('Processing request', {
    requestId,
    userId,
    operation,
});
```

#### 2. HTTP Response Builder

Standardized HTTP response formatting.

```typescript
import { buildResponse } from '/opt/nodejs/utils';

return buildResponse({
    statusCode: 200,
    body: { data },
});
```

#### 3. Error Classes

Custom error classes for different scenarios.

```typescript
import { ValidationError, NotFoundError, AuthorizationError } from '/opt/nodejs/errors';

throw new NotFoundError('Restaurant not found');
```

## Best Practices

### 1. Middleware Order

```typescript
export const handler = middy(baseHandler)
    .use(tracingMiddleware()) // Always first
    .use(validationMiddleware()) // Validate early
    .use(errorHandler()); // Always last
```

### 2. Error Handling

```typescript
try {
    // Operation
} catch (error) {
    logger.error('Operation failed', {
        error,
        context: { requestId },
    });
    throw error; // Let middleware handle it
}
```

### 3. Logging

```typescript
// ✅ Good - Structured logging
logger.info('Processing request', { requestId });

// ❌ Bad - Unstructured logging
console.log('Processing request', requestId);
```

## Configuration

### Environment Variables

```typescript
LOGGING_LEVEL = info;
TRACING_ENABLED = true;
ERROR_DETAILS_ENABLED = false;
```

### Default Middleware Stack

```typescript
import { defaultMiddleware } from '/opt/nodejs/middlewares';

export const handler = middy(baseHandler).use(defaultMiddleware());
```

## Testing

### Middleware Testing

```typescript
describe('tracingMiddleware', () => {
    it('should add trace ID', async () => {
        const handler = middy(baseHandler).use(tracingMiddleware());
        const response = await handler(event);
        expect(response.headers['X-Trace-ID']).toBeDefined();
    });
});
```

### Utility Testing

```typescript
describe('buildResponse', () => {
    it('should format response correctly', () => {
        const response = buildResponse({
            statusCode: 200,
            body: { data: 'test' },
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
    });
});
```
