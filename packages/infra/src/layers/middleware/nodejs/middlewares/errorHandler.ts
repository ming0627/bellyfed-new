/**
 * Error handling middleware for AWS Lambda functions
 * This middleware provides standardized error handling for Lambda functions
 */

import { MiddlewareObj } from '@middy/core';
import { Context } from 'aws-lambda';
import { ApplicationError } from '../../../utils/nodejs/errors.js';

/**
 * Error handler middleware
 * @returns Middleware object for error handling
 */
export const errorHandler = (): MiddlewareObj => {
  return {
    /**
     * Handle errors in the Lambda function
     * @param request Middy request object
     */
    onError: async (request) => {
      const { error, context } = request;

      if (!error) {
        return;
      }

      // Log the error
      console.error('Lambda Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        requestId: context?.awsRequestId,
      });

      // Handle ApplicationError with specific status code and message
      if (error instanceof ApplicationError) {
        return {
          statusCode: error.statusCode || 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Trace-Id': context?.awsRequestId || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          body: JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            requestId: context?.awsRequestId,
          }),
        };
      }

      // For all other errors, return a generic 500 error
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': context?.awsRequestId || '',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          message: 'Internal Server Error',
          code: 'INTERNAL_SERVER_ERROR',
          requestId: context?.awsRequestId,
        }),
      };
    },
  };
};

/**
 * Error handler middleware with custom error mapping
 * @param errorMap Map of error types to status codes and messages
 * @returns Middleware object for error handling with custom mapping
 */
export const customErrorHandler = (
  errorMap: Record<string, { statusCode: number; code: string }>
): MiddlewareObj => {
  return {
    /**
     * Handle errors in the Lambda function with custom mapping
     * @param request Middy request object
     */
    onError: async (request) => {
      const { error, context } = request;

      if (!error) {
        return;
      }

      // Log the error
      console.error('Lambda Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        requestId: context?.awsRequestId,
      });

      // Check if the error type is in the error map
      const errorType = error.constructor.name;
      const errorConfig = errorMap[errorType];

      if (errorConfig) {
        return {
          statusCode: errorConfig.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'X-Trace-Id': context?.awsRequestId || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          body: JSON.stringify({
            message: error.message,
            code: errorConfig.code,
            requestId: context?.awsRequestId,
          }),
        };
      }

      // Handle ApplicationError with specific status code and message
      if (error instanceof ApplicationError) {
        return {
          statusCode: error.statusCode || 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Trace-Id': context?.awsRequestId || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          body: JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            requestId: context?.awsRequestId,
          }),
        };
      }

      // For all other errors, return a generic 500 error
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': context?.awsRequestId || '',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          message: 'Internal Server Error',
          code: 'INTERNAL_SERVER_ERROR',
          requestId: context?.awsRequestId,
        }),
      };
    },
  };
};
