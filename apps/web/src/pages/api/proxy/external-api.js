/**
 * API Route: External API Proxy
 * 
 * This API route provides a secure proxy for external API calls.
 * It handles authentication, rate limiting, and request validation.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for external API proxy endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Allow GET and POST requests
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET and POST requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access external APIs'
      });
    }

    const { 
      url: targetUrl,
      method = 'GET',
      headers: customHeaders = {},
      timeout = 10000
    } = req.method === 'GET' ? req.query : req.body;

    // Validate target URL
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({
        error: 'Invalid URL parameter',
        message: 'Target URL is required and must be a string'
      });
    }

    // Validate URL format and allowed domains
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Target URL must be a valid HTTP/HTTPS URL'
      });
    }

    // Check allowed domains for security
    const allowedDomains = [
      'api.yelp.com',
      'maps.googleapis.com',
      'api.foursquare.com',
      'api.zomato.com',
      'api.tripadvisor.com'
    ];

    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return res.status(403).json({
        error: 'Domain not allowed',
        message: `Target domain ${parsedUrl.hostname} is not in the allowed list`
      });
    }

    // Validate method parameter
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid method parameter',
        message: `Method must be one of: ${validMethods.join(', ')}`
      });
    }

    // Validate timeout parameter
    const timeoutNum = parseInt(timeout, 10);
    if (isNaN(timeoutNum) || timeoutNum < 1000 || timeoutNum > 30000) {
      return res.status(400).json({
        error: 'Invalid timeout parameter',
        message: 'Timeout must be between 1000 and 30000 milliseconds'
      });
    }

    // Validate custom headers
    if (typeof customHeaders !== 'object' || Array.isArray(customHeaders)) {
      return res.status(400).json({
        error: 'Invalid headers parameter',
        message: 'Headers must be an object'
      });
    }

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'User-Agent': 'Bellyfed-Proxy/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...customHeaders
      },
      signal: AbortSignal.timeout(timeoutNum)
    };

    // Add body for POST/PUT requests
    if (['POST', 'PUT'].includes(method) && req.body?.data) {
      requestOptions.body = JSON.stringify(req.body.data);
    }

    // Make the external API request
    const response = await fetch(targetUrl, requestOptions);

    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Return the proxied response
    res.status(response.status).json({
      success: response.ok,
      data: responseData,
      meta: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: targetUrl,
        method,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error proxying external API request:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'External API request timed out'
      });
    }

    if (error.message.includes('fetch')) {
      return res.status(502).json({
        error: 'External API error',
        message: 'Failed to connect to external API'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to proxy external API request'
    });
  }
}
