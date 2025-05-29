import { Review, VisitStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import cognitoAuthService from './cognitoAuthService';
import { MockDataService } from './mockDataService';

// Create a singleton instance that's safe for SSR
let reviewServiceInstance: ReviewService | null = null;

class ReviewService {
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

  // Method removed as it was unused

  async getReviews(restaurantId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getReviews: ${restaurantId}`);
      return MockDataService.getUserReviews().filter(
        (review) => review.establishmentId === restaurantId,
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

  private findExistingReview(
    restaurantId: string,
    dishName: string,
  ): Review | undefined {
    const reviews = this.reviews.get(restaurantId) || [];
    return reviews.find(
      (review) => review.dishName.toLowerCase() === dishName.toLowerCase(),
    );
  }

  async addReview(restaurantId: string, review: Partial<Review>): Promise<any> {
    if (!review.dishName) {
      throw new Error('Dish name is required');
    }

    // Get current user from auth session
    const session = cognitoAuthService.getCurrentSession();
    if (!session.isSignedIn || !session.accessToken) {
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
        establishmentId: restaurantId,
        userId,
        dishName: review.dishName,
        comment: review.comment || '',
        notes: review.notes || '',
        visitStatus: review.visitStatus,
        photos: review.photos || [],
        rank: review.rank || 0,
        rating: review.rating || 0,
        visitDate: review.visitDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
          rating: review.rating || 5,
          text: review.comment || '',
          visitStatus: review.visitStatus || 'VISITED',
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

  async getUserReviews(userId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserReviews: ${userId}`);
      return MockDataService.getUserReviews();
    }

    const allReviews: Review[] = [];
    const entries = Array.from(this.reviews);

    for (const [, reviews] of entries) {
      const userReviews = reviews.filter(
        (review) => review.userId === 'user-123',
      );
      allReviews.push(...userReviews);
    }

    // Sort by date, newest first
    return allReviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getReviewedDishes(restaurantId: string): string[] {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getReviewedDishes: ${restaurantId}`);
      return MockDataService.getUserReviews()
        .filter((review) => review.establishmentId === restaurantId)
        .map((review) => review.dishName);
    }

    const reviews = this.reviews.get(restaurantId) || [];
    return reviews.map((review) => review.dishName);
  }
}

// Create a singleton instance
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
