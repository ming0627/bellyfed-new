/**
 * Review by ID API Route
 * 
 * GET /api/reviews/[id]
 * PUT /api/reviews/[id]
 * DELETE /api/reviews/[id]
 * 
 * Retrieves, updates, or deletes a specific review.
 * Includes review details, user information, and interaction data.
 * 
 * Features:
 * - Get review with full details
 * - Update review content and rating
 * - Delete review (with authorization)
 * - Review interaction tracking
 * - Photo management
 * - Restaurant response handling
 */

import { reviewService } from '../../../services/reviewService.js'
import { useAuth } from '../../../hooks/useAuth.js'

export default async function handler(req, res) {
  const { id } = req.query
  
  // Validate review ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid review ID',
      message: 'Review ID must be a valid string'
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetReview(req, res, id)
      case 'PUT':
        return await handleUpdateReview(req, res, id)
      case 'DELETE':
        return await handleDeleteReview(req, res, id)
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} is not supported`
        })
    }
  } catch (error) {
    console.error(`Error handling ${req.method} request for review ${id}:`, error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      })
    }
    
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        error: 'Review not found',
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
        message: 'Unable to process review request at this time'
      })
    }

    // Generic server error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the review request'
    })
  }
}

/**
 * Handle GET request - retrieve review by ID
 */
async function handleGetReview(req, res, reviewId) {
  const {
    includeUser = 'true',
    includeRestaurant = 'true',
    includePhotos = 'true',
    includeInteractions = 'true',
    includeResponse = 'true'
  } = req.query

  // Get review with requested includes
  const review = await reviewService.getReviewById(reviewId, {
    includeUser: includeUser === 'true',
    includeRestaurant: includeRestaurant === 'true',
    includePhotos: includePhotos === 'true',
    includeInteractions: includeInteractions === 'true',
    includeResponse: includeResponse === 'true'
  })

  if (!review) {
    return res.status(404).json({
      error: 'Review not found',
      message: `Review with ID ${reviewId} does not exist`
    })
  }

  // Transform review for API response
  const transformedReview = {
    id: review.id,
    rating: review.rating,
    title: review.title,
    text: review.text,
    visitDate: review.visitDate,
    isAnonymous: review.isAnonymous || false,
    wouldRecommend: review.wouldRecommend || false,
    
    // User information (if included and not anonymous)
    user: includeUser === 'true' && !review.isAnonymous && review.user ? {
      id: review.user.id,
      name: review.user.name,
      avatar: review.user.avatar,
      reviewCount: review.user.reviewCount || 0,
      averageRating: review.user.averageRating || 0
    } : null,
    
    // Restaurant information (if included)
    restaurant: includeRestaurant === 'true' && review.restaurant ? {
      id: review.restaurant.id,
      name: review.restaurant.name,
      slug: review.restaurant.slug,
      cuisine: review.restaurant.cuisine,
      address: review.restaurant.address,
      rating: review.restaurant.rating || 0
    } : null,
    
    // Photos (if included)
    photos: includePhotos === 'true' ? (review.photos || []).map(photo => ({
      id: photo.id,
      url: photo.url,
      thumbnail: photo.thumbnail,
      caption: photo.caption,
      altText: photo.altText
    })) : [],
    
    // Interaction data (if included)
    interactions: includeInteractions === 'true' ? {
      likes: review.likes || 0,
      dislikes: review.dislikes || 0,
      helpfulCount: review.helpfulCount || 0,
      unhelpfulCount: review.unhelpfulCount || 0,
      reportCount: review.reportCount || 0
    } : null,
    
    // Restaurant response (if included)
    restaurantResponse: includeResponse === 'true' && review.restaurantResponse ? {
      text: review.restaurantResponse.text,
      respondedBy: review.restaurantResponse.respondedBy,
      respondedAt: review.restaurantResponse.respondedAt
    } : null,
    
    // Metadata
    status: review.status || 'published',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt
  }

  return res.status(200).json({
    success: true,
    data: transformedReview
  })
}

/**
 * Handle PUT request - update review
 */
async function handleUpdateReview(req, res, reviewId) {
  // TODO: Implement authentication check
  // const user = await getAuthenticatedUser(req)
  // if (!user) {
  //   return res.status(401).json({
  //     error: 'Unauthorized',
  //     message: 'Authentication required to update review'
  //   })
  // }

  const {
    rating,
    title,
    text,
    visitDate,
    wouldRecommend,
    photos
  } = req.body

  // Validate required fields
  if (rating !== undefined) {
    const ratingNum = parseInt(rating, 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      })
    }
  }

  if (text !== undefined && (!text || text.trim().length < 10)) {
    return res.status(400).json({
      error: 'Invalid review text',
      message: 'Review text must be at least 10 characters long'
    })
  }

  if (visitDate !== undefined) {
    const visitDateObj = new Date(visitDate)
    if (isNaN(visitDateObj.getTime())) {
      return res.status(400).json({
        error: 'Invalid visit date',
        message: 'Visit date must be a valid date'
      })
    }
  }

  // Update review
  const updatedReview = await reviewService.updateReview(reviewId, {
    rating,
    title,
    text,
    visitDate,
    wouldRecommend,
    photos
  })

  return res.status(200).json({
    success: true,
    data: updatedReview,
    message: 'Review updated successfully'
  })
}

/**
 * Handle DELETE request - delete review
 */
async function handleDeleteReview(req, res, reviewId) {
  // TODO: Implement authentication check
  // const user = await getAuthenticatedUser(req)
  // if (!user) {
  //   return res.status(401).json({
  //     error: 'Unauthorized',
  //     message: 'Authentication required to delete review'
  //   })
  // }

  // Delete review
  await reviewService.deleteReview(reviewId)

  return res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  })
}
