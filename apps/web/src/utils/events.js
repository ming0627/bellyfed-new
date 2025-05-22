/**
 * Event Utilities
 *
 * This module provides functions for standardized event processing
 * that can be reused across the application.
 */

import { SQS } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';

// Initialize SQS client
const sqs = new SQS({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
});

/**
 * Event types for restaurant operations
 */
export const RestaurantEventType = {
  CREATED: 'RestaurantCreated',
  UPDATED: 'RestaurantUpdated',
  DELETED: 'RestaurantDeleted',
};

/**
 * Event types for review operations
 */
export const ReviewEventType = {
  CREATED: 'ReviewCreated',
  UPDATED: 'ReviewUpdated',
  DELETED: 'ReviewDeleted',
};

/**
 * Event types for user account operations
 */
export const UserEventType = {
  REGISTERED: 'UserRegistered',
  UPDATED: 'UserUpdated',
  DELETED: 'UserDeleted',
};

/**
 * Event sources
 */
export const EventSource = {
  RESTAURANT: 'bellyfed.restaurant',
  REVIEW: 'bellyfed.review',
  USER: 'bellyfed.user',
};

/**
 * Send an event to SQS
 *
 * @param {string} eventType - Type of event (e.g., 'RestaurantCreated')
 * @param {string} source - Source of the event (e.g., 'bellyfed.restaurant')
 * @param {Object} detail - Event details/payload
 * @param {string} [queueUrl] - SQS queue URL (optional, will use environment variable if not provided)
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function sendEvent(
  eventType,
  source,
  detail,
  queueUrl
) {
  // Create event payload
  const eventPayload = {
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
  } catch (error) {
    console.error(`Error sending event to SQS: ${eventType}`, error);
    throw error;
  }
}

/**
 * Get the SQS queue URL for a specific event type
 *
 * @param {string} eventType - Type of event
 * @returns {string} SQS queue URL
 */
function getQueueUrlForEventType(eventType) {
  // Map event types to queue URLs from environment variables
  const queueMap = {
    // Restaurant events
    [RestaurantEventType.CREATED]: process.env.RESTAURANT_CREATION_QUEUE_URL,
    [RestaurantEventType.UPDATED]: process.env.RESTAURANT_UPDATE_QUEUE_URL,
    [RestaurantEventType.DELETED]: process.env.RESTAURANT_DELETION_QUEUE_URL,

    // Review events
    [ReviewEventType.CREATED]: process.env.REVIEW_CREATION_QUEUE_URL,
    [ReviewEventType.UPDATED]: process.env.REVIEW_UPDATE_QUEUE_URL,
    [ReviewEventType.DELETED]: process.env.REVIEW_DELETION_QUEUE_URL,

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
 * Create a restaurant creation event
 *
 * @param {Object} restaurantData - Restaurant data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function createRestaurantEvent(restaurantData) {
  return sendEvent(
    RestaurantEventType.CREATED,
    EventSource.RESTAURANT,
    restaurantData
  );
}

/**
 * Create a restaurant update event
 *
 * @param {Object} restaurantData - Restaurant data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function updateRestaurantEvent(restaurantData) {
  return sendEvent(
    RestaurantEventType.UPDATED,
    EventSource.RESTAURANT,
    restaurantData
  );
}

/**
 * Create a restaurant deletion event
 *
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function deleteRestaurantEvent(restaurantId) {
  return sendEvent(RestaurantEventType.DELETED, EventSource.RESTAURANT, {
    restaurantId,
  });
}

/**
 * Create a review creation event
 *
 * @param {Object} reviewData - Review data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function createReviewEvent(reviewData) {
  return sendEvent(ReviewEventType.CREATED, EventSource.REVIEW, reviewData);
}

/**
 * Create a review update event
 *
 * @param {Object} reviewData - Review data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function updateReviewEvent(reviewData) {
  return sendEvent(ReviewEventType.UPDATED, EventSource.REVIEW, reviewData);
}

/**
 * Create a review deletion event
 *
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function deleteReviewEvent(reviewId) {
  return sendEvent(ReviewEventType.DELETED, EventSource.REVIEW, { reviewId });
}

/**
 * Create a user registration event
 *
 * @param {Object} userData - User data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function createUserEvent(userData) {
  return sendEvent(UserEventType.REGISTERED, EventSource.USER, userData);
}

/**
 * Create a user update event
 *
 * @param {Object} userData - User data
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function updateUserEvent(userData) {
  return sendEvent(UserEventType.UPDATED, EventSource.USER, userData);
}

/**
 * Create a user deletion event
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>} Promise that resolves when the event is sent
 */
export async function deleteUserEvent(userId) {
  return sendEvent(UserEventType.DELETED, EventSource.USER, { userId });
}
