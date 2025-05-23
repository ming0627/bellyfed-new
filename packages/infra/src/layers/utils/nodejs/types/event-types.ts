/**
 * Event types for infrastructure components
 * This module provides type definitions for events and event handlers
 */

/**
 * Base event interface
 */
export interface BaseEvent {
  /**
   * Event type
   */
  type: string;
  
  /**
   * Event timestamp (ISO 8601 format)
   */
  timestamp: string;
  
  /**
   * Event metadata
   */
  metadata: {
    /**
     * Event source
     */
    source: string;
    
    /**
     * Optional user ID
     */
    userId?: string;
    
    /**
     * Optional trace ID for distributed tracing
     */
    traceId?: string;
  };
}

/**
 * Event message extending base event
 */
export interface EventMessage extends BaseEvent {
  /**
   * Optional event action
   */
  action?: string;
  
  /**
   * Event data
   */
  data: Record<string, unknown>;
}

/**
 * Analytics specific metadata
 */
export interface AnalyticsMetadata {
  /**
   * Event source
   */
  source: string;
  
  /**
   * Optional event duration in milliseconds
   */
  duration?: number;
  
  /**
   * Event status
   */
  status: 'SUCCESS' | 'FAILURE';
  
  /**
   * Optional error type if status is FAILURE
   */
  errorType?: string;
  
  /**
   * Event category
   */
  eventCategory: 'USER_ACTION' | 'SYSTEM_EVENT' | 'AUTH_EVENT' | 'QUERY';
  
  /**
   * Additional event properties
   */
  properties: Record<string, unknown>;
  
  /**
   * Optional user ID
   */
  userId?: string;
  
  /**
   * Optional trace ID for distributed tracing
   */
  traceId?: string;
}

/**
 * Analytics event detail extending base event
 */
export interface AnalyticsEventDetail extends BaseEvent {
  /**
   * Event type
   */
  type: string;
  
  /**
   * Event timestamp (ISO 8601 format)
   */
  timestamp: string;
  
  /**
   * Event action
   */
  action: string;
  
  /**
   * Analytics metadata
   */
  metadata: AnalyticsMetadata;
}

/**
 * Event bus type definition
 */
export interface EventBusType {
  /**
   * Publish an event to the event bus
   * @param event The event to publish
   * @returns A promise that resolves when the event is published
   */
  publish: (event: EventMessage) => Promise<void>;
  
  /**
   * Subscribe to events of a specific type
   * @param eventType The event type to subscribe to
   * @param handler The event handler function
   */
  subscribe: (eventType: string, handler: (event: EventMessage) => Promise<void>) => void;
}

/**
 * Event handler type
 */
export type EventHandler<T extends BaseEvent = EventMessage> = (event: T) => Promise<void>;

/**
 * Event processor options
 */
export interface EventProcessorOptions {
  /**
   * Maximum number of retries for failed events
   */
  maxRetries?: number;
  
  /**
   * Retry delay in milliseconds
   */
  retryDelay?: number;
  
  /**
   * Whether to use exponential backoff for retries
   */
  useExponentialBackoff?: boolean;
  
  /**
   * Dead letter queue ARN for failed events
   */
  deadLetterQueueArn?: string;
}

/**
 * Event processor interface
 */
export interface EventProcessor {
  /**
   * Process an event
   * @param event The event to process
   * @returns A promise that resolves when the event is processed
   */
  processEvent: (event: EventMessage) => Promise<void>;
  
  /**
   * Register an event handler for a specific event type
   * @param eventType The event type to handle
   * @param handler The event handler function
   */
  registerHandler: (eventType: string, handler: EventHandler) => void;
}
