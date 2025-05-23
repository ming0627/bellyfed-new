/**
 * User Followers API Route
 * 
 * GET /api/user/profile/followers
 * 
 * Retrieves the list of users following the current user.
 * Supports pagination and filtering options.
 * 
 * Features:
 * - Paginated followers list
 * - Follower search and filtering
 * - Mutual connections identification
 * - Privacy controls
 * - Follower statistics
 * - Recent follower activity
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
    //     message: 'Authentication required to access followers'
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
      includeStats = 'true'
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
    const validSortFields = ['followedAt', 'name', 'username', 'reviewCount']
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
      stats: includeStats === 'true'
    }

    // Get user followers
    const result = await userProfileService.getUserFollowers(
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

    // Transform followers for API response
    const transformedFollowers = result.followers.map(follower => ({
      id: follower.id,
      username: follower.username,
      name: follower.name,
      avatar: follower.avatar,
      bio: follower.bio,
      location: follower.location,
      isVerified: follower.isVerified || false,
      
      // Follow relationship info
      followedAt: follower.followedAt,
      isMutual: follower.isMutual || false,
      
      // User stats (if included)
      stats: includeStats === 'true' && follower.stats ? {
        reviewCount: follower.stats.reviewCount || 0,
        averageRating: follower.stats.averageRating || 0,
        followersCount: follower.stats.followersCount || 0,
        followingCount: follower.stats.followingCount || 0
      } : null,
      
      // Recent activity preview
      lastActiveAt: follower.lastActiveAt,
      recentReview: follower.recentReview ? {
        id: follower.recentReview.id,
        restaurantName: follower.recentReview.restaurantName,
        rating: follower.recentReview.rating,
        createdAt: follower.recentReview.createdAt
      } : null
    }))

    // Calculate follower statistics
    const followerStats = includeStats === 'true' ? {
      totalFollowers: result.total,
      mutualFollowers: result.mutualCount || 0,
      recentFollowers: result.recentCount || 0,
      topLocations: result.topLocations || [],
      followerGrowth: result.followerGrowth || {
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0
      }
    } : null

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        userId,
        followers: transformedFollowers,
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
        stats: followerStats
      }
    })

  } catch (error) {
    console.error('Error fetching user followers:', error)
    
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
        message: 'Unable to fetch followers at this time'
      })
    }

    // Generic server error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching followers'
    })
  }
}
