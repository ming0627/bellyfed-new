/**
 * API Route: Get Restaurant Photos
 * 
 * This API route retrieves all photos for a specific restaurant.
 * It supports pagination and filtering by photo type.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { restaurantService } from '../../../../services/restaurantService.js';

/**
 * Handler for restaurant photos API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    const { id } = req.query;
    const { 
      page = 1, 
      limit = 20, 
      photoType,
      includeMetadata = true
    } = req.query;

    // Validate restaurant ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid restaurant ID',
        message: 'Restaurant ID is required and must be a string'
      });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'Page must be a positive integer'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 50'
      });
    }

    // Get restaurant photos
    const photos = await restaurantService.getRestaurantPhotos(id, {
      page: pageNum,
      limit: limitNum,
      photoType: photoType || undefined,
      includeMetadata: includeMetadata === 'true'
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: photos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: photos.total || 0,
        totalPages: Math.ceil((photos.total || 0) / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching restaurant photos:', error);
    
    // Handle specific error types
    if (error.message === 'Restaurant not found') {
      return res.status(404).json({
        error: 'Restaurant not found',
        message: 'The specified restaurant does not exist'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch restaurant photos'
    });
  }
}
