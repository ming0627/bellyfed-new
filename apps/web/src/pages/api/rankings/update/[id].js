/**
 * API Route: Update Ranking
 * 
 * This API route updates an existing dish ranking.
 * It requires authentication and ownership validation.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rankingService } from '../../../../services/rankingService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for update ranking API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only PUT requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to update rankings'
      });
    }

    const { id } = req.query;
    const {
      rating,
      review,
      photoUrls,
      tasteStatus,
      notes
    } = req.body;

    // Validate ranking ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid ranking ID',
        message: 'Ranking ID is required and must be a string'
      });
    }

    // Validate at least one field is provided for update
    if (!rating && !review && !photoUrls && !tasteStatus && !notes) {
      return res.status(400).json({
        error: 'No update data provided',
        message: 'At least one field must be provided for update'
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 10)) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be a number between 1 and 10'
      });
    }

    // Validate review if provided
    if (review !== undefined && review !== null && (typeof review !== 'string' || review.length > 1000)) {
      return res.status(400).json({
        error: 'Invalid review',
        message: 'Review must be a string with maximum 1000 characters'
      });
    }

    // Validate photo URLs if provided
    if (photoUrls !== undefined && (!Array.isArray(photoUrls) || photoUrls.length > 10)) {
      return res.status(400).json({
        error: 'Invalid photo URLs',
        message: 'Photo URLs must be an array with maximum 10 items'
      });
    }

    // Validate taste status if provided
    if (tasteStatus !== undefined && !['loved', 'liked', 'neutral', 'disliked'].includes(tasteStatus)) {
      return res.status(400).json({
        error: 'Invalid taste status',
        message: 'Taste status must be one of: loved, liked, neutral, disliked'
      });
    }

    // Validate notes if provided
    if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 500)) {
      return res.status(400).json({
        error: 'Invalid notes',
        message: 'Notes must be a string with maximum 500 characters'
      });
    }

    // Prepare update data
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;
    if (photoUrls !== undefined) updateData.photoUrls = photoUrls;
    if (tasteStatus !== undefined) updateData.tasteStatus = tasteStatus;
    if (notes !== undefined) updateData.notes = notes;

    // Update the ranking
    const ranking = await rankingService.updateRanking(id, session.user.id, updateData);

    // Return success response
    res.status(200).json({
      success: true,
      data: ranking,
      message: 'Ranking updated successfully'
    });

  } catch (error) {
    console.error('Error updating ranking:', error);
    
    // Handle specific error types
    if (error.message === 'Ranking not found') {
      return res.status(404).json({
        error: 'Ranking not found',
        message: 'The specified ranking does not exist'
      });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own rankings'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update ranking'
    });
  }
}
