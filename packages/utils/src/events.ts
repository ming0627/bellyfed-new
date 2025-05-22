/**
 * Event Utilities
 *
 * This module provides functions for standardized event processing
 * that can be reused across the application.
 */

import { SQS } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import { EventPayload, EventSource, UserEventType } from '@bellyfed/types';

// Initialize SQS client
const sqs = new SQS({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
});

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

  // Determine queue URL based on event type
  const targetQueueUrl = queueUrl || getQueueUrlForEventType(eventType);

  try {
    // Send message to SQS
    await sqs.sendMessage({
      QueueUrl: targetQueueUrl,
      MessageBody: JSON.stringify(eventPayload),
      MessageAttributes: {
        EventType: {
          DataType: 'String',
          StringValue: eventType,
        },
      },
    });

    console.log(`Event sent to SQS: ${eventType}`, {
      eventId: eventPayload.eventId,
    });
  } catch (error: unknown) {
    console.error(`Error sending event to SQS: ${eventType}`, error);
    throw error;
  }
}

/**
 * Get the SQS queue URL for a specific event type
 *
 * @param eventType Type of event
 * @returns SQS queue URL
 */
function getQueueUrlForEventType(eventType: string): string {
  // Map event types to queue URLs from environment variables
  const queueMap: Record<string, string | undefined> = {
    // User account events
    [UserEventType.REGISTERED]: process.env.USER_REGISTRATION_QUEUE_URL,
    [UserEventType.UPDATED]: process.env.USER_UPDATE_QUEUE_URL,
    [UserEventType.DELETED]: process.env.USER_DELETION_QUEUE_URL,
  };

  const queueUrl = queueMap[eventType];
  if (!queueUrl) {
    throw new Error(`No queue URL configured for event type: ${eventType}`);
  }

  return queueUrl;
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
