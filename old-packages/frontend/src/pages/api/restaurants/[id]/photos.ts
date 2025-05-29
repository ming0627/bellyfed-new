import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@/utils/auth';
import { RestaurantPhoto } from '@/types/restaurant';
import { executeQuery } from '@/utils/db';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get restaurant photos API endpoint
 *
 * This endpoint gets photos for a restaurant from the database or Google Maps API
 * It requires authentication and accepts the following parameters:
 * - id: Restaurant ID (either our internal ID or Google Place ID)
 * - limit: Maximum number of photos to return (default: 10)
 * - offset: Offset for pagination (default: 0)
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    if (!id) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Get restaurant ID from database
    const restaurantId = await getRestaurantId(id as string);

    if (!restaurantId) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get photos from database
    const photos = await getRestaurantPhotos(restaurantId, limit, offset);

    // If we have photos, return them
    if (photos.length > 0) {
      return res.status(200).json({
        photos,
        totalCount: photos.length,
        hasMore: photos.length === limit,
      });
    }

    // If we don't have photos, try to get them from Google Maps API
    const newPhotos = await getPhotosFromGoogleMaps(restaurantId);

    if (!newPhotos || newPhotos.length === 0) {
      return res.status(200).json({
        photos: [],
        totalCount: 0,
        hasMore: false,
      });
    }

    // Return the photos
    return res.status(200).json({
      photos: newPhotos.slice(offset, offset + limit),
      totalCount: newPhotos.length,
      hasMore: offset + limit < newPhotos.length,
    });
  } catch (error: unknown) {
    console.error('Error getting restaurant photos:', error);
    return res.status(500).json({ message: 'Error getting restaurant photos' });
  }
}

/**
 * Get restaurant ID from database
 *
 * @param id Restaurant ID (either our internal ID or Google Place ID)
 * @returns Restaurant ID or null if not found
 */
async function getRestaurantId(id: string): Promise<string | null> {
  try {
    // Try to get restaurant by our internal ID first
    let query = `
      SELECT restaurant_id
      FROM restaurants
      WHERE restaurant_id = $1
    `;

    let result = await executeQuery(query, [id]);

    // If found, return the ID
    if (result.rows.length > 0) {
      return (result.rows[0] as any).restaurant_id;
    }

    // If not found, try to get by Google Place ID
    query = `
      SELECT restaurant_id
      FROM restaurants
      WHERE google_place_id = $1
    `;

    result = await executeQuery(query, [id]);

    // If found, return the ID
    if (result.rows.length > 0) {
      return (result.rows[0] as any).restaurant_id;
    }

    // If still not found, return null
    return null;
  } catch (error: unknown) {
    console.error('Error getting restaurant ID:', error);
    return null;
  }
}

/**
 * Get restaurant photos from database
 *
 * @param restaurantId Restaurant ID
 * @param limit Maximum number of photos to return
 * @param offset Offset for pagination
 * @returns Array of restaurant photos
 */
async function getRestaurantPhotos(
  restaurantId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<RestaurantPhoto[]> {
  try {
    const query = `
      SELECT p.*
      FROM restaurant_photos p
      WHERE p.restaurant_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await executeQuery(query, [restaurantId, limit, offset]);

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
    console.error('Error getting restaurant photos from database:', error);
    return [];
  }
}

/**
 * Get restaurant photos from Google Maps API
 *
 * @param restaurantId Restaurant ID
 * @returns Array of restaurant photos
 */
async function getPhotosFromGoogleMaps(
  restaurantId: string,
): Promise<RestaurantPhoto[]> {
  try {
    // Get restaurant from database to get Google Place ID
    const query = `
      SELECT google_place_id
      FROM restaurants
      WHERE restaurant_id = $1
    `;

    const result = await executeQuery(query, [restaurantId]);

    if (result.rows.length === 0) {
      return [];
    }

    const googlePlaceId = (result.rows[0] as any).google_place_id;

    // Call our Lambda function for Google Maps integration
    const lambdaUrl = process.env.GOOGLE_MAPS_LAMBDA_URL;

    if (!lambdaUrl) {
      console.error('Google Maps Lambda URL not configured');
      return [];
    }

    // Prepare Lambda request
    const lambdaParams = {
      action: 'getPhotos',
      placeId: googlePlaceId,
    };

    // Call Lambda function
    const lambdaResponse = await axios.post(lambdaUrl, lambdaParams, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAMBDA_API_KEY || '',
      },
    });

    // Check if we got a valid response
    if (!lambdaResponse.data || !lambdaResponse.data.photos) {
      return [];
    }

    const photos = lambdaResponse.data.photos;

    // Insert photos into database
    await Promise.all(
      photos.map(async (photo: Record<string, unknown>) => {
        const photoId = uuidv4();

        const insertQuery = `
        INSERT INTO restaurant_photos (
          photo_id, restaurant_id, photo_url, photo_reference, width, height, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
        ON CONFLICT (photo_reference) DO NOTHING
      `;

        await executeQuery(insertQuery, [
          photoId,
          restaurantId,
          photo.photoUrl as string,
          photo.photoReference as string,
          photo.width as number,
          photo.height as number,
          new Date().toISOString(),
        ]);

        return {
          photoId,
          restaurantId,
          photoUrl: photo.photoUrl as string,
          photoReference: photo.photoReference as string,
          width: photo.width as number,
          height: photo.height as number,
          createdAt: new Date().toISOString(),
        };
      }),
    );

    // Get photos from database again to ensure we have the correct IDs
    return await getRestaurantPhotos(restaurantId, 100, 0);
  } catch (error: unknown) {
    console.error(
      'Error getting restaurant photos from Google Maps API:',
      error,
    );
    return [];
  }
}

export default withApiAuthRequired(handler);
