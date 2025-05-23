/**
 * API Route: Get User's All Rankings
 * 
 * This API route retrieves all rankings created by the authenticated user.
 * It requires authentication and supports filtering and pagination.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rankingService } from '../../../../services/rankingService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for user's all rankings API endpoint
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

    const { 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dishType,
      restaurantId,
      minRating,
      maxRating,
      tasteStatus,
      includeReviews = true,
      includePhotos = false
    } = req.query;

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

    // Validate rating filters if provided
    let minRatingNum = null;
    let maxRatingNum = null;

    if (minRating) {
      minRatingNum = parseFloat(minRating);
      if (isNaN(minRatingNum) || minRatingNum < 1 || minRatingNum > 10) {
        return res.status(400).json({
          error: 'Invalid minimum rating',
          message: 'Minimum rating must be a number between 1 and 10'
        });
      }
    }

    if (maxRating) {
      maxRatingNum = parseFloat(maxRating);
      if (isNaN(maxRatingNum) || maxRatingNum < 1 || maxRatingNum > 10) {
        return res.status(400).json({
          error: 'Invalid maximum rating',
          message: 'Maximum rating must be a number between 1 and 10'
        });
      }
    }

    if (minRatingNum && maxRatingNum && minRatingNum > maxRatingNum) {
      return res.status(400).json({
        error: 'Invalid rating range',
        message: 'Minimum rating cannot be greater than maximum rating'
      });
    }

    // Validate taste status if provided
    if (tasteStatus && !['loved', 'liked', 'neutral', 'disliked'].includes(tasteStatus)) {
      return res.status(400).json({
        error: 'Invalid taste status',
        message: 'Taste status must be one of: loved, liked, neutral, disliked'
      });
    }

    // Get user's all rankings
    const rankings = await rankingService.getUserRankings(session.user.id, {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      dishType: dishType || undefined,
      restaurantId: restaurantId || undefined,
      minRating: minRatingNum,
      maxRating: maxRatingNum,
      tasteStatus: tasteStatus || undefined,
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
        userId: session.user.id,
        averageRating: rankings.averageRating || 0,
        totalRankings: rankings.total || 0,
        filters: {
          dishType: dishType || null,
          restaurantId: restaurantId || null,
          minRating: minRatingNum,
          maxRating: maxRatingNum,
          tasteStatus: tasteStatus || null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user rankings:', error);
    
    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user rankings'
    });
  }
}
