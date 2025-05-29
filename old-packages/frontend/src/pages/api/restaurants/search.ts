import {
  Restaurant,
  RestaurantSearchParams,
  RestaurantSearchResponse,
} from '@/types/restaurant';
import { withApiAuthRequired } from '@/utils/auth';
import { executeQuery } from '@/utils/db';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

/**
 * Search restaurants API endpoint
 *
 * This endpoint searches for restaurants using the database and Google Maps API
 * It requires authentication and accepts the following parameters:
 * - query: Search query
 * - latitude: Latitude coordinate
 * - longitude: Longitude coordinate
 * - radius: Search radius in meters (default: 1000)
 * - type: Type of place (default: 'restaurant')
 * - countryCode: Country code (e.g., 'my', 'sg')
 * - limit: Maximum number of results (default: 20)
 * - nextPageToken: Token for pagination
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Get parameters from query or body
    const params: RestaurantSearchParams =
      req.method === 'GET'
        ? (req.query as unknown as RestaurantSearchParams)
        : req.body;

    // Validate required parameters
    if (!params.countryCode) {
      res.status(400).json({ message: 'countryCode is required' });
      return;
    }

    // Set default limit
    const limit = params.limit || 20;

    // If we have a query but no coordinates, try to search by name in the database
    if (params.query && (!params.latitude || !params.longitude)) {
      // Search in the database first
      const dbQuery = `
        SELECT r.*
        FROM restaurants r
        WHERE r.country_code = $1
        AND (
          r.name ILIKE $2
          OR r.address ILIKE $2
        )
        ORDER BY r.name
        LIMIT $3
      `;

      const result = await executeQuery(dbQuery, [
        params.countryCode,
        `%${params.query}%`,
        limit,
      ]);

      // If we have results from the database, return them
      if (result.rows.length > 0) {
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
          AND (
            r.name ILIKE $2
            OR r.address ILIKE $2
          )
        `;

        const countResult = await executeQuery(countQuery, [
          params.countryCode,
          `%${params.query}%`,
        ]);

        const totalCount = parseInt((countResult.rows[0] as any).total, 10);

        res.status(200).json({
          restaurants,
          totalCount,
          nextPageToken: undefined,
        });
        return;
      }
    }

    // If we have coordinates or a nextPageToken, use Google Maps API via our Lambda function
    if ((params.latitude && params.longitude) || params.nextPageToken) {
      // Call our Lambda function for Google Maps integration
      const lambdaUrl = process.env.GOOGLE_MAPS_LAMBDA_URL;

      if (!lambdaUrl) {
        res
          .status(500)
          .json({ message: 'Google Maps Lambda URL not configured' });
        return;
      }

      // Prepare Lambda request
      const lambdaParams = {
        action: 'search',
        query: params.query || '',
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 1000,
        type: params.type || 'restaurant',
        countryCode: params.countryCode,
        limit: limit,
        nextPageToken: params.nextPageToken,
      };

      // Call Lambda function
      const lambdaResponse = await axios.post(lambdaUrl, lambdaParams, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.LAMBDA_API_KEY || '',
        },
      });

      // Check if we got a valid response
      if (!lambdaResponse.data || !lambdaResponse.data.results) {
        res
          .status(500)
          .json({ message: 'Invalid response from Google Maps Lambda' });
        return;
      }

      // Transform Lambda response to our format
      const restaurants: Restaurant[] = await Promise.all(
        lambdaResponse.data.results.map(async (place: Record<string, any>) => {
          // Check if restaurant already exists in database
          const existingQuery = `
            SELECT restaurant_id
            FROM restaurants
            WHERE google_place_id = $1
            AND country_code = $2
          `;

          const existingResult = await executeQuery(existingQuery, [
            place.place_id,
            params.countryCode,
          ]);

          let restaurantId: string;

          // If restaurant exists, use its ID
          if (existingResult.rows.length > 0) {
            restaurantId = (existingResult.rows[0] as any).restaurant_id;
          } else {
            // Otherwise, generate a new ID and insert into database
            restaurantId = uuidv4();

            const insertQuery = `
              INSERT INTO restaurants (
                restaurant_id, google_place_id, name, address, latitude, longitude,
                rating, price_level, photo_reference, country_code, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
              )
              ON CONFLICT (google_place_id) DO NOTHING
            `;

            await executeQuery(insertQuery, [
              restaurantId,
              place.place_id,
              place.name,
              place.vicinity,
              place.geometry.location.lat,
              place.geometry.location.lng,
              place.rating,
              place.price_level,
              place.photos?.[0]?.photo_reference,
              params.countryCode,
              new Date().toISOString(),
              new Date().toISOString(),
            ]);
          }

          // Return restaurant object
          return {
            restaurantId,
            googlePlaceId: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            priceLevel: place.price_level,
            photoReference: place.photos?.[0]?.photo_reference,
            countryCode: params.countryCode as string,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      // Return response
      const response: RestaurantSearchResponse = {
        restaurants,
        totalCount: restaurants.length,
        nextPageToken: lambdaResponse.data.next_page_token,
      };

      res.status(200).json(response);
      return;
    }

    // If we don't have coordinates or a query, return empty response
    res.status(200).json({
      restaurants: [],
      totalCount: 0,
    });
    return;
  } catch (error: unknown) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ message: 'Error searching restaurants' });
    return;
  }
}

export default withApiAuthRequired(handler);
