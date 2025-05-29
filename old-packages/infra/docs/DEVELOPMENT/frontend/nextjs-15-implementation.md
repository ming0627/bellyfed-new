# Next.js 15 Implementation Guide

**Document Type:** DEV
**Last Updated:** December 2024
**Owner:** Frontend Team
**Reviewers:** Architecture Team

## Overview

This document provides a guide for implementing Next.js 15 in the Bellyfed application. It covers the migration from the previous architecture to Next.js 15, the implementation of Server Actions, and the integration with the outbox pattern.

## Migration to Next.js 15

Bellyfed has migrated from a previous architecture using CloudFront with Lambda@Edge to Next.js 15 hosted on ECS Fargate. This migration provides several benefits:

1. **Server Actions**: Direct server-side operations without separate API endpoints
2. **Incremental Static Regeneration (ISR)**: Efficient page updates without full rebuilds
3. **Improved Developer Experience**: Better alignment with Next.js development practices
4. **Simplified Architecture**: No need for complex Lambda@Edge functions for routing and authentication

## Next.js 15 Features

### App Router

Next.js 15 uses the App Router, which provides a file-system based router built on top of React Server Components:

```
app/
├── layout.js
├── page.js
├── [country]/
│   ├── layout.js
│   ├── page.js
│   └── restaurants/
│       ├── page.js
│       └── [id]/
│           └── page.js
└── actions/
    ├── auth.js
    ├── restaurants.js
    └── reviews.js
```

### Server Components

Server Components are React components that render on the server. They can:

- Access backend resources directly
- Keep sensitive information on the server
- Reduce the JavaScript bundle size

Example Server Component:

```tsx
// app/[country]/restaurants/page.tsx
import { getRestaurants } from '@/lib/db/restaurants.js';

export default async function RestaurantsPage({ params }) {
    const { country } = params;
    const restaurants = await getRestaurants({ country });

    return (
        <div>
            <h1>Restaurants in {country}</h1>
            <ul>
                {restaurants.map((restaurant) => (
                    <li key={restaurant.id}>
                        <a href={`/${country}/restaurants/${restaurant.id}`}>{restaurant.name}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### Client Components

Client Components are React components that render on the client. They can:

- Use React hooks and state
- Add interactivity and event listeners
- Access browser APIs

Example Client Component:

```tsx
// components/RestaurantSearch.tsx
'use client';

import { useState } from 'react';

export default function RestaurantSearch({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants..."
            />
            <button type="submit">Search</button>
        </form>
    );
}
```

### Server Actions

Server Actions are server functions that can be called directly from client components. They provide a way to perform server-side operations without building a separate API endpoint.

Example Server Action:

```tsx
// app/actions/restaurants.js
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import { auth } from '../../lib/auth/index.js';

// Validation schema
const restaurantSchema = z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
});

export async function createRestaurant(formData) {
    const session = await auth();

    if (!session?.user) {
        return { error: 'Authentication required' };
    }

    // Extract and validate form data
    const name = formData.get('name');
    const address = formData.get('address');
    const city = formData.get('city');
    const country = formData.get('country');

    const validationResult = restaurantSchema.safeParse({
        name,
        address,
        city,
        country,
    });

    if (!validationResult.success) {
        return { error: validationResult.error.message };
    }

    try {
        // Create restaurant in database
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                address,
                city,
                country,
                createdBy: session.user.id,
            },
        });

        // Revalidate restaurants page
        revalidatePath(`/${country}/restaurants`);

        return { success: true, restaurant };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return { error: 'Failed to create restaurant' };
    }
}
```

### Incremental Static Regeneration (ISR)

ISR allows you to update static pages after they've been built without rebuilding the entire site:

```tsx
// app/[country]/restaurants/[id]/page.tsx
import { getRestaurant } from '@/lib/db/restaurants.js';

export async function generateStaticParams() {
    // Generate static pages for popular restaurants
    const popularRestaurants = await getPopularRestaurants();
    return popularRestaurants.map((restaurant) => ({
        country: restaurant.country,
        id: restaurant.id,
    }));
}

export default async function RestaurantPage({ params }) {
    const { country, id } = params;
    const restaurant = await getRestaurant(id);

    return (
        <div>
            <h1>{restaurant.name}</h1>
            <p>
                {restaurant.address}, {restaurant.city}, {restaurant.country}
            </p>
            {/* Restaurant details */}
        </div>
    );
}
```

## Integration with Outbox Pattern

Next.js 15 Server Actions are integrated with the outbox pattern to ensure reliable event delivery to the AWS event-driven architecture:

```tsx
// app/actions/restaurants.js
'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import { createOutboxEventInTransaction } from '../../lib/outbox/index.js';
import { auth } from '../../lib/auth/index.js';

export async function createRestaurant(formData) {
    // ... validation and authentication ...

    try {
        // Create restaurant with transaction to ensure atomicity with outbox event
        const restaurantId = uuidv4();

        const result = await prisma.$transaction(async (tx) => {
            // Create the restaurant
            const restaurant = await tx.restaurant.create({
                data: {
                    id: restaurantId,
                    name,
                    address,
                    city,
                    country,
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
                    country: restaurant.country,
                    createdBy: restaurant.createdBy,
                },
                restaurant.id
            );

            return restaurant;
        });

        // Revalidate restaurants page
        revalidatePath(`/${country}/restaurants`);

        return { success: true, restaurant: result };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return { error: 'Failed to create restaurant' };
    }
}
```

## Deployment on ECS Fargate

The Next.js 15 application is deployed on ECS Fargate to support ISR and Server Actions:

1. **Build Process**: The application is built as a Docker image
2. **Deployment**: The Docker image is deployed to ECS Fargate
3. **Scaling**: ECS Fargate automatically scales based on demand
4. **Monitoring**: CloudWatch monitors the application performance

## Best Practices

1. **Use Server Components**: Use Server Components for data fetching and rendering
2. **Use Client Components**: Use Client Components for interactivity
3. **Use Server Actions**: Use Server Actions for server-side operations
4. **Implement Outbox Pattern**: Use the outbox pattern for reliable event delivery
5. **Optimize for ISR**: Use ISR for efficient page updates
6. **Follow ESM Standards**: Use .js extensions in import statements
7. **Implement Error Handling**: Handle errors gracefully in Server Actions
8. **Validate Input Data**: Validate input data using a schema validation library like Zod

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Server Actions Guide](./server-actions-guide.md)
- [Outbox Pattern Implementation](../../ARCHITECTURE/event-driven/outbox-pattern.md)
- [ECS Fargate Deployment](../../OPERATIONS/deployment/ecs-fargate-stack.md)

---

**Labels:** development, frontend, nextjs, server-actions, outbox-pattern
