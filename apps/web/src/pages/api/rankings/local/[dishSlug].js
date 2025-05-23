/**
 * API Route: Get Local Dish Rankings
 * 
 * This API route retrieves local rankings for a specific dish within a geographic area.
 * It supports location-based filtering and pagination.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rankingService } from '../../../../services/rankingService.js';

/**
 * Handler for local dish rankings API endpoint
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
    const { dishSlug } = req.query;
    const { 
      page = 1, 
      limit = 20,
      latitude,
      longitude,
      radius = 10,
      sortBy = 'rating',
      sortOrder = 'desc',
      minRating,
      includeReviews = true,
      includePhotos = false
    } = req.query;

    // Validate dish slug
    if (!dishSlug || typeof dishSlug !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish slug',
        message: 'Dish slug is required and must be a string'
      });
    }

    // Validate location parameters (required for local rankings)
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Latitude and longitude are required for local rankings'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid location parameters',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    if (isNaN(rad) || rad < 0 || rad > 100) {
      return res.status(400).json({
        error: 'Invalid radius parameter',
        message: 'Radius must be between 0 and 100 km'
      });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'Page must be a positive integer'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 100'
      });
    }

    // Validate minimum rating if provided
    let minRatingNum = null;
    if (minRating) {
      minRatingNum = parseFloat(minRating);
      if (isNaN(minRatingNum) || minRatingNum < 1 || minRatingNum > 10) {
        return res.status(400).json({
          error: 'Invalid minimum rating',
          message: 'Minimum rating must be a number between 1 and 10'
        });
      }
    }

    // Get local dish rankings
    const rankings = await rankingService.getLocalDishRankings(dishSlug, {
      page: pageNum,
      limit: limitNum,
      location: { latitude: lat, longitude: lng, radius: rad },
      sortBy,
      sortOrder,
      minRating: minRatingNum,
      includeReviews: includeReviews === 'true',
      includePhotos: includePhotos === 'true'
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: rankings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: rankings.total || 0,
        totalPages: Math.ceil((rankings.total || 0) / limitNum)
      },
      meta: {
        dishSlug,
        location: { latitude: lat, longitude: lng, radius: rad },
        averageRating: rankings.averageRating || 0,
        totalRankings: rankings.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching local dish rankings:', error);
    
    // Handle specific error types
    if (error.message === 'Dish not found') {
      return res.status(404).json({
        error: 'Dish not found',
        message: 'The specified dish does not exist'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch local dish rankings'
    });
  }
}
