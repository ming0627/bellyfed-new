/**
 * API Route: Create Restaurant (Admin)
 * 
 * This API route allows administrators to create new restaurants.
 * It requires admin authentication and validates restaurant data.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { restaurantService } from '../../../../services/restaurantService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for admin create restaurant API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to create restaurants'
      });
    }

    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      website,
      googlePlaceId,
      countryCode,
      cuisine,
      priceLevel,
      description,
      hours,
      photos
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Restaurant name is required and must be a non-empty string'
      });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 1) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Restaurant address is required and must be a non-empty string'
      });
    }

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Invalid latitude',
        message: 'Latitude must be a number between -90 and 90'
      });
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid longitude',
        message: 'Longitude must be a number between -180 and 180'
      });
    }

    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
      return res.status(400).json({
        error: 'Invalid country code',
        message: 'Country code is required and must be a 2-character string'
      });
    }

    // Validate optional fields
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return res.status(400).json({
        error: 'Invalid phone',
        message: 'Phone must be a string with maximum 20 characters'
      });
    }

    if (website && (typeof website !== 'string' || !website.match(/^https?:\/\/.+/))) {
      return res.status(400).json({
        error: 'Invalid website',
        message: 'Website must be a valid HTTP/HTTPS URL'
      });
    }

    if (googlePlaceId && typeof googlePlaceId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Google Place ID',
        message: 'Google Place ID must be a string'
      });
    }

    if (cuisine && (typeof cuisine !== 'string' || cuisine.length > 100)) {
      return res.status(400).json({
        error: 'Invalid cuisine',
        message: 'Cuisine must be a string with maximum 100 characters'
      });
    }

    if (priceLevel !== undefined && (typeof priceLevel !== 'number' || priceLevel < 1 || priceLevel > 4)) {
      return res.status(400).json({
        error: 'Invalid price level',
        message: 'Price level must be a number between 1 and 4'
      });
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return res.status(400).json({
        error: 'Invalid description',
        message: 'Description must be a string with maximum 1000 characters'
      });
    }

    if (hours && typeof hours !== 'object') {
      return res.status(400).json({
        error: 'Invalid hours',
        message: 'Hours must be an object'
      });
    }

    if (photos && (!Array.isArray(photos) || photos.length > 20)) {
      return res.status(400).json({
        error: 'Invalid photos',
        message: 'Photos must be an array with maximum 20 items'
      });
    }

    // Create the restaurant
    const restaurant = await restaurantService.createRestaurant({
      name: name.trim(),
      address: address.trim(),
      latitude,
      longitude,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      googlePlaceId: googlePlaceId?.trim() || null,
      countryCode: countryCode.toUpperCase(),
      cuisine: cuisine?.trim() || null,
      priceLevel: priceLevel || null,
      description: description?.trim() || null,
      hours: hours || null,
      photos: photos || [],
      createdBy: session.user.id
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: restaurant,
      message: 'Restaurant created successfully'
    });

  } catch (error) {
    console.error('Error creating restaurant:', error);
    
    // Handle specific error types
    if (error.message === 'Restaurant already exists') {
      return res.status(409).json({
        error: 'Restaurant already exists',
        message: 'A restaurant with this name and location already exists'
      });
    }

    if (error.message === 'Invalid Google Place ID') {
      return res.status(400).json({
        error: 'Invalid Google Place ID',
        message: 'The provided Google Place ID is not valid'
      });
    }

    if (error.message === 'Location validation failed') {
      return res.status(400).json({
        error: 'Location validation failed',
        message: 'The provided address and coordinates do not match'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create restaurant'
    });
  }
}
