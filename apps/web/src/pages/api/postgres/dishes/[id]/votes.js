/**
 * API Route: Get Dish Votes
 * 
 * This API route retrieves all votes for a specific dish.
 * It supports pagination and filtering by vote type.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { postgresService } from '../../../../../services/postgresService.js';

/**
 * Handler for dish votes API endpoint
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
      voteType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeUser = false
    } = req.query;

    // Validate dish ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish ID',
        message: 'Dish ID is required and must be a string'
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

    // Validate vote type if provided
    if (voteType && !['like', 'dislike', 'rating'].includes(voteType)) {
      return res.status(400).json({
        error: 'Invalid vote type',
        message: 'Vote type must be one of: like, dislike, rating'
      });
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'rating', 'userName'];
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

    // Get dish votes
    const votes = await postgresService.getDishVotes(id, {
      page: pageNum,
      limit: limitNum,
      voteType: voteType || undefined,
      sortBy,
      sortOrder,
      includeUser: includeUser === 'true'
    });

    // Calculate vote statistics
    const voteStats = await postgresService.getDishVoteStats(id);

    // Return success response
    res.status(200).json({
      success: true,
      data: votes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: votes.total || 0,
        totalPages: Math.ceil((votes.total || 0) / limitNum)
      },
      meta: {
        dishId: id,
        voteStats: {
          totalVotes: voteStats.totalVotes || 0,
          likes: voteStats.likes || 0,
          dislikes: voteStats.dislikes || 0,
          ratings: voteStats.ratings || 0,
          averageRating: voteStats.averageRating || 0
        },
        filters: {
          voteType: voteType || null,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dish votes:', error);
    
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
      message: 'Failed to fetch dish votes'
    });
  }
}
