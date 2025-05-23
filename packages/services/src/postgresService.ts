/**
 * PostgreSQL Service
 * Handles interactions with the PostgreSQL database through API endpoints
 */

import { ApiService } from './api.js';

export interface PostgresError extends Error {
  code?: string;
  statusCode?: number;
}

// User interfaces
export interface User {
  id: string;
  cognito_id?: string;
  email: string;
  name: string;
  phone?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// Dish interfaces
export interface Dish {
  id: string;
  name: string;
  description?: string;
  price?: number;
  restaurant_id: string;
  dish_type?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Ranking interfaces
export interface DishRanking {
  id: string;
  user_id: string;
  dish_id: string;
  restaurant_id: string;
  rank: number | null;
  taste_status: string | null;
  notes?: string;
  photo_urls?: string[];
  timestamp: string;
}

export interface RankingStats {
  total_votes: number;
  average_rank: number;
  ranks: Record<string, number>;
}

// Vote interfaces (for backward compatibility)
export interface VoteStats {
  total_votes: number;
  average_rating: number;
  ratings: Record<string, number>;
}

export interface IPostgresService {
  getUserById(userId: string): Promise<User>;
  getUserByCognitoId(cognitoId: string): Promise<User>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(userId: string, userData: Partial<User>): Promise<User>;
  getDishById(dishId: string): Promise<Dish>;
  getDishesByRestaurant(restaurantId: string): Promise<Dish[]>;
  getDishRankings(dishId: string): Promise<RankingStats>;
  getDishVotes(dishId: string): Promise<VoteStats>;
  createRanking(rankingData: {
    userId: string;
    dishId: string;
    restaurantId: string;
    dishType: string;
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    timestamp: string;
  }): Promise<DishRanking>;
  voteDish(
    dishId: string,
    userId: string,
    restaurantId: string,
    rating: number,
  ): Promise<DishRanking>;
  getUserVotes(userId: string): Promise<{ votes: DishRanking[] }>;
  getTopDishes(
    limit?: number,
    category?: string,
  ): Promise<{
    dishes: Array<{
      id: string;
      name: string;
      restaurantId: string;
      restaurantName: string;
      totalVotes: number;
      averageRating: number;
      category?: string;
    }>;
    total: number;
  }>;
}

/**
 * PostgreSQL Service class
 * Provides methods for interacting with the PostgreSQL database
 */
export class PostgresService implements IPostgresService {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1000;
  private readonly BASE_PATH = '/api/proxy/db';

  /**
   * Execute an operation with retry logic
   * @param operation The operation to execute
   * @returns The result of the operation
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        const pgError = error as PostgresError;
        if (attempt < this.MAX_RETRIES && this.isRetryableError(pgError)) {
          await this.delay(attempt);
          continue;
        }
        throw this.handleError(pgError);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Check if an error is retryable
   * @param error The error to check
   * @returns Whether the error is retryable
   */
  private isRetryableError(error: PostgresError): boolean {
    if (!error) return false;
    // Retry on connection errors or temporary server issues
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      (error.statusCode !== undefined && error.statusCode >= 500)
    );
  }

  /**
   * Handle an error
   * @param error The error to handle
   * @returns A standardized error
   */
  private handleError(error: PostgresError): Error {
    console.error('PostgreSQL error:', error);

    // Check if this is an ApiError from the ApiService
    if (error instanceof ApiService.ApiError) {
      const errorMessage = error.data?.message || error.message || 'An unexpected database error occurred';
      return new Error(errorMessage);
    }

    return new Error(error?.message || 'An unexpected database error occurred');
  }

