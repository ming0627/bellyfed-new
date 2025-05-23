/**
 * EventBridge specialized middleware for AWS Lambda functions
 * This middleware provides error handling and event processing for EventBridge events
 */

import { MiddlewareObj } from '@middy/core';
import { EventBridgeEvent } from 'aws-lambda';
import { ApplicationError } from '../../../../utils/nodejs/errors.js';

/**
 * EventBridge error handler middleware
 * @returns Middleware object for EventBridge error handling
 */
export const eventBridgeErrorHandler = (): MiddlewareObj<EventBridgeEvent<string, unknown>> => ({
  /**
   * Handle errors in EventBridge Lambda functions
   * @param request Middy request object
   */
  onError: async (request) => {
    const { error, context, event } = request;

    if (!error) {
      return;
    }

    // Log the error with event context
    console.error('EventBridge Error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      eventSource: event.source,
      eventType: event['detail-type'],
      eventId: event.id,
      traceId: context?.awsRequestId,
    });

    // For business logic errors, we might want to handle them differently
    if (error instanceof ApplicationError) {
      // Log additional details for application errors
      console.error('Application Error Details:', {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });
      
      // Rethrow to allow AWS to handle the error (e.g., retry policy, DLQ)
      throw error;
    }

    // For system errors, we might want to retry
    // Rethrow to allow AWS to handle the error
    throw error;
  },
});

/**
 * EventBridge event validator middleware
 * @param eventTypes Array of allowed event types
 * @returns Middleware object for EventBridge event validation
 */
export const eventBridgeValidator = (eventTypes: string[]): MiddlewareObj<EventBridgeEvent<string, unknown>> => ({
  /**
   * Validate EventBridge events before processing
   * @param request Middy request object
   */
  before: async (request) => {
    const { event } = request;
    
    // Validate event type
    const eventType = event['detail-type'];
    if (!eventTypes.includes(eventType)) {
      throw new ApplicationError(
        `Unsupported event type: ${eventType}`,
        400,
        'INVALID_EVENT_TYPE'
      );
    }
    
    // Validate event source
    if (!event.source) {
      throw new ApplicationError(
        'Event source is missing',
        400,
        'INVALID_EVENT'
      );
    }
    
    // Validate event detail
    if (!event.detail || typeof event.detail !== 'object') {
      throw new ApplicationError(
        'Event detail is missing or invalid',
        400,
        'INVALID_EVENT'
      );
    }
  },
});

/**
 * EventBridge event logger middleware
 * @returns Middleware object for EventBridge event logging
 */
export const eventBridgeLogger = (): MiddlewareObj<EventBridgeEvent<string, unknown>> => ({
  /**
   * Log EventBridge events before processing
   * @param request Middy request object
   */
  before: async (request) => {
    const { event, context } = request;
    
    // Log the event
    console.log('EventBridge Event:', {
      id: event.id,
      source: event.source,
      type: event['detail-type'],
      time: event.time,
      region: event.region,
      account: event.account,
      requestId: context?.awsRequestId,
    });
  },
  
  /**
   * Log successful event processing
   * @param request Middy request object
   */
  after: async (request) => {
    const { event, context } = request;
    
    // Log successful processing
    console.log('EventBridge Event Processed:', {
      id: event.id,
      source: event.source,
      type: event['detail-type'],
      requestId: context?.awsRequestId,
    });
  },
});
