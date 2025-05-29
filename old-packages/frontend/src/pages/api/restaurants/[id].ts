import {
  Restaurant,
  RestaurantHours,
  RestaurantPhoto,
} from '@/types/restaurant';
import { withApiAuthRequired } from '@/utils/auth';
import { executeQuery } from '@/utils/db';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Get restaurant details API endpoint
 *
 * This endpoint gets details for a restaurant from the database or Google Maps API
 * It requires authentication and accepts the following parameters:
 * - id: Restaurant ID (either our internal ID or Google Place ID)
 * - countryCode: Country code (e.g., 'my', 'sg')
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { id, countryCode } = req.query;

    if (!id) {
      res.status(400).json({ message: 'Restaurant ID is required' });
      return;
    }

    // Try to get restaurant from database first
    let restaurant: Restaurant | null = await getRestaurantFromDatabase(
      id as string,
    );

    // If restaurant is found in database, get photos and hours
    if (restaurant) {
      // Get photos
      const photos = await getRestaurantPhotos(restaurant.restaurantId);
      if (photos.length > 0) {
        restaurant.photos = photos;
      }

      // Get hours
      const hours = await getRestaurantHours(restaurant.restaurantId);
      if (hours.length > 0) {
        restaurant.hours = hours;
      }

      res.status(200).json(restaurant);
      return;
    }

    // If restaurant is not found in database, try to get it from Google Maps API
    restaurant = await getRestaurantFromGoogleMaps(
      id as string,
      countryCode as string,
    );

    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    res.status(200).json(restaurant);
    return;
  } catch (error: unknown) {
    console.error('Error getting restaurant details:', error);
    res.status(500).json({ message: 'Error getting restaurant details' });
    return;
  }
}

/**
 * Get restaurant from database
 *
 * @param id Restaurant ID (either our internal ID or Google Place ID)
 * @returns Restaurant or null if not found
 */
async function getRestaurantFromDatabase(
  id: string,
): Promise<Restaurant | null> {
  try {
    // Try to get restaurant by our internal ID first
    let query = `
      SELECT r.*
      FROM restaurants r
      WHERE r.restaurant_id = $1
    `;

    let result = await executeQuery(query, [id]);

    // If not found, try to get by Google Place ID
    if (result.rows.length === 0) {
      query = `
        SELECT r.*
        FROM restaurants r
        WHERE r.google_place_id = $1
      `;

      result = await executeQuery(query, [id]);
    }

    // If still not found, return null
    if (result.rows.length === 0) {
      return null;
    }

    // Transform database row to our format
    const row = result.rows[0] as any;
    return {
      restaurantId: row.restaurant_id,
      googlePlaceId: row.google_place_id,
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      phone: row.phone,
      website: row.website,
      rating: row.rating,
      priceLevel: row.price_level,
      photoReference: row.photo_reference,
      countryCode: row.country_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error: unknown) {
    console.error('Error getting restaurant from database:', error);
    return null;
  }
}

/**
 * Get restaurant photos from database
 *
 * @param restaurantId Restaurant ID
 * @returns Array of restaurant photos
 */
async function getRestaurantPhotos(
  restaurantId: string,
): Promise<RestaurantPhoto[]> {
  try {
    const query = `
      SELECT p.*
      FROM restaurant_photos p
      WHERE p.restaurant_id = $1
    `;

    const result = await executeQuery(query, [restaurantId]);

    // Transform database rows to our format
    return result.rows.map((row: Record<string, unknown>) => ({
      photoId: row.photo_id as string,
      restaurantId: row.restaurant_id as string,
      photoUrl: row.photo_url as string,
      photoReference: row.photo_reference as string,
      width: row.width as number,
      height: row.height as number,
      createdAt: row.created_at as string,
    }));
  } catch (error: unknown) {
    console.error('Error getting restaurant photos:', error);
    return [];
  }
}

/**
 * Get restaurant hours from database
 *
 * @param restaurantId Restaurant ID
 * @returns Array of restaurant hours
 */
async function getRestaurantHours(
  restaurantId: string,
): Promise<RestaurantHours[]> {
  try {
    const query = `
      SELECT h.*
      FROM restaurant_hours h
      WHERE h.restaurant_id = $1
      ORDER BY h.day_of_week, h.open_time
    `;

    const result = await executeQuery(query, [restaurantId]);

    // Transform database rows to our format
    return result.rows.map((row: Record<string, unknown>) => ({
      hourId: row.hour_id as string,
      restaurantId: row.restaurant_id as string,
      dayOfWeek: row.day_of_week as number,
      openTime: row.open_time as string,
      closeTime: row.close_time as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  } catch (error: unknown) {
    console.error('Error getting restaurant hours:', error);
    return [];
  }
}

/**
 * Get restaurant from Google Maps API
 *
 * @param id Restaurant ID (Google Place ID)
 * @param countryCode Country code
 * @returns Restaurant or null if not found
 */
async function getRestaurantFromGoogleMaps(
  id: string,
  countryCode: string,
): Promise<Restaurant | null> {
  try {
    // Call our Lambda function for Google Maps integration
    const lambdaUrl = process.env.GOOGLE_MAPS_LAMBDA_URL;

    if (!lambdaUrl) {
      console.error('Google Maps Lambda URL not configured');
      return null;
    }

    // Prepare Lambda request
    const lambdaParams = {
      action: 'getDetails',
      placeId: id,
      countryCode: countryCode || 'unknown',
    };

    // Call Lambda function
    const lambdaResponse = await axios.post(lambdaUrl, lambdaParams, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAMBDA_API_KEY || '',
      },
    });

    // Check if we got a valid response
    if (!lambdaResponse.data || !lambdaResponse.data.restaurantId) {
      return null;
    }

    const place = lambdaResponse.data;

    // Transform Lambda response to our format
    const restaurant: Restaurant = {
      restaurantId: place.restaurantId,
      googlePlaceId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      phone: place.international_phone_number,
      website: place.website,
      rating: place.rating,
      priceLevel: place.price_level,
      photoReference: place.photos?.[0]?.photo_reference,
      countryCode: countryCode || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get photos from database
    const photos = await getRestaurantPhotos(restaurant.restaurantId);
    if (photos.length > 0) {
      restaurant.photos = photos;
    }

    // Get hours from database
    const hours = await getRestaurantHours(restaurant.restaurantId);
    if (hours.length > 0) {
      restaurant.hours = hours;
    }

    return restaurant;
  } catch (error: unknown) {
    console.error('Error getting restaurant from Google Maps API:', error);
    return null;
  }
}

export default withApiAuthRequired(handler);
