/**
 * Query Processor Router
 * 
 * This file defines the tRPC router for query processor operations.
 * It exposes endpoints for querying restaurant data.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  getRestaurantById,
  listRestaurants,
  searchRestaurantsByName,
  searchRestaurantsByLocation,
  type RestaurantFilter,
} from './index.js';

export const queryProcessorRouter = router({
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

  // List restaurants with filtering options
  listRestaurants: publicProcedure
    .input(
      z.object({
        cuisineType: z.string().optional(),
        priceRange: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return listRestaurants(input as RestaurantFilter);
    }),

  // Search restaurants by name
  searchRestaurantsByName: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurantsByName(input.name, input.limit);
    }),

  // Search restaurants by location
  searchRestaurantsByLocation: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().min(100).max(50000).optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurantsByLocation(
        input.latitude,
        input.longitude,
        input.radius,
        input.limit
      );
    }),

  // Get restaurants by cuisine type
  getRestaurantsByCuisineType: publicProcedure
    .input(
      z.object({
        cuisineType: z.string(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return listRestaurants({
        cuisineType: input.cuisineType,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Get restaurants by price range
  getRestaurantsByPriceRange: publicProcedure
    .input(
      z.object({
        priceRange: z.string(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return listRestaurants({
        priceRange: input.priceRange,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),

  // Get popular restaurants
  getPopularRestaurants: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
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
        include: {
          photos: {
            take: 1,
          },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
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
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit = 10 } = input;

      // Get most recently added restaurants
      const restaurants = await ctx.prisma.restaurant.findMany({
        include: {
          photos: {
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return {
        items: restaurants,
        count: restaurants.length,
      };
    }),
});
