import {
  CUISINE_TYPES,
  CuisineType,
  PRICE_RANGES,
  PriceRange,
} from '@/config/restaurantConfig';
import { Review } from '@/types';
import { Restaurant, RestaurantWithDishes } from '@/types/restaurant';
import { ApiService } from './api';
import { googleMapsService } from './googleMapsService';

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

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
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

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        const apiError = error as ApiError;
        if (
          apiError?.response?.status === 429 ||
          (attempt < this.MAX_RETRIES && this.isRetryableError(apiError))
        ) {
          await this.delay(attempt);
          continue;
        }
        throw this.handleError(apiError);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private isRetryableError(error: ApiError): boolean {
    if (!error) return false;
    return (
      (error.response?.status ?? 0) >= 500 || error.code === 'ECONNABORTED'
    );
  }

  private handleError(error: ApiError): Error {
    console.error('Restaurant service error:', error);

    // Check if this is an ApiError from the ApiService
    if (error && 'status' in error && typeof error.status === 'number') {
      // This is likely an ApiError from the ApiService
      const apiError = error as unknown as {
        status: number;
        message: string;
        data?: any;
      };
      const errorMessage =
        apiError.data &&
        typeof apiError.data === 'object' &&
        'message' in apiError.data
          ? String(apiError.data.message)
          : apiError.message || 'An unexpected error occurred';

      return new Error(errorMessage);
    }

    // Handle legacy error format
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return new Error(errorMessage);
  }

  private delay(attempt: number): Promise<void> {
    const delayMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(id: string): Promise<Restaurant> {
    return this.executeWithRetry(() =>
      ApiService.get<Restaurant>(`${this.BASE_PATH}/${id}`),
    );
  }

  /**
   * Get restaurant with dishes by ID
   */
  async getRestaurantWithDishes(id: string): Promise<RestaurantWithDishes> {
    return this.executeWithRetry(() =>
      ApiService.get<RestaurantWithDishes>(`${this.BASE_PATH}/${id}/dishes`),
    );
  }

  /**
   * Get restaurant analytics
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
   */
  async getRestaurantReviews(id: string): Promise<Review[]> {
    return this.executeWithRetry(() =>
      ApiService.get<Review[]>(`${this.BASE_PATH}/${id}/reviews`),
    );
  }

  /**
   * Search restaurants
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
   */
  async getCuisineTypes(): Promise<{ types: CuisineType[] }> {
    return Promise.resolve({ types: [...CUISINE_TYPES] });
  }

  /**
   * Get price ranges
   */
  async getPriceRanges(): Promise<{ ranges: PriceRange[] }> {
    return Promise.resolve({ ranges: [...PRICE_RANGES] });
  }

  /**
   * Like a restaurant
   */
  async likeRestaurant(id: string): Promise<void> {
    return this.executeWithRetry(() =>
      ApiService.post(`${this.BASE_PATH}/${id}/like`, {}),
    );
  }

  /**
   * Unlike a restaurant
   */
  async unlikeRestaurant(id: string): Promise<void> {
    return this.executeWithRetry(() =>
      ApiService.delete(`${this.BASE_PATH}/${id}/like`),
    );
  }

  /**
   * Get restaurants by dish ID
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
