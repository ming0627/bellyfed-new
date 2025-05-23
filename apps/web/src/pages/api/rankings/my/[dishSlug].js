/**
 * API Route: Get User's Dish Rankings
 * 
 * This API route retrieves the authenticated user's rankings for a specific dish.
 * It requires authentication and supports pagination.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rankingService } from '../../../../services/rankingService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for user's dish rankings API endpoint
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
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view your rankings'
      });
    }

    const { dishSlug } = req.query;
    const { 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeReviews = true,
      includePhotos = true
    } = req.query;

    // Validate dish slug
    if (!dishSlug || typeof dishSlug !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish slug',
        message: 'Dish slug is required and must be a string'
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
    const validSortFields = ['rating', 'createdAt', 'updatedAt', 'restaurantName'];
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

    // Get user's dish rankings
    const rankings = await rankingService.getUserDishRankings(session.user.id, dishSlug, {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      includeReviews: includeReviews === 'true',
      includePhotos: includePhotos === 'true'
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
        dishSlug,
        userId: session.user.id,
        averageRating: rankings.averageRating || 0,
        totalRankings: rankings.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching user dish rankings:', error);
    
    // Handle specific error types
    if (error.message === 'Dish not found') {
      return res.status(404).json({
        error: 'Dish not found',
        message: 'The specified dish does not exist'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user dish rankings'
    });
  }
}
