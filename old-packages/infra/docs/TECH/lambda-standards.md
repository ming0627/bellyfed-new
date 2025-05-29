# Lambda Function Standards

## Overview

This document outlines the standards and best practices for Lambda functions in the Bellyfed infrastructure.

## Structure

### Directory Structure

```
src/functions/[function-name]/
├── handler.ts              # Main handler function
├── schemas/               # Validation schemas
│   └── input.ts          # Input validation schemas
├── types/                # Type definitions
│   └── index.ts         # Type exports
└── README.md            # Function documentation
```

### Handler Structure

```typescript
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';

import { inputSchema } from './schemas/input';
import { HandlerEvent, HandlerResponse } from './types';

const baseHandler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    // Implementation
};

export const handler = middy(baseHandler)
    .use(jsonBodyParser())
    .use(validator({ inputSchema }))
    .use(httpErrorHandler());
```

## Best Practices

### 1. Error Handling

- Use custom error classes
- Always return proper HTTP status codes
- Include meaningful error messages

```typescript
throw new CustomError({
    message: 'Restaurant not found',
    statusCode: 404,
    details: { restaurantId },
});
```

### 2. Input Validation

- Always validate input using JSON Schema
- Define strict types for input/output
- Use middleware for validation

```typescript
export const inputSchema = {
    type: 'object',
    required: ['restaurantId'],
    properties: {
        restaurantId: { type: 'string' },
    },
};
```

### 3. Logging

- Use structured logging
- Include correlation IDs
- Log appropriate detail level

```typescript
logger.info('Processing restaurant query', {
    restaurantId,
    correlationId: event.requestContext.requestId,
});
```

### 4. Performance

- Keep functions focused and small
- Optimize cold starts
- Use connection pooling

```typescript
// ✅ Good - Reuse connections
const dbConnection = await getConnection();

// ❌ Bad - Create new connection each time
const newConnection = await createConnection();
```

### 5. Security

- Never log sensitive data
- Use environment variables for secrets
- Implement proper IAM roles

```typescript
// ✅ Good - Use environment variables
const apiKey = process.env.API_KEY;

// ❌ Bad - Hardcode secrets
const apiKey = 'secret123';
```

### 6. Testing

- Write unit tests for business logic
- Integration tests for API endpoints
- Use test doubles appropriately

```typescript
describe('restaurant query', () => {
    it('should return restaurant details', async () => {
        const result = await handler(mockEvent);
        expect(result.statusCode).toBe(200);
    });
});
```

## Middleware Stack

### Required Middleware

1. `jsonBodyParser`: Parse JSON request bodies
2. `validator`: Validate input against schemas
3. `httpErrorHandler`: Consistent error responses

### Optional Middleware

1. `cors`: For cross-origin requests
2. `httpSecurityHeaders`: Add security headers
3. `ssm`: Load parameters from SSM

## Deployment

### Memory and Timeout

- Default memory: 256MB
- Default timeout: 30 seconds
- Adjust based on function needs

### Environment Variables

- Use SSM for configuration
- Follow naming convention:
    ```
    /bellyfed/{environment}/{function-name}/{variable-name}
    ```

### Monitoring

- Set up CloudWatch alarms
- Monitor key metrics:
    - Duration
    - Error rate
    - Throttling
    - Cold starts

## Documentation

### README Requirements

1. Purpose of the function
2. Input/output examples
3. Dependencies
4. Environment variables
5. Deployment notes

### Code Comments

- Document complex logic
- Explain business rules
- Note any limitations

```typescript
// Calculate weighted score based on:
// - Review recency (40%)
// - User reputation (30%)
// - Review quality (30%)
function calculateScore(review) {
    // Implementation
}
```
