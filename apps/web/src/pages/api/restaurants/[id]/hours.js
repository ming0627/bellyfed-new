/**
 * API Route: Get Restaurant Hours
 * 
 * This API route retrieves the operating hours for a specific restaurant.
 * It includes regular hours and special holiday hours.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { restaurantService } from '../../../../services/restaurantService.js';

/**
 * Handler for restaurant hours API endpoint
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
    const { id } = req.query;
    const { includeSpecialHours = true } = req.query;

    // Validate restaurant ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid restaurant ID',
        message: 'Restaurant ID is required and must be a string'
      });
    }

    // Get restaurant hours
    const hours = await restaurantService.getRestaurantHours(id, {
      includeSpecialHours: includeSpecialHours === 'true'
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: hours
    });

  } catch (error) {
    console.error('Error fetching restaurant hours:', error);
    
    // Handle specific error types
    if (error.message === 'Restaurant not found') {
      return res.status(404).json({
        error: 'Restaurant not found',
        message: 'The specified restaurant does not exist'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch restaurant hours'
    });
  }
}
