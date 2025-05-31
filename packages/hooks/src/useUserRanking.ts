/**
 * User Ranking Hook
 *
 * This hook provides functionality for managing user dish rankings.
 * It uses React Query for data fetching and caching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast.js';
import { useCognitoUser } from './useCognitoUser.js';
import { useUserProfile } from './useUserProfile.js';
import { ApiService } from '@bellyfed/services';

/**
 * User Ranking interface
 * Represents a user's ranking of a dish
 */
export interface UserRanking {
  /**
   * Ranking ID
   */
  rankingId?: string;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Dish ID
   */
  dishId: string;

  /**
   * Restaurant ID
   */
  restaurantId: string;

  /**
   * Restaurant name
   */
  restaurantName?: string;

  /**
   * Restaurant address
   */
  restaurantAddress?: string;

  /**
   * Dish type
   */
  dishType?: string;

  /**
   * Rank (1-5, with 1 being the best)
   */
  rank?: number | null;

  /**
   * Taste status (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED)
   */
  tasteStatus?: string | null;

  /**
   * Notes about the dish
   */
  notes?: string;

  /**
   * Photo URLs
   */
  photoUrls?: string[];

  /**
   * Created at timestamp
   */
  createdAt?: string;

  /**
   * Updated at timestamp
   */
  updatedAt?: string;
}

/**
 * Dish Details interface
 * Represents details about a dish
 */
export interface DishDetails {
  /**
   * Dish ID
   */
  dishId: string;

  /**
   * Dish name
   */
  name: string;

  /**
   * Dish description
   */
  description: string;

  /**
   * Restaurant ID
   */
  restaurantId: string;

  /**
   * Restaurant name
   */
  restaurantName: string;

  /**
   * Dish category
   */
  category: string;

  /**
   * Image URL
   */
  imageUrl: string;

  /**
   * Whether the dish is vegetarian
   */
  isVegetarian: boolean;

  /**
   * Spicy level (0-5)
   */
  spicyLevel: number;

  /**
   * Price
   */
  price: number;

  /**
   * Country code
   */
  countryCode: string;
}

/**
 * Ranking Stats interface
 * Represents statistics about a dish's rankings
 */
export interface RankingStats {
  /**
   * Total number of rankings
   */
  totalRankings: number;

  /**
   * Average rank
   */
  averageRank: number;

  /**
   * Counts of each rank
   */
  ranks: Record<string, number>;

  /**
   * Counts of each taste status
   */
  tasteStatuses: Record<string, number>;
}

/**
 * User Ranking State interface
 */
export interface UserRankingState {
  /**
   * User ranking
   */
  userRanking: UserRanking | null;

  /**
   * Dish details
   */
  dishDetails: DishDetails | null;

  /**
   * Ranking statistics
   */
  rankingStats: RankingStats | null;

  /**
   * Whether data is loading
   */
  isLoading: boolean;

  /**
   * Whether a mutation is in progress
   */
  isUpdating: boolean;

  /**
   * Any error that occurred
   */
  error: Error | null;
}

/**
 * User Ranking Methods interface
 */
export interface UserRankingMethods {
  /**
   * Create or update a ranking
   */
  createOrUpdateRanking: (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId?: string;
    restaurantName?: string;
  }) => Promise<void>;

  /**
   * Delete a ranking
   */
  deleteRanking: () => Promise<void>;

  /**
   * Reset the state
   */
  reset: () => void;
}

// Define query keys
const USER_RANKING_KEY = 'userRanking';

/**
 * Hook for managing user dish rankings
 *
 * @param dishSlug The dish slug
 * @param dishId Optional dish ID
 * @returns User ranking state and methods
 */
