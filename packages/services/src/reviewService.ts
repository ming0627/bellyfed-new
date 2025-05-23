/**
 * Review Service
 * Handles operations related to restaurant and dish reviews
 */

import { v4 as uuidv4 } from 'uuid';
import { Review, VisitStatus, formatVisitStatus, getVisitStatusColor, formatRank } from '@bellyfed/types/review.js';
import { cognitoAuthService } from './auth/cognitoAuthService.js';
import { mockDataService } from './mockDataService.js';

/**
 * Review Service class
 * Provides methods for managing reviews
 */
export class ReviewService {
  private reviews: Map<string, Review[]>;
  private readonly IS_DEV = process.env.NODE_ENV === 'development';
  private readonly USE_MOCK_DATA = true; // Toggle this to use mock data in development

  constructor() {
    this.reviews = new Map();

    // Load reviews from server when initialized
    if (typeof window !== 'undefined') {
      this.loadReviewsFromServer();
    }
  }

  /**
   * Load reviews from server
   * @private
   */
  private async loadReviewsFromServer() {
    try {
      const response = await fetch('/api/reviews', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          this.reviews = new Map(Object.entries(data));
        }
      }
    } catch (error: unknown) {
      console.error('Error loading reviews from server:', error);
    }
  }

  /**
   * Get reviews for a restaurant
   * @param restaurantId The restaurant ID
   * @returns The reviews for the restaurant
   */
  async getReviews(restaurantId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getReviews: ${restaurantId}`);
      return mockDataService.getUserReviews().filter(
        (review) => review.restaurantId === restaurantId,
      );
    }

    const reviews = this.reviews.get(restaurantId) || [];

    // Sort by rank (1-5 first, then unranked)
    return reviews.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      return 0;
    });
  }

  /**
   * Find an existing review
   * @param restaurantId The restaurant ID
   * @param dishName The dish name
   * @returns The existing review, if any
   * @private
   */
  private findExistingReview(
    restaurantId: string,
    dishName: string,
  ): Review | undefined {
    const reviews = this.reviews.get(restaurantId) || [];
    return reviews.find(
      (review) => review.dishName.toLowerCase() === dishName.toLowerCase(),
    );
  }

  /**
   * Add a review
   * @param restaurantId The restaurant ID
   * @param review The review to add
   * @returns The added review
   */
  async addReview(restaurantId: string, review: Partial<Review>): Promise<any> {
    if (!review.dishName) {
      throw new Error('Dish name is required');
    }

    // Get current user from auth session
    const session = cognitoAuthService.getCurrentSession();
    if (!session.isSignedIn) {
      throw new Error('User must be authenticated to add a review');
    }
    const user = await cognitoAuthService.getCurrentUser();
    const userId = user?.username || 'unknown-user';

    // Check for existing review of the same dish
    const existingReview = this.findExistingReview(
      restaurantId,
      review.dishName,
    );
    if (existingReview) {
      throw new Error('A review for this dish already exists');
    }

    // If using mock data in development, use the local approach
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      const newReview: Review = {
        id: uuidv4(),
        authorId: userId,
        authorName: user?.attributes?.name || userId,
        restaurantId: restaurantId,
        restaurantName: review.restaurantName || '',
        dishId: review.dishId || '',
        dishName: review.dishName,
        comment: review.comment || '',
        notes: review.notes || '',
        visitStatus: review.visitStatus || VisitStatus.ACCEPTABLE,
        photos: review.photos || [],
        rank: review.rank,
        visitDate: review.visitDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      const existingReviews = this.reviews.get(restaurantId) || [];
      this.reviews.set(restaurantId, [...existingReviews, newReview]);
      return newReview;
    }

    // In production, use the API
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          dishName: review.dishName,
          comment: review.comment || '',
          notes: review.notes || '',
          visitStatus: review.visitStatus || VisitStatus.ACCEPTABLE,
          visitDate: review.visitDate || new Date().toISOString(),
          photos: review.photos || [],
          rank: review.rank,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review');
      }

      const responseData = await response.json();

      // If the response indicates an asynchronous process
      if (response.status === 202 && responseData.status === 'PROCESSING') {
        console.log('Review creation in progress:', responseData);

        // We could implement polling here to check the status
        // For now, we'll just return the response data
        return responseData;
      }

      return responseData;
    } catch (error: unknown) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update a review's ranking
   * @param reviewId The review ID
   * @param newRank The new rank
   * @returns The updated review
   */
  async updateRanking(reviewId: string, newRank: number): Promise<any> {
    // If using mock data in development, use the local approach
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      // Convert Map entries to array for iteration
      const entries = Array.from(this.reviews);
      for (const [restaurantId, reviews] of entries) {
        const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          // If promoting to a rank, ensure no other review has this rank
          if (newRank > 0) {
            const existingWithRank = reviews.find((r) => r.rank === newRank);
            if (existingWithRank) {
              // Swap ranks
              existingWithRank.rank = reviews[reviewIndex].rank || 0;
            }
          }

          reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            rank: newRank,
            updatedAt: new Date().toISOString(),
          };

          this.reviews.set(restaurantId, reviews);
          return reviews[reviewIndex];
        }
      }
      throw new Error('Review not found');
    }

    // In production, use the API
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rank: newRank,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review ranking');
      }

      const responseData = await response.json();

      // If the response indicates an asynchronous process
      if (response.status === 202 && responseData.status === 'PROCESSING') {
        console.log('Review update in progress:', responseData);

        // We could implement polling here to check the status
        // For now, we'll just return the response data
        return responseData;
      }

      return responseData;
    } catch (error: unknown) {
      console.error('Error updating review ranking:', error);
      throw error;
    }
  }

  /**
   * Update a review's visit status
   * @param reviewId The review ID
   * @param status The new visit status
   * @returns The updated review
   */
  async updateVisitStatus(reviewId: string, status: VisitStatus): Promise<any> {
    // If using mock data in development, use the local approach
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      // Convert Map entries to array for iteration
      const entries = Array.from(this.reviews);
      for (const [restaurantId, reviews] of entries) {
        const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            visitStatus: status,
            updatedAt: new Date().toISOString(),
          };

          this.reviews.set(restaurantId, reviews);
          return reviews[reviewIndex];
        }
      }
      throw new Error('Review not found');
    }

    // In production, use the API
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitStatus: status,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update visit status');
      }

      const responseData = await response.json();

      // If the response indicates an asynchronous process
      if (response.status === 202 && responseData.status === 'PROCESSING') {
        console.log('Review update in progress:', responseData);

        // We could implement polling here to check the status
        // For now, we'll just return the response data
        return responseData;
      }

      return responseData;
    } catch (error: unknown) {
      console.error('Error updating visit status:', error);
      throw error;
    }
  }

  /**
   * Clear all reviews for a restaurant
   * @param restaurantId The restaurant ID
   * @returns Success status
   */
  async clearAllReviews(restaurantId: string): Promise<any> {
    // If using mock data in development, use the local approach
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      this.reviews.delete(restaurantId);
      return { success: true };
    }

    // In production, use the API
    try {
      // Get all reviews for the restaurant
      const reviews = await this.getReviews(restaurantId);

      // Delete each review
      const deletePromises = reviews.map((review) =>
        fetch(`/api/reviews/${review.id}`, {
          method: 'DELETE',
          credentials: 'include',
        }),
      );

      // Wait for all deletions to complete
      const results = await Promise.all(deletePromises);

      // Check if any deletions failed
      const failedDeletions = results.filter((response) => !response.ok);
      if (failedDeletions.length > 0) {
        throw new Error(`Failed to delete ${failedDeletions.length} reviews`);
      }

      return { success: true, message: `Deleted ${reviews.length} reviews` };
    } catch (error: unknown) {
      console.error('Error clearing reviews:', error);
      throw error;
    }
  }

  /**
   * Get reviews by a user
   * @param userId The user ID
   * @returns The user's reviews
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserReviews: ${userId}`);
      return mockDataService.getUserReviews();
    }

    const allReviews: Review[] = [];
    const entries = Array.from(this.reviews);

    for (const [, reviews] of entries) {
      const userReviews = reviews.filter(
        (review) => review.authorId === userId,
      );
      allReviews.push(...userReviews);
    }

    // Sort by date, newest first
    return allReviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Get reviewed dishes for a restaurant
   * @param restaurantId The restaurant ID
   * @returns The reviewed dish names
   */
  getReviewedDishes(restaurantId: string): string[] {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getReviewedDishes: ${restaurantId}`);
      return mockDataService.getUserReviews()
        .filter((review) => review.restaurantId === restaurantId)
        .map((review) => review.dishName);
    }

    const reviews = this.reviews.get(restaurantId) || [];
    return reviews.map((review) => review.dishName);
  }

  /**
   * Like a review
   * @param reviewId The review ID
   * @returns Success status
   */
  async likeReview(reviewId: string): Promise<boolean> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for likeReview: ${reviewId}`);

      // Find the review in all restaurants
      const entries = Array.from(this.reviews);
      for (const [restaurantId, reviews] of entries) {
        const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          // Update the review
          reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            likes: (reviews[reviewIndex].likes || 0) + 1,
            isLiked: true,
            updatedAt: new Date().toISOString(),
          };

          this.reviews.set(restaurantId, reviews);
          return true;
        }
      }

      return false;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error: unknown) {
      console.error('Error liking review:', error);
      return false;
    }
  }

  /**
   * Unlike a review
   * @param reviewId The review ID
   * @returns Success status
   */
  async unlikeReview(reviewId: string): Promise<boolean> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for unlikeReview: ${reviewId}`);

      // Find the review in all restaurants
      const entries = Array.from(this.reviews);
      for (const [restaurantId, reviews] of entries) {
        const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          // Update the review
          reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            likes: Math.max(0, (reviews[reviewIndex].likes || 0) - 1),
            isLiked: false,
            updatedAt: new Date().toISOString(),
          };

          this.reviews.set(restaurantId, reviews);
          return true;
        }
      }

      return false;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/unlike`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error: unknown) {
      console.error('Error unliking review:', error);
      return false;
    }
  }

  /**
   * Get top-ranked reviews
   * @param limit The maximum number of reviews to return
   * @returns The top-ranked reviews
   */
  async getTopRankedReviews(limit: number = 5): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getTopRankedReviews: ${limit}`);

      // Get all reviews from all restaurants
      const allReviews: Review[] = [];
      mockDataService.getUserReviews().forEach(review => {
        if (review.rank && review.rank > 0 && review.rank <= 5) {
          allReviews.push(review);
        }
      });

      // Sort by rank
      return allReviews
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, limit);
    }

    try {
      const response = await fetch(`/api/reviews/top?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top-ranked reviews');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error fetching top-ranked reviews:', error);
      return [];
    }
  }

  /**
   * Format visit status to a user-friendly string
   * @param status The visit status
   * @returns The formatted status
   */
  formatVisitStatus(status: VisitStatus): string {
    return formatVisitStatus(status);
  }

  /**
   * Get color for visit status
   * @param status The visit status
   * @returns The color for the status
   */
  getVisitStatusColor(status: VisitStatus): string {
    return getVisitStatusColor(status);
  }

  /**
   * Format rank to a user-friendly string
   * @param rank The rank
   * @returns The formatted rank
   */
  formatRank(rank?: number): string {
    return formatRank(rank);
  }
}

// Create a singleton instance
let reviewServiceInstance: ReviewService | null = null;

export const reviewService = ((): ReviewService => {
  if (typeof window !== 'undefined') {
    if (!reviewServiceInstance) {
      reviewServiceInstance = new ReviewService();
    }
    return reviewServiceInstance;
  }

  // For SSR, return a new instance each time that doesn't use localStorage
  return new ReviewService();
})();
