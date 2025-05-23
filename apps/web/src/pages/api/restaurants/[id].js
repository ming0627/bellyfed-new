/**
 * Restaurant by ID API Route
 * 
 * Handles CRUD operations for individual restaurants.
 * Supports GET, PUT, and DELETE operations.
 * 
 * Features:
 * - Get restaurant details by ID
 * - Update restaurant information
 * - Delete restaurant (admin only)
 * - Error handling and validation
 * - Authentication checks
 */

import { restaurantService } from '../../../services/restaurantService.js'
import { withApiAuthRequired } from '../../../utils/auth.js'

/**
 * Get restaurant by ID
 */
const getRestaurant = async (req, res) => {
  try {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({
        error: 'Restaurant ID is required'
      })
    }
    
    const restaurant = await restaurantService.getRestaurantById(id)
    
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found'
      })
    }
    
    return res.status(200).json({
      data: restaurant,
      success: true
    })
    
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return res.status(500).json({
      error: 'Failed to fetch restaurant',
      message: error.message
    })
  }
}

/**
 * Update restaurant
 */
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.query
    const updateData = req.body
    
    if (!id) {
      return res.status(400).json({
        error: 'Restaurant ID is required'
      })
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Update data is required'
      })
    }
    
    // Validate required fields if provided
    const validFields = [
      'name', 'description', 'address', 'phone', 'email', 'website',
      'cuisine', 'priceRange', 'hours', 'location', 'images'
    ]
    
    const invalidFields = Object.keys(updateData).filter(
      field => !validFields.includes(field)
    )
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid fields provided',
        invalidFields
      })
    }
    
    // Check if restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(id)
    if (!existingRestaurant) {
      return res.status(404).json({
        error: 'Restaurant not found'
      })
    }
    
    // Update restaurant
    const updatedRestaurant = await restaurantService.updateRestaurant(id, updateData)
    
    return res.status(200).json({
      data: updatedRestaurant,
      success: true,
      message: 'Restaurant updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return res.status(500).json({
      error: 'Failed to update restaurant',
      message: error.message
    })
  }
}

/**
 * Delete restaurant (admin only)
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({
        error: 'Restaurant ID is required'
      })
    }
    
    // Check if restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(id)
    if (!existingRestaurant) {
      return res.status(404).json({
        error: 'Restaurant not found'
      })
    }
    
    // Delete restaurant
    await restaurantService.deleteRestaurant(id)
    
    return res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return res.status(500).json({
      error: 'Failed to delete restaurant',
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await getRestaurant(req, res)
        
      case 'PUT':
        return await updateRestaurant(req, res)
        
      case 'DELETE':
        return await deleteRestaurant(req, res)
        
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          allowedMethods: ['GET', 'PUT', 'DELETE']
        })
    }
  } catch (error) {
    console.error('Restaurant API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

// Apply authentication middleware for PUT and DELETE operations
export default withApiAuthRequired(handler, {
  requireAuth: ['PUT', 'DELETE'],
  requireAdmin: ['DELETE']
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
