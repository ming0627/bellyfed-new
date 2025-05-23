/**
 * Review Query Service
 * 
 * This service provides functionality to query review data.
 * It includes:
 * - Getting a review by ID
 * - Getting reviews for a restaurant
 * - Getting reviews by a user
 * - Tracking analytics for review queries
 * 
 * The service uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Performance monitoring
function measureTime(startTime: [number, number]): number {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  return seconds * 1000 + nanoseconds / 1000000;
}

/**
 * Get a review by ID
 */
export const getReviewById = async (reviewId: string): Promise<any> => {
  const startTime = process.hrtime();
  console.log('[getReviewById] Starting request:', { reviewId });

  try {
    // Validate input
    if (!reviewId) {
      console.log('[getReviewById] Missing ID parameter');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Review ID is required',
      });
    }

    console.log('[getReviewById] Fetching review:', { reviewId });

    const queryStart = process.hrtime();
    const review = await prisma.review.findFirst({
      where: {
        reviewId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
    const queryDuration = measureTime(queryStart);
    
    console.log('[getReviewById] Database response:', {
      found: !!review,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    if (!review) {
      console.log('[getReviewById] Review not found:', { reviewId });
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Review not found',
      });
    }

    // Log analytics event
    await logReviewAnalytics('REVIEW_VIEW', {
      reviewId,
      type: 'single',
      queryDuration: measureTime(startTime),
    });

    const duration = measureTime(startTime);
    console.log('[getReviewById] Request completed:', {
      reviewId,
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      ...review,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[getReviewById] Error:', error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get reviews for a restaurant
 */
export const getReviewsByRestaurantId = async (params: {
  restaurantId: string;
  limit?: number;
  offset?: number;
}): Promise<any> => {
  const startTime = process.hrtime();
  const { restaurantId, limit = 10, offset = 0 } = params;

  console.log('[getReviewsByRestaurantId] Starting request:', {
    restaurantId,
    limit,
    offset,
  });

  try {
    // Validate input
    if (!restaurantId) {
      console.log('[getReviewsByRestaurantId] Missing restaurant ID parameter');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Restaurant ID is required',
      });
    }

    const queryStart = process.hrtime();
    
    // Get reviews for this restaurant
    const reviews = await prisma.review.findMany({
      where: {
        restaurantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    const queryDuration = measureTime(queryStart);
    console.log('[getReviewsByRestaurantId] Database response:', {
      reviewCount: reviews.length,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    // Get total count
    const totalCount = await prisma.review.count({
      where: {
        restaurantId,
      },
    });

    // Log analytics event
    await logReviewAnalytics('REVIEWS_VIEW', {
      restaurantId,
      reviewCount: reviews.length,
      type: 'list',
      queryDuration: measureTime(startTime),
    });

    const duration = measureTime(startTime);
    console.log('[getReviewsByRestaurantId] Request completed:', {
      restaurantId,
      reviewCount: reviews.length,
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      reviews,
      totalCount,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[getReviewsByRestaurantId] Error:', error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get reviews by a user
 */
export const getReviewsByUserId = async (params: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<any> => {
  const startTime = process.hrtime();
  const { userId, limit = 10, offset = 0 } = params;

  console.log('[getReviewsByUserId] Starting request:', {
    userId,
    limit,
    offset,
  });

  try {
    // Validate input
    if (!userId) {
      console.log('[getReviewsByUserId] Missing user ID parameter');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User ID is required',
      });
    }

    const queryStart = process.hrtime();
    
    // Get reviews by this user
    const reviews = await prisma.review.findMany({
      where: {
        userId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            photos: {
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    const queryDuration = measureTime(queryStart);
    console.log('[getReviewsByUserId] Database response:', {
      reviewCount: reviews.length,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    // Get total count
    const totalCount = await prisma.review.count({
      where: {
        userId,
      },
    });

    // Log analytics event
    await logReviewAnalytics('USER_REVIEWS_VIEW', {
      userId,
      reviewCount: reviews.length,
      type: 'list',
      queryDuration: measureTime(startTime),
    });

    const duration = measureTime(startTime);
    console.log('[getReviewsByUserId] Request completed:', {
      userId,
      reviewCount: reviews.length,
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      reviews,
      totalCount,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[getReviewsByUserId] Error:', error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Log review analytics event
 */
const logReviewAnalytics = async (eventType: string, data: any): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'review_query',
        action: eventType,
        timestamp: new Date(),
        userId: 'system',
        source: 'review-query',
        status: 'SUCCESS',
        eventCategory: 'REVIEW_EVENT',
        properties: data as any,
      },
    });
  } catch (error) {
    console.error(`Error logging analytics event ${eventType}:`, error);
    // Don't throw here to avoid failing the main function
  }
};
