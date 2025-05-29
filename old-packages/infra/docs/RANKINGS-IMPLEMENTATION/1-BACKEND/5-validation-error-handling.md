# 5. Validation and Error Handling Implementation

This document outlines the implementation plan for validation and error handling for the Rankings feature.

## Overview

Proper validation and error handling are essential for a robust API. This implementation will:

- Validate all input data before processing
- Provide clear and consistent error messages
- Handle different types of errors appropriately
- Log errors for debugging and monitoring

## Implementation Tasks

### 1. Input Validation

- [ ] Create validation schemas

    - File: `src/lib/validation/schemas.ts`
    - Implement schemas for dish data
    - Implement schemas for ranking data
    - Implement schemas for photo upload

- [ ] Create validation utility functions
    - File: `src/lib/validation/index.ts`
    - Implement function to validate request data against schemas
    - Add helper functions for common validation patterns

### 2. Error Handling

- [ ] Create error handling middleware

    - File: `src/middleware/errorHandler.ts`
    - Implement middleware to catch and format errors
    - Handle different types of errors (validation, database, authentication, etc.)
    - Provide appropriate HTTP status codes

- [ ] Create custom error classes
    - File: `src/lib/errors.ts`
    - Implement custom error classes for different error types
    - Add metadata to errors for better debugging

### 3. Error Logging

- [ ] Create error logging utility
    - File: `src/lib/logger.ts`
    - Implement function to log errors
    - Add context information to logs
    - Configure different log levels

### 4. Response Formatting

- [ ] Create response formatting utility
    - File: `src/lib/api/responseFormatter.ts`
    - Implement function to format success responses
    - Implement function to format error responses
    - Ensure consistent response structure

## Implementation Details

### Validation Schemas

```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

// Dish schema
export const dishSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(255)
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    restaurantName: z.string().min(1, 'Restaurant name is required').max(255),
    category: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isVegetarian: z.boolean().default(false),
    spicyLevel: z.number().int().min(0).max(5).default(0),
    price: z.number().positive().optional(),
    countryCode: z.string().max(10).optional(),
});

// Ranking schema
export const rankingSchema = z
    .object({
        dishId: z.string().uuid('Invalid dish ID'),
        restaurantId: z.string().uuid('Invalid restaurant ID'),
        dishType: z.string().optional(),
        rank: z.number().int().min(1).max(5).optional(),
        tasteStatus: z.enum(['ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED']).optional(),
        notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
        photoUrls: z.array(z.string().url('Invalid photo URL')).optional(),
    })
    .refine((data) => (data.rank !== undefined) !== (data.tasteStatus !== undefined), {
        message: 'Either rank or tasteStatus must be provided, but not both',
        path: ['rank', 'tasteStatus'],
    });

// Photo upload schema
export const photoUploadSchema = z.object({
    contentType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
        errorMap: () => ({ message: 'Content type must be a valid image type' }),
    }),
});
```

### Validation Utility

```typescript
// src/lib/validation/index.ts
import { z } from 'zod';

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

export function validate<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};

            error.errors.forEach((err) => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });

            return {
                success: false,
                errors,
            };
        }

        return {
            success: false,
            errors: {
                _error: 'Validation failed',
            },
        };
    }
}

// Validation functions for specific schemas
export function validateDish(data: unknown): ValidationResult<z.infer<typeof dishSchema>> {
    return validate(dishSchema, data);
}

export function validateRanking(data: unknown): ValidationResult<z.infer<typeof rankingSchema>> {
    return validate(rankingSchema, data);
}

export function validatePhotoUpload(
    data: unknown
): ValidationResult<z.infer<typeof photoUploadSchema>> {
    return validate(photoUploadSchema, data);
}
```

### Custom Error Classes

```typescript
// src/lib/errors.ts
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string>;

    constructor(message: string, errors: Record<string, string>) {
        super(message, 400, true);
        this.errors = errors;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, true);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, true);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, true);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, true);
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false);
    }
}
```

### Error Handling Middleware

```typescript
// src/middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export function withErrorHandler(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            await handler(req, res);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                    errors: error.errors,
                });
            }

            if (error instanceof AppError) {
                // Log operational errors
                if (!error.isOperational) {
                    logger.error({
                        message: error.message,
                        stack: error.stack,
                        path: req.url,
                        method: req.method,
                    });
                }

                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }

            // Unexpected errors
            logger.error({
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                path: req.url,
                method: req.method,
            });

            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    };
}
```

### Logger Utility

