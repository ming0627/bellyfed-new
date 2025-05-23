/**
 * API Route: Get Restaurants Serving Dish
 * 
 * This API route retrieves all restaurants that serve a specific dish.
 * It supports location-based filtering and sorting.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { restaurantService } from '../../../../services/restaurantService.js';

/**
 * Handler for restaurants serving dish API endpoint
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
    const { dishId } = req.query;
    const { 
      page = 1, 
      limit = 20,
      latitude,
      longitude,
      radius = 10,
      sortBy = 'distance',
      sortOrder = 'asc',
      countryCode
    } = req.query;

    // Validate dish ID
    if (!dishId || typeof dishId !== 'string') {
      return res.status(400).json({
        error: 'Invalid dish ID',
        message: 'Dish ID is required and must be a string'
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

    // Validate location parameters if provided
    let location = null;
    if (latitude && longitude) {
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

      location = { latitude: lat, longitude: lng, radius: rad };
    }

    // Get restaurants serving the dish
    const restaurants = await restaurantService.getRestaurantsServingDish(dishId, {
      page: pageNum,
      limit: limitNum,
      location,
      sortBy,
      sortOrder,
      countryCode: countryCode || undefined
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: restaurants.total || 0,
        totalPages: Math.ceil((restaurants.total || 0) / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching restaurants serving dish:', error);
    
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
      message: 'Failed to fetch restaurants serving dish'
    });
  }
}
