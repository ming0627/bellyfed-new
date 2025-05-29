/**
 * Admin API: Create Restaurant
 *
 * This endpoint creates a new restaurant in the database.
 * It requires admin authentication.
 */

import { NextApiResponse } from 'next';
import { withAdminAuth, AdminApiRequest } from '@/middleware/adminMiddleware';
import { executeQuery } from '@/utils/db';
import { createRestaurantEvent } from '@/utils/events';

interface CreateRestaurantRequest {
  restaurantId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  countryCode: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  website?: string;
  email?: string;
  cuisineType?: string;
  priceRange: number;
}

/**
 * Handler for creating a restaurant
 * This will only be called if the user is authenticated and has admin privileges
 * due to the withAdminAuth middleware
 */
async function handler(
  req: AdminApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request body for debugging
    console.log('Restaurant creation request body:', req.body);

    const {
      restaurantId,
      name,
      description,
      address,
      city,
      state,
      postalCode,
      country,
      countryCode,
      latitude,
      longitude,
      phone,
      website,
      email,
      cuisineType,
      priceRange,
    } = req.body as CreateRestaurantRequest;

    // Enhanced validation with specific error messages
    const missingFields = [];
    if (!restaurantId) missingFields.push('restaurantId');
    if (!name) missingFields.push('name');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!country) missingFields.push('country');
    if (!countryCode) missingFields.push('countryCode');

    if (missingFields.length > 0) {
      console.warn('Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
    }

    // Validate price range
    if (typeof priceRange !== 'number' || priceRange < 1 || priceRange > 5) {
      return res.status(400).json({
        error: 'Invalid price range',
        message: 'Price range must be a number between 1 and 5',
      });
    }

    // Get a client from the pool to check if the restaurant already exists
    const checkResult = await executeQuery(
      `SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1`,
      [restaurantId],
    );

    if (checkResult.rows.length > 0) {
      return res
        .status(409)
        .json({ error: 'Restaurant with this ID already exists' });
    }

    // Prepare restaurant data for the event
    const restaurantData = {
      restaurantId,
      name,
      description: description || '',
      address,
      city,
      state: state || '',
      postalCode: postalCode || '',
      country,
      countryCode,
      latitude: latitude || null,
      longitude: longitude || null,
      phone: phone || '',
      website: website || '',
      email: email || '',
      cuisineType: cuisineType || '',
      priceRange,
      createdBy: req.user?.id || 'system',
      createdAt: new Date().toISOString(),
    };

    // Send the event to SQS
    console.log('Sending restaurant creation event to SQS');
    await createRestaurantEvent(restaurantData);
    console.log('Restaurant creation event sent successfully');

    // Return an acknowledgment response
    return res.status(202).json({
      message: 'Restaurant creation request accepted',
      restaurantId,
      status: 'PROCESSING',
      estimatedCompletionTime: '30 seconds',
    });
  } catch (error: unknown) {
    console.error('Error creating restaurant:', error);

    // Check for SQS-related errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to process restaurant creation request at this time',
        details: errorMessage,
      });
    }

    return res.status(500).json({
      error: 'Failed to create restaurant',
      message: errorMessage,
    });
  }
}

// Export the handler with admin authentication
export default withAdminAuth(handler);
