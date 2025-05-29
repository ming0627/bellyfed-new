# Prisma Integration Guide

**Document Type:** DEV
**Last Updated:** December 2024
**Owner:** Frontend Team
**Reviewers:** Architecture Team

## Overview

This document provides a guide for integrating Prisma ORM with the Bellyfed application. It covers the setup, schema definition, database operations, and integration with Next.js 15 Server Actions and the outbox pattern.

## What is Prisma?

Prisma is a next-generation ORM that provides a type-safe database client for TypeScript and Node.js. It offers:

1. **Type Safety**: Automatically generated TypeScript types based on your database schema
2. **Query Building**: Intuitive API for building database queries
3. **Migrations**: Tools for managing database schema changes
4. **Transactions**: Support for database transactions
5. **Relation Handling**: Simplified handling of database relations

## Setup

### Installation

```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

### Initialization

```bash
npx prisma init
```

This creates a `prisma` directory with a `schema.prisma` file and a `.env` file.

### Environment Configuration

```env
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/bellyfed?schema=public"
```

## Schema Definition

The Prisma schema is defined in the `prisma/schema.prisma` file:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  name      String?
  role      String      @default("USER")
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  restaurants Restaurant[] @relation("CreatedByUser")
  reviews     Review[]     @relation("UserReviews")

  @@map("users")
}

// Restaurant model
model Restaurant {
  id        String    @id @default(uuid())
  name      String
  address   String
  city      String
  state     String?
  country   String
  postalCode String?  @map("postal_code")
  phone     String?
  website   String?
  cuisine   String?
  createdBy String    @map("created_by")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  creator   User      @relation("CreatedByUser", fields: [createdBy], references: [id])
  dishes    Dish[]    @relation("RestaurantDishes")
  reviews   Review[]  @relation("RestaurantReviews")

  @@index([country, city])
  @@index([cuisine])
  @@map("restaurants")
}

// Dish model
model Dish {
  id           String    @id @default(uuid())
  name         String
  description  String?
  price        Float?
  restaurantId String    @map("restaurant_id")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  restaurant   Restaurant @relation("RestaurantDishes", fields: [restaurantId], references: [id])
  reviews      Review[]   @relation("DishReviews")

  @@index([restaurantId])
  @@map("dishes")
}

// Review model
model Review {
  id           String    @id @default(uuid())
  rating       Int
  comment      String?
  userId       String    @map("user_id")
  restaurantId String    @map("restaurant_id")
  dishId       String?   @map("dish_id")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user         User       @relation("UserReviews", fields: [userId], references: [id])
  restaurant   Restaurant @relation("RestaurantReviews", fields: [restaurantId], references: [id])
  dish         Dish?      @relation("DishReviews", fields: [dishId], references: [id])

  @@index([userId])
  @@index([restaurantId])
  @@index([dishId])
  @@map("reviews")
}

// Outbox Event model for reliable event delivery
model OutboxEvent {
  id          String    @id @default(uuid())
  aggregateId String
  eventType   String
  payload     String    @db.Text
  status      String    @default("PENDING")
  processedAt DateTime? @map("processed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([status, createdAt])
  @@index([aggregateId])
  @@index([eventType])
  @@index([processedAt])
  @@map("outbox_events")
}
```

## Database Operations

### Client Initialization

```typescript
// lib/db/index.ts
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Basic CRUD Operations

```typescript
// Create
const newRestaurant = await prisma.restaurant.create({
    data: {
        name: 'Restaurant Name',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        createdBy: userId,
    },
});

// Read
const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { dishes: true, reviews: true },
});

// Update
const updatedRestaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { name: 'New Restaurant Name' },
});

// Delete
const deletedRestaurant = await prisma.restaurant.delete({
    where: { id: restaurantId },
});
```

### Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
    // Create restaurant
    const restaurant = await tx.restaurant.create({
        data: {
            id: restaurantId,
            name,
            address,
            city,
            country,
            createdBy: userId,
        },
    });

    // Create dish
    const dish = await tx.dish.create({
        data: {
            name: dishName,
            restaurantId: restaurant.id,
        },
    });

    return { restaurant, dish };
});
```

## Integration with Next.js 15 Server Actions

Prisma is integrated with Next.js 15 Server Actions to provide type-safe database operations:

```typescript
// app/actions/restaurants.js
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../../lib/db/index.js';
import { auth } from '../../lib/auth/index.js';

export async function getRestaurants({ country, city, cuisine }) {
    const filters = {};

    if (country) filters.country = country;
    if (city) filters.city = city;
    if (cuisine) filters.cuisine = cuisine;

    return prisma.restaurant.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
    });
}

export async function getRestaurant(id) {
    return prisma.restaurant.findUnique({
        where: { id },
        include: {
            dishes: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
}
```

## Integration with Outbox Pattern

Prisma is integrated with the outbox pattern to ensure reliable event delivery:

```typescript
// lib/outbox/index.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export enum OutboxEventStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED',
}

export async function createOutboxEventInTransaction(
    tx: PrismaClient,
    type: string,
    payload: any,
    aggregateId: string
) {
    return tx.outboxEvent.create({
        data: {
            id: uuidv4(),
            aggregateId,
            eventType: type,
            payload: JSON.stringify(payload),
            status: OutboxEventStatus.PENDING,
            createdAt: new Date(),
        },
    });
}
```

## Migrations

### Creating Migrations

```bash
npx prisma migrate dev --name init
```

### Applying Migrations

```bash
npx prisma migrate deploy
```

### Generating Client

```bash
npx prisma generate
```

## Best Practices

1. **Use Transactions**: Use transactions for operations that modify multiple records
2. **Include Relations**: Use the `include` option to fetch related records
3. **Use Indexes**: Define indexes for frequently queried fields
4. **Use Enums**: Define enums for fields with a fixed set of values
5. **Use Migrations**: Use migrations to manage schema changes
6. **Use Validation**: Validate input data before passing it to Prisma
7. **Handle Errors**: Implement proper error handling for database operations
8. **Use Connection Pooling**: Use connection pooling for production deployments

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Implementation](./nextjs-15-implementation.md)
- [Server Actions Guide](./server-actions-guide.md)
- [Outbox Pattern Implementation](../../ARCHITECTURE/event-driven/outbox-pattern.md)

---

**Labels:** development, frontend, prisma, database, orm
