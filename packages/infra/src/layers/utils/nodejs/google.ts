/**
 * Google API utilities for AWS Lambda functions
 * This module provides utilities for interacting with Google APIs
 */

import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';
import { ApplicationError } from './errors.js';

// Create a Secrets Manager client
const secretsManager = new SecretsManager({});

/**
 * Place details interface from Google Places API
 */
export interface PlaceDetails {
  /**
   * Google Place ID
   */
  place_id: string;

  /**
   * Place name
   */
  name: string;

  /**
   * Formatted address
   */
  formatted_address: string;

  /**
   * Geometry information
   */
  geometry: {
    /**
     * Location coordinates
     */
    location: {
      /**
       * Latitude
       */
      lat: number;

      /**
       * Longitude
       */
      lng: number;
    };
  };

  /**
   * Formatted phone number
   */
  formatted_phone_number?: string;

  /**
   * International phone number
   */
  international_phone_number?: string;

  /**
   * Website URL
   */
  website?: string;

  /**
   * Rating (0-5)
   */
  rating?: number;

  /**
   * Price level (0-4)
   */
  price_level?: number;

  /**
   * Opening hours
   */
  opening_hours?: {
    /**
     * Opening periods
     */
    periods: Array<{
      /**
       * Opening time
       */
      open: {
        /**
         * Day of week (0-6, starting from Sunday)
         */
        day: number;

        /**
         * Time in 24-hour format (e.g., "0900")
         */
        time: string;
      };

      /**
       * Closing time
       */
      close: {
        /**
         * Day of week (0-6, starting from Sunday)
         */
        day: number;

        /**
         * Time in 24-hour format (e.g., "1700")
         */
        time: string;
      };
    }>;

    /**
     * Weekday text descriptions
     */
    weekday_text: string[];
  };

  /**
   * Photos
   */
  photos?: Array<{
    /**
     * Photo reference for API calls
     */
    photo_reference: string;

    /**
     * Photo height
     */
    height: number;

    /**
     * Photo width
     */
    width: number;
  }>;

  /**
   * Place types
   */
  types?: string[];

  /**
   * Business status
   */
  business_status?: string;
}

/**
 * Transformed place details for internal use
 */
export interface TransformedPlaceDetails {
  /**
   * Place name
   */
  name: string;

  /**
   * Place description
   */
  description: string;

  /**
   * Cuisine types
   */
  cuisineTypes: string[];

  /**
   * Price range
   */
  priceRange: string;

  /**
   * Whether the place is currently operating
   */
  isCurrentlyOperating: boolean;

  /**
   * Location information
   */
  locations: Array<{
    /**
     * Address information
     */
    info: {
      /**
       * Street address
       */
      address: string;

      /**
       * City
       */
      city: string;

      /**
       * State or province
       */
      state: string;

      /**
       * Country
       */
      country: string;

      /**
       * Postal code
       */
      postalCode: string;
    };

    /**
     * Coordinates
     */
    coordinates: {
      /**
       * Latitude
       */
      latitude: number;

      /**
       * Longitude
       */
      longitude: number;
    };
  }>;

  /**
   * Operating schedules
   */
  schedules: {
    /**
     * Day of week
     */
    [key: string]: {
      /**
       * Opening time
       */
      open: string;

      /**
       * Closing time
       */
      close: string;
    };
  };

  /**
   * Contact information
   */
  contact: {
    /**
     * Phone number
     */
    phone?: string;

    /**
     * International phone number
     */
    internationalPhone?: string;

    /**
     * Website URL
     */
    website?: string;
  };

  /**
   * Facilities information
   */
  facilities: {
    /**
     * Whether the place has parking
     */
    hasParking?: boolean;

    /**
     * Whether the place has WiFi
     */
    hasWifi?: boolean;

    /**
     * Whether the place is wheelchair accessible
     */
    isWheelchairAccessible?: boolean;

    /**
     * Whether the place offers delivery
     */
    hasDelivery?: boolean;

    /**
     * Whether the place offers takeout
     */
    hasTakeout?: boolean;
  };

  /**
   * Rating (0-5)
   */
  rating?: number;

  /**
   * Image URLs
   */
  images: string[];

  /**
   * Google Place ID
   */
  googlePlaceId: string;
}

/**
 * Fetch place details from Google Places API
 * @param placeId Google Place ID
 * @returns Place details
 */
