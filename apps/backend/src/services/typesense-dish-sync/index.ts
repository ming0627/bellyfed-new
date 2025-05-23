/**
 * Typesense Dish Sync Service
 *
 * This service syncs dish data from the database to Typesense.
 * It provides functionality to:
 * - Ensure the dishes collection exists in Typesense
 * - Sync all dishes from the database to Typesense
 * - Sync a specific dish to Typesense
 * - Delete a dish from Typesense
 *
 * The service uses Prisma ORM for database operations and Typesense for search.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  getTypesenseClient,
  type DishDocument
} from '../../utils/typesense-client.js';
import {
  TYPESENSE_DISH_SCHEMA,
  formatDishForTypesense,
  type DishData,
  type TypesenseDishDocument
} from './typesense-dish-schema.js';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Ensure the dishes collection exists in Typesense
 */
export const ensureCollection = async (): Promise<void> => {
  console.log('[ensureCollection] Ensuring dishes collection exists');

  try {
    const client = await getTypesenseClient();

    // Check if collection exists
    try {
      await client.collections('dishes').retrieve();
      console.log('[ensureCollection] Dishes collection already exists');
    } catch (error: unknown) {
      // Collection doesn't exist, create it
      console.log('[ensureCollection] Creating dishes collection');
      await client.collections().create(TYPESENSE_DISH_SCHEMA);
      console.log('[ensureCollection] Dishes collection created successfully');
    }
  } catch (error) {
    console.error('[ensureCollection] Error ensuring collection exists:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error ensuring collection exists',
    });
  }
};

/**
 * Get dishes with rankings from the database
 */
export const getDishesWithRankings = async (): Promise<DishData[]> => {
  console.log('[getDishesWithRankings] Getting dishes with rankings from database');

  try {
    // Get dishes with their average rankings using Prisma
    const dishes = await prisma.$queryRaw<DishData[]>`
      SELECT
        d.id as dish_id,
        d.restaurant_id,
        d.name,
        d.description,
        d.price,
        d.dish_type,
        d.tags,
        d.is_seasonal,
        d.is_available,
        d.created_at,
        r.name as restaurant_name,
        COALESCE(AVG(dr.rating), 0) as average_rank,
        COUNT(dr.id) as ranking_count
      FROM
        "Dish" d
      JOIN
        "Restaurant" r ON d.restaurant_id = r.id
      LEFT JOIN
        "DishRanking" dr ON d.id = dr.dish_id
      GROUP BY
        d.id, d.restaurant_id, d.name, d.description, d.price,
        d.dish_type, d.tags, d.is_seasonal, d.is_available, d.created_at, r.name
    `;

    console.log(`[getDishesWithRankings] Retrieved ${dishes.length} dishes from database`);
    return dishes;
  } catch (error) {
    console.error('[getDishesWithRankings] Error getting dishes from database:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error getting dishes from database',
    });
  }
};

/**
 * Sync all dishes from the database to Typesense
 */
export const syncAllDishes = async (): Promise<{ syncedCount: number }> => {
  console.log('[syncAllDishes] Starting dish sync to Typesense');

  try {
    // Get Typesense client
    const client = await getTypesenseClient();

    // Ensure collection exists
    await ensureCollection();

    // Get dishes from database
    const dishes = await getDishesWithRankings();

    // Format dishes for Typesense
    const typesenseDishes = dishes.map(formatDishForTypesense);

    // Batch size for import
    const BATCH_SIZE = 100;

    // Import dishes in batches
    for (let i = 0; i < typesenseDishes.length; i += BATCH_SIZE) {
      const batch = typesenseDishes.slice(i, i + BATCH_SIZE);
      console.log(`[syncAllDishes] Importing batch ${i / BATCH_SIZE + 1} (${batch.length} dishes)`);

      await client.collections('dishes').documents().import(batch, { action: 'upsert' });
    }

    console.log(`[syncAllDishes] Successfully synced ${typesenseDishes.length} dishes to Typesense`);

    return {
      syncedCount: typesenseDishes.length,
    };
  } catch (error) {
    console.error('[syncAllDishes] Error syncing dishes to Typesense:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error syncing dishes to Typesense',
    });
  }
};

/**
 * Sync a specific dish to Typesense
 */
export const syncDish = async (dishId: string): Promise<TypesenseDishDocument> => {
  console.log(`[syncDish] Syncing dish ${dishId} to Typesense`);

  try {
    // Get Typesense client
    const client = await getTypesenseClient();

    // Ensure collection exists
    await ensureCollection();

    // Get dish from database
    const dishData = await prisma.$queryRaw<DishData[]>`
      SELECT
        d.id as dish_id,
        d.restaurant_id,
        d.name,
        d.description,
        d.price,
        d.dish_type,
        d.tags,
        d.is_seasonal,
        d.is_available,
        d.created_at,
        r.name as restaurant_name,
        COALESCE(AVG(dr.rating), 0) as average_rank,
        COUNT(dr.id) as ranking_count
      FROM
        "Dish" d
      JOIN
        "Restaurant" r ON d.restaurant_id = r.id
      LEFT JOIN
        "DishRanking" dr ON d.id = dr.dish_id
      WHERE
        d.id = ${dishId}
      GROUP BY
        d.id, d.restaurant_id, d.name, d.description, d.price,
        d.dish_type, d.tags, d.is_seasonal, d.is_available, d.created_at, r.name
    `;

    if (!dishData || dishData.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Dish with ID ${dishId} not found`,
      });
    }

    // Format dish for Typesense
    const dishToFormat = dishData[0];
    if (!dishToFormat) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Dish with ID ${dishId} not found`,
      });
    }
    const typesenseDish = formatDishForTypesense(dishToFormat);

    // Upsert dish in Typesense
    await client.collections('dishes').documents().upsert(typesenseDish);

    console.log(`[syncDish] Successfully synced dish ${dishId} to Typesense`);

    return typesenseDish;
  } catch (error) {
    console.error(`[syncDish] Error syncing dish ${dishId} to Typesense:`, error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : `Error syncing dish ${dishId} to Typesense`,
    });
  }
};

/**
 * Delete a dish from Typesense
 */
export const deleteDish = async (dishId: string): Promise<{ success: boolean }> => {
  console.log(`[deleteDish] Deleting dish ${dishId} from Typesense`);

  try {
    // Get Typesense client
    const client = await getTypesenseClient();

    // Delete dish from Typesense
    await client.collections('dishes').documents(dishId).delete();

    console.log(`[deleteDish] Successfully deleted dish ${dishId} from Typesense`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`[deleteDish] Error deleting dish ${dishId} from Typesense:`, error);

    // If the error is that the document was not found, consider it a success
    if (error instanceof Error && error.message.includes('Could not find')) {
      console.log(`[deleteDish] Dish ${dishId} not found in Typesense, considering deletion successful`);
      return {
        success: true,
      };
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : `Error deleting dish ${dishId} from Typesense`,
    });
  }
};