```typescript
// src/lib/logger.ts
interface LogData {
    message: string;
    stack?: string;
    [key: string]: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    info(data: LogData | string) {
        if (typeof data === 'string') {
            data = { message: data };
        }

        console.log(
            JSON.stringify({
                level: 'info',
                timestamp: new Date().toISOString(),
                ...data,
            })
        );
    }

    error(data: LogData | string) {
        if (typeof data === 'string') {
            data = { message: data };
        }

        console.error(
            JSON.stringify({
                level: 'error',
                timestamp: new Date().toISOString(),
                ...data,
            })
        );

        // In development, also log the stack trace in a readable format
        if (this.isDevelopment && data.stack) {
            console.error(data.stack);
        }
    }

    warn(data: LogData | string) {
        if (typeof data === 'string') {
            data = { message: data };
        }

        console.warn(
            JSON.stringify({
                level: 'warn',
                timestamp: new Date().toISOString(),
                ...data,
            })
        );
    }

    debug(data: LogData | string) {
        if (!this.isDevelopment) return;

        if (typeof data === 'string') {
            data = { message: data };
        }

        console.debug(
            JSON.stringify({
                level: 'debug',
                timestamp: new Date().toISOString(),
                ...data,
            })
        );
    }
}

export const logger = new Logger();
```

### Response Formatter

```typescript
// src/lib/api/responseFormatter.ts
export function formatSuccessResponse<T>(data: T, meta?: Record<string, any>) {
    return {
        success: true,
        data,
        ...(meta ? { meta } : {}),
    };
}

export function formatErrorResponse(
    error: string,
    errors?: Record<string, string>,
    meta?: Record<string, any>
) {
    return {
        success: false,
        error,
        ...(errors ? { errors } : {}),
        ...(meta ? { meta } : {}),
    };
}

export function formatPaginatedResponse<T>(
    data: T[],
    page: number,
    pageSize: number,
    totalItems: number
) {
    const totalPages = Math.ceil(totalItems / pageSize);

    return formatSuccessResponse(data, {
        pagination: {
            page,
            pageSize,
            totalPages,
            totalItems,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    });
}
```

### API Route with Validation and Error Handling

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthResult } from '@/middleware/auth';
import { withErrorHandler } from '@/middleware/errorHandler';
import {
    getRankingByDishSlug,
    createRanking,
    updateRanking,
    deleteRanking,
} from '@/services/rankingService';
import { getDishBySlug } from '@/services/dishService';
import {
    userCanModifyRankingByDishSlug,
    getRankingIdByDishSlugAndUserId,
} from '@/lib/authorization';
import { validateRanking } from '@/lib/validation';
import { formatSuccessResponse } from '@/lib/api/responseFormatter';
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors';

async function handler(req: NextApiRequest, res: NextApiResponse, authResult: AuthResult) {
    const { dishSlug } = req.query as { dishSlug: string };
    const userId = authResult.userId!;

    // GET: Get user's ranking for a dish
    if (req.method === 'GET') {
        const ranking = await getRankingByDishSlug(dishSlug, userId);
        return res.status(200).json(formatSuccessResponse(ranking));
    }

    // POST: Create a new ranking
    if (req.method === 'POST') {
        // Validate input
        const validationResult = validateRanking(req.body);
        if (!validationResult.success) {
            throw new ValidationError('Invalid input', validationResult.errors!);
        }

        // Get dish by slug
        const dish = await getDishBySlug(dishSlug);
        if (!dish) {
            throw new NotFoundError('Dish not found');
        }

        // Check if ranking already exists
        const existingRankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
        if (existingRankingId) {
            throw new ConflictError('Ranking already exists');
        }

        // Create ranking
        const ranking = await createRanking({
            ...validationResult.data!,
            userId,
            dishId: dish.id,
        });

        return res.status(201).json(formatSuccessResponse(ranking));
    }

    // PUT: Update an existing ranking
    if (req.method === 'PUT') {
        // Validate input
        const validationResult = validateRanking(req.body);
        if (!validationResult.success) {
            throw new ValidationError('Invalid input', validationResult.errors!);
        }

        // Check if user can modify the ranking
        const canModify = await userCanModifyRankingByDishSlug(userId, dishSlug);
        if (!canModify) {
            throw new NotFoundError('Ranking not found');
        }

        // Get ranking ID
        const rankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
        if (!rankingId) {
            throw new NotFoundError('Ranking not found');
        }

        // Update ranking
        const ranking = await updateRanking(rankingId, validationResult.data!);

        return res.status(200).json(formatSuccessResponse(ranking));
    }

    // DELETE: Delete a ranking
    if (req.method === 'DELETE') {
        // Check if user can modify the ranking
        const canModify = await userCanModifyRankingByDishSlug(userId, dishSlug);
        if (!canModify) {
            throw new NotFoundError('Ranking not found');
        }

        // Get ranking ID
        const rankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
        if (!rankingId) {
            throw new NotFoundError('Ranking not found');
        }

        // Delete ranking
        await deleteRanking(rankingId);

        return res.status(200).json(formatSuccessResponse({ deleted: true }));
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json(formatErrorResponse(`Method ${req.method} not allowed`));
}

export default withAuth(withErrorHandler(handler));
```

## Testing

- [ ] Write unit tests for validation schemas
- [ ] Test error handling middleware
- [ ] Verify logger functionality
- [ ] Test response formatting

## Dependencies

- Zod for validation
- Next.js for API routes

## Estimated Time

- Input Validation: 1 day
- Error Handling: 1 day
- Error Logging: 0.5 day
- Response Formatting: 0.5 day
- Testing: 1 day

Total: 4 days
