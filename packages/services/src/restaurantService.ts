/**
 * Restaurant Service
 * Handles interactions with restaurant API endpoints
 */

// Define cuisine types and price ranges directly in this file for now
// These will be moved to a separate package once the config package is properly set up
export const CUISINE_TYPES = [
  'Japanese',
  'Chinese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Indian',
  'Italian',
  'French',
  'American',
  'Mexican',
  'Mediterranean',
  'Middle Eastern',
  'Vegetarian',
  'Seafood',
  'Fusion',
] as const;

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];
export type PriceRange = (typeof PRICE_RANGES)[number];

// Import types from the types package
import { Restaurant, RestaurantWithDishes } from '@bellyfed/types/restaurant.js';
import { Review } from '@bellyfed/types/review.js';
import { ApiService } from './api.js';
import { googleMapsService } from './googleMapsService.js';

// Define the RestaurantService interface
export interface IRestaurantService {
  getRestaurantById(id: string): Promise<Restaurant>;
  getRestaurantWithDishes(id: string): Promise<RestaurantWithDishes>;
  getRestaurantAnalytics(id: string): Promise<{ totalVotes: number }>;
  getRestaurantReviews(id: string): Promise<Review[]>;
  searchRestaurants(
    params: SearchRestaurantsParams,
  ): Promise<SearchRestaurantsResponse>;
  listRestaurants(
    params: ListRestaurantsParams,
  ): Promise<ListRestaurantsResponse>;
  getCuisineTypes(): Promise<{ types: CuisineType[] }>;
  getPriceRanges(): Promise<{ ranges: PriceRange[] }>;
  likeRestaurant(id: string): Promise<void>;
  unlikeRestaurant(id: string): Promise<void>;
  getRestaurantsByDishId(
    dishId: string,
    countryCode: string,
  ): Promise<Restaurant[]>;
  getNearbyRestaurants(
    latitude: number,
    longitude: number,
    countryCode: string,
    radius?: number,
  ): Promise<Restaurant[]>;
}

export interface SearchRestaurantsParams {
  query?: string;
  cuisine?: CuisineType | string; // Allow string for flexibility
  location?: string;
  minRating?: number;
  maxPrice?: PriceRange | string; // Allow string for flexibility
  limit?: number;
  nextPageToken?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  countryCode?: string;
}

export interface SearchRestaurantsResponse {
  restaurants: Restaurant[];
  totalCount: number;
  nextPageToken?: string;
}

export interface ListRestaurantsParams {
  limit?: number;
  nextPageToken?: string;
  countryCode?: string;
}

export interface ListRestaurantsResponse {
  restaurants: Restaurant[];
  totalCount: number;
  nextPageToken?: string;
}

