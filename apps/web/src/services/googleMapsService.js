/**
 * Google Maps Service
 * This service provides methods for interacting with the Google Maps API
 */

import { ApiService } from './api.js';

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Get the Google Maps API key
   * @returns {string} The API key
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Get the Google Maps script URL with the API key
   * @returns {string} The script URL
   */
  getScriptUrl() {
    return `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
  }

  /**
   * Search for nearby restaurants using the Google Places API
   * @param {number} latitude - The latitude coordinate
   * @param {number} longitude - The longitude coordinate
   * @param {number} radius - The search radius in meters
   * @param {string} countryCode - The country code
   * @returns {Promise<Array>} A promise that resolves to an array of restaurants
   */
  async searchNearbyRestaurants(latitude, longitude, radius = 1000, countryCode) {
    try {
      // Use our proxy API to avoid exposing the API key in client-side requests
      const response = await ApiService.get(
        `/api/proxy/maps/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&type=restaurant&countryCode=${countryCode}`
      );

      // Transform the response to match our Restaurant type
      return this.transformPlacesToRestaurants(response.results || [], countryCode);
    } catch (error) {
      console.error('Error searching for nearby restaurants:', error);
      return [];
    }
  }

  /**
   * Transform Google Places results to our Restaurant format
   * @param {Array} places - The Google Places results
   * @param {string} countryCode - The country code
   * @returns {Array} An array of restaurants
   */
  transformPlacesToRestaurants(places, countryCode) {
    return places.map(place => {
      const { 
        place_id, 
        name, 
        vicinity, 
        geometry, 
        rating, 
        user_ratings_total,
        photos,
        price_level,
        types
      } = place;

      // Map price level to our price range format
      const priceRangeMap = {
        0: '$',
        1: '$',
        2: '$$',
        3: '$$$',
        4: '$$$$'
      };

      // Extract cuisine types from place types
      const cuisineTypes = this.extractCuisineTypes(types);

      return {
        id: place_id,
        name,
        address: vicinity,
        latitude: geometry?.location?.lat,
        longitude: geometry?.location?.lng,
        rating: rating || 0,
        reviewCount: user_ratings_total || 0,
        photos: photos ? photos.map(photo => photo.photo_reference) : [],
        priceRange: priceRangeMap[price_level] || '$$',
        cuisines: cuisineTypes,
        country: countryCode.toUpperCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Extract cuisine types from Google Places types
   * @param {Array} types - The Google Places types
   * @returns {Array} An array of cuisine types
   */
  extractCuisineTypes(types) {
    const cuisineMap = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'cafe': 'Cafe',
      'bakery': 'Bakery',
      'bar': 'Bar',
      'meal_takeaway': 'Takeaway',
      'meal_delivery': 'Delivery',
      'japanese_restaurant': 'Japanese',
      'chinese_restaurant': 'Chinese',
      'thai_restaurant': 'Thai',
      'indian_restaurant': 'Indian',
      'italian_restaurant': 'Italian',
      'french_restaurant': 'French',
      'american_restaurant': 'American',
      'mexican_restaurant': 'Mexican',
      'seafood_restaurant': 'Seafood',
      'vegetarian_restaurant': 'Vegetarian'
    };

    return types
      .filter(type => cuisineMap[type])
      .map(type => cuisineMap[type])
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  }
}

// Export a singleton instance
export const googleMapsService = new GoogleMapsService();
