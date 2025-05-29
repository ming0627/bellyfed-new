# Next.js 15 Server Actions Guide

**Document Type:** DEV
**Last Updated:** December 2024
**Owner:** Frontend Team
**Reviewers:** Architecture Team

## Overview

This document provides a guide for implementing and using Next.js 15 Server Actions in the Bellyfed application. Server Actions allow you to define asynchronous server functions that can be called directly from your components.

## What are Server Actions?

Server Actions are a Next.js 15 feature that allows you to define server-side functions that can be called directly from client components. They provide a way to perform server-side operations without building a separate API endpoint.

Key benefits:

1. **Simplified Data Mutations**: No need to create separate API endpoints
2. **Progressive Enhancement**: Works even without JavaScript
3. **Optimistic Updates**: Built-in support for optimistic UI updates
4. **Type Safety**: End-to-end type safety with TypeScript
5. **Security**: Automatic CSRF protection

## Implementation in Bellyfed

In the Bellyfed application, Server Actions are used for:

1. **User Authentication**: Login, logout, and profile management
2. **Restaurant Management**: Creating and updating restaurant profiles
3. **Review System**: Submitting reviews and ratings
4. **Search Functionality**: Basic search queries and filtering
5. **Import System**: Bulk data import operations

## Creating a Server Action

Server Actions are defined in files with the `'use server'` directive at the top:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import { auth } from '../../lib/auth/index.js';

// Validation schema
const reviewSchema = z.object({
    restaurantId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
});

/**
 * Creates a new review
 *
 * @param formData - Form data containing review details
 * @returns Result object with success status and review data or error
 */
export async function createReview(formData: FormData) {
    // Get authenticated user
    const session = await auth();

    if (!session?.user) {
        return { error: 'Authentication required' };
    }

    // Extract and validate form data
    const restaurantId = formData.get('restaurantId') as string;
    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;

    const validationResult = reviewSchema.safeParse({
        restaurantId,
        rating,
        comment,
    });

    if (!validationResult.success) {
        return { error: validationResult.error.message };
    }

    try {
        // Create review in database
        const review = await prisma.review.create({
            data: {
                restaurantId,
                userId: session.user.id,
                rating,
                comment,
            },
        });

        // Revalidate restaurant page to show new review
        revalidatePath(`/restaurants/${restaurantId}`);

        return { success: true, review };
    } catch (error) {
        console.error('Error creating review:', error);
        return { error: 'Failed to create review' };
    }
}
```

## Using Server Actions in Components

Server Actions can be used directly in client components:

```tsx
'use client';

import { useState } from 'react';
import { createReview } from '@/app/actions/reviews';

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setSuccess(false);

        const result = await createReview(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setRating(5);
            setComment('');
        }
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="restaurantId" value={restaurantId} />

            <div>
                <label htmlFor="rating">Rating</label>
                <select
                    id="rating"
                    name="rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            <div>
                <label htmlFor="comment">Comment</label>
                <textarea
                    id="comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">Review submitted successfully!</div>}

            <button type="submit">Submit Review</button>
        </form>
    );
}
```

## Server Actions with the Outbox Pattern

For operations that need to be integrated with the AWS event-driven architecture, Server Actions are combined with the outbox pattern:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import { createOutboxEventInTransaction, ImportEventType } from '../../lib/outbox/index.js';
import { auth } from '../../lib/auth/index.js';

// Validation schema
const importJobSchema = z.object({
    sourceId: z.string().uuid(),
    jobType: z.enum(['RESTAURANT', 'DISH', 'MENU']),
    parameters: z.record(z.any()).optional(),
    region: z.string().optional(),
    searchQuery: z.string().optional(),
});

/**
 * Creates a new import job
 *
 * @param formData - Form data containing import job details
 * @returns Result object with success status and job data or error
 */
export async function createImportJob(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        return { error: 'Authentication required' };
    }

    // Extract and validate form data
    const sourceId = formData.get('sourceId') as string;
    const jobType = formData.get('jobType') as string;
    const parametersJson = formData.get('parameters') as string;
    const region = formData.get('region') as string;
    const searchQuery = formData.get('searchQuery') as string;

    let parameters;
    try {
        parameters = parametersJson ? JSON.parse(parametersJson) : {};
    } catch (error) {
        return { error: 'Invalid parameters JSON' };
    }

    const validationResult = importJobSchema.safeParse({
        sourceId,
        jobType,
        parameters,
        region,
        searchQuery,
    });

    if (!validationResult.success) {
        return { error: validationResult.error.message };
    }

    try {
        // Create import job with transaction to ensure atomicity with outbox event
        const jobId = uuidv4();

        const result = await prisma.$transaction(async (tx: any) => {
            // Create the import job
            const job = await tx.importJob.create({
                data: {
                    id: jobId,
                    sourceId,
                    userId: session.user.id,
                    jobType,
                    status: 'PENDING',
                    parameters: parameters || {},
                    region,
                    searchQuery,
                },
            });

            // Create outbox event
            await createOutboxEventInTransaction(
                tx,
                ImportEventType.IMPORT_JOB_CREATED,
                {
                    jobId: job.id,
                    sourceId: job.sourceId,
                    userId: job.userId,
                    jobType: job.jobType,
                    parameters: job.parameters,
                },
                job.id
            );

            return job;
        });

        // Revalidate import jobs page
        revalidatePath('/admin/imports');

        return { success: true, job: result };
    } catch (error) {
        console.error('Error creating import job:', error);
        return { error: 'Failed to create import job' };
    }
}
```

## Best Practices

1. **Validation**: Always validate input data using a schema validation library like Zod
2. **Error Handling**: Implement proper error handling and return meaningful error messages
3. **Authentication**: Check authentication status at the beginning of each Server Action
4. **Transactions**: Use transactions for operations that modify multiple database records
5. **Revalidation**: Use `revalidatePath` or `revalidateTag` to update cached data
6. **Type Safety**: Use TypeScript for end-to-end type safety
7. **Outbox Pattern**: Use the outbox pattern for operations that need to be integrated with AWS event-driven architecture

## References

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Documentation](https://zod.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Outbox Pattern Implementation](../../ARCHITECTURE/event-driven/outbox-pattern.md)
