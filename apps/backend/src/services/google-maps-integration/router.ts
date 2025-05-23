/**
 * Google Maps Integration Router
 * 
 * This file defines the tRPC router for Google Maps integration operations.
 * It exposes endpoints for searching restaurants and getting restaurant details.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  searchRestaurants,
  getRestaurantDetails,
  type SearchRestaurantsParams,
  type GetRestaurantDetailsParams,
} from './index.js';

export const googleMapsIntegrationRouter = router({
  // Search restaurants
  searchRestaurants: publicProcedure
    .input(
      z.object({
        query: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().optional(),
        countryCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      return searchRestaurants(input as SearchRestaurantsParams);
    }),

  // Get restaurant details
  getRestaurantDetails: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
        countryCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getRestaurantDetails(input as GetRestaurantDetailsParams);
    }),

  // Get restaurant by ID
  getRestaurantById: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { restaurantId } = input;

      // Get restaurant from database
      const restaurant = await ctx.prisma.restaurant.findUnique({
        where: {
          id: restaurantId,
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
        throw new Error('Restaurant not found');
      }

      return restaurant;
    }),

  // Get restaurants by country code
  getRestaurantsByCountryCode: publicProcedure
    .input(
      z.object({
        countryCode: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { countryCode, limit = 20, offset = 0 } = input;

      // Get restaurants from database
      const restaurants = await ctx.prisma.restaurant.findMany({
        where: {
          countryCode,
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
        skip: offset,
      });

      // Get total count
      const total = await ctx.prisma.restaurant.count({
        where: {
          countryCode,
        },
      });

      return {
        restaurants,
        total,
      };
    }),

  // Search restaurants by name
  searchRestaurantsByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        countryCode: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { name, countryCode, limit = 20, offset = 0 } = input;

      // Build where clause
      const where: any = {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      };

      if (countryCode) {
        where.countryCode = countryCode;
      }

      // Get restaurants from database
      const restaurants = await ctx.prisma.restaurant.findMany({
        where,
        include: {
          photos: {
            take: 1,
          },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
        skip: offset,
      });

      // Get total count
      const total = await ctx.prisma.restaurant.count({
        where,
      });

      return {
        restaurants,
        total,
      };
    }),
});
