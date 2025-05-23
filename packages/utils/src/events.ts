/**
 * Event Utilities
 *
 * This module provides functions for standardized event processing
 * that can be reused across the application.
 */

// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

// Event sources
export enum EventSource {
  RESTAURANT = 'bellyfed.restaurant',
  REVIEW = 'bellyfed.review',
  USER = 'bellyfed.user',
}

// User event types
export enum UserEventType {
  REGISTERED = 'UserRegistered',
  UPDATED = 'UserUpdated',
  DELETED = 'UserDeleted',
}

// Standard event payload structure
export interface EventPayload {
  eventId: string;
  eventType: string;
  source: string;
  timestamp: string;
  detail: any;
}

/**
 * Send an event to SQS
 *
 * @param eventType Type of event (e.g., 'UserUpdated')
 * @param source Source of the event (e.g., 'bellyfed.user')
 * @param detail Event details/payload
 * @param queueUrl SQS queue URL (optional, will use environment variable if not provided)
 * @returns Promise that resolves when the event is sent
 */
export async function sendEvent(
  eventType: string,
  source: string,
  detail: unknown,
  queueUrl?: string,
): Promise<void> {
  // Create event payload
  const eventPayload: EventPayload = {
    eventId: uuidv4(),
    eventType,
    source,
    timestamp: new Date().toISOString(),
    detail,
  };

  // In a real implementation, this would send the event to SQS
  // For now, we'll just log it
  console.log(`Event sent: ${eventType}`, {
    eventId: eventPayload.eventId,
    source,
    detail,
  });
}

/**
 * Create a user update event
 *
 * @param userData User data
 * @returns Promise that resolves when the event is sent
 */
export async function updateUserEvent(userData: unknown): Promise<void> {
  return sendEvent(UserEventType.UPDATED, EventSource.USER, userData);
}
