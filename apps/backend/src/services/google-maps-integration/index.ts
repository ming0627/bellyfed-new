/**
 * Google Maps Integration Service
 *
 * This service integrates with the Google Maps API to provide restaurant
 * search and details functionality. It also stores restaurant data in the database.
 *
 * The service provides functionality to:
 * - Search for restaurants using Google Places API
 * - Get restaurant details using Google Places API
 * - Store restaurant data in the database
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Type definitions
export interface Restaurant {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  international_phone_number?: string;
  website?: string;
  rating?: number;
  price_level?: number;
  photos?: Photo[];
  opening_hours?: {
    periods?: Period[];
  };
}

export interface Photo {
  photo_reference: string;
  width: number;
  height: number;
}

export interface Period {
  open?: {
    day: number;
    time: string;
  };
  close?: {
    day: number;
    time: string;
  };
}

export interface SearchRestaurantsParams {
  query: string;
  latitude: number;
  longitude: number;
  radius?: number;
  countryCode: string;
}

export interface GetRestaurantDetailsParams {
  placeId: string;
  countryCode: string;
}

/**
 * Search for restaurants using Google Places API
 */
export const searchRestaurants = async (params: SearchRestaurantsParams): Promise<Restaurant[]> => {
  try {
    const { query, latitude, longitude, radius, countryCode } = params;

    if (!GOOGLE_MAPS_API_KEY) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Google Maps API key is not configured',
      });
    }

    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const requestParams = {
      location: `${latitude},${longitude}`,
      radius: radius || 1000,
      type: 'restaurant',
      keyword: query,
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(url, { params: requestParams });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Google Places API error: ${response.data.status}`,
      });
    }

    return response.data.results;
  } catch (error) {
    console.error('Error searching restaurants:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to search restaurants',
    });
  }
};

/**
 * Get restaurant details using Google Places API
 */
export const getRestaurantDetails = async (params: GetRestaurantDetailsParams): Promise<Restaurant & { restaurantId: string }> => {
  try {
    const { placeId, countryCode } = params;

    if (!GOOGLE_MAPS_API_KEY) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Google Maps API key is not configured',
      });
    }

    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const requestParams = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,international_phone_number,website,rating,price_level,photos,opening_hours',
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(url, { params: requestParams });

    if (response.data.status !== 'OK') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Google Places API error: ${response.data.status}`,
      });
    }

    const restaurantDetails = response.data.result;

    // Save restaurant to database
    const restaurantId = await saveRestaurantToDatabase(restaurantDetails, countryCode);

    // Save photos if available
    if (restaurantDetails.photos) {
      await saveRestaurantPhotos(restaurantId, restaurantDetails.photos);
    }

    // Save hours if available
    if (restaurantDetails.opening_hours) {
      await saveRestaurantHours(restaurantId, restaurantDetails.opening_hours);
    }

    return {
      ...restaurantDetails,
      restaurantId,
    };
  } catch (error) {
    console.error('Error getting restaurant details:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get restaurant details',
    });
  }
};

/**
 * Save restaurant to database
 */
const saveRestaurantToDatabase = async (restaurant: Restaurant, countryCode: string): Promise<string> => {
  try {
    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        googlePlaceId: restaurant.place_id,
      },
    });

    if (existingRestaurant) {
      // Update existing restaurant
      await prisma.restaurant.update({
        where: {
          id: existingRestaurant.id,
        },
        data: {
          name: restaurant.name,
          address: restaurant.formatted_address || '',
          latitude: restaurant.geometry?.location?.lat || 0,
          longitude: restaurant.geometry?.location?.lng || 0,
          phone: restaurant.international_phone_number || '',
          website: restaurant.website || '',
          rating: restaurant.rating || 0,
          priceLevel: restaurant.price_level || 0,
          countryCode,
          updatedAt: new Date(),
        },
      });

      return existingRestaurant.id;
    } else {
      // Create new restaurant
      const restaurantId = uuidv4();
      await prisma.restaurant.create({
        data: {
          id: restaurantId,
          googlePlaceId: restaurant.place_id,
          name: restaurant.name,
          address: restaurant.formatted_address || '',
          latitude: restaurant.geometry?.location?.lat || 0,
          longitude: restaurant.geometry?.location?.lng || 0,
          phone: restaurant.international_phone_number || '',
          website: restaurant.website || '',
          rating: restaurant.rating || 0,
          priceLevel: restaurant.price_level || 0,
          countryCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return restaurantId;
    }
  } catch (error) {
    console.error('Error saving restaurant to database:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to save restaurant to database',
    });
  }
};

/**
 * Save restaurant photos to database
 */
const saveRestaurantPhotos = async (restaurantId: string, photos: Photo[]): Promise<void> => {
  try {
    if (!photos || photos.length === 0) {
      return;
    }

    // Delete existing photos
    await prisma.restaurantPhoto.deleteMany({
      where: {
        restaurantId,
      },
    });

    // Insert new photos
    for (const photo of photos) {
      const photoId = uuidv4();
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photo.width}&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;

      await prisma.restaurantPhoto.create({
        data: {
          id: photoId,
          restaurantId,
          photoUrl,
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        },
      });
    }
  } catch (error) {
    console.error('Error saving restaurant photos:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to save restaurant photos',
    });
  }
};

/**
 * Save restaurant hours to database
 */
const saveRestaurantHours = async (restaurantId: string, openingHours: { periods?: Period[] }): Promise<void> => {
  try {
    if (!openingHours || !openingHours.periods) {
      return;
    }

    // Delete existing hours
    await prisma.restaurantHour.deleteMany({
      where: {
        restaurantId,
      },
    });

    // Insert new hours
    for (const period of openingHours.periods) {
      if (!period.open || !period.close) {
        continue;
      }

      const hourId = uuidv4();
      const dayOfWeek = period.open.day;
      const openTime = period.open.time.substring(0, 2) + ':' + period.open.time.substring(2, 4) + ':00';
      const closeTime = period.close.time.substring(0, 2) + ':' + period.close.time.substring(2, 4) + ':00';

      await prisma.restaurantHour.create({
        data: {
          id: hourId,
          restaurantId,
          dayOfWeek,
          openTime,
          closeTime,
        },
      });
    }
  } catch (error) {
    console.error('Error saving restaurant hours:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to save restaurant hours',
    });
  }
};
