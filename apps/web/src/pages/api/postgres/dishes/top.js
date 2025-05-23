/**
 * API Route: Get Top Dishes
 * 
 * This API route retrieves the top-rated dishes from the database.
 * It supports various filtering and sorting options.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { postgresService } from '../../../../services/postgresService.js';

/**
 * Handler for top dishes API endpoint
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
    const { 
      page = 1, 
      limit = 20,
      timeframe = 'all',
      dishType,
      restaurantId,
      countryCode,
      minVotes = 5,
      sortBy = 'averageRating',
      sortOrder = 'desc',
      includeRestaurant = true,
      includeStats = true
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

    // Validate timeframe
    const validTimeframes = ['all', 'week', 'month', 'quarter', 'year'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        error: 'Invalid timeframe',
        message: `Timeframe must be one of: ${validTimeframes.join(', ')}`
      });
    }

    // Validate minimum votes
    const minVotesNum = parseInt(minVotes, 10);
    if (isNaN(minVotesNum) || minVotesNum < 1) {
      return res.status(400).json({
        error: 'Invalid minimum votes',
        message: 'Minimum votes must be a positive integer'
      });
    }

    // Validate sort parameters
    const validSortFields = ['averageRating', 'totalVotes', 'createdAt', 'name'];
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

    // Validate country code if provided
    if (countryCode && (typeof countryCode !== 'string' || countryCode.length !== 2)) {
      return res.status(400).json({
        error: 'Invalid country code',
        message: 'Country code must be a 2-character string'
      });
    }

    // Get top dishes
    const dishes = await postgresService.getTopDishes({
      page: pageNum,
      limit: limitNum,
      timeframe,
      dishType: dishType || undefined,
      restaurantId: restaurantId || undefined,
      countryCode: countryCode || undefined,
      minVotes: minVotesNum,
      sortBy,
      sortOrder,
      includeRestaurant: includeRestaurant === 'true',
      includeStats: includeStats === 'true'
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: dishes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: dishes.total || 0,
        totalPages: Math.ceil((dishes.total || 0) / limitNum)
      },
      meta: {
        timeframe,
        minVotes: minVotesNum,
        filters: {
          dishType: dishType || null,
          restaurantId: restaurantId || null,
          countryCode: countryCode || null,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching top dishes:', error);
    
    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch top dishes'
    });
  }
}