export const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    // Get Google Maps API Key from Secrets Manager
    const secretResponse = await secretsManager.getSecretValue({
      SecretId: process.env.GOOGLE_MAPS_API_KEY_SECRET_ARN!,
    });

    if (!secretResponse.SecretString) {
      throw new ApplicationError(
        'Failed to retrieve Google Maps API Key',
        500,
        'GOOGLE_API_ERROR'
      );
    }

    const secretData = JSON.parse(secretResponse.SecretString);
    const apiKey = secretData[process.env.GOOGLE_MAPS_API_KEY_SECRET_KEY!];

    if (!apiKey) {
      throw new ApplicationError(
        'Google Maps API Key not found in secret',
        500,
        'GOOGLE_API_ERROR'
      );
    }

    // Make request to Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,rating,price_level,opening_hours,photos,types,business_status`
    );

    if (response.data.status !== 'OK') {
      throw new ApplicationError(
        `Google Places API error: ${response.data.status}`,
        500,
        'GOOGLE_API_ERROR'
      );
    }

    return response.data.result;
  } catch (error: unknown) {
    console.error('Error fetching place details:', error);

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      'Failed to fetch place details',
      500,
      'GOOGLE_API_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
};

/**
 * Transform Google Places API response to internal format
 * @param details Place details from Google Places API
 * @returns Transformed place details
 */
export const transformPlaceDetails = (details: PlaceDetails): TransformedPlaceDetails => {
  // Extract address components
  const addressParts = details.formatted_address.split(',').map((part) => part.trim());

  // Handle address parts safely with default values
  let postalCode = '';
  let country = 'Unknown';
  let state = 'Unknown';
  let city = 'Unknown';
  let streetAddress = '';

  // Extract postal code and country from the last part
  if (addressParts.length > 0) {
    const lastPart = addressParts[addressParts.length - 1];
    if (lastPart) {
      postalCode = lastPart.match(/\d+/)?.[0] || '';
      country = lastPart.replace(postalCode, '').trim() || 'Unknown';
    }
  }

  // Extract state from the second-to-last part
  if (addressParts.length > 1) {
    state = addressParts[addressParts.length - 2] || 'Unknown';
  }

  // Extract city from the third-to-last part
  if (addressParts.length > 2) {
    city = addressParts[addressParts.length - 3] || 'Unknown';
  }

  // Extract street address from the remaining parts
  if (addressParts.length > 3) {
    streetAddress = addressParts.slice(0, -3).join(', ');
  }

  // Transform schedules
  const schedules: { [key: string]: { open: string; close: string } } = {};
  if (details.opening_hours?.periods) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    details.opening_hours.periods.forEach((period) => {
      // Make sure day index is valid and day is defined
      if (period.open.day >= 0 && period.open.day < days.length && period.close) {
        const day = days[period.open.day];

        // Only add schedule if day is defined
        if (day) {
          // Format times safely
          const openTime = period.open.time || '0000';
          const closeTime = period.close.time || '0000';

          schedules[day] = {
            open: `${openTime.slice(0, 2)}:${openTime.slice(2)}`,
            close: `${closeTime.slice(0, 2)}:${closeTime.slice(2)}`,
          };
        }
      }
    });
  }

  // Transform types to cuisine types
  const cuisineTypes = (details.types || [])
    .filter(
      (type) =>
        type.includes('food') || type.includes('restaurant') || type.includes('cuisine')
    )
    .map((type) => type.replace(/_/g, ' '));

  // Transform price level to string
  const priceRanges = ['Budget', 'Affordable', 'Moderate', 'Expensive', 'Luxury'];
  let priceRangeValue = 'Not specified';

  // Make sure price_level is valid
  if (details.price_level !== undefined &&
      details.price_level >= 0 &&
      details.price_level < priceRanges.length) {
    const index = details.price_level as number;
    priceRangeValue = priceRanges[index] || 'Not specified';
  }

  return {
    name: details.name,
    description: `${details.name} is located in ${city}, ${state}. ${
      details.rating ? `It has a rating of ${details.rating} stars. ` : ''
    }${details.price_level ? `Price range: ${priceRangeValue}.` : ''}`,
    cuisineTypes,
    priceRange: priceRangeValue,
    isCurrentlyOperating: details.business_status === 'OPERATIONAL',
    locations: [
      {
        info: {
          address: streetAddress,
          city,
          state,
          country,
          postalCode,
        },
        coordinates: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        },
      },
    ],
    schedules,
    contact: {
      phone: details.formatted_phone_number,
      internationalPhone: details.international_phone_number,
      website: details.website,
    },
    facilities: {
      hasParking: details.types?.includes('parking'),
      hasWifi: details.types?.includes('wifi'),
      isWheelchairAccessible: details.types?.includes('wheelchair_accessible'),
      hasDelivery: details.types?.includes('delivery'),
      hasTakeout: details.types?.includes('takeout'),
    },
    rating: details.rating,
    images: (details.photos || []).map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}`
    ),
    googlePlaceId: details.place_id,
  };
};
