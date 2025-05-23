import { useState, useCallback } from 'react';
import { reviewService } from '@bellyfed/services';
import { useToast } from './useToast.js';
import { useAuth } from './useAuth.js';
import type {
  Review,
  CreateReviewParams,
  UpdateReviewParams,
  VisitStatus,
} from '@bellyfed/types';

/**
 * Interface for review state
 */
export interface ReviewState {
  /**
   * Whether review data is loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during review operations
   */
  error: Error | null;

  /**
   * List of reviews
   */
  reviews: Review[];

  /**
   * Top ranked reviews
   */
  topRankedReviews: Review[];

  /**
   * List of reviewed dish names for a restaurant
   */
  reviewedDishes: string[];
}

/**
 * Interface for review methods
 */
export interface ReviewMethods {
  /**
   * Get reviews for a restaurant
   * @param restaurantId - The restaurant ID
   */
  getReviews: (restaurantId: string) => Promise<void>;

  /**
   * Get reviews by a user
   * @param userId - The user ID
   */
  getUserReviews: (userId: string) => Promise<void>;

  /**
   * Get top-ranked reviews
   * @param limit - The maximum number of reviews to return
   */
  getTopRankedReviews: (limit?: number) => Promise<void>;

  /**
   * Get reviewed dishes for a restaurant
   * @param restaurantId - The restaurant ID
   */
  getReviewedDishes: (restaurantId: string) => Promise<void>;

  /**
   * Add a review
   * @param restaurantId - The restaurant ID
   * @param review - The review to add
   */
  addReview: (restaurantId: string, review: CreateReviewParams) => Promise<void>;

  /**
   * Update a review's ranking
   * @param reviewId - The review ID
   * @param newRank - The new rank
   */
  updateRanking: (reviewId: string, newRank: number) => Promise<void>;

  /**
   * Update a review's visit status
   * @param reviewId - The review ID
   * @param status - The new visit status
   */
  updateVisitStatus: (reviewId: string, status: VisitStatus) => Promise<void>;

  /**
   * Like a review
   * @param reviewId - The review ID
   */
  likeReview: (reviewId: string) => Promise<void>;

  /**
   * Unlike a review
   * @param reviewId - The review ID
   */
  unlikeReview: (reviewId: string) => Promise<void>;

  /**
   * Clear all reviews for a restaurant
   * @param restaurantId - The restaurant ID
   */
  clearAllReviews: (restaurantId: string) => Promise<void>;

  /**
   * Format visit status to a user-friendly string
   * @param status - The visit status
   */
  formatVisitStatus: (status: VisitStatus) => string;

  /**
   * Get color for visit status
   * @param status - The visit status
   */
  getVisitStatusColor: (status: VisitStatus) => string;

  /**
   * Format rank to a user-friendly string
   * @param rank - The rank
   */
  formatRank: (rank?: number) => string;

  /**
   * Reset the review state
   */
  reset: () => void;
}

/**
 * Hook for managing review submission and display
 *
 * @returns Review state and methods
 */
export function useReviews(): ReviewState & ReviewMethods {
  const toast = useToast();
  const { user } = useAuth();

  const [state, setState] = useState<ReviewState>({
    isLoading: false,
    error: null,
    reviews: [],
    topRankedReviews: [],
    reviewedDishes: [],
  });

  /**
   * Get reviews for a restaurant
   */
  const getReviews = useCallback(async (restaurantId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const reviews = await reviewService.getReviews(restaurantId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get reviews';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get reviews by a user
   */
  const getUserReviews = useCallback(async (userId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const reviews = await reviewService.getUserReviews(userId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get user reviews';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get top-ranked reviews
   */
  const getTopRankedReviews = useCallback(async (limit: number = 5): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const topRankedReviews = await reviewService.getTopRankedReviews(limit);

      setState(prev => ({
        ...prev,
        isLoading: false,
        topRankedReviews,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get top-ranked reviews';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Get reviewed dishes for a restaurant
   */
  const getReviewedDishes = useCallback(async (restaurantId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const reviewedDishes = reviewService.getReviewedDishes(restaurantId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviewedDishes,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to get reviewed dishes';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Add a review
   */
  const addReview = useCallback(async (
    restaurantId: string,
    review: CreateReviewParams
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await reviewService.addReview(restaurantId, review);

      // Refresh reviews for the restaurant
      const reviews = await reviewService.getReviews(restaurantId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews,
      }));

      toast.success('Review added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to add review';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Update a review's ranking
   */
  const updateRanking = useCallback(async (
    reviewId: string,
    newRank: number
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await reviewService.updateRanking(reviewId, newRank);

      // Update the review in the state
      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews: prev.reviews.map(review =>
          review.id === reviewId
            ? { ...review, rank: newRank }
            : review
        ),
      }));

      toast.success('Ranking updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update ranking';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Update a review's visit status
   */
  const updateVisitStatus = useCallback(async (
    reviewId: string,
    status: VisitStatus
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await reviewService.updateVisitStatus(reviewId, status);

      // Update the review in the state
      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews: prev.reviews.map(review =>
          review.id === reviewId
            ? { ...review, visitStatus: status }
            : review
        ),
      }));

      toast.success('Visit status updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update visit status';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Like a review
   */
  const likeReview = useCallback(async (reviewId: string): Promise<void> => {
    try {
      const success = await reviewService.likeReview(reviewId);

      if (success) {
        // Update the review in the state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  likes: (review.likes || 0) + 1,
                  isLiked: true,
                }
              : review
          ),
        }));
      } else {
        toast.error('Failed to like review');
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to like review';

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Unlike a review
   */
  const unlikeReview = useCallback(async (reviewId: string): Promise<void> => {
    try {
      const success = await reviewService.unlikeReview(reviewId);

      if (success) {
        // Update the review in the state
        setState(prev => ({
          ...prev,
          reviews: prev.reviews.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  likes: Math.max(0, (review.likes || 0) - 1),
                  isLiked: false,
                }
              : review
          ),
        }));
      } else {
        toast.error('Failed to unlike review');
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to unlike review';

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Clear all reviews for a restaurant
   */
  const clearAllReviews = useCallback(async (restaurantId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await reviewService.clearAllReviews(restaurantId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviews: [],
        reviewedDishes: [],
      }));

      toast.success('All reviews cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to clear reviews';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }));

      toast.error(errorMessage);
    }
  }, [toast]);

  /**
   * Format visit status to a user-friendly string
   */
  const formatVisitStatus = useCallback((status: VisitStatus): string => {
    return reviewService.formatVisitStatus(status);
  }, []);

  /**
   * Get color for visit status
   */
  const getVisitStatusColor = useCallback((status: VisitStatus): string => {
    return reviewService.getVisitStatusColor(status);
  }, []);

  /**
   * Format rank to a user-friendly string
   */
  const formatRank = useCallback((rank?: number): string => {
    return reviewService.formatRank(rank);
  }, []);

  /**
   * Reset the review state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      reviews: [],
      topRankedReviews: [],
      reviewedDishes: [],
    });
  }, []);

  return {
    ...state,
    getReviews,
    getUserReviews,
    getTopRankedReviews,
    getReviewedDishes,
    addReview,
    updateRanking,
    updateVisitStatus,
    likeReview,
    unlikeReview,
    clearAllReviews,
    formatVisitStatus,
    getVisitStatusColor,
    formatRank,
    reset,
  };
}
