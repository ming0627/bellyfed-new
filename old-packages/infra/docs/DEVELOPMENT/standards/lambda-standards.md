# Lambda Function Standards

## Overview

This document outlines the standards and best practices for Lambda functions in the Oishiiteru infrastructure.

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
import { tracingMiddleware, errorHandler, validation } from '/opt/nodejs/middlewares';

// 1. Import schemas and types
// 2. Define constants
// 3. Define helper functions
// 4. Define main handler logic
// 5. Export handler with middleware

export const handler = middy(baseHandler)
    .use(tracingMiddleware())
    .use(validation({ schema }))
    .use(errorHandler());
```

## Standards

### 1. Middleware Usage

- All Lambda functions MUST use the middleware layer
- Required middleware:
    - Tracing middleware
    - Error handler
    - Input validation (where applicable)

### 2. Error Handling

- Use ApplicationError for business logic errors
- Include appropriate HTTP status codes
- Always include traceId in responses
- Log errors with appropriate detail

### 3. Input Validation

- Define Joi schemas for all inputs
- Validate early in the request lifecycle
- Use appropriate Joi types and constraints

### 4. Response Format

```typescript
// Success Response
{
    "data": any,
    "traceId": string
}

// Error Response
{
    "message": string,
    "traceId": string,
    "statusCode": number
}
```

### 5. Logging

- Use appropriate log levels
- Include traceId in all logs
- Log request/response for debugging
- Avoid logging sensitive information

### 6. Performance

- Keep functions focused and small
- Use appropriate memory/timeout settings
- Implement caching where beneficial
- Reuse connections when possible

## Examples

### Basic Lambda Handler

```typescript
import middy from '@middy/core';
import {
    tracingMiddleware,
    errorHandler,
    validation,
    ExtendedContext,
} from '/opt/nodejs/middlewares';
import { inputSchema } from './schemas/input';

async function baseHandler(event: APIGatewayProxyEvent, context: ExtendedContext) {
    const { id } = event.pathParameters;

    // Business logic here
    const result = await someOperation(id);

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: result,
            traceId: context.traceId,
        }),
    };
}

export const handler = middy(baseHandler)
    .use(tracingMiddleware())
    .use(validation({ schema: inputSchema }))
    .use(errorHandler());
```

### Error Handler Example

```typescript
import { ApplicationError } from '/opt/nodejs/errors';

function validateInput(data: unknown): void {
    if (!isValidData(data)) {
        throw new ApplicationError({
            message: 'Invalid input data',
            statusCode: 400,
            details: { data },
        });
    }
}
```
