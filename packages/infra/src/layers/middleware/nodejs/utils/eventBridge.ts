/**
 * EventBridge utilities for AWS Lambda functions
 * This module provides utilities for sending events to EventBridge
 */

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard event interface for EventBridge events
 */
export interface StandardEvent {
  /**
   * Unique event ID
   */
  event_id?: string;
  
  /**
   * Event timestamp (ISO 8601 format)
   */
  timestamp?: string;
  
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
  version?: string;
  
  /**
   * Trace ID for distributed tracing
   */
  trace_id?: string;
  
  /**
   * Event detail
   */
  detail: any;
}

/**
 * Create an EventBridge client
 * @returns EventBridge client
 */
export const createEventBridgeClient = (): EventBridgeClient => {
  return new EventBridgeClient({});
};

/**
 * Send an event to EventBridge
 * @param event Standard event to send
 * @param eventBusName EventBridge event bus name
 * @param detailType Event detail type
 * @param client Optional EventBridge client (creates a new client if not provided)
 * @returns Result of the PutEvents operation
 */
export const sendToEventBridge = async (
  event: StandardEvent,
  eventBusName: string,
  detailType: string,
  client?: EventBridgeClient
): Promise<any> => {
  // Use provided client or create a new one
  const eventBridgeClient = client || createEventBridgeClient();
  
  // Standardize the event
  const standardEvent = {
    event_id: event.event_id || uuidv4(),
    timestamp: event.timestamp || new Date().toISOString(),
    event_type: event.event_type,
    source: event.source,
    version: event.version || '1.0',
    trace_id: event.trace_id,
    detail: event.detail,
  };

  // Create the PutEvents command
  const command = new PutEventsCommand({
    Entries: [
      {
        EventBusName: eventBusName,
        Source: standardEvent.source,
        DetailType: detailType,
        Detail: JSON.stringify(standardEvent),
      },
    ],
  });

  try {
    // Send the event
    const result = await eventBridgeClient.send(command);
    
    // Check for failed entries
    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      console.error('Failed to send event to EventBridge:', result.Entries);
      throw new Error(`Failed to send event to EventBridge: ${JSON.stringify(result.Entries)}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending event to EventBridge:', error);
    throw error;
  }
};

/**
 * Send multiple events to EventBridge
 * @param events Array of standard events to send
 * @param eventBusName EventBridge event bus name
 * @param detailType Event detail type
 * @param client Optional EventBridge client (creates a new client if not provided)
 * @returns Result of the PutEvents operation
 */
export const sendBatchToEventBridge = async (
  events: StandardEvent[],
  eventBusName: string,
  detailType: string,
  client?: EventBridgeClient
): Promise<any> => {
  // Use provided client or create a new one
  const eventBridgeClient = client || createEventBridgeClient();
  
  // Standardize the events
  const entries = events.map(event => ({
    EventBusName: eventBusName,
    Source: event.source,
    DetailType: detailType,
    Detail: JSON.stringify({
      event_id: event.event_id || uuidv4(),
      timestamp: event.timestamp || new Date().toISOString(),
      event_type: event.event_type,
      source: event.source,
      version: event.version || '1.0',
      trace_id: event.trace_id,
      detail: event.detail,
    }),
  }));

  // Create the PutEvents command
  const command = new PutEventsCommand({
    Entries: entries,
  });

  try {
    // Send the events
    const result = await eventBridgeClient.send(command);
    
    // Check for failed entries
    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      console.error('Failed to send events to EventBridge:', result.Entries);
      throw new Error(`Failed to send events to EventBridge: ${JSON.stringify(result.Entries)}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending events to EventBridge:', error);
    throw error;
  }
};
