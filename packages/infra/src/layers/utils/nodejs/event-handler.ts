/**
 * Event handler utilities for AWS Lambda functions
 * This module provides utilities for handling events from various sources
 */

import { Context } from 'aws-lambda';
import { ApplicationError } from './errors.js';

/**
 * Event handler options
 */
export interface EventHandlerOptions {
  /**
   * Whether to enable logging
   */
  enableLogging?: boolean;
  
  /**
   * Whether to enable tracing
   */
  enableTracing?: boolean;
  
  /**
   * Whether to enable error handling
   */
  enableErrorHandling?: boolean;
  
  /**
   * Whether to enable performance monitoring
   */
  enablePerformanceMonitoring?: boolean;
  
  /**
   * Custom error handler
   */
  errorHandler?: (error: Error, context: Context) => any;
}

/**
 * Default event handler options
 */
const defaultOptions: EventHandlerOptions = {
  enableLogging: true,
  enableTracing: true,
  enableErrorHandling: true,
  enablePerformanceMonitoring: true,
};

/**
 * Create an event handler for AWS Lambda functions
 * @param handler Lambda handler function
 * @param options Event handler options
 * @returns Wrapped handler function
 */
export const createEventHandler = <TEvent, TResult>(
  handler: (event: TEvent, context: Context) => Promise<TResult>,
  options: EventHandlerOptions = {}
): (event: TEvent, context: Context) => Promise<TResult> => {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  return async (event: TEvent, context: Context): Promise<TResult> => {
    // Start time for performance monitoring
    const startTime = opts.enablePerformanceMonitoring ? Date.now() : 0;
    
    // Log the event
    if (opts.enableLogging) {
      console.log('Event:', {
        requestId: context.awsRequestId,
        functionName: context.functionName,
        remainingTime: context.getRemainingTimeInMillis(),
        event: JSON.stringify(event),
      });
    }
    
    try {
      // Call the handler
      const result = await handler(event, context);
      
      // Log the result
      if (opts.enableLogging) {
        console.log('Result:', {
          requestId: context.awsRequestId,
          functionName: context.functionName,
          remainingTime: context.getRemainingTimeInMillis(),
          ...(opts.enablePerformanceMonitoring && {
            duration: Date.now() - startTime,
          }),
        });
      }
      
      return result;
    } catch (error: unknown) {
      // Log the error
      console.error('Error:', {
        requestId: context.awsRequestId,
        functionName: context.functionName,
        remainingTime: context.getRemainingTimeInMillis(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        ...(opts.enablePerformanceMonitoring && {
          duration: Date.now() - startTime,
        }),
      });
      
      // Handle the error
      if (opts.enableErrorHandling) {
        if (opts.errorHandler) {
          return opts.errorHandler(error as Error, context) as TResult;
        } else {
          // Default error handling
          if (error instanceof ApplicationError) {
            throw error;
          } else {
            throw new ApplicationError(
              'Internal server error',
              500,
              'INTERNAL_SERVER_ERROR',
              { error: error instanceof Error ? error.message : String(error) }
            );
          }
        }
      }
      
      // Rethrow the error if error handling is disabled
      throw error;
    }
  };
};

/**
 * Create an API Gateway event handler
 * @param handler Lambda handler function
 * @param options Event handler options
 * @returns Wrapped handler function
 */
export const createApiGatewayHandler = <TEvent, TResult>(
  handler: (event: TEvent, context: Context) => Promise<TResult>,
  options: EventHandlerOptions = {}
): (event: TEvent, context: Context) => Promise<TResult> => {
  return createEventHandler(handler, {
    ...options,
    errorHandler: (error, context) => {
      // Format error for API Gateway
      const statusCode = error instanceof ApplicationError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const errorCode = error instanceof ApplicationError ? error.code : 'INTERNAL_SERVER_ERROR';
      const errorDetails = error instanceof ApplicationError ? error.details : undefined;
      
      return {
        statusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': context.awsRequestId,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          error: errorMessage,
          code: errorCode,
          details: errorDetails,
          requestId: context.awsRequestId,
        }),
      };
    },
  });
};

/**
 * Create an SQS event handler
 * @param handler Lambda handler function
 * @param options Event handler options
 * @returns Wrapped handler function
 */
export const createSQSHandler = <TEvent, TResult>(
  handler: (event: TEvent, context: Context) => Promise<TResult>,
  options: EventHandlerOptions = {}
): (event: TEvent, context: Context) => Promise<TResult> => {
  return createEventHandler(handler, {
    ...options,
    errorHandler: (error, context) => {
      // For SQS, we want to return a partial failure response
      // to allow successful messages to be processed
      if (error instanceof Error && error.name === 'BatchProcessingError') {
        return {
          batchItemFailures: (error as any).failedMessageIds?.map((id: string) => ({
            itemIdentifier: id,
          })) || [],
        };
      }
      
      // For other errors, rethrow to retry the entire batch
      throw error;
    },
  });
};
