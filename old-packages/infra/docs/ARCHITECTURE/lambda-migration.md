# Lambda Function Migration to Next.js Server Actions

**Document Type:** TECH
**Last Updated:** December 2024
**Owner:** Backend Team
**Reviewers:** Architecture Team

## Overview

This document outlines the migration of Lambda functions to Next.js 15 Server Actions in the Bellyfed application. It identifies which Lambda functions have been replaced by Server Actions and which ones are still in use.

## Migration Strategy

As part of our migration to Next.js 15, we've moved many operations from Lambda functions to Server Actions. This migration:

1. **Improves Developer Experience**: Simplifies development by using a single programming model
2. **Reduces Latency**: Eliminates the need for API Gateway and Lambda cold starts
3. **Enhances Type Safety**: Provides end-to-end type safety with TypeScript
4. **Simplifies Authentication**: Leverages Next.js built-in authentication
5. **Maintains Event-Driven Architecture**: Uses the outbox pattern for event delivery

## Migrated Lambda Functions

The following Lambda functions have been replaced by Next.js 15 Server Actions:

| Lambda Function     | Replacement Server Action     | Location                                       |
| ------------------- | ----------------------------- | ---------------------------------------------- |
| `user-auth`         | Authentication Server Actions | `packages/frontend/app/actions/auth.ts`        |
| `user-profile`      | Profile Server Actions        | `packages/frontend/app/actions/profile.ts`     |
| `restaurant-create` | Restaurant Server Actions     | `packages/frontend/app/actions/restaurants.ts` |
| `restaurant-update` | Restaurant Server Actions     | `packages/frontend/app/actions/restaurants.ts` |
| `review-create`     | Review Server Actions         | `packages/frontend/app/actions/reviews.ts`     |
| `review-update`     | Review Server Actions         | `packages/frontend/app/actions/reviews.ts`     |
| `search-basic`      | Search Server Actions         | `packages/frontend/app/actions/search.ts`      |

## Retained Lambda Functions

The following Lambda functions are still in use:

| Lambda Function         | Purpose                    | Reason for Retention                          |
| ----------------------- | -------------------------- | --------------------------------------------- |
| `outbox-processor`      | Processes outbox events    | Part of the outbox pattern for event delivery |
| `batch-processor`       | Processes import batches   | Handles long-running background tasks         |
| `analytics-service`     | Processes analytics events | Handles high-volume event processing          |
| `recommendation-engine` | Generates recommendations  | Requires specialized compute resources        |
| `media-processor`       | Processes media files      | Requires specialized compute resources        |

## Migration Process

The migration process for each Lambda function follows these steps:

1. **Identify Candidates**: Identify Lambda functions that can be replaced by Server Actions
2. **Create Server Actions**: Implement equivalent functionality as Server Actions
3. **Update Frontend**: Update frontend components to use Server Actions
4. **Implement Outbox Pattern**: Add outbox pattern for event delivery if needed
5. **Test and Validate**: Test the new implementation and validate functionality
6. **Deploy and Monitor**: Deploy the changes and monitor performance
7. **Decommission Lambda**: Remove the Lambda function after successful migration

## Example Migration: Restaurant Creation

### Before: Lambda Function

```typescript
// packages/infra/functions/restaurant-create/index.ts
export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
    try {
        const requestBody = JSON.parse(event.body || '{}');

        // Validate input
        if (!requestBody.name || !requestBody.address) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name and address are required' }),
            };
        }

        // Create restaurant in database
        const restaurant = await createRestaurant(requestBody);

        // Publish event to EventBridge
        await publishEvent('RESTAURANT_CREATED', restaurant);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, restaurant }),
        };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create restaurant' }),
        };
    }
};
```

### After: Server Action with Outbox Pattern

```typescript
// packages/frontend/app/actions/restaurants.ts
'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import { createOutboxEventInTransaction } from '../../lib/outbox/index.js';
import { auth } from '../../lib/auth/index.js';

// Validation schema
const restaurantSchema = z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    cuisine: z.string().optional(),
});

/**
 * Creates a new restaurant
 *
 * @param formData - Form data containing restaurant details
 * @returns Result object with success status and restaurant data or error
 */
export async function createRestaurant(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        return { error: 'Authentication required' };
    }

    // Extract and validate form data
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const postalCode = formData.get('postalCode') as string;
    const phone = formData.get('phone') as string;
    const website = formData.get('website') as string;
    const cuisine = formData.get('cuisine') as string;

    const validationResult = restaurantSchema.safeParse({
        name,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        website,
        cuisine,
    });

    if (!validationResult.success) {
        return { error: validationResult.error.message };
    }

    try {
        // Create restaurant with transaction to ensure atomicity with outbox event
        const restaurantId = uuidv4();

        const result = await prisma.$transaction(async (tx: any) => {
            // Create the restaurant
            const restaurant = await tx.restaurant.create({
                data: {
                    id: restaurantId,
                    name,
                    address,
                    city,
                    state,
                    country,
                    postalCode,
                    phone,
                    website,
                    cuisine,
                    createdBy: session.user.id,
                },
            });

            // Create outbox event
            await createOutboxEventInTransaction(
                tx,
                'RESTAURANT_CREATED',
                {
                    restaurantId: restaurant.id,
                    name: restaurant.name,
                    address: restaurant.address,
                    createdBy: restaurant.createdBy,
                },
                restaurant.id
            );

            return restaurant;
        });

        // Revalidate restaurants page
        revalidatePath('/restaurants');

        return { success: true, restaurant: result };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return { error: 'Failed to create restaurant' };
    }
}
```

## Best Practices

1. **Use Validation**: Always validate input data using a schema validation library like Zod
2. **Implement Authentication**: Check authentication status at the beginning of each Server Action
3. **Use Transactions**: Use transactions for operations that modify multiple database records
4. **Add Outbox Pattern**: Use the outbox pattern for operations that need to be integrated with AWS event-driven architecture
5. **Revalidate Cache**: Use `revalidatePath` or `revalidateTag` to update cached data
6. **Handle Errors**: Implement proper error handling and return meaningful error messages
7. **Add Logging**: Include logging for debugging and monitoring

## References

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Outbox Pattern Implementation](./event-driven/outbox-pattern.md)
- [Server Actions Guide](../TECH/frontend/server-actions-guide.md)
