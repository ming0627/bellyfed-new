/**
 * API Route: Create Ranking
 *
 * This API route creates a new dish ranking for a user.
 * It requires authentication and validates the ranking data.
 */

import { rankingService } from '../../../services/rankingService.js';

/**
 * Handler for create ranking API endpoint
 *
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // TODO: Implement authentication check
    // const user = await getAuthenticatedUser(req)
    // if (!user) {
    //   return res.status(401).json({
    //     error: 'Unauthorized',
    //     message: 'Authentication required to create ranking'
    //   })
    // }

    // Mock user ID for now - replace with actual authenticated user ID
    const userId = req.headers['x-user-id'] || 'user_123'

    const {
      dishId,
      restaurantId,
      rating,
      review,
      photoUrls,
      tasteStatus,
      notes
    } = req.body;

    // Validate required fields
    if (!dishId || typeof dishId !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish ID',
        message: 'Dish ID is required and must be a string'
      });
    }

    if (!restaurantId || typeof restaurantId !== 'string') {
      return res.status(400).json({
        error: 'Invalid restaurant ID',
        message: 'Restaurant ID is required and must be a string'
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be a number between 1 and 10'
      });
    }

    // Validate optional fields
    if (review && (typeof review !== 'string' || review.length > 1000)) {
      return res.status(400).json({
        error: 'Invalid review',
        message: 'Review must be a string with maximum 1000 characters'
      });
    }

    if (photoUrls && (!Array.isArray(photoUrls) || photoUrls.length > 10)) {
      return res.status(400).json({
        error: 'Invalid photo URLs',
        message: 'Photo URLs must be an array with maximum 10 items'
      });
    }

    if (tasteStatus && !['loved', 'liked', 'neutral', 'disliked'].includes(tasteStatus)) {
      return res.status(400).json({
        error: 'Invalid taste status',
        message: 'Taste status must be one of: loved, liked, neutral, disliked'
      });
    }

    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return res.status(400).json({
        error: 'Invalid notes',
        message: 'Notes must be a string with maximum 500 characters'
      });
    }

    // Create the ranking
    const ranking = await rankingService.createRanking({
      userId,
      dishId,
      restaurantId,
      rating,
      review: review || null,
      photoUrls: photoUrls || [],
      tasteStatus: tasteStatus || 'neutral',
      notes: notes || null
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: ranking,
      message: 'Ranking created successfully'
    });

  } catch (error) {
    console.error('Error creating ranking:', error);

    // Handle specific error types
    if (error.message === 'Dish not found') {
      return res.status(404).json({
        error: 'Dish not found',
        message: 'The specified dish does not exist'
      });
    }

    if (error.message === 'Restaurant not found') {
      return res.status(404).json({
        error: 'Restaurant not found',
        message: 'The specified restaurant does not exist'
      });
    }

    if (error.message === 'Ranking already exists') {
      return res.status(409).json({
        error: 'Ranking already exists',
        message: 'You have already ranked this dish at this restaurant'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create ranking'
    });
  }
}
