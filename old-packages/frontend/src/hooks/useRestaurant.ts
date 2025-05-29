/**
 * Hook for restaurant data
 */

import { useCountry } from '@/contexts/CountryContext';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Hook for getting restaurant data
 *
 * @param id Restaurant ID
 * @returns Restaurant data and loading state
 */
export const useRestaurant = (id?: string) => {
  // Country is used in other functions but not here
  // const { country } = useCountry();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get restaurant data
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        return await restaurantService.getRestaurantById(id);
      } catch (error: unknown) {
        setError(error as Error);
        throw error;
      }
    },
    enabled: !!id,
  });

  // Get restaurant with dishes
  const { data: restaurantWithDishes, isLoading: isLoadingDishes } = useQuery({
    queryKey: ['restaurant-dishes', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        return await restaurantService.getRestaurantWithDishes(id);
      } catch (error: unknown) {
        console.error('Error getting restaurant dishes:', error);
        return null;
      }
    },
    enabled: !!id && !!restaurant,
  });

  // Get restaurant reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['restaurant-reviews', id],
    queryFn: async () => {
      if (!id) return [];

      try {
        return await restaurantService.getRestaurantReviews(id);
      } catch (error: unknown) {
        console.error('Error getting restaurant reviews:', error);
        return [];
      }
    },
    enabled: !!id && !!restaurant,
  });

  // Like restaurant mutation
  const likeMutation = useMutation({
    mutationFn: (restaurantId: string) =>
      restaurantService.likeRestaurant(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
    },
  });

  // Unlike restaurant mutation
  const unlikeMutation = useMutation({
    mutationFn: (restaurantId: string) =>
      restaurantService.unlikeRestaurant(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
    },
  });

  // Like restaurant
  const likeRestaurant = async () => {
    if (!id) return;
    await likeMutation.mutateAsync(id);
  };

  // Unlike restaurant
  const unlikeRestaurant = async () => {
    if (!id) return;
    await unlikeMutation.mutateAsync(id);
  };

  return {
    restaurant,
    restaurantWithDishes,
    reviews,
    isLoading: isLoading || isLoadingDishes || isLoadingReviews,
    error,
    likeRestaurant,
    unlikeRestaurant,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
  };
};

/**
 * Hook for searching restaurants
 *
 * @returns Restaurant search functions and state
 */
export function useRestaurantSearch() {
  const { countryCode } = useCountry();
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    undefined,
  );

  // Search restaurants with advanced parameters
  const searchRestaurants = async (params: {
    query?: string;
    cuisine?: string;
    maxPrice?: string;
    countryCode?: string;
    limit?: number;
    nextPageToken?: string;
  }) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await restaurantService.searchRestaurants({
        ...params,
        countryCode: params.countryCode || countryCode,
      });

      setSearchResults(response.restaurants || []);
      setTotalCount(response.totalCount || 0);
      setNextPageToken(response.nextPageToken);
    } catch (error: unknown) {
      setError(error as Error);
      console.error('Error searching restaurants:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Search restaurants by location
  const searchRestaurantsByLocation = async (
    latitude: number,
    longitude: number,
    radius = 1000,
    query = '',
    limit = 20,
  ) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await restaurantService.searchRestaurants({
        query,
        latitude,
        longitude,
        radius,
        countryCode,
        limit,
      });

      setSearchResults(response.restaurants || []);
      setTotalCount(response.totalCount || 0);
      setNextPageToken(response.nextPageToken);
    } catch (error: unknown) {
      setError(error as Error);
      console.error('Error searching restaurants by location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Load more results
  const loadMore = async () => {
    if (!nextPageToken || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await restaurantService.searchRestaurants({
        countryCode,
        nextPageToken: nextPageToken,
      });

      setSearchResults((prev) => [...prev, ...(response.restaurants || [])]);
      setTotalCount(response.totalCount || 0);
      setNextPageToken(response.nextPageToken);
    } catch (error: unknown) {
      setError(error as Error);
      console.error('Error loading more restaurants:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchResults,
    isSearching,
    error,
    totalCount,
    hasMore: !!nextPageToken,
    searchRestaurants,
    searchRestaurantsByLocation,
    loadMore,
  };
}

/**
 * Hook for getting nearby restaurants
 *
 * @returns Nearby restaurants functions and state
 */
export function useNearbyRestaurants() {
  const { countryCode } = useCountry();
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get nearby restaurants
  const getNearbyRestaurants = async (
    latitude: number,
    longitude: number,
    radius = 1000,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const restaurants = await restaurantService.getNearbyRestaurants(
        latitude,
        longitude,
        countryCode,
        radius,
      );

      setNearbyRestaurants(restaurants);
    } catch (error: unknown) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nearbyRestaurants,
    isLoading,
    error,
    getNearbyRestaurants,
  };
}
