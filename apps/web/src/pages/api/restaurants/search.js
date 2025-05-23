/**
 * Restaurant Search API Route
 * 
 * Advanced search functionality for restaurants with multiple filters.
 * Supports text search, location-based search, and complex filtering.
 * 
 * Features:
 * - Full-text search across restaurant data
 * - Location-based search with radius
 * - Multiple filter combinations
 * - Autocomplete suggestions
 * - Search analytics tracking
 */

import { restaurantService } from '../../../services/restaurantService.js'
import { analyticsService } from '../../../services/analyticsService.js'

/**
 * Default search settings
 */
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

/**
 * Parse search query parameters
 */
const parseSearchParams = (query) => {
  const {
    q = '',
    limit = DEFAULT_LIMIT.toString(),
    offset = '0',
    cuisine = '',
    location = '',
    minRating = '',
    maxRating = '',
    priceRange = '',
    latitude = '',
    longitude = '',
    radius = '10',
    sortBy = 'relevance',
    includeClosedRestaurants = 'false',
    autocomplete = 'false'
  } = query

  // Parse pagination
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT))
  const offsetNum = Math.max(0, parseInt(offset, 10) || 0)

  // Parse ratings
  const minRatingNum = minRating ? Math.max(0, Math.min(5, parseFloat(minRating))) : undefined
  const maxRatingNum = maxRating ? Math.max(0, Math.min(5, parseFloat(maxRating))) : undefined

  // Parse price range
  const priceRangeNum = priceRange ? Math.max(1, Math.min(4, parseInt(priceRange, 10))) : undefined

  // Parse location
  const lat = latitude ? parseFloat(latitude) : undefined
  const lng = longitude ? parseFloat(longitude) : undefined
  const radiusNum = radius ? Math.max(0.1, Math.min(100, parseFloat(radius))) : 10

  return {
    query: q.trim(),
    limit: limitNum,
    offset: offsetNum,
    cuisine: cuisine.trim(),
    location: location.trim(),
    minRating: minRatingNum,
    maxRating: maxRatingNum,
    priceRange: priceRangeNum,
    latitude: lat,
    longitude: lng,
    radius: radiusNum,
    sortBy,
    includeClosedRestaurants: includeClosedRestaurants === 'true',
    autocomplete: autocomplete === 'true'
  }
}

/**
 * Build search filters
 */
const buildSearchFilters = (params) => {
  const filters = {
    includeClosedRestaurants: params.includeClosedRestaurants
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

  if (params.priceRange !== undefined) {
    filters.priceRange = params.priceRange
  }

  if (params.latitude !== undefined && params.longitude !== undefined) {
    filters.coordinates = {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius
    }
  }

  return filters
}

/**
 * Get autocomplete suggestions
 */
const getAutocompleteSuggestions = async (params) => {
  try {
    if (!params.query || params.query.length < 2) {
      return {
        suggestions: [],
        total: 0
      }
    }

    const suggestions = await restaurantService.getAutocompleteSuggestions({
      query: params.query,
      limit: Math.min(10, params.limit),
      filters: buildSearchFilters(params)
    })

    return suggestions
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error)
    return {
      suggestions: [],
      total: 0
    }
  }
}

/**
 * Perform restaurant search
 */
const searchRestaurants = async (params) => {
  try {
    const filters = buildSearchFilters(params)

    const result = await restaurantService.searchRestaurants({
      query: params.query,
      filters,
      pagination: {
        limit: params.limit,
        offset: params.offset
      },
      sort: {
        field: params.sortBy,
        coordinates: params.latitude && params.longitude ? {
          latitude: params.latitude,
          longitude: params.longitude
        } : undefined
      }
    })

    return result
  } catch (error) {
    console.error('Error searching restaurants:', error)
    throw error
  }
}

/**
 * Track search analytics
 */
const trackSearchAnalytics = async (params, results, req) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown'
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'Unknown'

    await analyticsService.trackSearch({
      query: params.query,
      filters: {
        cuisine: params.cuisine,
        location: params.location,
        minRating: params.minRating,
        maxRating: params.maxRating,
        priceRange: params.priceRange,
        hasLocation: !!(params.latitude && params.longitude)
      },
      results: {
        total: results.total,
        returned: results.restaurants?.length || 0
      },
      metadata: {
        userAgent,
        clientIP: clientIP.split(',')[0].trim(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Error tracking search analytics:', error)
  }
}

/**
 * Main search handler
 */
const handleSearch = async (req, res) => {
  try {
    const params = parseSearchParams(req.query)

    // Handle autocomplete requests
    if (params.autocomplete) {
      const suggestions = await getAutocompleteSuggestions(params)
      return res.status(200).json({
        data: suggestions.suggestions,
        total: suggestions.total,
        autocomplete: true,
        success: true
      })
    }

    // Perform full search
    const result = await searchRestaurants(params)

    // Track search analytics (async, don't wait)
    trackSearchAnalytics(params, result, req).catch(() => {})

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / params.limit)
    const currentPage = Math.floor(params.offset / params.limit) + 1

    return res.status(200).json({
      data: result.restaurants,
      pagination: {
        page: currentPage,
        limit: params.limit,
        offset: params.offset,
        total: result.total,
        totalPages,
        hasNextPage: params.offset + params.limit < result.total,
        hasPrevPage: params.offset > 0
      },
      searchParams: {
        query: params.query,
        cuisine: params.cuisine || undefined,
        location: params.location || undefined,
        minRating: params.minRating,
        maxRating: params.maxRating,
        priceRange: params.priceRange,
        sortBy: params.sortBy,
        radius: params.radius
      },
      success: true
    })

  } catch (error) {
    console.error('Error performing restaurant search:', error)
    return res.status(500).json({
      error: 'Failed to search restaurants',
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
    return await handleSearch(req, res)
  } catch (error) {
    console.error('Restaurant search API error:', error)
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
