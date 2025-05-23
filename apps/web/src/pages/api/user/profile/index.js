/**
 * User Profile API Route
 * 
 * GET /api/user/profile
 * PUT /api/user/profile
 * 
 * Retrieves or updates the current user's profile information.
 * Handles authentication and profile data management.
 * 
 * Features:
 * - Get current user profile
 * - Update profile information
 * - Profile privacy settings
 * - Activity statistics
 * - Achievement tracking
 * - Social connections
 */

import { userProfileService } from '../../../../services/userProfileService.js'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetProfile(req, res)
      case 'PUT':
        return await handleUpdateProfile(req, res)
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} is not supported`
        })
    }
  } catch (error) {
    console.error(`Error handling ${req.method} request for user profile:`, error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      })
    }
    
    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message
      })
    }
    
    if (error.name === 'ForbiddenError') {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      })
    }
    
    if (error.name === 'DatabaseError') {
      return res.status(503).json({
        error: 'Database error',
        message: 'Unable to process profile request at this time'
      })
    }

    // Generic server error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the profile request'
    })
  }
}

/**
 * Handle GET request - retrieve current user profile
 */
async function handleGetProfile(req, res) {
  // TODO: Implement authentication check
  // const user = await getAuthenticatedUser(req)
  // if (!user) {
  //   return res.status(401).json({
  //     error: 'Unauthorized',
  //     message: 'Authentication required to access profile'
  //   })
  // }

  // Mock user ID for now - replace with actual authenticated user ID
  const userId = req.headers['x-user-id'] || 'user_123'

  const {
    includeStats = 'true',
    includeActivity = 'true',
    includeAchievements = 'true',
    includeConnections = 'false'
  } = req.query

  // Get user profile with requested includes
  const profile = await userProfileService.getUserProfile(userId, {
    includeStats: includeStats === 'true',
    includeActivity: includeActivity === 'true',
    includeAchievements: includeAchievements === 'true',
    includeConnections: includeConnections === 'true'
  })

  if (!profile) {
    return res.status(404).json({
      error: 'Profile not found',
      message: 'User profile does not exist'
    })
  }

  // Transform profile for API response
  const transformedProfile = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar,
    location: profile.location,
    website: profile.website,
    dateOfBirth: profile.dateOfBirth,
    
    // Privacy settings
    privacy: {
      profileVisibility: profile.profileVisibility || 'public',
      showEmail: profile.showEmail || false,
      showLocation: profile.showLocation || true,
      showActivity: profile.showActivity || true,
      allowMessages: profile.allowMessages || true
    },
    
    // Preferences
    preferences: {
      language: profile.language || 'en',
      timezone: profile.timezone || 'Asia/Kuala_Lumpur',
      currency: profile.currency || 'MYR',
      notifications: profile.notifications || {
        email: true,
        push: true,
        reviews: true,
        followers: true,
        recommendations: true
      },
      dietary: profile.dietary || [],
      cuisinePreferences: profile.cuisinePreferences || []
    },
    
    // Statistics (if included)
    stats: includeStats === 'true' && profile.stats ? {
      reviewCount: profile.stats.reviewCount || 0,
      averageRating: profile.stats.averageRating || 0,
      helpfulVotes: profile.stats.helpfulVotes || 0,
      followersCount: profile.stats.followersCount || 0,
      followingCount: profile.stats.followingCount || 0,
      favoritesCount: profile.stats.favoritesCount || 0,
      photosCount: profile.stats.photosCount || 0,
      checkinsCount: profile.stats.checkinsCount || 0,
      joinedDate: profile.stats.joinedDate || profile.createdAt
    } : null,
    
    // Recent activity (if included)
    recentActivity: includeActivity === 'true' && profile.recentActivity ? 
      profile.recentActivity.slice(0, 10).map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        entityId: activity.entityId,
        entityType: activity.entityType,
        createdAt: activity.createdAt
      })) : [],
    
    // Achievements (if included)
    achievements: includeAchievements === 'true' && profile.achievements ?
      profile.achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        earnedAt: achievement.earnedAt,
        progress: achievement.progress || null
      })) : [],
    
    // Social connections (if included)
    connections: includeConnections === 'true' && profile.connections ? {
      followers: profile.connections.followers || [],
      following: profile.connections.following || [],
      mutualConnections: profile.connections.mutualConnections || []
    } : null,
    
    // Metadata
    isVerified: profile.isVerified || false,
    isPremium: profile.isPremium || false,
    status: profile.status || 'active',
    lastActiveAt: profile.lastActiveAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  }

  return res.status(200).json({
    success: true,
    data: transformedProfile
  })
}

/**
 * Handle PUT request - update user profile
 */
async function handleUpdateProfile(req, res) {
  // TODO: Implement authentication check
  // const user = await getAuthenticatedUser(req)
  // if (!user) {
  //   return res.status(401).json({
  //     error: 'Unauthorized',
  //     message: 'Authentication required to update profile'
  //   })
  // }

  // Mock user ID for now - replace with actual authenticated user ID
  const userId = req.headers['x-user-id'] || 'user_123'

  const {
    name,
    bio,
    avatar,
    location,
    website,
    dateOfBirth,
    privacy,
    preferences
  } = req.body

  // Validate input data
  if (name !== undefined && (!name || name.trim().length < 2)) {
    return res.status(400).json({
      error: 'Invalid name',
      message: 'Name must be at least 2 characters long'
    })
  }

  if (bio !== undefined && bio.length > 500) {
    return res.status(400).json({
      error: 'Invalid bio',
      message: 'Bio must be 500 characters or less'
    })
  }

  if (website !== undefined && website && !isValidUrl(website)) {
    return res.status(400).json({
      error: 'Invalid website',
      message: 'Website must be a valid URL'
    })
  }

  if (dateOfBirth !== undefined && dateOfBirth) {
    const dobDate = new Date(dateOfBirth)
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date of birth',
        message: 'Date of birth must be a valid date'
      })
    }
    
    // Check if user is at least 13 years old
    const minAge = new Date()
    minAge.setFullYear(minAge.getFullYear() - 13)
    if (dobDate > minAge) {
      return res.status(400).json({
        error: 'Invalid date of birth',
        message: 'You must be at least 13 years old'
      })
    }
  }

  // Update user profile
  const updatedProfile = await userProfileService.updateUserProfile(userId, {
    name,
    bio,
    avatar,
    location,
    website,
    dateOfBirth,
    privacy,
    preferences
  })

  return res.status(200).json({
    success: true,
    data: updatedProfile,
    message: 'Profile updated successfully'
  })
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}