export class RestaurantService implements IRestaurantService {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1000;
  private readonly BASE_PATH = '/api/restaurants';

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
        // Check if this is an ApiError from the ApiService
        if (
          error instanceof ApiService.ApiError &&
          (error.status === 429 ||
            (attempt < this.MAX_RETRIES && this.isRetryableError(error)))
        ) {
          await this.delay(attempt);
          continue;
        }
        throw this.handleError(error);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Check if an error is retryable
   * @param error The error to check
   * @returns Whether the error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!error) return false;

    // Check if this is an ApiError from the ApiService
    if (error instanceof ApiService.ApiError) {
      return error.status >= 500;
    }

    // Check if this is a network error
    if (error instanceof Error) {
      return error.message.includes('network') || error.message.includes('timeout');
    }

    return false;
  }

  /**
   * Handle an error
   * @param error The error to handle
   * @returns A standardized error
   */
  private handleError(error: unknown): Error {
    console.error('Restaurant service error:', error);

    // Check if this is an ApiError from the ApiService
    if (error instanceof ApiService.ApiError) {
      const errorMessage = error.data?.message || error.message || 'An unexpected error occurred';
      return new Error(errorMessage);
    }

    // Handle other error types
    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred');
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
   * Get restaurant by ID
   * @param id The restaurant ID
   * @returns The restaurant
   */
  async getRestaurantById(id: string): Promise<Restaurant> {
    return this.executeWithRetry(() =>
      ApiService.get<Restaurant>(`${this.BASE_PATH}/${id}`),
    );
  }

  /**
   * Get restaurant with dishes by ID
   * @param id The restaurant ID
   * @returns The restaurant with dishes
   */
  async getRestaurantWithDishes(id: string): Promise<RestaurantWithDishes> {
    return this.executeWithRetry(() =>
      ApiService.get<RestaurantWithDishes>(`${this.BASE_PATH}/${id}/dishes`),
    );
  }

  /**
   * Get restaurant analytics
   * @param id The restaurant ID
   * @returns The restaurant analytics
   */
  async getRestaurantAnalytics(id: string): Promise<{ totalVotes: number }> {
    return this.executeWithRetry(() =>
      ApiService.get<{ totalVotes: number }>(
        `${this.BASE_PATH}/${id}/analytics`,
      ),
    );
  }

  /**
   * Get restaurant reviews
   * @param id The restaurant ID
   * @returns The restaurant reviews
   */
  async getRestaurantReviews(id: string): Promise<Review[]> {
    return this.executeWithRetry(() =>
      ApiService.get<Review[]>(`${this.BASE_PATH}/${id}/reviews`),
    );
  }

  /**
   * Search restaurants
   * @param params The search parameters
   * @returns The search results
   */
  async searchRestaurants(
    params: SearchRestaurantsParams,
  ): Promise<SearchRestaurantsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert nextPageToken to the correct parameter name
        const paramName = key === 'nextPageToken' ? 'nextPageToken' : key;
        queryParams.append(paramName, value.toString());
      }
    });

    return this.executeWithRetry(() =>
      ApiService.get<SearchRestaurantsResponse>(
        `${this.BASE_PATH}/search?${queryParams.toString()}`,
      ),
    );
  }

  /**
   * List restaurants
   * @param params The list parameters
   * @returns The list results
   */
  async listRestaurants(
    params: ListRestaurantsParams,
  ): Promise<ListRestaurantsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert nextPageToken to the correct parameter name
        const paramName = key === 'nextPageToken' ? 'nextPageToken' : key;
        queryParams.append(paramName, value.toString());
      }
    });

    return this.executeWithRetry(() =>
      ApiService.get<ListRestaurantsResponse>(
        `${this.BASE_PATH}/list?${queryParams.toString()}`,
      ),
    );
  }

  /**
   * Get cuisine types
   * @returns The cuisine types
   */
  async getCuisineTypes(): Promise<{ types: CuisineType[] }> {
    return Promise.resolve({ types: [...CUISINE_TYPES] });
  }

  /**
   * Get price ranges
   * @returns The price ranges
   */
  async getPriceRanges(): Promise<{ ranges: PriceRange[] }> {
    return Promise.resolve({ ranges: [...PRICE_RANGES] });
  }

  /**
   * Like a restaurant
   * @param id The restaurant ID
   */
  async likeRestaurant(id: string): Promise<void> {
    return this.executeWithRetry(() =>
      ApiService.post(`${this.BASE_PATH}/${id}/like`, {}),
    );
  }

  /**
   * Unlike a restaurant
   * @param id The restaurant ID
   */
  async unlikeRestaurant(id: string): Promise<void> {
    return this.executeWithRetry(() =>
      ApiService.delete(`${this.BASE_PATH}/${id}/like`),
    );
  }

  /**
   * Get restaurants by dish ID
   * @param dishId The dish ID
   * @param countryCode The country code
   * @returns The restaurants
   */
  async getRestaurantsByDishId(
    dishId: string,
    countryCode: string,
  ): Promise<Restaurant[]> {
    return this.executeWithRetry(() =>
      ApiService.get<Restaurant[]>(
        `${this.BASE_PATH}/dish/${dishId}?countryCode=${countryCode}`,
      ),
    );
  }

  /**
   * Get nearby restaurants
   * @param latitude The latitude
   * @param longitude The longitude
   * @param countryCode The country code
   * @param radius The radius in meters
   * @returns The nearby restaurants
   */
  async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    countryCode: string,
    radius: number = 1000,
  ): Promise<Restaurant[]> {
    return googleMapsService.searchNearbyRestaurants(
      latitude,
      longitude,
      radius,
      countryCode,
    );
  }
}

// Export a singleton instance
export const restaurantService = new RestaurantService();
