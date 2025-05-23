/**
 * Typesense Dish Search Router
 * 
 * This file defines the tRPC router for Typesense dish search operations.
 * It exposes endpoints for searching dishes using Typesense.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  searchDishesWithFilters,
  getDish,
  getDishesByRestaurant,
  getDishesByDishType,
  getDishesByTagList,
} from './index.js';

export const typesenseDishSearchRouter = router({
  // Search dishes with filters
  searchDishes: publicProcedure
    .input(
      z.object({
        q: z.string().optional(),
        dishType: z.string().optional(),
        restaurantId: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        perPage: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchDishesWithFilters({
        q: input.q,
        dishType: input.dishType,
        restaurantId: input.restaurantId,
        tags: input.tags,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        perPage: input.perPage,
        page: input.page,
      });
    }),

  // Get dish by ID
  getDishById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getDish(input.id);
    }),

  // Get dishes by restaurant ID
  getDishesByRestaurantId: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      return getDishesByRestaurant({
        restaurantId: input.restaurantId,
        limit: input.limit,
        page: input.page,
      });
    }),

  // Get dishes by type
  getDishesByType: publicProcedure
    .input(
      z.object({
        dishType: z.string(),
        limit: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      return getDishesByDishType({
        dishType: input.dishType,
        limit: input.limit,
        page: input.page,
      });
    }),

  // Get dishes by tags
  getDishesByTags: publicProcedure
    .input(
      z.object({
        tags: z.array(z.string()).min(1),
        limit: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      return getDishesByTagList({
        tags: input.tags,
        limit: input.limit,
        page: input.page,
      });
    }),

  // Get popular dishes
  getPopularDishes: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchDishesWithFilters({
        q: '*',
        perPage: input.limit,
        page: input.page,
      });
    }),

  // Get dishes by price range
  getDishesByPriceRange: publicProcedure
    .input(
      z.object({
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        limit: z.number().min(1).max(100).optional(),
        page: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      if (input.priceMin === undefined && input.priceMax === undefined) {
        throw new Error('At least one of priceMin or priceMax is required');
      }

      return searchDishesWithFilters({
        q: '*',
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        perPage: input.limit,
        page: input.page,
      });
    }),
});
