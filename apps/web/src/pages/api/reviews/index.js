/**
 * Reviews Index API Route
 *
 * Handles listing and creating reviews.
 * Supports GET for listing reviews and POST for creating new reviews.
 *
 * Features:
 * - List reviews with pagination and filtering
 * - Create new reviews (authenticated users)
 * - Filter by restaurant, user, rating
 * - Sort by various criteria
 * - Review moderation support
 */

import { reviewService } from '@bellyfed/services'
import { withApiAuthRequired, isAuthenticated, getUserId } from '@bellyfed/utils'

/**
 * Default pagination settings
 */
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Parse query parameters for listing reviews
 */
const parseListParams = (query) => {
  const {
    page = '1',
    limit = DEFAULT_LIMIT.toString(),
    restaurantId = '',
    userId = '',
    minRating = '',
    maxRating = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    status = 'published'
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
    restaurantId: restaurantId.trim(),
    userId: userId.trim(),
    minRating: minRatingNum,
    maxRating: maxRatingNum,
    sortBy,
    sortDirection,
    status
  }
}

/**
 * Build filters for review queries
 */
const buildReviewFilters = (params) => {
  const filters = {
    status: params.status
  }

  if (params.restaurantId) {
    filters.restaurantId = params.restaurantId
  }

  if (params.userId) {
    filters.userId = params.userId
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
 * Get reviews list
 */
const getReviews = async (req, res) => {
  try {
    const params = parseListParams(req.query)
    const filters = buildReviewFilters(params)

    const result = await reviewService.getReviews({
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
      data: result.reviews,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        restaurantId: params.restaurantId || undefined,
        userId: params.userId || undefined,
        minRating: params.minRating,
        maxRating: params.maxRating,
        status: params.status,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return res.status(500).json({
      error: 'Failed to fetch reviews',
      message: error.message
    })
  }
}

/**
 * Create new review
 */
const createReview = async (req, res) => {
  try {
    const { user } = req
    const reviewData = req.body

    // Validate required fields
    const requiredFields = ['restaurantId', 'rating', 'content']
    const missingFields = requiredFields.filter(field => !reviewData[field])

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      })
    }

    // Validate rating
    const rating = parseFloat(reviewData.rating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be a number between 1 and 5'
      })
    }

    // Validate content length
    if (reviewData.content.trim().length < 10) {
      return res.status(400).json({
        error: 'Review content must be at least 10 characters long'
      })
    }

    if (reviewData.content.length > 2000) {
      return res.status(400).json({
        error: 'Review content must be less than 2000 characters'
      })
    }

    // Add user ID and default status
    const completeReviewData = {
      ...reviewData,
      userId: user.id,
      rating,
      content: reviewData.content.trim(),
      status: 'published' // Auto-publish for now, can add moderation later
    }

    // Check if user already reviewed this restaurant
    const existingReview = await reviewService.getUserReviewForRestaurant({
      userId: user.id,
      restaurantId: reviewData.restaurantId
    })

    if (existingReview) {
      return res.status(409).json({
        error: 'You have already reviewed this restaurant',
        existingReview
      })
    }

    // Create the review
    const newReview = await reviewService.createReview(completeReviewData)

    return res.status(201).json({
      data: newReview,
      success: true,
      message: 'Review created successfully'
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return res.status(500).json({
      error: 'Failed to create review',
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
        return await getReviews(req, res)

      case 'POST':
        // Check authentication for POST requests
        if (!isAuthenticated(req)) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required to create reviews'
          })
        }

        // Add user info to request
        const userId = getUserId(req)
        req.user = { id: userId }

        return await createReview(req, res)

      default:
        return res.status(405).json({
          error: 'Method not allowed',
          allowedMethods: ['GET', 'POST']
        })
    }
  } catch (error) {
    console.error('Reviews API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

// Export the handler directly (no auth middleware wrapper needed)
export default handler

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
