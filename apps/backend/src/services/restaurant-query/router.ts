/**
 * Restaurant Query Router
 * 
 * This file defines the tRPC router for restaurant query operations.
 * It exposes endpoints for querying restaurant data.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  getRestaurantById,
  listRestaurants,
  searchRestaurants,
} from './index.js';

export const restaurantQueryRouter = router({
  // Get restaurant by ID
  getRestaurantById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getRestaurantById(input.id);
    }),

  // List restaurants with pagination
  listRestaurants: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return listRestaurants({
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Search restaurants with filters
  searchRestaurants: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        cuisine: z.string().optional(),
        location: z.string().optional(),
        minRating: z.number().min(0).max(5).optional(),
        maxPrice: z.number().min(1).max(4).optional(),
        limit: z.number().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurants({
        query: input.query,
        cuisine: input.cuisine,
        location: input.location,
        minRating: input.minRating,
        maxPrice: input.maxPrice,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Get popular restaurants
  getPopularRestaurants: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit = 10 } = input;

      // Get restaurants with highest ratings
      const restaurants = await ctx.prisma.restaurant.findMany({
        where: {
          rating: {
            gte: 4.0,
          },
        },
        take: limit,
        orderBy: {
          rating: 'desc',
        },
        include: {
          photos: {
            take: 1,
          },
        },
      });

      return {
        items: restaurants,
        count: restaurants.length,
      };
    }),

  // Get recently added restaurants
  getRecentlyAddedRestaurants: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit = 10 } = input;

      // Get most recently added restaurants
      const restaurants = await ctx.prisma.restaurant.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          photos: {
            take: 1,
          },
        },
      });

      return {
        items: restaurants,
        count: restaurants.length,
      };
    }),

  // Get restaurants by cuisine type
  getRestaurantsByCuisine: publicProcedure
    .input(
      z.object({
        cuisine: z.string(),
        limit: z.number().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurants({
        cuisine: input.cuisine,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Get restaurants by price range
  getRestaurantsByPriceRange: publicProcedure
    .input(
      z.object({
        priceRange: z.number().min(1).max(4),
        limit: z.number().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurants({
        maxPrice: input.priceRange,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Get restaurants by location
  getRestaurantsByLocation: publicProcedure
    .input(
      z.object({
        location: z.string(),
        limit: z.number().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurants({
        location: input.location,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),
});
