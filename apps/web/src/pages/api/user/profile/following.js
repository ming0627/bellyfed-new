/**
 * User Following API Route
 * 
 * GET /api/user/profile/following
 * 
 * Retrieves the list of users that the current user is following.
 * Supports pagination and filtering options.
 * 
 * Features:
 * - Paginated following list
 * - Following search and filtering
 * - Mutual connections identification
 * - Privacy controls
 * - Following statistics
 * - Recent activity from followed users
 */

import { userProfileService } from '../../../../services/userProfileService.js'

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    })
  }

  try {
    // TODO: Implement authentication check
    // const user = await getAuthenticatedUser(req)
    // if (!user) {
    //   return res.status(401).json({
    //     error: 'Unauthorized',
    //     message: 'Authentication required to access following list'
    //   })
    // }

    // Mock user ID for now - replace with actual authenticated user ID
    const userId = req.headers['x-user-id'] || 'user_123'

    // Extract query parameters
    const {
      search,
      sortBy = 'followedAt',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
      includeMutual = 'true',
      includeStats = 'true',
      includeActivity = 'true'
    } = req.query

    // Validate pagination parameters
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'Page must be a positive integer'
      })
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 100'
      })
    }

    // Validate sort parameters
    const validSortFields = ['followedAt', 'name', 'username', 'reviewCount', 'lastActiveAt']
    const validSortOrders = ['asc', 'desc']
    
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: 'Invalid sortBy parameter',
        message: `sortBy must be one of: ${validSortFields.join(', ')}`
      })
    }
    
    if (!validSortOrders.includes(sortOrder)) {
      return res.status(400).json({
        error: 'Invalid sortOrder parameter',
        message: `sortOrder must be one of: ${validSortOrders.join(', ')}`
      })
    }

    // Build filter options
    const filterOptions = {
      search: search ? search.trim() : undefined
    }

    // Build sort options
    const sortOptions = {
      field: sortBy,
      order: sortOrder
    }

    // Build pagination options
    const paginationOptions = {
      page: pageNum,
      limit: limitNum
    }

    // Build include options
    const includeOptions = {
      mutual: includeMutual === 'true',
      stats: includeStats === 'true',
      activity: includeActivity === 'true'
    }

    // Get users that current user is following
    const result = await userProfileService.getUserFollowing(
      userId,
      filterOptions,
      sortOptions,
      paginationOptions,
      includeOptions
    )

    if (!result) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile does not exist'
      })
    }

    // Transform following list for API response
    const transformedFollowing = result.following.map(followedUser => ({
      id: followedUser.id,
      username: followedUser.username,
      name: followedUser.name,
      avatar: followedUser.avatar,
      bio: followedUser.bio,
      location: followedUser.location,
      isVerified: followedUser.isVerified || false,
      
      // Follow relationship info
      followedAt: followedUser.followedAt,
      isMutual: followedUser.isMutual || false,
      
      // User stats (if included)
      stats: includeStats === 'true' && followedUser.stats ? {
        reviewCount: followedUser.stats.reviewCount || 0,
        averageRating: followedUser.stats.averageRating || 0,
        followersCount: followedUser.stats.followersCount || 0,
        followingCount: followedUser.stats.followingCount || 0,
        helpfulVotes: followedUser.stats.helpfulVotes || 0
      } : null,
      
      // Recent activity (if included)
      recentActivity: includeActivity === 'true' && followedUser.recentActivity ? 
        followedUser.recentActivity.slice(0, 3).map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          entityId: activity.entityId,
          entityType: activity.entityType,
          createdAt: activity.createdAt
        })) : [],
      
      // Last activity info
      lastActiveAt: followedUser.lastActiveAt,
      lastReview: followedUser.lastReview ? {
        id: followedUser.lastReview.id,
        restaurantName: followedUser.lastReview.restaurantName,
        rating: followedUser.lastReview.rating,
        createdAt: followedUser.lastReview.createdAt
      } : null
    }))

    // Calculate following statistics
    const followingStats = includeStats === 'true' ? {
      totalFollowing: result.total,
      mutualFollowing: result.mutualCount || 0,
      activeThisWeek: result.activeThisWeek || 0,
      topCuisines: result.topCuisines || [],
      averageRating: result.averageRating || 0,
      recentlyJoined: result.recentlyJoined || []
    } : null

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        userId,
        following: transformedFollowing,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum),
          hasNext: pageNum < Math.ceil(result.total / limitNum),
          hasPrev: pageNum > 1
        },
        filters: {
          search: filterOptions.search
        },
        sort: sortOptions,
        stats: followingStats
      }
    })

  } catch (error) {
    console.error('Error fetching user following:', error)
    
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
    
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        error: 'User not found',
        message: error.message
      })
    }
    
    if (error.name === 'DatabaseError') {
      return res.status(503).json({
        error: 'Database error',
        message: 'Unable to fetch following list at this time'
      })
    }

    // Generic server error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching following list'
    })
  }
}
