/**
 * Restaurant Query Service
 * 
 * This service provides functionality to query restaurant data.
 * It includes:
 * - Getting a restaurant by ID
 * - Listing restaurants with pagination
 * - Searching restaurants with various filters
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
 * Get a restaurant by ID
 */
export const getRestaurantById = async (id: string): Promise<any> => {
  const startTime = process.hrtime();
  console.log('[getRestaurantById] Starting request:', { id });

  try {
    if (!id) {
      console.log('[getRestaurantById] Missing ID parameter');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Restaurant ID is required',
      });
    }

    console.log('[getRestaurantById] Fetching restaurant:', { id });

    const queryStart = process.hrtime();
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id,
      },
      include: {
        photos: true,
        hours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });
    const queryDuration = measureTime(queryStart);
    
    console.log('[getRestaurantById] Database response:', {
      found: !!restaurant,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    if (!restaurant) {
      console.log('[getRestaurantById] Restaurant not found:', { id });
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      });
    }

    // Log analytics event
    await logAnalyticsEvent('RESTAURANT_GET', {
      id,
      queryDuration: measureTime(startTime),
    });

    const duration = measureTime(startTime);
    console.log('[getRestaurantById] Request completed:', {
      id,
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      ...restaurant,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[getRestaurantById] Error:', error);
    
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
 * List restaurants with pagination
 */
export const listRestaurants = async (params: {
  limit?: number;
  cursor?: string;
}): Promise<any> => {
  const startTime = process.hrtime();
  const { limit = 12, cursor } = params;
  const pageLimit = Math.min(limit, 50); // Max 50 items per page

  console.log('[listRestaurants] Starting request:', {
    limit: pageLimit,
    hasCursor: !!cursor,
  });

  try {
    const queryStart = process.hrtime();
    
    // Get restaurants with pagination
    const restaurants = await prisma.restaurant.findMany({
      take: pageLimit + 1, // Get one extra item to check if there are more results
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: {
        name: 'asc',
      },
      include: {
        photos: {
          take: 1, // Get only the first photo for list view
        },
      },
    });
    
    const queryDuration = measureTime(queryStart);
    console.log('[listRestaurants] Database response:', {
      itemCount: restaurants.length,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    // Check if there are more results
    let nextCursor: string | undefined;
    if (restaurants.length > pageLimit) {
      const nextItem = restaurants.pop();
      nextCursor = nextItem?.id;
    }

    // Get total count
    const totalCount = await prisma.restaurant.count();

    const duration = measureTime(startTime);
    console.log('[listRestaurants] Request completed:', {
      itemCount: restaurants.length,
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      items: restaurants,
      nextCursor,
      totalCount,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[listRestaurants] Error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Search restaurants with filters
 */
export const searchRestaurants = async (params: {
  query?: string;
  cuisine?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  cursor?: string;
}): Promise<any> => {
  const startTime = process.hrtime();
  const {
    query,
    cuisine,
    location,
    minRating,
    maxPrice,
    limit = 10,
    cursor,
  } = params;
  
  const pageLimit = Math.min(limit, 50); // Max 50 items per page

  console.log('[searchRestaurants] Starting request:', {
    query,
    cuisine,
    location,
    minRating,
    maxPrice,
    limit: pageLimit,
    hasCursor: !!cursor,
  });

  try {
    // Validate input parameters
    if (minRating !== undefined && (minRating < 0 || minRating > 5)) {
      console.log('[searchRestaurants] Invalid minRating parameter');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'minRating must be a number between 0 and 5',
      });
    }

    // Build where clause
    const where: any = {};

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (cuisine) {
      where.cuisineType = cuisine;
    }

    if (location) {
      where.address = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (minRating !== undefined) {
      where.rating = {
        gte: minRating,
      };
    }

    if (maxPrice !== undefined) {
      where.priceLevel = {
        lte: maxPrice,
      };
    }

    const queryStart = process.hrtime();
    
    // Get restaurants with filters and pagination
    const restaurants = await prisma.restaurant.findMany({
      where,
      take: pageLimit + 1, // Get one extra item to check if there are more results
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: {
        rating: 'desc',
      },
      include: {
        photos: {
          take: 1, // Get only the first photo for list view
        },
      },
    });
    
    const queryDuration = measureTime(queryStart);
    console.log('[searchRestaurants] Database response:', {
      itemCount: restaurants.length,
      duration: `${queryDuration.toFixed(2)}ms`,
    });

    // Check if there are more results
    let nextCursor: string | undefined;
    if (restaurants.length > pageLimit) {
      const nextItem = restaurants.pop();
      nextCursor = nextItem?.id;
    }

    // Log analytics event
    await logAnalyticsEvent('RESTAURANT_SEARCH', {
      query,
      cuisine,
      location,
      minRating,
      maxPrice,
      resultCount: restaurants.length,
      queryDuration: measureTime(startTime),
    });

    const duration = measureTime(startTime);
    console.log('[searchRestaurants] Request completed:', {
      duration: `${duration.toFixed(2)}ms`,
    });

    return {
      items: restaurants,
      nextCursor,
      count: restaurants.length,
      _debug: {
        totalDuration: duration,
      },
    };
  } catch (error) {
    console.error('[searchRestaurants] Error:', error);
    
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
 * Log analytics event
 */
const logAnalyticsEvent = async (eventType: string, data: any): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'restaurant_query',
        action: eventType,
        timestamp: new Date(),
        userId: 'system',
        source: 'restaurant-query',
        status: 'SUCCESS',
        eventCategory: 'RESTAURANT_EVENT',
        properties: data as any,
      },
    });
  } catch (error) {
    console.error(`Error logging analytics event ${eventType}:`, error);
    // Don't throw here to avoid failing the main function
  }
};
