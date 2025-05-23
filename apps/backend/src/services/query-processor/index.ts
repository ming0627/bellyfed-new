/**
 * Query Processor Service
 * 
 * This service handles queries for restaurant data.
 * It provides functionality to:
 * - Get restaurant by ID
 * - List restaurants with filtering options
 * - Search restaurants by various criteria
 * 
 * The service uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the restaurant filter interface
export interface RestaurantFilter {
  cuisineType?: string;
  priceRange?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Get restaurant by ID
 */
export const getRestaurantById = async (id: string): Promise<any> => {
  console.log(`[getRestaurantById] Starting retrieval for restaurant ID: ${id}`);
  
  try {
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

    if (!restaurant) {
      console.log(`[getRestaurantById] Restaurant with ID ${id} not found`);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      });
    }

    console.log(`[getRestaurantById] Successfully retrieved restaurant: ${restaurant.name}`);
    return restaurant;
  } catch (error) {
    console.error(`[getRestaurantById] Error retrieving restaurant ID ${id}:`, error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * List restaurants with filtering options
 */
export const listRestaurants = async (filter: RestaurantFilter): Promise<any> => {
  console.log('[listRestaurants] Starting restaurant list retrieval with params:', filter);
  
  try {
    const { cuisineType, priceRange, limit = 50, cursor } = filter;

    // Build where clause
    const where: any = {};

    if (cuisineType) {
      where.cuisineType = cuisineType;
    }

    if (priceRange) {
      where.priceLevel = parseInt(priceRange);
    }

    // Get one more item than requested for cursor-based pagination
    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        photos: {
          take: 1, // Get only the first photo for list view
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Check if there are more results
    let nextCursor: string | undefined;
    if (restaurants.length > limit) {
      const nextItem = restaurants.pop();
      nextCursor = nextItem?.id;
    }

    // Get total count
    const totalCount = await prisma.restaurant.count({
      where,
    });

    console.log(`[listRestaurants] Query completed. Items found: ${restaurants.length}, Total: ${totalCount}`);
    
    return {
      items: restaurants,
      nextCursor,
      totalCount,
    };
  } catch (error) {
    console.error('[listRestaurants] Error listing restaurants:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * Search restaurants by name
 */
export const searchRestaurantsByName = async (name: string, limit: number = 50): Promise<any> => {
  console.log(`[searchRestaurantsByName] Searching restaurants with name: ${name}`);
  
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        photos: {
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });

    console.log(`[searchRestaurantsByName] Found ${restaurants.length} restaurants matching "${name}"`);
    
    return {
      items: restaurants,
      count: restaurants.length,
    };
  } catch (error) {
    console.error(`[searchRestaurantsByName] Error searching restaurants by name "${name}":`, error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * Search restaurants by location
 */
export const searchRestaurantsByLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 5000,
  limit: number = 50
): Promise<any> => {
  console.log(`[searchRestaurantsByLocation] Searching restaurants near (${latitude}, ${longitude})`);
  
  try {
    // Calculate bounding box for faster querying
    const latDegreePerMeter = 1 / 111320; // 1 degree latitude is approximately 111,320 meters
    const lonDegreePerMeter = 1 / (111320 * Math.cos(latitude * (Math.PI / 180)));
    
    const latDelta = radius * latDegreePerMeter;
    const lonDelta = radius * lonDegreePerMeter;
    
    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;
    
    // First filter by bounding box (which is fast)
    const restaurants = await prisma.restaurant.findMany({
      where: {
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLon,
          lte: maxLon,
        },
      },
      include: {
        photos: {
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Then filter more precisely by actual distance and sort by distance
    const restaurantsWithDistance = restaurants.map(restaurant => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude
      );
      return { ...restaurant, distance };
    })
    .filter(restaurant => restaurant.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
    
    console.log(`[searchRestaurantsByLocation] Found ${restaurantsWithDistance.length} restaurants within ${radius}m`);
    
    return {
      items: restaurantsWithDistance,
      count: restaurantsWithDistance.length,
    };
  } catch (error) {
    console.error('[searchRestaurantsByLocation] Error searching restaurants by location:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};
