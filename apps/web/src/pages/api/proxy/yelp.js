/**
 * API Route: Yelp API Proxy
 * 
 * This API route proxies requests to Yelp Fusion API.
 * It handles authentication and provides restaurant/business data.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for Yelp API proxy endpoint
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
        message: 'Authentication required to access Yelp API'
      });
    }

    const { 
      term,
      location,
      latitude,
      longitude,
      radius = 5000,
      categories = 'restaurants',
      limit = 20,
      offset = 0,
      sort_by = 'best_match',
      price = '1,2,3,4'
    } = req.query;

    // Validate required parameters
    if (!term && !categories) {
      return res.status(400).json({
        error: 'Missing search parameters',
        message: 'Either term or categories parameter is required'
      });
    }

    if (!location && (!latitude || !longitude)) {
      return res.status(400).json({
        error: 'Missing location parameters',
        message: 'Either location or latitude/longitude is required'
      });
    }

    // Validate numeric parameters
    const radiusNum = parseInt(radius, 10);
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 40000) {
      return res.status(400).json({
        error: 'Invalid radius parameter',
        message: 'Radius must be between 1 and 40000 meters'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 50'
      });
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Invalid offset parameter',
        message: 'Offset must be a non-negative integer'
      });
    }

    // Validate coordinates if provided
    if (latitude || longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }
    }

    // Validate sort_by parameter
    const validSortOptions = ['best_match', 'rating', 'review_count', 'distance'];
    if (!validSortOptions.includes(sort_by)) {
      return res.status(400).json({
        error: 'Invalid sort_by parameter',
        message: `Sort option must be one of: ${validSortOptions.join(', ')}`
      });
    }

    // Check for Yelp API key
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Yelp API is not configured'
      });
    }

    // Build Yelp API URL
    const baseUrl = 'https://api.yelp.com/v3/businesses/search';
    const params = new URLSearchParams({
      categories,
      limit: limitNum.toString(),
      offset: offsetNum.toString(),
      sort_by,
      price
    });

    if (term) params.append('term', term);
    if (location) {
      params.append('location', location);
    } else {
      params.append('latitude', latitude);
      params.append('longitude', longitude);
    }
    params.append('radius', radiusNum.toString());

    const yelpUrl = `${baseUrl}?${params.toString()}`;

    // Make request to Yelp API
    const response = await fetch(yelpUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Bellyfed/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and filter the response
    const transformedBusinesses = data.businesses?.map(business => ({
      id: business.id,
      name: business.name,
      imageUrl: business.image_url,
      url: business.url,
      reviewCount: business.review_count,
      categories: business.categories?.map(cat => ({
        alias: cat.alias,
        title: cat.title
      })) || [],
      rating: business.rating,
      coordinates: business.coordinates,
      transactions: business.transactions || [],
      price: business.price,
      location: {
        address1: business.location?.address1,
        city: business.location?.city,
        zipCode: business.location?.zip_code,
        country: business.location?.country,
        state: business.location?.state,
        displayAddress: business.location?.display_address
      },
      phone: business.phone,
      displayPhone: business.display_phone,
      distance: business.distance,
      isClosed: business.is_closed
    })) || [];

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        businesses: transformedBusinesses,
        total: data.total || 0,
        region: data.region
      },
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < (data.total || 0)
      },
      meta: {
        term: term || null,
        location: location || `${latitude},${longitude}`,
        radius: radiusNum,
        categories,
        sortBy: sort_by,
        resultCount: transformedBusinesses.length
      }
    });

  } catch (error) {
    console.error('Error proxying Yelp request:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API key error',
        message: 'Invalid or missing Yelp API key'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Quota exceeded',
        message: 'Yelp API quota exceeded'
      });
    }

    if (error.message.includes('400')) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid parameters sent to Yelp API'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy Yelp request'
    });
  }
}
