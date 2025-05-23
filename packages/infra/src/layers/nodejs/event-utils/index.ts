/**
 * Event utilities for AWS Lambda functions
 * This module provides utilities for processing and standardizing events
 */

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationError } from '../../utils/nodejs/errors.js';

/**
 * Standard event interface
 */
export interface StandardEvent {
  /**
   * Unique event ID
   */
  event_id: string;

  /**
   * Event timestamp (ISO 8601 format)
   */
  timestamp: string;

  /**
   * Event type
   */
  event_type: string;

  /**
   * Event source
   */
  source: string;

  /**
   * Event version
   */
  version: string;

  /**
   * Trace ID for distributed tracing
   */
  trace_id: string;

  /**
   * Correlation ID for related events
   */
  correlation_id?: string;

  /**
   * User ID associated with the event
   */
  user_id?: string;

  /**
   * Event status
   */
  status: string;

  /**
   * Event payload
   */
  payload: Record<string, unknown>;
}

/**
 * Process an event from various sources into a standardized format
 * @param event Raw event from Lambda
 * @param traceId Trace ID for distributed tracing
 * @returns Standardized event
 */
export const processEvent = (event: unknown, traceId: string): StandardEvent => {
  // Check if it's a Cognito event
  if (event && typeof event === 'object' && 'triggerSource' in event) {
    return processCognitoEvent(event, traceId);
  }
  // Check if it's an API Gateway event
  else if (
    event &&
    typeof event === 'object' &&
    'headers' in event &&
    'httpMethod' in event
  ) {
    return processApiGatewayEvent(event, traceId);
  }
  // Unsupported event source
  else {
    throw new ApplicationError(
      'Unsupported event source',
      400,
      'UNSUPPORTED_EVENT_SOURCE'
    );
  }
};

/**
 * Process a Cognito event into a standardized format
 * @param event Cognito event
 * @param traceId Trace ID for distributed tracing
 * @returns Standardized event
 */
const processCognitoEvent = (event: any, traceId: string): StandardEvent => {
  // Extract event data
  const userId = event.userName;
  const eventType = event.triggerSource;
  const source = 'bellyfed.cognito';
  const status = 'triggered';

  // Extract user attributes
  const payload = {
    email: event.request?.userAttributes?.email,
    username: event.userName,
    ...event.request?.userAttributes,
  };

  // Customize email messages if needed
  if (event.triggerSource === 'CustomMessage_SignUp' && event.response) {
    event.response.emailSubject = 'Welcome to Bellyfed!';
    event.response.emailMessage = `Hello ${event.userName}, please confirm your email.`;
  } else if (event.triggerSource === 'CustomMessage_ForgotPassword' && event.response) {
    event.response.emailSubject = 'Reset Your Bellyfed Password';
    event.response.emailMessage = `Hello ${event.userName}, you requested a password reset.`;
  }

  // Create standardized event
  const standardizedEvent: StandardEvent = {
    event_id: uuidv4(),
    timestamp: new Date().toISOString(),
    event_type: eventType,
    source,
    version: 'v1.0',
    trace_id: traceId || uuidv4(),
    user_id: userId,
    status,
    payload,
  };

  // Validate the event
  validateStandardEvent(standardizedEvent);

  return standardizedEvent;
};

/**
 * Process an API Gateway event into a standardized format
 * @param event API Gateway event
 * @param traceId Trace ID for distributed tracing
 * @returns Standardized event
 */
const processApiGatewayEvent = (event: any, traceId: string): StandardEvent => {
  // Parse the body if it's a string
  const body = typeof event.body === 'string' && event.body
    ? JSON.parse(event.body)
    : (event.body || {});

  // Extract event data
  const eventType = body.eventType || 'APIGatewayEvent';
  const source = 'bellyfed.api';
  const status = body.status || 'received';

  // Extract user ID from authorizer or body
  const userId =
    event.requestContext?.authorizer?.claims?.sub ||
    body.userId ||
    'anonymous';

  // Extract correlation ID from headers or generate a new one
  const correlationId =
    (event.headers && (event.headers['X-Correlation-Id'] || event.headers['x-correlation-id'])) ||
    uuidv4();

  // Extract payload from body
  const payload = body.payload || {};

  // Create standardized event
  const standardizedEvent: StandardEvent = {
    event_id: uuidv4(),
    timestamp: new Date().toISOString(),
    event_type: eventType,
    source,
    version: 'v1.0',
    trace_id: traceId || uuidv4(),
    correlation_id: correlationId,
    user_id: userId,
    status,
    payload,
  };

  // Validate the event
  validateStandardEvent(standardizedEvent);

  return standardizedEvent;
};

/**
 * Validate a standardized event
 * @param event Standardized event to validate
 * @throws Error if the event is invalid
 */
export const validateStandardEvent = (event: StandardEvent): void => {
  // Required fields
  const requiredFields = [
    'event_id',
    'timestamp',
    'event_type',
    'source',
    'version',
    'trace_id',
    'status',
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!event[field as keyof StandardEvent]) {
      throw new ApplicationError(
        `Missing required field: ${field}`,
        400,
        'INVALID_EVENT'
      );
    }
  }
};

/**
 * Send a standardized event to EventBridge
 * @param event Standardized event to send
 * @param options Options for sending the event
 * @returns Result of the PutEvents operation
 */
export const sendToEventBridge = async (
  event: StandardEvent,
  options: {
    client: EventBridgeClient;
    eventBusName: string;
    detailType?: string;
  }
): Promise<void> => {
  const { client, eventBusName, detailType = 'ProcessedEvent' } = options;

  // Create the PutEvents command
  const params = {
    Entries: [
      {
        EventBusName: eventBusName,
        Source: 'custom.eventProcessor',
        DetailType: detailType,
        Detail: JSON.stringify(event),
      },
    ],
  };

  try {
    // Send the event
    const result = await client.send(new PutEventsCommand(params));

    // Check for failed entries
    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      console.error('Failed to send event to EventBridge:', result.Entries);
      throw new ApplicationError(
        'Failed to send event to EventBridge',
        500,
        'EVENT_BRIDGE_ERROR'
      );
    }
  } catch (error: unknown) {
    console.error('Error sending event to EventBridge:', error);
    throw error;
  }
};
