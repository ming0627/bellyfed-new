import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@/utils/auth';
import { Restaurant } from '@/types/restaurant';
import { executeQuery } from '@/utils/db';

/**
 * Get restaurants by dish ID API endpoint
 *
 * This endpoint gets restaurants that serve a specific dish
 * It requires authentication and accepts the following parameters:
 * - dishId: Dish ID
 * - countryCode: Country code (e.g., 'my', 'sg')
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { dishId, countryCode } = req.query;

    if (!dishId) {
      return res.status(400).json({ message: 'Dish ID is required' });
    }

    if (!countryCode) {
      return res.status(400).json({ message: 'Country code is required' });
    }

    // Query the database for restaurants that serve this dish
    const query = `
      SELECT r.*
      FROM restaurants r
      JOIN dishes d ON r.restaurant_id = d.restaurant_id
      WHERE d.dish_id = $1
      AND r.country_code = $2
    `;

    const result = await executeQuery(query, [dishId, countryCode]);

    // Transform database results to our format
    const restaurants: Restaurant[] = result.rows.map(
      (row: Record<string, unknown>) => ({
        restaurantId: row.restaurant_id as string,
        googlePlaceId: row.google_place_id as string,
        name: row.name as string,
        address: row.address as string,
        latitude: row.latitude as number,
        longitude: row.longitude as number,
        phone: row.phone as string,
        website: row.website as string,
        rating: row.rating as number,
        priceLevel: row.price_level as number,
        photoReference: row.photo_reference as string,
        countryCode: row.country_code as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }),
    );

    return res.status(200).json(restaurants);
  } catch (error: unknown) {
    console.error('Error getting restaurants by dish ID:', error);
    return res
      .status(500)
      .json({ message: 'Error getting restaurants by dish ID' });
  }
}

export default withApiAuthRequired(handler);