export function useUserRanking(
  dishSlug: string,
  dishId?: string,
): UserRankingState & UserRankingMethods {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user: cognitoUser } = useCognitoUser();
  const { profile } = useUserProfile();

  // Initialize state
  const [state, setState] = useState<UserRankingState>({
    userRanking: null,
    dishDetails: null,
    rankingStats: null,
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  /**
   * Fetch user ranking data
   */
  const {
    data: userRankingData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [USER_RANKING_KEY, dishSlug, dishId],
    queryFn: async () => {
      try {
        if (!dishSlug) throw new Error('Dish slug is required');

        const response = await fetch(
          `/api/rankings/my/${dishSlug}${dishId ? `?dishId=${dishId}` : ''}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user ranking');
        }

        return await response.json();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch user ranking';

        console.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: !!dishSlug && (!!cognitoUser || !!profile),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: () => {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          userRanking: {
            rankingId: 'ranking1',
            userId: 'user1',
            dishId: dishId || 'dish1',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            restaurantAddress:
              '5, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor',
            dishType: 'Malaysian',
            rank: 1,
            tasteStatus: null,
            notes:
              'This is the best Nasi Lemak I have ever had! The sambal is perfectly balanced with just the right amount of spice.',
            photoUrls: ['/images/placeholder-dish.jpg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          dishDetails: {
            dishId: dishId || 'dish1',
            name: 'Nasi Lemak Special',
            description:
              'Fragrant coconut rice served with spicy sambal, crispy anchovies, roasted peanuts, cucumber slices, and a perfectly cooked egg',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            category: 'Malaysian',
            imageUrl:
              'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
            isVegetarian: false,
            spicyLevel: 2,
            price: 15.9,
            countryCode: 'my',
          },
          rankingStats: {
            totalRankings: 1250,
            averageRank: 4.8,
            ranks: { '1': 850, '2': 250, '3': 100, '4': 30, '5': 20 },
            tasteStatuses: {
              ACCEPTABLE: 950,
              SECOND_CHANCE: 250,
              DISSATISFIED: 50,
            },
          },
        };
      }
      return undefined;
    },
  });

  /**
   * Create or update ranking mutation
   */
  const createOrUpdateRankingMutation = useMutation({
    mutationFn: async (data: {
      rank: number | null;
      tasteStatus: string | null;
      notes: string;
      photoUrls: string[];
      restaurantId?: string;
      restaurantName?: string;
    }) => {
      try {
        if (!state.dishDetails) {
          throw new Error('Dish details not available');
        }

        const method = state.userRanking?.rankingId ? 'PUT' : 'POST';
        const response = await fetch(`/api/rankings/my/${dishSlug}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dishId: state.dishDetails.dishId,
            restaurantId: data.restaurantId || state.dishDetails.restaurantId,
            restaurantName: data.restaurantName || state.dishDetails.restaurantName,
            dishType: state.dishDetails.category,
            ...data,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to ${state.userRanking?.rankingId ? 'update' : 'create'} ranking`,
          );
        }

        return await response.json();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : `Failed to ${state.userRanking?.rankingId ? 'update' : 'create'} ranking`;

        console.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData([USER_RANKING_KEY, dishSlug, dishId], data);

      // Show success message
      toast.success(
        state.userRanking?.rankingId
          ? 'Your ranking has been updated'
          : 'Your ranking has been created'
      );
    },
    onError: (error) => {
      console.error(
        `Error ${state.userRanking?.rankingId ? 'updating' : 'creating'} ranking:`,
        error,
      );

      // Show error message
      toast.error(
        `Failed to ${state.userRanking?.rankingId ? 'update' : 'create'} ranking. Please try again.`
      );
    },
  });

  /**
   * Delete ranking mutation
   */
  const deleteRankingMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!state.userRanking?.rankingId) {
          throw new Error('No ranking to delete');
        }

        const response = await fetch(`/api/rankings/my/${dishSlug}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rankingId: state.userRanking.rankingId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete ranking');
        }

        return await response.json();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to delete ranking';

        console.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Update the cache to remove the ranking
      queryClient.setQueryData(
        [USER_RANKING_KEY, dishSlug, dishId],
        (oldData: any) => ({
          ...oldData,
          userRanking: null,
        }),
      );

      // Show success message
      toast.success('Your ranking has been deleted');
    },
    onError: (error) => {
      console.error('Error deleting ranking:', error);

      // Show error message
      toast.error('Failed to delete ranking. Please try again.');
    },
  });

  /**
   * Create or update ranking
   */
  const createOrUpdateRanking = useCallback(async (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId?: string;
    restaurantName?: string;
  }): Promise<void> => {
    await createOrUpdateRankingMutation.mutateAsync(data);
  }, [createOrUpdateRankingMutation]);

  /**
   * Delete ranking
   */
  const deleteRanking = useCallback(async (): Promise<void> => {
    await deleteRankingMutation.mutateAsync();
  }, [deleteRankingMutation]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      userRanking: null,
      dishDetails: null,
      rankingStats: null,
      isLoading: false,
      isUpdating: false,
      error: null,
    });
  }, []);

  /**
   * Update state when data changes
   */
  useEffect(() => {
    setState({
      userRanking: userRankingData?.userRanking || null,
      dishDetails: userRankingData?.dishDetails || null,
      rankingStats: userRankingData?.rankingStats || null,
      isLoading,
      isUpdating: createOrUpdateRankingMutation.isLoading || deleteRankingMutation.isLoading,
      error: error as Error | null,
    });
  }, [
    userRankingData,
    isLoading,
    error,
    createOrUpdateRankingMutation.isLoading,
    deleteRankingMutation.isLoading,
  ]);

  return {
    ...state,
    createOrUpdateRanking,
    deleteRanking,
    reset,
  };
}
