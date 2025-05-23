/**
 * API Gateway specialized middleware for AWS Lambda functions
 * This middleware provides error handling and request processing for API Gateway events
 */

import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApplicationError } from '../../../../utils/nodejs/errors.js';

/**
 * API Gateway error handler middleware
 * @returns Middleware object for API Gateway error handling
 */
export const apiGatewayErrorHandler = (): MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => ({
  /**
   * Handle errors in API Gateway Lambda functions
   * @param request Middy request object
   */
  onError: async (request) => {
    const { error, context } = request;

    if (!error) {
      throw new Error('No error object provided');
    }

    // Log the error
    console.error('API Gateway Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestId: context?.awsRequestId,
    });

    // Determine status code and error message
    const statusCode = error instanceof ApplicationError ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorCode = error instanceof ApplicationError ? error.code : 'INTERNAL_SERVER_ERROR';
    const errorDetails = error instanceof ApplicationError ? error.details : undefined;

    // Return formatted error response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-Id': context?.awsRequestId || '',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      },
      body: JSON.stringify({
        error: errorMessage,
        code: errorCode,
        details: errorDetails,
        traceId: context?.awsRequestId,
      }),
    };
  },
});

/**
 * API Gateway CORS middleware
 * @param allowedOrigins Array of allowed origins or '*' for all origins
 * @returns Middleware object for CORS handling
 */
export const apiGatewayCors = (allowedOrigins: string[] | '*' = '*'): MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => ({
  /**
   * Add CORS headers to the response
   * @param request Middy request object
   */
  after: async (request) => {
    const { response, event } = request;
    
    if (!response) {
      return;
    }
    
    // Initialize headers if not present
    response.headers = response.headers || {};
    
    // Get origin from request
    const origin = event.headers?.Origin || event.headers?.origin;
    
    // Determine if origin is allowed
    let allowOrigin = '*';
    if (allowedOrigins !== '*' && origin) {
      allowOrigin = allowedOrigins.includes(origin) ? origin : '';
    }
    
    // Set CORS headers
    response.headers['Access-Control-Allow-Origin'] = allowOrigin;
    response.headers['Access-Control-Allow-Credentials'] = 'true';
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token';
    
    return response;
  },
  
  /**
   * Handle OPTIONS requests for CORS preflight
   * @param request Middy request object
   */
  before: async (request) => {
    const { event } = request;
    
    // Handle OPTIONS requests (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      // Get origin from request
      const origin = event.headers?.Origin || event.headers?.origin;
      
      // Determine if origin is allowed
      let allowOrigin = '*';
      if (allowedOrigins !== '*' && origin) {
        allowOrigin = allowedOrigins.includes(origin) ? origin : '';
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Content-Type': 'application/json',
        },
        body: '',
      };
    }
  },
});
