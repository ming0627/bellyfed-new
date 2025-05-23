/**
 * Event Processor Service
 * 
 * This service processes events from various sources and routes them
 * to the appropriate handlers. It supports processing events from
 * API Gateway, SQS, and direct calls.
 * 
 * The service provides functionality to:
 * - Process events from different sources
 * - Route events to specific handlers based on event type
 * - Store events in the database
 * - Send events to other services
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseEvent,
  EventTypes,
  isUserSignupEvent,
  isUserLoginEvent,
  isUserProfileUpdateEvent,
  isAnalyticsEvent,
  isSystemEvent,
} from './schema.js';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the processed event interface
export interface ProcessedEvent {
  eventId: string;
  eventType: string;
  status: 'SUCCESS' | 'FAILURE';
  error?: {
    message: string;
    code?: string;
  };
  processingTime: number;
}

// Define the event bus types
export enum EventBusType {
  USER = 'USER',
  AUTH = 'AUTH',
  SYSTEM = 'SYSTEM',
  ANALYTICS = 'ANALYTICS',
}

// Process event
export const processEvent = async (event: BaseEvent): Promise<ProcessedEvent> => {
  const startTime = Date.now();
  const eventId = event.event_id || `${event.event_type}-${startTime}`;

  console.log('[processEvent] Starting event processing:', {
    eventId,
    type: event.event_type,
    source: event.source,
  });

  try {
    // Route to specific event handler based on event type
    if (isUserSignupEvent(event)) {
      await processUserSignupEvent(event);
    } else if (isUserLoginEvent(event)) {
      await processUserLoginEvent(event);
    } else if (isUserProfileUpdateEvent(event)) {
      await processUserProfileUpdateEvent(event);
    } else if (isAnalyticsEvent(event)) {
      await processAnalyticsEvent(event);
    } else if (isSystemEvent(event)) {
      await processSystemEvent(event);
    } else {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Unsupported event type: ${event.event_type}`,
      });
    }

    // Store the event in the database
    await storeEvent(event, 'SUCCESS');

    const processingTime = Date.now() - startTime;
    console.log('[processEvent] Successfully processed event:', {
      eventId,
      type: event.event_type,
      processingTime,
    });

    return {
      eventId,
      eventType: event.event_type,
      status: 'SUCCESS',
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof TRPCError ? error.code : undefined;

    console.error('[processEvent] Failed to process event:', {
      eventId,
      type: event.event_type,
      error: error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            code: errorCode,
          }
        : error,
      processingTime,
    });

    // Store the event in the database with error status
    await storeEvent(event, 'FAILURE', errorMessage);

    return {
      eventId,
      eventType: event.event_type,
      status: 'FAILURE',
      error: {
        message: errorMessage,
        code: errorCode,
      },
      processingTime,
    };
  }
};

// Process batch of events
export const processBatch = async (events: BaseEvent[]): Promise<ProcessedEvent[]> => {
  console.log('[processBatch] Processing batch of events:', {
    count: events.length,
  });

  return Promise.all(events.map(processEvent));
};

// Store event in database
const storeEvent = async (event: BaseEvent, status: string, errorMessage?: string): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: event.event_id || uuidv4(),
        type: 'event_processor',
        action: event.event_type,
        timestamp: new Date(event.timestamp),
        userId: event.user_id,
        traceId: event.trace_id,
        source: event.source,
        status,
        errorType: errorMessage ? 'PROCESSING_ERROR' : undefined,
        eventCategory: getEventCategory(event.event_type),
        properties: {
          event,
          error: errorMessage ? { message: errorMessage } : undefined,
        } as any,
      },
    });
  } catch (error) {
    console.error('Error storing event:', error);
    // Don't throw here to avoid failing the whole process
  }
};

// Get event category based on event type
const getEventCategory = (eventType: string): string => {
  if (eventType.startsWith('AUTH_') || eventType.startsWith('LOGIN_') || eventType.startsWith('SIGNUP_')) {
    return 'AUTH_EVENT';
  } else if (eventType.startsWith('USER_') || eventType.startsWith('PROFILE_')) {
    return 'USER_EVENT';
  } else if (eventType.endsWith('_ANALYTICS') || eventType.startsWith('ANALYTICS_')) {
    return 'ANALYTICS_EVENT';
  } else {
    return 'SYSTEM_EVENT';
  }
};

// Get event bus type based on event type
export const getEventBusType = (eventType: string): EventBusType => {
  if (eventType.startsWith('AUTH_') || eventType.startsWith('LOGIN_') || eventType.startsWith('SIGNUP_')) {
    return EventBusType.AUTH;
  } else if (eventType.startsWith('USER_') || eventType.startsWith('PROFILE_')) {
    return EventBusType.USER;
  } else if (eventType.endsWith('_ANALYTICS') || eventType.startsWith('ANALYTICS_')) {
    return EventBusType.ANALYTICS;
  } else {
    return EventBusType.SYSTEM;
  }
};

// Process user signup event
const processUserSignupEvent = async (event: EventTypes): Promise<void> => {
  console.log('[processUserSignupEvent] Processing user signup:', {
    email: (event.payload as any)?.email,
    username: (event.payload as any)?.username,
  });

  // For now, just log the event
  // In a real implementation, this would send the event to other services
};

// Process user login event
const processUserLoginEvent = async (event: EventTypes): Promise<void> => {
  console.log('[processUserLoginEvent] Processing user login:', {
    email: (event.payload as any)?.email,
    username: (event.payload as any)?.username,
    loginMethod: (event.payload as any)?.loginMethod,
  });

  // For now, just log the event
  // In a real implementation, this would send the event to other services
};

// Process user profile update event
const processUserProfileUpdateEvent = async (event: EventTypes): Promise<void> => {
  console.log('[processUserProfileUpdateEvent] Processing user profile update:', {
    userId: (event.payload as any)?.userId,
    updatedFields: (event.payload as any)?.updatedFields,
  });

  // For now, just log the event
  // In a real implementation, this would send the event to other services
};

// Process analytics event
const processAnalyticsEvent = async (event: EventTypes): Promise<void> => {
  console.log('[processAnalyticsEvent] Processing analytics event:', {
    category: (event.payload as any)?.category,
    action: (event.payload as any)?.action,
  });

  // For now, just log the event
  // In a real implementation, this would send the event to other services
};

// Process system event
const processSystemEvent = async (event: EventTypes): Promise<void> => {
  console.log('[processSystemEvent] Processing system event:', {
    component: (event.payload as any)?.component,
    action: (event.payload as any)?.action,
  });

  // For now, just log the event
  // In a real implementation, this would send the event to other services
};
