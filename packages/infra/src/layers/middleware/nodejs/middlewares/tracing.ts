/**
 * Tracing middleware for AWS Lambda functions
 * This middleware provides request and response tracing for Lambda functions
 */

import { MiddlewareObj } from '@middy/core';
import { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extended context interface with tracing information
 */
export interface ExtendedContext extends Context {
  /**
   * Trace ID for distributed tracing
   */
  traceId?: string;
  
  /**
   * Start time for performance measurement
   */
  startTime?: number;
}

/**
 * Tracing options
 */
export interface TracingOptions {
  /**
   * Whether to log the request event
   */
  logEvent?: boolean;
  
  /**
   * Whether to log the response
   */
  logResponse?: boolean;
  
  /**
   * Whether to measure performance
   */
  measurePerformance?: boolean;
  
  /**
   * Whether to redact sensitive information
   */
  redactSensitiveInfo?: boolean;
  
  /**
   * List of sensitive fields to redact
   */
  sensitiveFields?: string[];
}

/**
 * Default tracing options
 */
const defaultOptions: TracingOptions = {
  logEvent: true,
  logResponse: true,
  measurePerformance: true,
  redactSensitiveInfo: true,
  sensitiveFields: ['password', 'token', 'authorization', 'secret', 'key'],
};

/**
 * Tracing middleware
 * @param options Tracing options
 * @returns Middleware object for tracing
 */
export const tracing = (options: TracingOptions = {}): MiddlewareObj<unknown, unknown, Error, ExtendedContext> => {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  return {
    /**
     * Before handler execution
     * @param request Middy request object
     */
    before: async (request) => {
      const { event, context } = request;
      
      if (context) {
        // Generate trace ID if not already present
        context.traceId = context.traceId || uuidv4();
        
        // Record start time for performance measurement
        if (opts.measurePerformance) {
          context.startTime = Date.now();
        }
        
        // Log the request
        if (opts.logEvent) {
          const logEvent = opts.redactSensitiveInfo ? redactSensitiveInfo(event, opts.sensitiveFields || []) : event;
          
          console.log('Request:', {
            requestId: context.awsRequestId,
            traceId: context.traceId,
            functionName: context.functionName,
            event: logEvent,
          });
        }
      }
    },
    
    /**
     * After handler execution
     * @param request Middy request object
     */
    after: async (request) => {
      const { response, context } = request;
      
      if (context) {
        // Calculate execution duration
        let duration;
        if (opts.measurePerformance && context.startTime) {
          duration = Date.now() - context.startTime;
        }
        
        // Log the response
        if (opts.logResponse) {
          const logResponse = opts.redactSensitiveInfo ? redactSensitiveInfo(response, opts.sensitiveFields || []) : response;
          
          console.log('Response:', {
            requestId: context.awsRequestId,
            traceId: context.traceId,
            functionName: context.functionName,
            duration,
            response: logResponse,
          });
        }
      }
    },
    
    /**
     * On error
     * @param request Middy request object
     */
    onError: async (request) => {
      const { error, context } = request;
      
      if (context && error) {
        // Calculate execution duration
        let duration;
        if (opts.measurePerformance && context.startTime) {
          duration = Date.now() - context.startTime;
        }
        
        // Log the error
        console.error('Error:', {
          requestId: context.awsRequestId,
          traceId: context.traceId,
          functionName: context.functionName,
          duration,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        });
      }
    },
  };
};

/**
 * Redact sensitive information from an object
 * @param obj Object to redact
 * @param sensitiveFields List of sensitive fields to redact
 * @returns Redacted object
 */
function redactSensitiveInfo(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveInfo(item, sensitiveFields));
  }
  
  // Handle objects
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if the key is sensitive
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      // Redact sensitive value
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively redact nested objects
      result[key] = redactSensitiveInfo(value, sensitiveFields);
    } else {
      // Keep non-sensitive value
      result[key] = value;
    }
  }
  
  return result;
}
