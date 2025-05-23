/**
 * Typesense Dish Search Service
 * 
 * This service provides functionality to search for dishes using Typesense.
 * It includes:
 * - Searching dishes with various filters
 * - Getting dishes by restaurant
 * - Getting dishes by type
 * - Getting dishes by tags
 * 
 * The service uses Typesense for efficient search operations.
 */

import { TRPCError } from '@trpc/server';
import { 
  searchDishes, 
  getDishById, 
  getDishesByRestaurantId, 
  getDishesByType, 
  getDishesByTags,
  type SearchParams,
  type DishDocument
} from '../../utils/typesense-client.js';

/**
 * Search dishes with various filters
 */
export const searchDishesWithFilters = async (params: {
  q?: string;
  dishType?: string;
  restaurantId?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  perPage?: number;
  page?: number;
}): Promise<any> => {
  console.log('[searchDishesWithFilters] Starting request:', params);

  try {
    const {
      q,
      dishType,
      restaurantId,
      tags,
      priceMin,
      priceMax,
      perPage = 20,
      page = 1,
    } = params;

    // Build filter expression
    const filterExpressions: string[] = [];

    if (dishType) {
      filterExpressions.push(`dish_type:=${dishType}`);
    }

    if (restaurantId) {
      filterExpressions.push(`restaurant_id:=${restaurantId}`);
    }

    if (tags && tags.length > 0) {
      const tagFilter = tags.map((tag) => `tags:=${tag}`).join(' || ');
      filterExpressions.push(`(${tagFilter})`);
    }

    if (priceMin !== undefined && priceMax !== undefined) {
      filterExpressions.push(`price:>=${priceMin} && price:<=${priceMax}`);
    } else if (priceMin !== undefined) {
      filterExpressions.push(`price:>=${priceMin}`);
    } else if (priceMax !== undefined) {
      filterExpressions.push(`price:<=${priceMax}`);
    }

    // Only show available dishes by default
    filterExpressions.push('is_available:=true');

    const filterBy = filterExpressions.join(' && ');

    // Build search parameters
    const searchParams: SearchParams = {
      q: q || '',
      query_by: 'name,description,tags',
      filter_by: filterBy,
      sort_by: q ? '_text_match:desc,average_rank:desc' : 'average_rank:desc',
      per_page: perPage,
      page,
    };

    console.log('[searchDishesWithFilters] Search parameters:', searchParams);

    // Perform search
    const results = await searchDishes(searchParams);

    console.log(`[searchDishesWithFilters] Found ${results.found} dishes`);

    return results;
  } catch (error) {
    console.error('[searchDishesWithFilters] Error searching dishes:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error searching dishes',
    });
  }
};

/**
 * Get dish by ID
 */
export const getDish = async (id: string): Promise<DishDocument> => {
  console.log('[getDish] Starting request:', { id });

  try {
    if (!id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Dish ID is required',
      });
    }

    const dish = await getDishById(id);

    console.log('[getDish] Found dish:', dish.name);

    return dish;
  } catch (error) {
    console.error('[getDish] Error getting dish:', error);
    
    if (error instanceof Error && error.message.includes('Could not find')) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Dish with ID ${id} not found`,
      });
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error getting dish',
    });
  }
};

/**
 * Get dishes by restaurant ID
 */
export const getDishesByRestaurant = async (params: {
  restaurantId: string;
  limit?: number;
  page?: number;
}): Promise<any> => {
  console.log('[getDishesByRestaurant] Starting request:', params);

  try {
    const { restaurantId, limit = 20, page = 1 } = params;

    if (!restaurantId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Restaurant ID is required',
      });
    }

    const results = await getDishesByRestaurantId(restaurantId, limit, page);

    console.log(`[getDishesByRestaurant] Found ${results.found} dishes for restaurant ${restaurantId}`);

    return results;
  } catch (error) {
    console.error('[getDishesByRestaurant] Error getting dishes by restaurant:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error getting dishes by restaurant',
    });
  }
};

/**
 * Get dishes by type
 */
export const getDishesByDishType = async (params: {
  dishType: string;
  limit?: number;
  page?: number;
}): Promise<any> => {
  console.log('[getDishesByDishType] Starting request:', params);

  try {
    const { dishType, limit = 20, page = 1 } = params;

    if (!dishType) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Dish type is required',
      });
    }

    const results = await getDishesByType(dishType, limit, page);

    console.log(`[getDishesByDishType] Found ${results.found} dishes of type ${dishType}`);

    return results;
  } catch (error) {
    console.error('[getDishesByDishType] Error getting dishes by type:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error getting dishes by type',
    });
  }
};

/**
 * Get dishes by tags
 */
export const getDishesByTagList = async (params: {
  tags: string[];
  limit?: number;
  page?: number;
}): Promise<any> => {
  console.log('[getDishesByTagList] Starting request:', params);

  try {
    const { tags, limit = 20, page = 1 } = params;

    if (!tags || tags.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'At least one tag is required',
      });
    }

    const results = await getDishesByTags(tags, limit, page);

    console.log(`[getDishesByTagList] Found ${results.found} dishes with tags ${tags.join(', ')}`);

    return results;
  } catch (error) {
    console.error('[getDishesByTagList] Error getting dishes by tags:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Error getting dishes by tags',
    });
  }
};
