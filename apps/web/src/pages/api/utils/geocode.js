/**
 * API Route: Geocoding Utility
 * 
 * This API route provides geocoding and reverse geocoding services.
 * It converts addresses to coordinates and vice versa.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for geocoding utility API endpoint
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
        message: 'Authentication required to use geocoding services'
      });
    }

    const { 
      address,
      latitude,
      longitude,
      language = 'en',
      region,
      components
    } = req.query;

    // Determine operation type
    const isReverseGeocode = latitude && longitude;
    const isForwardGeocode = address;

    if (!isReverseGeocode && !isForwardGeocode) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Either address or latitude/longitude parameters are required'
      });
    }

    if (isReverseGeocode && isForwardGeocode) {
      return res.status(400).json({
        error: 'Conflicting parameters',
        message: 'Provide either address OR latitude/longitude, not both'
      });
    }

    // Validate coordinates for reverse geocoding
    if (isReverseGeocode) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }
    }

    // Validate address for forward geocoding
    if (isForwardGeocode && (typeof address !== 'string' || address.trim().length < 3)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Address must be a string with at least 3 characters'
      });
    }

    // Validate language parameter
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        error: 'Invalid language parameter',
        message: `Language must be one of: ${validLanguages.join(', ')}`
      });
    }

    // Check for Google Geocoding API key
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Geocoding API is not configured'
      });
    }

    // Build Google Geocoding API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = new URLSearchParams({
      language,
      key: apiKey
    });

    if (isReverseGeocode) {
      params.append('latlng', `${latitude},${longitude}`);
    } else {
      params.append('address', address);
    }

    if (region) params.append('region', region);
    if (components) params.append('components', components);

    const geocodingUrl = `${baseUrl}?${params.toString()}`;

    // Make request to Google Geocoding API
    const response = await fetch(geocodingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Bellyfed/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(502).json({
        error: 'External API error',
        message: `Google Geocoding API returned status: ${data.status}`,
        details: data.error_message || 'Unknown error'
      });
    }

    // Transform and filter the response
    const transformedResults = data.results?.map(result => ({
      formattedAddress: result.formatted_address,
      geometry: {
        location: result.geometry.location,
        locationType: result.geometry.location_type,
        viewport: result.geometry.viewport,
        bounds: result.geometry.bounds
      },
      addressComponents: result.address_components?.map(component => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      })) || [],
      types: result.types,
      placeId: result.place_id,
      plusCode: result.plus_code
    })) || [];

    // Extract useful information
    const primaryResult = transformedResults[0];
    let extractedInfo = null;

    if (primaryResult) {
      extractedInfo = {
        address: primaryResult.formattedAddress,
        coordinates: primaryResult.geometry.location,
        components: {}
      };

      // Extract common address components
      primaryResult.addressComponents.forEach(component => {
        if (component.types.includes('street_number')) {
          extractedInfo.components.streetNumber = component.longName;
        }
        if (component.types.includes('route')) {
          extractedInfo.components.street = component.longName;
        }
        if (component.types.includes('locality')) {
          extractedInfo.components.city = component.longName;
        }
        if (component.types.includes('administrative_area_level_1')) {
          extractedInfo.components.state = component.longName;
          extractedInfo.components.stateCode = component.shortName;
        }
        if (component.types.includes('country')) {
          extractedInfo.components.country = component.longName;
          extractedInfo.components.countryCode = component.shortName;
        }
        if (component.types.includes('postal_code')) {
          extractedInfo.components.postalCode = component.longName;
        }
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        results: transformedResults,
        extracted: extractedInfo,
        status: data.status
      },
      meta: {
        operation: isReverseGeocode ? 'reverse_geocode' : 'forward_geocode',
        input: isReverseGeocode ? `${latitude},${longitude}` : address,
        language,
        resultCount: transformedResults.length
      }
    });

  } catch (error) {
    console.error('Error processing geocoding request:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API key error',
        message: 'Invalid or missing Google Geocoding API key'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Quota exceeded',
        message: 'Google Geocoding API quota exceeded'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process geocoding request'
    });
  }
}
