# Migration to Next.js 15 Server Actions: Architectural Direction

## Overview

This document outlines our strategy for migrating from our current AWS event-driven architecture to a hybrid approach leveraging Next.js 15 Server Actions for direct database operations while maintaining AWS EDA for specific use cases.

## Current Architecture

Our current architecture uses:

- Aurora PostgreSQL as primary database
- DynamoDB for high-performance read patterns
- EventBridge for event routing
- Lambda for business logic
- SQS for reliable message delivery
- ECS Fargate for Next.js hosting

## Migration Plan

### Phase 1: Server Actions Implementation (Q3 2024)

1. Identify and prioritize database operations for migration
2. Create shared Prisma schema for PostgreSQL operations
3. Implement Server Actions for high-priority operations
4. Add outbox pattern for reliability
5. Update frontend components to use Server Actions
6. Implement monitoring and observability

### Phase 2: Hybrid Architecture Optimization (Q4 2024)

1. Refine boundaries between Server Actions and AWS EDA
2. Optimize database access patterns
3. Implement caching strategy
4. Enhance error handling and retry mechanisms
5. Performance testing and optimization

### Phase 3: EKS Migration for Specific Services (Q1 2025)

1. Identify services for EKS migration
2. Create Kubernetes manifests
3. Implement CI/CD pipeline for EKS
4. Migrate services incrementally
5. Optimize resource allocation

## Feature Distribution

### Use Server Actions For:

- **User Authentication**

  - Login/logout
  - Profile management
  - Preference settings

- **Restaurant Management**

  - Create/update restaurant profiles
  - Menu management
  - Operating hours updates

- **Review System**

  - Submit reviews
  - Rating updates
  - Comment moderation

- **Search Functionality**
  - Basic search queries
  - Filtering
  - Sorting

### Keep in AWS EDA:

- **Analytics Processing**

  - User behavior tracking
  - Restaurant performance metrics
  - Search pattern analysis

- **Recommendation Engine**

  - Personalized recommendations
  - Trending restaurants calculation
  - Similarity scoring

- **Media Processing**

  - Image optimization
  - Video transcoding
  - Storage management

- **Notifications**

  - Email delivery
  - Push notifications
  - SMS alerts

- **Scheduled Tasks**
  - Daily reports
  - Data aggregation
  - Cleanup operations

## Implementation Examples

### Server Action for Restaurant Creation

```typescript
// app/actions/restaurants.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createOutboxEvent } from '@/lib/outbox';
import { z } from 'zod';

const restaurantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  location: z.string().min(1),
  cuisineType: z.string(),
  priceRange: z.string(),
});

export async function createRestaurant(formData: FormData) {
  // Validate input
  const validatedFields = restaurantSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    location: formData.get('location'),
    cuisineType: formData.get('cuisineType'),
    priceRange: formData.get('priceRange'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid restaurant data' };
  }

  const data = validatedFields.data;

  try {
    // Create restaurant in database
    const restaurant = await prisma.restaurant.create({
      data,
    });

    // Create outbox event for analytics
    await createOutboxEvent(
      'RESTAURANT_CREATED',
      {
        restaurantId: restaurant.id,
        name: restaurant.name,
      },
      restaurant.id
    );

    // Update UI
    revalidatePath('/restaurants');
    revalidatePath('/dashboard');

    return { success: true, restaurant };
  } catch (error) {
    console.error('Failed to create restaurant:', error);
    return { error: 'Failed to create restaurant' };
  }
}
```

### Server Action for Review Submission

```typescript
// app/actions/reviews.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createOutboxEvent } from '@/lib/outbox';
import { auth } from '@/lib/auth';

export async function submitReview(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Authentication required' };
  }

  const restaurantId = formData.get('restaurantId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  if (!restaurantId || isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Invalid review data' };
  }

  try {
    // Create review in database
    const review = await prisma.review.create({
      data: {
        restaurantId,
        rating,
        comment,
        userId: session.user.id,
      },
    });

    // Create outbox event for analytics processing
    await createOutboxEvent(
      'REVIEW_SUBMITTED',
      {
        reviewId: review.id,
        restaurantId,
        rating,
        userId: session.user.id,
      },
      restaurantId
    );

    // Update UI
    revalidatePath(`/restaurants/${restaurantId}`);

    return { success: true, review };
  } catch (error) {
    console.error('Failed to submit review:', error);
    return { error: 'Failed to submit review' };
  }
}
```

### Outbox Pattern Implementation

```typescript
// lib/outbox/index.ts
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function createOutboxEvent(type: string, payload: any, aggregateId: string) {
  return prisma.outboxEvent.create({
    data: {
      id: uuidv4(),
      aggregateId,
      eventType: type,
      payload: JSON.stringify(payload),
      status: 'PENDING',
      createdAt: new Date(),
    },
  });
}
```

## EKS Migration Roadmap

### Services to Migrate

1. **Recommendation Engine**

   - Resource-intensive computation
   - Benefits from horizontal scaling
   - Requires specialized ML libraries

2. **Media Processing Service**

   - CPU/memory intensive
   - Benefits from specialized worker nodes
   - Requires optimized storage access

3. **Analytics Processing**
   - High volume data processing
   - Benefits from dedicated resources
   - Requires specialized data processing libraries

### Implementation Timeline

| Service               | Migration Start | Expected Completion | Dependencies                  |
| --------------------- | --------------- | ------------------- | ----------------------------- |
| Recommendation Engine | Q1 2025         | Q1 2025             | EKS Cluster, CI/CD Pipeline   |
| Media Processing      | Q2 2025         | Q2 2025             | EKS Cluster, S3 Integration   |
| Analytics Processing  | Q3 2025         | Q3 2025             | EKS Cluster, Data Lake Access |

## Monitoring and Observability

### Server Actions Monitoring

1. **Application Performance Monitoring**

   - Implement OpenTelemetry instrumentation
   - Track Server Action execution times
   - Monitor database query performance
   - Set up alerts for slow operations

2. **Error Tracking**

   - Implement structured error logging
   - Set up error aggregation in CloudWatch
   - Create dashboards for error rates
   - Implement circuit breakers for failing operations

3. **Custom Metrics**
   - Track Server Action invocation counts
   - Monitor cache hit/miss ratios
   - Track revalidation frequencies
   - Monitor memory usage

### Hybrid Architecture Observability

1. **Unified Logging**

   - Implement consistent log format across Next.js and AWS
   - Use correlation IDs to track requests across systems
   - Set up centralized log storage and analysis
   - Create log-based alerts for critical issues

2. **Distributed Tracing**

   - Implement end-to-end tracing from Next.js to AWS services
   - Track cross-service dependencies
   - Monitor service latencies
   - Identify bottlenecks in request flows

3. **Health Checks**
   - Implement health check endpoints for all services
   - Set up automated monitoring
   - Create service dependency maps
   - Implement graceful degradation for service failures

## Conclusion

This migration to Next.js 15 Server Actions represents a strategic shift in our architecture that will improve developer productivity while maintaining the scalability benefits of our AWS infrastructure. By carefully selecting which features use Server Actions versus AWS EDA, we can optimize for both development speed and system performance.

The future EKS migration for specific services will further enhance our ability to scale individual components independently as our platform grows.

## References

- [Next.js 15 Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [OpenTelemetry for Next.js](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)
