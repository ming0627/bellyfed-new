/**
 * Validation middleware for AWS Lambda functions
 * This middleware provides input validation for Lambda functions using Joi
 */

import { MiddlewareObj } from '@middy/core';
import { Schema } from 'joi';
import { ApplicationError, createValidationError } from '../../../utils/nodejs/errors.js';

/**
 * Input validation middleware
 * @param schema Joi schema for validating the event
 * @returns Middleware object for input validation
 */
export const inputValidation = (schema?: Schema): MiddlewareObj => {
  return {
    /**
     * Validate the event before processing
     * @param request Middy request object
     */
    before: async (request) => {
      // Skip validation if no schema is provided
      if (!schema) {
        return;
      }

      const { event } = request;

      try {
        // Validate the event against the schema
        const validatedEvent = await schema.validateAsync(event, {
          abortEarly: false, // Return all errors, not just the first one
          stripUnknown: true, // Remove unknown properties
        });

        // Replace the event with the validated event
        request.event = validatedEvent;
      } catch (error: unknown) {
        // Handle Joi validation errors
        if (error && typeof error === 'object' && 'details' in error && Array.isArray(error.details)) {
          const details = error.details.map((detail: any) => ({
            path: detail.path,
            message: detail.message,
            type: detail.type,
          }));

          throw createValidationError('Validation failed', { details });
        }

        // Handle other errors
        throw new ApplicationError('Validation failed', 400, 'VALIDATION_ERROR');
      }
    },
  };
};

/**
 * Body validation middleware for API Gateway events
 * @param schema Joi schema for validating the request body
 * @returns Middleware object for body validation
 */
export const bodyValidation = (schema: Schema): MiddlewareObj => {
  return {
    /**
     * Validate the request body before processing
     * @param request Middy request object
     */
    before: async (request) => {
      const { event } = request;

      // Type guard for API Gateway event
      if (!event || typeof event !== 'object' || !('body' in event)) {
        throw new ApplicationError('Invalid event structure', 400, 'INVALID_EVENT');
      }

      try {
        // Parse the body if it's a string
        let body = event.body;
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body);
          } catch (parseError) {
            throw createValidationError('Invalid JSON in request body');
          }
        }

        // Validate the body against the schema
        const validatedBody = await schema.validateAsync(body, {
          abortEarly: false,
          stripUnknown: true,
        });

        // Replace the body with the validated body
        event.body = validatedBody;
      } catch (error: unknown) {
        // Handle Joi validation errors
        if (error && typeof error === 'object' && 'details' in error && Array.isArray(error.details)) {
          const details = error.details.map((detail: any) => ({
            path: detail.path,
            message: detail.message,
            type: detail.type,
          }));

          throw createValidationError('Validation failed', { details });
        }

        // Handle other errors
        throw new ApplicationError('Validation failed', 400, 'VALIDATION_ERROR');
      }
    },
  };
};

/**
 * Query parameters validation middleware for API Gateway events
 * @param schema Joi schema for validating the query parameters
 * @returns Middleware object for query parameters validation
 */
export const queryValidation = (schema: Schema): MiddlewareObj => {
  return {
    /**
     * Validate the query parameters before processing
     * @param request Middy request object
     */
    before: async (request) => {
      const { event } = request;

      // Type guard for API Gateway event
      if (!event || typeof event !== 'object') {
        throw new ApplicationError('Invalid event structure', 400, 'INVALID_EVENT');
      }

      const queryParams = 'queryStringParameters' in event ? event.queryStringParameters || {} : {};

      try {
        // Validate the query parameters against the schema
        const validatedParams = await schema.validateAsync(queryParams, {
          abortEarly: false,
          stripUnknown: true,
        });

        // Replace the query parameters with the validated parameters
        if ('queryStringParameters' in event) {
          event.queryStringParameters = validatedParams;
        }
      } catch (error: unknown) {
        // Handle Joi validation errors
        if (error && typeof error === 'object' && 'details' in error && Array.isArray(error.details)) {
          const details = error.details.map((detail: any) => ({
            path: detail.path,
            message: detail.message,
            type: detail.type,
          }));

          throw createValidationError('Query parameter validation failed', { details });
        }

        // Handle other errors
        throw new ApplicationError('Query parameter validation failed', 400, 'VALIDATION_ERROR');
      }
    },
  };
};
