/**
 * Rankings Index API Route
 * 
 * Handles listing and creating rankings.
 * Supports GET for listing rankings and POST for creating new rankings.
 * 
 * Features:
 * - List rankings with pagination and filtering
 * - Create new rankings (authenticated users)
 * - Filter by dish, restaurant, user, location
 * - Sort by various criteria
 * - Analytics tracking
 */

import { rankingService } from '../../../services/rankingService.js'
import { withApiAuthRequired } from '../../../utils/auth.js'

/**
 * Default pagination settings
 */
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Parse query parameters for listing rankings
 */
const parseListParams = (query) => {
  const {
    page = '1',
    limit = DEFAULT_LIMIT.toString(),
    dishId = '',
    restaurantId = '',
    userId = '',
    location = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    minRating = '',
    maxRating = ''
  } = query

  // Parse pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT))
  const offset = (pageNum - 1) * limitNum

  // Parse ratings
  const minRatingNum = minRating ? Math.max(1, Math.min(5, parseFloat(minRating))) : undefined
  const maxRatingNum = maxRating ? Math.max(1, Math.min(5, parseFloat(maxRating))) : undefined

  return {
    page: pageNum,
    limit: limitNum,
    offset,
    dishId: dishId.trim(),
    restaurantId: restaurantId.trim(),
    userId: userId.trim(),
    location: location.trim(),
    sortBy,
    sortDirection,
    minRating: minRatingNum,
    maxRating: maxRatingNum
  }
}

/**
 * Build filters for ranking queries
 */
const buildRankingFilters = (params) => {
  const filters = {}

  if (params.dishId) {
    filters.dishId = params.dishId
  }

  if (params.restaurantId) {
    filters.restaurantId = params.restaurantId
  }

  if (params.userId) {
    filters.userId = params.userId
  }

  if (params.location) {
    filters.location = params.location
  }

  if (params.minRating !== undefined || params.maxRating !== undefined) {
    filters.rating = {}
    if (params.minRating !== undefined) {
      filters.rating.gte = params.minRating
    }
    if (params.maxRating !== undefined) {
      filters.rating.lte = params.maxRating
    }
  }

  return filters
}

/**
 * Get rankings list
 */
const getRankings = async (req, res) => {
  try {
    const params = parseListParams(req.query)
    const filters = buildRankingFilters(params)

    const result = await rankingService.getRankings({
      filters,
      pagination: {
        limit: params.limit,
        offset: params.offset
      },
      sort: {
        field: params.sortBy,
        direction: params.sortDirection
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / params.limit)
    const hasNextPage = params.page < totalPages
    const hasPrevPage = params.page > 1

    return res.status(200).json({
      data: result.rankings,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        dishId: params.dishId || undefined,
        restaurantId: params.restaurantId || undefined,
        userId: params.userId || undefined,
        location: params.location || undefined,
        minRating: params.minRating,
        maxRating: params.maxRating,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching rankings:', error)
    return res.status(500).json({
      error: 'Failed to fetch rankings',
      message: error.message
    })
  }
}

/**
 * Create new ranking
 */
const createRanking = async (req, res) => {
  try {
    const { user } = req
    const rankingData = req.body

    // Validate required fields
    const requiredFields = ['dishId', 'restaurantId', 'rating']
    const missingFields = requiredFields.filter(field => !rankingData[field])

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      })
    }

    // Validate rating
    const rating = parseFloat(rankingData.rating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be a number between 1 and 5'
      })
    }

    // Add user ID to ranking data
    const completeRankingData = {
      ...rankingData,
      userId: user.id,
      rating
    }

    // Check if user already ranked this dish at this restaurant
    const existingRanking = await rankingService.getUserRankingForDish({
      userId: user.id,
      dishId: rankingData.dishId,
      restaurantId: rankingData.restaurantId
    })

    if (existingRanking) {
      return res.status(409).json({
        error: 'You have already ranked this dish at this restaurant',
        existingRanking
      })
    }

    // Create the ranking
    const newRanking = await rankingService.createRanking(completeRankingData)

    return res.status(201).json({
      data: newRanking,
      success: true,
      message: 'Ranking created successfully'
    })

  } catch (error) {
    console.error('Error creating ranking:', error)
    return res.status(500).json({
      error: 'Failed to create ranking',
      message: error.message
    })
  }
}

/**
 * Main handler
 */
const handler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await getRankings(req, res)
        
      case 'POST':
        return await createRanking(req, res)
        
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          allowedMethods: ['GET', 'POST']
        })
    }
  } catch (error) {
    console.error('Rankings API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

// Apply authentication middleware for POST operations
export default withApiAuthRequired(handler, {
  requireAuth: ['POST']
})

/**
 * API route configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
