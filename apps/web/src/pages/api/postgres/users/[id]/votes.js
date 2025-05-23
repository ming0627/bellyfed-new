/**
 * API Route: Get User Votes
 * 
 * This API route retrieves all votes cast by a specific user.
 * It supports pagination and filtering options.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { postgresService } from '../../../../../services/postgresService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for user votes API endpoint
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
      dishType,
      restaurantId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDish = true,
      includeRestaurant = false
    } = req.query;

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Get current user session for privacy checks
    const session = await getServerSession(req, res);
    const isOwnProfile = session?.user?.id === id;
    const isAuthenticated = !!session?.user;

    // Check if user can view votes (own profile or public votes)
    if (!isOwnProfile && !isAuthenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view user votes'
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
    const validSortFields = ['createdAt', 'rating', 'dishName', 'restaurantName'];
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

    // Get user votes
    const votes = await postgresService.getUserVotes(id, {
      page: pageNum,
      limit: limitNum,
      voteType: voteType || undefined,
      dishType: dishType || undefined,
      restaurantId: restaurantId || undefined,
      sortBy,
      sortOrder,
      includeDish: includeDish === 'true',
      includeRestaurant: includeRestaurant === 'true',
      publicOnly: !isOwnProfile // Only show public votes for other users
    });

    // Get vote statistics
    const voteStats = await postgresService.getUserVoteStats(id);

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
        userId: id,
        isOwnProfile,
        voteStats: {
          totalVotes: voteStats.totalVotes || 0,
          likes: voteStats.likes || 0,
          dislikes: voteStats.dislikes || 0,
          ratings: voteStats.ratings || 0,
          averageRating: voteStats.averageRating || 0
        },
        filters: {
          voteType: voteType || null,
          dishType: dishType || null,
          restaurantId: restaurantId || null,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user votes:', error);
    
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
      message: 'Failed to fetch user votes'
    });
  }
}
