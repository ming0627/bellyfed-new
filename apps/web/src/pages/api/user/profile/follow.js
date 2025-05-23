/**
 * API Route: Follow/Unfollow User
 * 
 * This API route handles following and unfollowing users.
 * It requires authentication and prevents self-following.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { userProfileService } from '../../../../services/userProfileService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for follow/unfollow user API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handleFollowUser(req, res);
    case 'DELETE':
      return handleUnfollowUser(req, res);
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST and DELETE requests are supported'
      });
  }
}

/**
 * Handle POST request to follow a user
 */
async function handleFollowUser(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to follow users'
      });
    }

    const { userId } = req.body;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Prevent self-following
    if (userId === session.user.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot follow yourself'
      });
    }

    // Follow the user
    const result = await userProfileService.followUser(session.user.id, userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
      message: 'User followed successfully'
    });

  } catch (error) {
    console.error('Error following user:', error);
    
    // Handle specific error types
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The user you are trying to follow does not exist'
      });
    }

    if (error.message === 'Already following') {
      return res.status(409).json({
        error: 'Already following',
        message: 'You are already following this user'
      });
    }

    if (error.message === 'User blocked') {
      return res.status(403).json({
        error: 'User blocked',
        message: 'You cannot follow this user'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to follow user'
    });
  }
}

/**
 * Handle DELETE request to unfollow a user
 */
async function handleUnfollowUser(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to unfollow users'
      });
    }

    const { userId } = req.body;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Prevent self-unfollowing
    if (userId === session.user.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot unfollow yourself'
      });
    }

    // Unfollow the user
    const result = await userProfileService.unfollowUser(session.user.id, userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    
    // Handle specific error types
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The user you are trying to unfollow does not exist'
      });
    }

    if (error.message === 'Not following') {
      return res.status(409).json({
        error: 'Not following',
        message: 'You are not following this user'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to unfollow user'
    });
  }
}
