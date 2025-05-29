import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@/utils/auth';
import { RestaurantHours } from '@/types/restaurant';
import { executeQuery } from '@/utils/db';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get restaurant hours API endpoint
 *
 * This endpoint gets opening hours for a restaurant from the database or Google Maps API
 * It requires authentication and accepts the following parameters:
 * - id: Restaurant ID (either our internal ID or Google Place ID)
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

    if (!id) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Get restaurant ID from database
    const restaurantId = await getRestaurantId(id as string);

    if (!restaurantId) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get hours from database
    const hours = await getRestaurantHours(restaurantId);

    // If we have hours, return them
    if (hours.length > 0) {
      return res.status(200).json({
        hours,
        currentStatus: getCurrentOpenStatus(hours),
      });
    }

    // If we don't have hours, try to get them from Google Maps API
    const newHours = await getHoursFromGoogleMaps(restaurantId);

    if (!newHours || newHours.length === 0) {
      return res.status(200).json({
        hours: [],
        currentStatus: 'unknown',
      });
    }

    // Return the hours
    return res.status(200).json({
      hours: newHours,
      currentStatus: getCurrentOpenStatus(newHours),
    });
  } catch (error: unknown) {
    console.error('Error getting restaurant hours:', error);
    return res.status(500).json({ message: 'Error getting restaurant hours' });
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
    console.error('Error getting restaurant hours from database:', error);
    return [];
  }
}

/**
 * Get restaurant hours from Google Maps API
 *
 * @param restaurantId Restaurant ID
 * @returns Array of restaurant hours
 */
async function getHoursFromGoogleMaps(
  restaurantId: string,
): Promise<RestaurantHours[]> {
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
      action: 'getHours',
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
    if (!lambdaResponse.data || !lambdaResponse.data.periods) {
      return [];
    }

    const periods = lambdaResponse.data.periods;

    // Insert hours into database
    await Promise.all(
      periods.map(async (period: Record<string, any>) => {
        const hourId = uuidv4();

        const insertQuery = `
        INSERT INTO restaurant_hours (
          hour_id, restaurant_id, day_of_week, open_time, close_time, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
        ON CONFLICT (restaurant_id, day_of_week, open_time) DO NOTHING
      `;

        await executeQuery(insertQuery, [
          hourId,
          restaurantId,
          period.open.day,
          `${period.open.time.substring(0, 2)}:${period.open.time.substring(2, 4)}:00`,
          `${period.close.time.substring(0, 2)}:${period.close.time.substring(2, 4)}:00`,
          new Date().toISOString(),
          new Date().toISOString(),
        ]);

        return {
          hourId,
          restaurantId,
          dayOfWeek: period.open.day,
          openTime: `${period.open.time.substring(0, 2)}:${period.open.time.substring(2, 4)}:00`,
          closeTime: `${period.close.time.substring(0, 2)}:${period.close.time.substring(2, 4)}:00`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),
    );

    // Get hours from database again to ensure we have the correct IDs
    return await getRestaurantHours(restaurantId);
  } catch (error: unknown) {
    console.error(
      'Error getting restaurant hours from Google Maps API:',
      error,
    );
    return [];
  }
}

/**
 * Get current open status
 *
 * @param hours Array of restaurant hours
 * @returns Current open status ('open', 'closed', or 'unknown')
 */
function getCurrentOpenStatus(
  hours: RestaurantHours[],
): 'open' | 'closed' | 'unknown' {
  if (!hours || hours.length === 0) {
    return 'unknown';
  }

  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

    // Find hours for current day
    const todayHours = hours.filter((hour) => hour.dayOfWeek === currentDay);

    if (todayHours.length === 0) {
      return 'closed';
    }

    // Check if current time is within any of the open periods
    for (const hour of todayHours) {
      if (currentTime >= hour.openTime && currentTime <= hour.closeTime) {
        return 'open';
      }
    }

    return 'closed';
  } catch (error: unknown) {
    console.error('Error getting current open status:', error);
    return 'unknown';
  }
}

export default withApiAuthRequired(handler);
