/**
 * API Route: Get User by ID
 * 
 * This API route retrieves user information from the PostgreSQL database.
 * It supports different levels of detail and privacy controls.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { postgresService } from '../../../../services/postgresService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for user by ID API endpoint
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
      includeStats = true,
      includeActivity = false,
      includePrivateInfo = false
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

    // Determine what information to include based on privacy and authentication
    const includePrivate = includePrivateInfo === 'true' && isOwnProfile;
    const includeActivityData = includeActivity === 'true' && (isOwnProfile || isAuthenticated);

    // Get user information
    const user = await postgresService.getUserById(id, {
      includeStats: includeStats === 'true',
      includeActivity: includeActivityData,
      includePrivateInfo: includePrivate
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Filter out sensitive information for non-owners
    const responseData = {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      bio: user.bio,
      location: user.location,
      countryCode: user.countryCode,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      
      // Include stats if requested
      ...(includeStats === 'true' && {
        stats: {
          totalVotes: user.totalVotes || 0,
          totalRankings: user.totalRankings || 0,
          totalReviews: user.totalReviews || 0,
          averageRating: user.averageRating || 0,
          followers: user.followers || 0,
          following: user.following || 0
        }
      }),
      
      // Include activity if requested and authorized
      ...(includeActivityData && {
        activity: {
          lastActive: user.lastActive,
          recentVotes: user.recentVotes || [],
          recentRankings: user.recentRankings || [],
          recentReviews: user.recentReviews || []
        }
      }),
      
      // Include private info only for own profile
      ...(includePrivate && {
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
        privacy: user.privacy
      })
    };

    // Return success response
    res.status(200).json({
      success: true,
      data: responseData,
      meta: {
        isOwnProfile,
        includeStats: includeStats === 'true',
        includeActivity: includeActivityData,
        includePrivateInfo: includePrivate
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    
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
      message: 'Failed to fetch user information'
    });
  }
}
