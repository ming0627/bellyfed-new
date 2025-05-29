import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@/utils/auth';
import { Restaurant } from '@/types/restaurant';
import { executeQuery } from '@/utils/db';

/**
 * List restaurants API endpoint
 *
 * This endpoint lists restaurants from the database
 * It requires authentication and accepts the following parameters:
 * - countryCode: Country code (e.g., 'my', 'sg')
 * - limit: Maximum number of results (default: 20)
 * - offset: Offset for pagination
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { countryCode, limit = '20', offset = '0' } = req.query;

    if (!countryCode) {
      return res.status(400).json({ message: 'Country code is required' });
    }

    // Query the database for restaurants
    const query = `
      SELECT r.*
      FROM restaurants r
      WHERE r.country_code = $1
      ORDER BY r.name
      LIMIT $2 OFFSET $3
    `;

    const result = await executeQuery(query, [
      countryCode,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10),
    ]);

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

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM restaurants r
      WHERE r.country_code = $1
    `;

    const countResult = await executeQuery(countQuery, [countryCode]);
    const totalCount = parseInt((countResult.rows[0] as any).total, 10);

    return res.status(200).json({
      restaurants,
      totalCount,
      nextToken:
        totalCount >
        parseInt(limit as string, 10) + parseInt(offset as string, 10)
          ? (
              parseInt(offset as string, 10) + parseInt(limit as string, 10)
            ).toString()
          : undefined,
    });
  } catch (error: unknown) {
    console.error('Error listing restaurants:', error);
    return res.status(500).json({ message: 'Error listing restaurants' });
  }
}

export default withApiAuthRequired(handler);
