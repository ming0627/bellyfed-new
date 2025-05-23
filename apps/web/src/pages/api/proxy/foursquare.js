/**
 * API Route: Foursquare API Proxy
 * 
 * This API route proxies requests to Foursquare Places API.
 * It handles authentication and provides venue/place data.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for Foursquare API proxy endpoint
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
        message: 'Authentication required to access Foursquare API'
      });
    }

    const { 
      query: searchQuery,
      ll, // latitude,longitude
      near,
      radius = 5000,
      categories,
      limit = 20,
      sort = 'RELEVANCE',
      fields = 'fsq_id,name,location,categories,rating,photos'
    } = req.query;

    // Validate location parameters
    if (!ll && !near) {
      return res.status(400).json({
        error: 'Missing location parameters',
        message: 'Either ll (latitude,longitude) or near parameter is required'
      });
    }

    // Validate ll parameter format if provided
    if (ll) {
      const coords = ll.split(',');
      if (coords.length !== 2) {
        return res.status(400).json({
          error: 'Invalid ll parameter format',
          message: 'll parameter must be in format "latitude,longitude"'
        });
      }

      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }
    }

    // Validate numeric parameters
    const radiusNum = parseInt(radius, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 100000) {
      return res.status(400).json({
        error: 'Invalid radius parameter',
        message: 'Radius must be between 1 and 100000 meters'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 50'
      });
    }

    // Validate sort parameter
    const validSortOptions = ['RELEVANCE', 'DISTANCE', 'RATING', 'POPULARITY'];
    if (!validSortOptions.includes(sort)) {
      return res.status(400).json({
        error: 'Invalid sort parameter',
        message: `Sort option must be one of: ${validSortOptions.join(', ')}`
      });
    }

    // Check for Foursquare API key
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Foursquare API is not configured'
      });
    }

    // Build Foursquare API URL
    const baseUrl = 'https://api.foursquare.com/v3/places/search';
    const params = new URLSearchParams({
      limit: limitNum.toString(),
      sort,
      fields
    });

    if (searchQuery) params.append('query', searchQuery);
    if (ll) params.append('ll', ll);
    if (near) params.append('near', near);
    if (categories) params.append('categories', categories);
    params.append('radius', radiusNum.toString());

    const foursquareUrl = `${baseUrl}?${params.toString()}`;

    // Make request to Foursquare API
    const response = await fetch(foursquareUrl, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'User-Agent': 'Bellyfed/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and filter the response
    const transformedResults = data.results?.map(place => ({
      fsqId: place.fsq_id,
      name: place.name,
      categories: place.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon ? {
          prefix: cat.icon.prefix,
          suffix: cat.icon.suffix
        } : null
      })) || [],
      location: place.location ? {
        address: place.location.address,
        locality: place.location.locality,
        region: place.location.region,
        postcode: place.location.postcode,
        country: place.location.country,
        formattedAddress: place.location.formatted_address,
        latitude: place.location.latitude,
        longitude: place.location.longitude
      } : null,
      rating: place.rating,
      photos: place.photos?.map(photo => ({
        id: photo.id,
        prefix: photo.prefix,
        suffix: photo.suffix,
        width: photo.width,
        height: photo.height
      })) || [],
      distance: place.distance,
      timezone: place.timezone
    })) || [];

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        results: transformedResults,
        context: data.context
      },
      meta: {
        query: searchQuery || null,
        location: ll || near,
        radius: radiusNum,
        categories: categories || null,
        sort,
        resultCount: transformedResults.length
      }
    });

  } catch (error) {
    console.error('Error proxying Foursquare request:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API key error',
        message: 'Invalid or missing Foursquare API key'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Quota exceeded',
        message: 'Foursquare API quota exceeded'
      });
    }

    if (error.message.includes('400')) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid parameters sent to Foursquare API'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy Foursquare request'
    });
  }
}
