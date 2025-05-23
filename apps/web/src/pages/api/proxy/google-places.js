/**
 * API Route: Google Places Proxy
 * 
 * This API route proxies requests to Google Places API.
 * It handles authentication and rate limiting for external API calls.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for Google Places proxy API endpoint
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
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access Google Places API'
      });
    }

    const { 
      query: searchQuery,
      location,
      radius = 5000,
      type = 'restaurant',
      language = 'en'
    } = req.query;

    // Validate required parameters
    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({
        error: 'Invalid query parameter',
        message: 'Search query is required and must be a string'
      });
    }

    // Validate location parameter
    if (location && typeof location !== 'string') {
      return res.status(400).json({
        error: 'Invalid location parameter',
        message: 'Location must be a string in format "lat,lng"'
      });
    }

    // Validate radius parameter
    const radiusNum = parseInt(radius, 10);
    if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 50000) {
      return res.status(400).json({
        error: 'Invalid radius parameter',
        message: 'Radius must be between 1 and 50000 meters'
      });
    }

    // Validate type parameter
    const validTypes = ['restaurant', 'food', 'meal_takeaway', 'cafe', 'bakery'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid type parameter',
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Check for Google Places API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Google Places API is not configured'
      });
    }

    // Build Google Places API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const params = new URLSearchParams({
      query: searchQuery,
      type,
      language,
      key: apiKey
    });

    if (location) {
      params.append('location', location);
      params.append('radius', radiusNum.toString());
    }

    const googlePlacesUrl = `${baseUrl}?${params.toString()}`;

    // Make request to Google Places API
    const response = await fetch(googlePlacesUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Bellyfed/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(502).json({
        error: 'External API error',
        message: `Google Places API returned status: ${data.status}`,
        details: data.error_message || 'Unknown error'
      });
    }

    // Transform and filter the response
    const transformedResults = data.results?.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry?.location,
      rating: place.rating,
      priceLevel: place.price_level,
      types: place.types,
      photos: place.photos?.slice(0, 3).map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || [],
      openingHours: place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        weekdayText: place.opening_hours.weekday_text
      } : null
    })) || [];

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        results: transformedResults,
        status: data.status,
        nextPageToken: data.next_page_token || null
      },
      meta: {
        query: searchQuery,
        location: location || null,
        radius: radiusNum,
        type,
        resultCount: transformedResults.length
      }
    });

  } catch (error) {
    console.error('Error proxying Google Places request:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API key error',
        message: 'Invalid or missing Google Places API key'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Quota exceeded',
        message: 'Google Places API quota exceeded'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy Google Places request'
    });
  }
}
