/**
 * API Route: Vote on Dish
 * 
 * This API route handles voting on dishes (like/dislike).
 * It requires authentication and prevents duplicate voting.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { postgresService } from '../../../../../services/postgresService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for dish voting API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handleVoteOnDish(req, res);
    case 'DELETE':
      return handleRemoveVote(req, res);
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST and DELETE requests are supported'
      });
  }
}

/**
 * Handle POST request to vote on a dish
 */
async function handleVoteOnDish(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to vote on dishes'
      });
    }

    const { id } = req.query;
    const { voteType, rating } = req.body;

    // Validate dish ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish ID',
        message: 'Dish ID is required and must be a string'
      });
    }

    // Validate vote type
    if (!voteType || !['like', 'dislike', 'rating'].includes(voteType)) {
      return res.status(400).json({
        error: 'Invalid vote type',
        message: 'Vote type must be one of: like, dislike, rating'
      });
    }

    // Validate rating if vote type is rating
    if (voteType === 'rating') {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Invalid rating',
          message: 'Rating must be a number between 1 and 5'
        });
      }
    }

    // Cast vote on dish
    const vote = await postgresService.voteOnDish({
      dishId: id,
      userId: session.user.id,
      voteType,
      rating: voteType === 'rating' ? rating : null
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: vote,
      message: 'Vote cast successfully'
    });

  } catch (error) {
    console.error('Error voting on dish:', error);
    
    // Handle specific error types
    if (error.message === 'Dish not found') {
      return res.status(404).json({
        error: 'Dish not found',
        message: 'The specified dish does not exist'
      });
    }

    if (error.message === 'Vote already exists') {
      return res.status(409).json({
        error: 'Vote already exists',
        message: 'You have already voted on this dish'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to vote on dish'
    });
  }
}

/**
 * Handle DELETE request to remove a vote
 */
async function handleRemoveVote(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to remove votes'
      });
    }

    const { id } = req.query;

    // Validate dish ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish ID',
        message: 'Dish ID is required and must be a string'
      });
    }

    // Remove vote from dish
    await postgresService.removeVoteFromDish({
      dishId: id,
      userId: session.user.id
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Vote removed successfully'
    });

  } catch (error) {
    console.error('Error removing vote from dish:', error);
    
    // Handle specific error types
    if (error.message === 'Dish not found') {
      return res.status(404).json({
        error: 'Dish not found',
        message: 'The specified dish does not exist'
      });
    }

    if (error.message === 'Vote not found') {
      return res.status(404).json({
        error: 'Vote not found',
        message: 'You have not voted on this dish'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove vote from dish'
    });
  }
}
