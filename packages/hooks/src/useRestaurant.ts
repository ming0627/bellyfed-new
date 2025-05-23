import { useState, useCallback } from 'react';
import { restaurantService } from '@bellyfed/services';
import { useToast } from './useToast.js';
import { useCountry } from './useCountry.js';
import type {
  Restaurant,
  RestaurantWithDishes,
  RestaurantSearchParams,
} from '@bellyfed/types';

/**
 * Interface for restaurant state
 */
export interface RestaurantState {
  /**
   * Whether restaurant data is loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during restaurant operations
   */
  error: Error | null;

  /**
   * Current restaurant data
   */
  restaurant: Restaurant | null;

  /**
   * Current restaurant with dishes data
   */
  restaurantWithDishes: RestaurantWithDishes | null;

  /**
   * List of restaurants
   */
  restaurants: Restaurant[];

  /**
   * Total count of restaurants in search results
   */
  totalCount: number;

  /**
   * Next page token for pagination
   */
  nextPageToken?: string;

  /**
   * Whether the user has liked the restaurant
   */
  isLiked: boolean;
}

/**
 * Interface for restaurant methods
 */
export interface RestaurantMethods {
  /**
   * Get a restaurant by ID
   * @param id - The restaurant ID
   */
  getRestaurantById: (id: string) => Promise<void>;

  /**
   * Get a restaurant with dishes by ID
   * @param id - The restaurant ID
   */
  getRestaurantWithDishes: (id: string) => Promise<void>;

  /**
   * Search restaurants
   * @param params - The search parameters
   */
  searchRestaurants: (params: RestaurantSearchParams) => Promise<void>;

  /**
   * List restaurants
   * @param limit - The maximum number of restaurants to return
   * @param nextPageToken - The token for the next page of results
   * @param countryCode - The country code to filter by
   */
  listRestaurants: (
    limit?: number,
    nextPageToken?: string,
    countryCode?: string
  ) => Promise<void>;

  /**
   * Like a restaurant
   * @param id - The restaurant ID
   */
  likeRestaurant: (id: string) => Promise<void>;

  /**
   * Unlike a restaurant
   * @param id - The restaurant ID
   */
  unlikeRestaurant: (id: string) => Promise<void>;

  /**
   * Get restaurants by dish ID
   * @param dishId - The dish ID
   */
  getRestaurantsByDishId: (dishId: string) => Promise<void>;

  /**
   * Get nearby restaurants
   * @param latitude - The latitude
   * @param longitude - The longitude
   * @param radius - The radius in meters
   */
  getNearbyRestaurants: (
    latitude: number,
    longitude: number,
    radius?: number
  ) => Promise<void>;

  /**
   * Reset the restaurant state
   */
  reset: () => void;
}

/**
 * Hook for fetching and managing restaurant data
 *
 * @returns Restaurant state and methods
 */
export function useRestaurant(): RestaurantState & RestaurantMethods {
  const toast = useToast();
  const { currentCountry } = useCountry();

  const [state, setState] = useState<RestaurantState>({
    isLoading: false,
    error: null,
    restaurant: null,
    restaurantWithDishes: null,
    restaurants: [],
    totalCount: 0,
    nextPageToken: undefined,
    isLiked: false,
  });

  /**
   * Get a restaurant by ID
   */
  const getRestaurantById = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const restaurant = await restaurantService.getRestaurantById(id);

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurant,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get restaurant';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get a restaurant with dishes by ID
   */
  const getRestaurantWithDishes = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const restaurantWithDishes = await restaurantService.getRestaurantWithDishes(id);

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurantWithDishes,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get restaurant with dishes';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Search restaurants
   */
  const searchRestaurants = useCallback(async (params: RestaurantSearchParams): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Add country code if available and convert maxPrice to string if it's a number
      const searchParams = {
        ...params,
        countryCode: params.countryCode || currentCountry?.code,
        maxPrice: params.maxPrice ? params.maxPrice.toString() : undefined,
      };

      const { restaurants, totalCount, nextPageToken } = await restaurantService.searchRestaurants(searchParams);

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurants,
        totalCount,
        nextPageToken,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to search restaurants';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast, currentCountry]);

  /**
   * List restaurants
   */
  const listRestaurants = useCallback(async (
    limit?: number,
    nextPageToken?: string,
    countryCode?: string
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { restaurants, totalCount, nextPageToken: newNextPageToken } = await restaurantService.listRestaurants({
        limit,
        nextPageToken,
        countryCode: countryCode || currentCountry?.code,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurants,
        totalCount,
        nextPageToken: newNextPageToken,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to list restaurants';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast, currentCountry]);

  /**
   * Like a restaurant
   */
  const likeRestaurant = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await restaurantService.likeRestaurant(id);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLiked: true,
      }));

      toast.success('Restaurant added to favorites');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to like restaurant';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Unlike a restaurant
   */
  const unlikeRestaurant = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await restaurantService.unlikeRestaurant(id);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLiked: false,
      }));

      toast.success('Restaurant removed from favorites');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to unlike restaurant';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get restaurants by dish ID
   */
  const getRestaurantsByDishId = useCallback(async (dishId: string): Promise<void> => {
    if (!currentCountry?.code) {
      toast.error('Country code is required');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const restaurants = await restaurantService.getRestaurantsByDishId(
        dishId,
        currentCountry.code
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurants,
        totalCount: restaurants.length,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get restaurants by dish ID';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast, currentCountry]);

  /**
   * Get nearby restaurants
   */
  const getNearbyRestaurants = useCallback(async (
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<void> => {
    if (!currentCountry?.code) {
      toast.error('Country code is required');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const restaurants = await restaurantService.getNearbyRestaurants(
        latitude,
        longitude,
        currentCountry.code,
        radius
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        restaurants,
        totalCount: restaurants.length,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get nearby restaurants';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast, currentCountry]);

  /**
   * Reset the restaurant state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      restaurant: null,
      restaurantWithDishes: null,
      restaurants: [],
      totalCount: 0,
      nextPageToken: undefined,
      isLiked: false,
    });
  }, []);

  return {
    ...state,
    getRestaurantById,
    getRestaurantWithDishes,
    searchRestaurants,
    listRestaurants,
    likeRestaurant,
    unlikeRestaurant,
    getRestaurantsByDishId,
    getNearbyRestaurants,
    reset,
  };
}
