/**
 * API Route: Get User Rankings by ID
 * 
 * This API route retrieves all public rankings created by a specific user.
 * It supports filtering and pagination for public viewing.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rankingService } from '../../../../services/rankingService.js';

/**
 * Handler for user rankings by ID API endpoint
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dishType,
      restaurantId,
      minRating,
      includeReviews = true,
      includePhotos = false
    } = req.query;

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
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

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 100'
      });
    }

    // Validate sort parameters
    const validSortFields = ['rating', 'createdAt', 'updatedAt', 'dishName', 'restaurantName'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: 'Invalid sort field',
        message: `Sort field must be one of: ${validSortFields.join(', ')}`
      });
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({
        error: 'Invalid sort order',
        message: 'Sort order must be either "asc" or "desc"'
      });
    }

    // Validate minimum rating if provided
    let minRatingNum = null;
    if (minRating) {
      minRatingNum = parseFloat(minRating);
      if (isNaN(minRatingNum) || minRatingNum < 1 || minRatingNum > 10) {
        return res.status(400).json({
          error: 'Invalid minimum rating',
          message: 'Minimum rating must be a number between 1 and 10'
        });
      }
    }

    // Get user's public rankings
    const rankings = await rankingService.getUserRankings(id, {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      dishType: dishType || undefined,
      restaurantId: restaurantId || undefined,
      minRating: minRatingNum,
      includeReviews: includeReviews === 'true',
      includePhotos: includePhotos === 'true',
      publicOnly: true // Only show public rankings for other users
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: rankings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: rankings.total || 0,
        totalPages: Math.ceil((rankings.total || 0) / limitNum)
      },
      meta: {
        userId: id,
        averageRating: rankings.averageRating || 0,
        totalRankings: rankings.total || 0,
        filters: {
          dishType: dishType || null,
          restaurantId: restaurantId || null,
          minRating: minRatingNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user rankings:', error);
    
    // Handle specific error types
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user rankings'
    });
  }
}
