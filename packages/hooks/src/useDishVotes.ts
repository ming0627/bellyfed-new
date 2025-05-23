import { useState, useCallback } from 'react';
import { ApiService } from '@bellyfed/services';
import { useAuth } from './useAuth.js';
import { useToast } from './useToast.js';

/**
 * Interface for dish vote stats
 */
export interface DishVoteStats {
  /**
   * Total number of votes
   */
  totalVotes: number;

  /**
   * Average rating (1-5)
   */
  averageRating: number;

  /**
   * Ratings breakdown by rating value
   */
  ratings: Record<string, number>;
}

/**
 * Interface for dish vote state
 */
export interface DishVoteState {
  /**
   * Whether vote data is loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during voting operations
   */
  error: Error | null;

  /**
   * Vote stats for the dish
   */
  voteStats: DishVoteStats | null;

  /**
   * User's current vote for the dish
   */
  userVote: number | null;
}

/**
 * Interface for dish vote methods
 */
export interface DishVoteMethods {
  /**
   * Vote for a dish
   * @param dishId - The dish ID
   * @param restaurantId - The restaurant ID
   * @param rating - The rating (1-5)
   */
  voteDish: (
    dishId: string,
    restaurantId: string,
    rating: number
  ) => Promise<void>;

  /**
   * Get vote stats for a dish
   * @param dishId - The dish ID
   */
  getDishVotes: (dishId: string) => Promise<void>;

  /**
   * Get user's vote for a dish
   * @param dishId - The dish ID
   */
  getUserVoteForDish: (dishId: string) => Promise<void>;

  /**
   * Reset the vote state
   */
  reset: () => void;
}

/**
 * Hook for handling dish voting functionality
 *
 * @returns Dish vote state and methods
 */
export function useDishVotes(): DishVoteState & DishVoteMethods {
  const { user } = useAuth();
  const toast = useToast();

  const [state, setState] = useState<DishVoteState>({
    isLoading: false,
    error: null,
    voteStats: null,
    userVote: null,
  });

  /**
   * Vote for a dish
   */
  const voteDish = useCallback(
    async (
      dishId: string,
      restaurantId: string,
      rating: number
    ): Promise<void> => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Validate rating
        const validRating = Math.min(Math.max(Math.round(rating), 1), 5);

        // Call API to vote for the dish
        await ApiService.post('/api/proxy/dishes/vote', {
          dishId,
          restaurantId,
          rating: validRating,
          userId: user?.id,
        });

        // Update state with new vote
        setState(prev => ({
          ...prev,
          isLoading: false,
          userVote: validRating,
        }));

        // Show success toast
        toast.success('Your vote has been recorded!');

        // Refresh vote stats
        await getDishVotes(dishId);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to vote for dish';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));

        // Show error toast
        toast.error(errorMessage);
      }
    },
    [user, toast]
  );

  /**
   * Get vote stats for a dish
   */
  const getDishVotes = useCallback(async (dishId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Call API to get dish votes
      const response = await ApiService.get<{
        total_votes: number;
        average_rating: number;
        ratings: Record<string, number>;
      }>(`/api/proxy/dishes/${dishId}/votes`);

      // Update state with vote stats
      setState(prev => ({
        ...prev,
        isLoading: false,
        voteStats: {
          totalVotes: response.total_votes,
          averageRating: response.average_rating,
          ratings: response.ratings,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get dish votes';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      // Show error toast
      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get user's vote for a dish
   */
  const getUserVoteForDish = useCallback(
    async (dishId: string): Promise<void> => {
      // If user is not authenticated, return
      if (!user) {
        setState(prev => ({ ...prev, userVote: null }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Call API to get user's vote for the dish
        const response = await ApiService.get<{ rating: number }>(
          `/api/proxy/users/${user.id}/dishes/${dishId}/vote`
        );

        // Update state with user's vote
        setState(prev => ({
          ...prev,
          isLoading: false,
          userVote: response.rating,
        }));
      } catch (error) {
        // If error is 404, user hasn't voted yet
        if (error instanceof Error && error.message.includes('404')) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            userVote: null,
          }));
          return;
        }

        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to get user vote';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        }));
      }
    },
    [user]
  );

  /**
   * Reset the vote state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      voteStats: null,
      userVote: null,
    });
  }, []);

  return {
    ...state,
    voteDish,
    getDishVotes,
    getUserVoteForDish,
    reset,
  };
}
