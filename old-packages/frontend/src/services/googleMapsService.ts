/**
 * Google Maps Service
 * Handles interactions with Google Maps API through our backend Lambda function
 */

import {
  Restaurant,
  RestaurantHours,
  RestaurantPhoto,
  RestaurantSearchParams,
  RestaurantSearchResponse,
} from '@/types/restaurant';
import { ApiService } from './api';

// Cache for restaurant data to reduce API calls
const restaurantCache = new Map<string, Restaurant>();
const searchCache = new Map<string, RestaurantSearchResponse>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

// Cache metadata to track expiration
interface CacheMetadata {
  timestamp: number;
}

const cacheMetadata = new Map<string, CacheMetadata>();

/**
 * Google Maps Service class
 */
export class GoogleMapsService {
  private readonly BASE_PATH = '/api/google-maps';

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();

    // Clear expired restaurant cache entries
    for (const [key, metadata] of cacheMetadata.entries()) {
      if (now - metadata.timestamp > CACHE_EXPIRATION_MS) {
        restaurantCache.delete(key);
        searchCache.delete(key);
        cacheMetadata.delete(key);
      }
    }
  }

  /**
   * Get cache key for search parameters
   */
  private getSearchCacheKey(params: RestaurantSearchParams): string {
    return JSON.stringify(params);
  }

  /**
   * Search for restaurants
   */
  async searchRestaurants(
    params: RestaurantSearchParams,
  ): Promise<RestaurantSearchResponse> {
    this.clearExpiredCache();

    const cacheKey = this.getSearchCacheKey(params);

    // Check cache first
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey) as RestaurantSearchResponse;
    }

    try {
      const response = await ApiService.post<RestaurantSearchResponse>(
        `${this.BASE_PATH}/search`,
        params,
      );

      // Cache the response
      searchCache.set(cacheKey, response);
      cacheMetadata.set(cacheKey, { timestamp: Date.now() });

      // Also cache individual restaurants
      if (response.restaurants) {
        for (const restaurant of response.restaurants) {
          restaurantCache.set(restaurant.restaurantId, restaurant);
          cacheMetadata.set(restaurant.restaurantId, { timestamp: Date.now() });
        }
      }

      return response;
    } catch (error: unknown) {
      console.error('Error searching restaurants:', error);
      throw error;
    }
  }

  /**
   * Get restaurant details by ID
   */
  async getRestaurantById(restaurantId: string): Promise<Restaurant> {
    this.clearExpiredCache();

    // Check cache first
    if (restaurantCache.has(restaurantId)) {
      return restaurantCache.get(restaurantId) as Restaurant;
    }

    try {
      const response = await ApiService.get<Restaurant>(
        `${this.BASE_PATH}/restaurant/${restaurantId}`,
      );

      // Cache the response
      restaurantCache.set(restaurantId, response);
      cacheMetadata.set(restaurantId, { timestamp: Date.now() });

      return response;
    } catch (error: unknown) {
      console.error(`Error getting restaurant ${restaurantId}:`, error);
      throw error;
    }
  }

  /**
   * Get restaurant details by Google Place ID
   */
  async getRestaurantByPlaceId(
    placeId: string,
    countryCode: string,
  ): Promise<Restaurant> {
    try {
      const response = await ApiService.get<Restaurant>(
        `${this.BASE_PATH}/place/${placeId}?countryCode=${countryCode}`,
      );

      // Cache the response
      restaurantCache.set(response.restaurantId, response);
      cacheMetadata.set(response.restaurantId, { timestamp: Date.now() });

      return response;
    } catch (error: unknown) {
      console.error(`Error getting restaurant by place ID ${placeId}:`, error);
      throw error;
    }
  }

  /**
   * Get restaurant photos
   */
  async getRestaurantPhotos(restaurantId: string): Promise<RestaurantPhoto[]> {
    try {
      return await ApiService.get<RestaurantPhoto[]>(
        `${this.BASE_PATH}/restaurant/${restaurantId}/photos`,
      );
    } catch (error: unknown) {
      console.error(
        `Error getting photos for restaurant ${restaurantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get restaurant hours
   */
  async getRestaurantHours(restaurantId: string): Promise<RestaurantHours[]> {
    try {
      return await ApiService.get<RestaurantHours[]>(
        `${this.BASE_PATH}/restaurant/${restaurantId}/hours`,
      );
    } catch (error: unknown) {
      console.error(
        `Error getting hours for restaurant ${restaurantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Search for nearby restaurants
   */
  async searchNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    countryCode: string,
  ): Promise<Restaurant[]> {
    try {
      const params: RestaurantSearchParams = {
        latitude,
        longitude,
        radius,
        countryCode,
        type: 'restaurant',
        limit: 20,
      };

      const response = await this.searchRestaurants(params);
      return response.restaurants;
    } catch (error: unknown) {
      console.error('Error searching nearby restaurants:', error);
      throw error;
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await ApiService.get<{ lat: number; lng: number }>(
        `${this.BASE_PATH}/geocode?address=${encodeURIComponent(address)}`,
      );

      return response;
    } catch (error: unknown) {
      console.error(`Error geocoding address ${address}:`, error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<{ address: string; countryCode: string } | null> {
    try {
      const response = await ApiService.get<{
        address: string;
        countryCode: string;
      }>(
        `${this.BASE_PATH}/reverse-geocode?latitude=${latitude}&longitude=${longitude}`,
      );

      return response;
    } catch (error: unknown) {
      console.error(
        `Error reverse geocoding coordinates (${latitude}, ${longitude}):`,
        error,
      );
      return null;
    }
  }
}

// Create and export a singleton instance
export const googleMapsService = new GoogleMapsService();
