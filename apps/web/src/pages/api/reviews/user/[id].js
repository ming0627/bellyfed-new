/**
 * User Reviews API Route
 * 
 * GET /api/reviews/user/[id]
 * 
 * Retrieves all reviews written by a specific user.
 * Supports filtering, sorting, and pagination.
 * 
 * Features:
 * - User review history
 * - Filtering by rating, restaurant, date range
 * - Sorting by date, rating, helpfulness
 * - Pagination for large review collections
 * - Privacy controls for anonymous reviews
 * - Review statistics and analytics
 */

import { reviewService } from '../../../../services/reviewService.js'

export default async function handler(req, res) {
  const { id } = req.query
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    })
  }

  try {
    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid string'
      })
    }

    // Extract query parameters
    const {
      rating,
      restaurantId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
      includeAnonymous = 'false',
      includeRestaurant = 'true',
      includePhotos = 'true',
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
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 50'
      })
    }

    // Validate rating filter
    let ratingNum
    if (rating) {
      ratingNum = parseInt(rating, 10)
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          error: 'Invalid rating parameter',
          message: 'Rating must be between 1 and 5'
        })
      }
    }

    // Validate date range
    let startDateObj, endDateObj
    if (startDate) {
      startDateObj = new Date(startDate)
      if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({
          error: 'Invalid startDate parameter',
          message: 'startDate must be a valid date'
        })
      }
    }
    
    if (endDate) {
      endDateObj = new Date(endDate)
      if (isNaN(endDateObj.getTime())) {
        return res.status(400).json({
          error: 'Invalid endDate parameter',
          message: 'endDate must be a valid date'
        })
      }
    }
    
    if (startDateObj && endDateObj && startDateObj > endDateObj) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'startDate cannot be after endDate'
      })
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'rating', 'helpfulCount', 'visitDate']
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
      rating: ratingNum,
      restaurantId: restaurantId || undefined,
      dateRange: startDateObj || endDateObj ? {
        start: startDateObj,
        end: endDateObj
      } : undefined,
      includeAnonymous: includeAnonymous === 'true'
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
      restaurant: includeRestaurant === 'true',
      photos: includePhotos === 'true',
      stats: includeStats === 'true'
    }

    // Get user reviews
    const result = await reviewService.getUserReviews(
      id,
      filterOptions,
      sortOptions,
      paginationOptions,
      includeOptions
    )

    if (!result) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      })
    }

    // Transform reviews for API response
    const transformedReviews = result.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      text: review.text,
      visitDate: review.visitDate,
      isAnonymous: review.isAnonymous || false,
      wouldRecommend: review.wouldRecommend || false,
      
      // Restaurant information (if included)
      restaurant: includeRestaurant === 'true' && review.restaurant ? {
        id: review.restaurant.id,
        name: review.restaurant.name,
        slug: review.restaurant.slug,
        cuisine: review.restaurant.cuisine,
        address: review.restaurant.address,
        rating: review.restaurant.rating || 0,
        images: review.restaurant.images || []
      } : null,
      
      // Photos (if included)
      photos: includePhotos === 'true' ? (review.photos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        thumbnail: photo.thumbnail,
        caption: photo.caption
      })) : [],
      
      // Interaction stats (if included)
      stats: includeStats === 'true' ? {
        likes: review.likes || 0,
        helpfulCount: review.helpfulCount || 0,
        views: review.views || 0
      } : null,
      
      // Metadata
      status: review.status || 'published',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }))

    // Calculate user review statistics
    const userStats = includeStats === 'true' ? {
      totalReviews: result.total,
      averageRating: result.averageRating || 0,
      ratingDistribution: result.ratingDistribution || {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      },
      totalLikes: result.totalLikes || 0,
      totalHelpful: result.totalHelpful || 0,
      reviewsThisMonth: result.reviewsThisMonth || 0,
      reviewsThisYear: result.reviewsThisYear || 0,
      topCuisines: result.topCuisines || [],
      recentActivity: result.recentActivity || []
    } : null

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        userId: id,
        reviews: transformedReviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum),
          hasNext: pageNum < Math.ceil(result.total / limitNum),
          hasPrev: pageNum > 1
        },
        filters: {
          rating: filterOptions.rating,
          restaurantId: filterOptions.restaurantId,
          dateRange: filterOptions.dateRange,
          includeAnonymous: filterOptions.includeAnonymous
        },
        sort: sortOptions,
        userStats: userStats
      }
    })

  } catch (error) {
    console.error('Error fetching user reviews:', error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
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
        message: 'Unable to fetch user reviews at this time'
      })
    }

    // Generic server error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching user reviews'
    })
  }
}
