/**
 * Restaurant Service
 * This service provides methods for interacting with restaurant data
 */

import { CUISINE_TYPES, PRICE_RANGES } from '../config/restaurantConfig.js';
import { ApiService } from './api.js';
import { googleMapsService } from './googleMapsService.js';

/**
 * Restaurant Service class
 */
export class RestaurantService {
  constructor() {
    this.MAX_RETRIES = 3;
    this.BASE_DELAY_MS = 1000;
    this.BASE_PATH = '/api/restaurants';
  }

  /**
   * Execute an operation with retry logic
   * @param {Function} operation - The operation to execute
   * @returns {Promise<any>} A promise that resolves to the operation result
   */
  async executeWithRetry(operation) {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (
          error?.response?.status === 429 ||
          (attempt < this.MAX_RETRIES && this.isRetryableError(error))
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
   * @param {Error} error - The error to check
   * @returns {boolean} Whether the error is retryable
   */
  isRetryableError(error) {
    if (!error) return false;
    return (
      (error.response?.status ?? 0) >= 500 || error.code === 'ECONNABORTED'
    );
  }

  /**
   * Handle an error
   * @param {Error} error - The error to handle
   * @returns {Error} The handled error
   */
  handleError(error) {
    console.error('Restaurant service error:', error);

    // Check if this is an ApiError from the ApiService
    if (error && 'status' in error && typeof error.status === 'number') {
      // This is likely an ApiError from the ApiService
      const apiError = error;
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

  /**
   * Delay execution
   * @param {number} attempt - The attempt number
   * @returns {Promise<void>} A promise that resolves after the delay
   */
  delay(attempt) {
    const delayMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Get restaurant by ID
   * @param {string} id - The restaurant ID
   * @returns {Promise<Object>} A promise that resolves to the restaurant
   */
  async getRestaurantById(id) {
    return this.executeWithRetry(() =>
      ApiService.get(`${this.BASE_PATH}/${id}`)
    );
  }

  /**
   * Get restaurant with dishes by ID
   * @param {string} id - The restaurant ID
   * @returns {Promise<Object>} A promise that resolves to the restaurant with dishes
   */
  async getRestaurantWithDishes(id) {
    return this.executeWithRetry(() =>
      ApiService.get(`${this.BASE_PATH}/${id}/dishes`)
    );
  }

  /**
   * Get restaurant analytics
   * @param {string} id - The restaurant ID
   * @returns {Promise<Object>} A promise that resolves to the restaurant analytics
   */
  async getRestaurantAnalytics(id) {
    return this.executeWithRetry(() =>
      ApiService.get(`${this.BASE_PATH}/${id}/analytics`)
    );
  }

  /**
   * Get restaurant reviews
   * @param {string} id - The restaurant ID
   * @returns {Promise<Array>} A promise that resolves to the restaurant reviews
   */
  async getRestaurantReviews(id) {
    return this.executeWithRetry(() =>
      ApiService.get(`${this.BASE_PATH}/${id}/reviews`)
    );
  }

  /**
   * Search restaurants
   * @param {Object} params - The search parameters
   * @returns {Promise<Object>} A promise that resolves to the search results
   */
  async searchRestaurants(params) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert nextPageToken to the correct parameter name
        const paramName = key === 'nextPageToken' ? 'nextPageToken' : key;
        queryParams.append(paramName, value.toString());
      }
    });

    return this.executeWithRetry(() =>
      ApiService.get(
        `${this.BASE_PATH}/search?${queryParams.toString()}`
      )
    );
  }

  /**
   * List restaurants
   * @param {Object} params - The list parameters
   * @returns {Promise<Object>} A promise that resolves to the list results
   */
  async listRestaurants(params) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert nextPageToken to the correct parameter name
        const paramName = key === 'nextPageToken' ? 'nextPageToken' : key;
        queryParams.append(paramName, value.toString());
      }
    });

    return this.executeWithRetry(() =>
      ApiService.get(
        `${this.BASE_PATH}/list?${queryParams.toString()}`
      )
    );
  }

  /**
   * Get cuisine types
   * @returns {Promise<Object>} A promise that resolves to the cuisine types
   */
  async getCuisineTypes() {
    return Promise.resolve({ types: [...CUISINE_TYPES] });
  }

  /**
   * Get price ranges
   * @returns {Promise<Object>} A promise that resolves to the price ranges
   */
  async getPriceRanges() {
    return Promise.resolve({ ranges: [...PRICE_RANGES] });
  }

  /**
   * Like a restaurant
   * @param {string} id - The restaurant ID
   * @returns {Promise<void>} A promise that resolves when the restaurant is liked
   */
  async likeRestaurant(id) {
    return this.executeWithRetry(() =>
      ApiService.post(`${this.BASE_PATH}/${id}/like`, {})
    );
  }

  /**
   * Unlike a restaurant
   * @param {string} id - The restaurant ID
   * @returns {Promise<void>} A promise that resolves when the restaurant is unliked
   */
  async unlikeRestaurant(id) {
    return this.executeWithRetry(() =>
      ApiService.delete(`${this.BASE_PATH}/${id}/like`)
    );
  }

  /**
   * Get restaurants by dish ID
   * @param {string} dishId - The dish ID
   * @param {string} countryCode - The country code
   * @returns {Promise<Array>} A promise that resolves to the restaurants
   */
  async getRestaurantsByDishId(dishId, countryCode) {
    return this.executeWithRetry(() =>
      ApiService.get(
        `${this.BASE_PATH}/dish/${dishId}?countryCode=${countryCode}`
      )
    );
  }

  /**
   * Get nearby restaurants
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @param {string} countryCode - The country code
   * @param {number} radius - The search radius in meters
   * @returns {Promise<Array>} A promise that resolves to the nearby restaurants
   */
  async getNearbyRestaurants(latitude, longitude, countryCode, radius = 1000) {
    return googleMapsService.searchNearbyRestaurants(
      latitude,
      longitude,
      radius,
      countryCode
    );
  }
}

// Export a singleton instance
export const restaurantService = new RestaurantService();
