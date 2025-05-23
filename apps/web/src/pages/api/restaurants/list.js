/**
 * Restaurant List API Route
 * 
 * Handles listing restaurants with pagination, filtering, and sorting.
 * Supports various query parameters for customized results.
 * 
 * Features:
 * - Paginated restaurant listing
 * - Filtering by cuisine, location, price range
 * - Sorting by rating, distance, name
 * - Search functionality
 * - Caching support
 */

import { restaurantService } from '../../../services/restaurantService.js'

/**
 * Default pagination settings
 */
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Valid sort options
 */
const VALID_SORT_OPTIONS = [
  'name', 'rating', 'distance', 'priceRange', 'createdAt', 'updatedAt'
]

/**
 * Valid sort directions
 */
const VALID_SORT_DIRECTIONS = ['asc', 'desc']

/**
 * Parse and validate query parameters
 */
const parseQueryParams = (query) => {
  const {
    page = '1',
    limit = DEFAULT_LIMIT.toString(),
    search = '',
    cuisine = '',
    location = '',
    minRating = '',
    maxRating = '',
    minPrice = '',
    maxPrice = '',
    sortBy = 'name',
    sortDirection = 'asc',
    latitude = '',
    longitude = '',
    radius = ''
  } = query

  // Parse pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT))
  const offset = (pageNum - 1) * limitNum

  // Parse ratings
  const minRatingNum = minRating ? parseFloat(minRating) : undefined
  const maxRatingNum = maxRating ? parseFloat(maxRating) : undefined

  // Parse price range
  const minPriceNum = minPrice ? parseInt(minPrice, 10) : undefined
  const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : undefined

  // Parse location
  const lat = latitude ? parseFloat(latitude) : undefined
  const lng = longitude ? parseFloat(longitude) : undefined
  const radiusNum = radius ? parseFloat(radius) : undefined

  // Validate sort parameters
  const validSortBy = VALID_SORT_OPTIONS.includes(sortBy) ? sortBy : 'name'
  const validSortDirection = VALID_SORT_DIRECTIONS.includes(sortDirection) ? sortDirection : 'asc'

  return {
    page: pageNum,
    limit: limitNum,
    offset,
    search: search.trim(),
    cuisine: cuisine.trim(),
    location: location.trim(),
    minRating: minRatingNum,
    maxRating: maxRatingNum,
    minPrice: minPriceNum,
    maxPrice: maxPriceNum,
    sortBy: validSortBy,
    sortDirection: validSortDirection,
    latitude: lat,
    longitude: lng,
    radius: radiusNum
  }
}

/**
 * Build filters object
 */
const buildFilters = (params) => {
  const filters = {}

  if (params.search) {
    filters.search = params.search
  }

  if (params.cuisine) {
    filters.cuisine = params.cuisine
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

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filters.priceRange = {}
    if (params.minPrice !== undefined) {
      filters.priceRange.gte = params.minPrice
    }
    if (params.maxPrice !== undefined) {
      filters.priceRange.lte = params.maxPrice
    }
  }

  if (params.latitude !== undefined && params.longitude !== undefined) {
    filters.location = {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius || 10 // Default 10km radius
    }
  }

  return filters
}

/**
 * Get restaurants list
 */
const getRestaurantsList = async (req, res) => {
  try {
    const params = parseQueryParams(req.query)
    const filters = buildFilters(params)

    // Get restaurants with filters and pagination
    const result = await restaurantService.getRestaurants({
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
      data: result.restaurants,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search: params.search || undefined,
        cuisine: params.cuisine || undefined,
        location: params.location || undefined,
        minRating: params.minRating,
        maxRating: params.maxRating,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching restaurants list:', error)
    return res.status(500).json({
      error: 'Failed to fetch restaurants',
      message: error.message
    })
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['GET']
    })
  }
  
  try {
    return await getRestaurantsList(req, res)
  } catch (error) {
    console.error('Restaurant list API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

/**
 * API route configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