  /**
   * Delay execution for a specified time
   * @param attempt The current attempt number
   * @returns A promise that resolves after the delay
   */
  private delay(attempt: number): Promise<void> {
    const delayMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Get user by ID
   * @param userId The user ID
   * @returns The user
   */
  async getUserById(userId: string): Promise<User> {
    return this.executeWithRetry(() =>
      ApiService.get<User>(`${this.BASE_PATH}/users/${userId}`),
    );
  }

  /**
   * Get user by Cognito ID
   * @param cognitoId The Cognito ID
   * @returns The user
   */
  async getUserByCognitoId(cognitoId: string): Promise<User> {
    return this.executeWithRetry(() =>
      ApiService.get<User>(`${this.BASE_PATH}/users/cognito/${cognitoId}`),
    );
  }

  /**
   * Create a user
   * @param userData The user data
   * @returns The created user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    return this.executeWithRetry(() =>
      ApiService.post<User>(`${this.BASE_PATH}/users`, userData),
    );
  }

  /**
   * Update a user
   * @param userId The user ID
   * @param userData The user data to update
   * @returns The updated user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return this.executeWithRetry(() =>
      ApiService.put<User>(`${this.BASE_PATH}/users/${userId}`, userData),
    );
  }

  /**
   * Get dish by ID
   * @param dishId The dish ID
   * @returns The dish
   */
  async getDishById(dishId: string): Promise<Dish> {
    return this.executeWithRetry(() =>
      ApiService.get<Dish>(`${this.BASE_PATH}/dishes/${dishId}`),
    );
  }

  /**
   * Get dishes by restaurant
   * @param restaurantId The restaurant ID
   * @returns The dishes
   */
  async getDishesByRestaurant(restaurantId: string): Promise<Dish[]> {
    return this.executeWithRetry(() =>
      ApiService.get<Dish[]>(`${this.BASE_PATH}/restaurants/${restaurantId}/dishes`),
    );
  }

  /**
   * Get dish rankings
   * @param dishId The dish ID
   * @returns The dish rankings
   */
  async getDishRankings(dishId: string): Promise<RankingStats> {
    return this.executeWithRetry(() =>
      ApiService.get<RankingStats>(`${this.BASE_PATH}/dishes/${dishId}/rankings`),
    );
  }

  /**
   * Get dish votes (for backward compatibility)
   * @param dishId The dish ID
   * @returns The dish votes
   */
  async getDishVotes(dishId: string): Promise<VoteStats> {
    const rankings = await this.getDishRankings(dishId);
    // Convert RankingStats to VoteStats for backward compatibility
    return {
      total_votes: rankings.total_votes,
      average_rating: rankings.average_rank,
      ratings: rankings.ranks,
    };
  }

  /**
   * Create a ranking
   * @param rankingData The ranking data
   * @returns The created ranking
   */
  async createRanking(rankingData: {
    userId: string;
    dishId: string;
    restaurantId: string;
    dishType: string;
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    timestamp: string;
  }): Promise<DishRanking> {
    return this.executeWithRetry(() =>
      ApiService.post<DishRanking>(`${this.BASE_PATH}/rankings/create`, rankingData),
    );
  }

  /**
   * Update a ranking
   * @param rankingId The ranking ID
   * @param rankingData The ranking data to update
   * @returns The updated ranking
   */
  async updateRanking(
    rankingId: string,
    rankingData: {
      rank: number | null;
      tasteStatus: string | null;
      notes: string;
      photoUrls: string[];
      timestamp: string;
    },
  ): Promise<DishRanking> {
    return this.executeWithRetry(() =>
      ApiService.put<DishRanking>(
        `${this.BASE_PATH}/rankings/update/${rankingId}`,
        rankingData,
      ),
    );
  }

  /**
   * Vote for a dish (for backward compatibility)
   * @param dishId The dish ID
   * @param userId The user ID
   * @param restaurantId The restaurant ID
   * @param rating The rating (1-5)
   * @returns The created vote
   */
  async voteDish(
    dishId: string,
    userId: string,
    restaurantId: string,
    rating: number,
  ): Promise<DishRanking> {
    // Convert the rating to a rank
    const rank = Math.min(Math.max(Math.round(rating), 1), 5);

    return this.createRanking({
      userId,
      dishId,
      restaurantId,
      dishType: 'Unknown', // Default dish type
      rank,
      tasteStatus: null, // No taste status for backward compatibility
      notes: 'Voted via app', // Default notes
      photoUrls: ['/images/placeholder-dish.jpg'], // Default photo
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get user votes
   * @param userId The user ID
   * @returns The user votes
   */
  async getUserVotes(userId: string): Promise<{ votes: DishRanking[] }> {
    return this.executeWithRetry(() =>
      ApiService.get<{ votes: DishRanking[] }>(`${this.BASE_PATH}/users/${userId}/votes`),
    );
  }

  /**
   * Get top dishes
   * @param limit The maximum number of dishes to return
   * @param category The dish category
   * @returns The top dishes
   */
  async getTopDishes(
    limit: number = 10,
    category?: string,
  ): Promise<{
    dishes: Array<{
      id: string;
      name: string;
      restaurantId: string;
      restaurantName: string;
      totalVotes: number;
      averageRating: number;
      category?: string;
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (category) {
      queryParams.append('category', category);
    }

    return this.executeWithRetry(() =>
      ApiService.get<{
        dishes: Array<{
          id: string;
          name: string;
          restaurantId: string;
          restaurantName: string;
          totalVotes: number;
          averageRating: number;
          category?: string;
        }>;
        total: number;
      }>(`${this.BASE_PATH}/dishes/top?${queryParams.toString()}`),
    );
  }
}

// Export a singleton instance
export const postgresService = new PostgresService();
