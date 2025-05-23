/**
 * Typesense Dish Sync Router
 * 
 * This file defines the tRPC router for Typesense dish sync operations.
 * It exposes endpoints for syncing dish data to Typesense.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  ensureCollection,
  syncAllDishes,
  syncDish,
  deleteDish,
} from './index.js';

export const typesenseDishSyncRouter = router({
  // Ensure the dishes collection exists in Typesense
  ensureCollection: protectedProcedure
    .mutation(async () => {
      await ensureCollection();
      return {
        success: true,
      };
    }),

  // Sync all dishes from the database to Typesense
  syncAllDishes: protectedProcedure
    .mutation(async () => {
      return syncAllDishes();
    }),

  // Sync a specific dish to Typesense
  syncDish: protectedProcedure
    .input(
      z.object({
        dishId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return syncDish(input.dishId);
    }),

  // Delete a dish from Typesense
  deleteDish: protectedProcedure
    .input(
      z.object({
        dishId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return deleteDish(input.dishId);
    }),

  // Sync dishes by restaurant ID
  syncDishesByRestaurantId: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get all dishes for the restaurant
      const dishes = await ctx.prisma.dish.findMany({
        where: {
          restaurantId: input.restaurantId,
        },
      });

      // Sync each dish
      const results = await Promise.all(
        dishes.map(async (dish) => {
          try {
            const result = await syncDish(dish.id);
            return {
              dishId: dish.id,
              success: true,
              data: result,
            };
          } catch (error) {
            return {
              dishId: dish.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      return {
        restaurantId: input.restaurantId,
        totalDishes: dishes.length,
        syncedDishes: results.filter((r) => r.success).length,
        failedDishes: results.filter((r) => !r.success).length,
        results,
      };
    }),

  // Handle dish event (create, update, delete)
  handleDishEvent: publicProcedure
    .input(
      z.object({
        eventType: z.enum(['created', 'updated', 'deleted']),
        dishId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { eventType, dishId } = input;

      if (eventType === 'deleted') {
        return deleteDish(dishId);
      } else {
        // For created or updated events, sync the dish
        return syncDish(dishId);
      }
    }),
});
