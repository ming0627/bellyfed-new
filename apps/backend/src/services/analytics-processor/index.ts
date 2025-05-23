/**
 * Analytics Processor Service
 * 
 * This service processes analytics events and stores them in the database.
 * It handles various types of analytics events including user actions,
 * system events, authentication events, and queries.
 * 
 * The service is responsible for:
 * - Validating analytics events
 * - Processing analytics events
 * - Storing analytics events in the database
 * - Handling errors and retries
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Analytics event types
export enum AnalyticsEventCategory {
  USER_ACTION = 'USER_ACTION',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  AUTH_EVENT = 'AUTH_EVENT',
  QUERY = 'QUERY',
}

// Analytics event status
export enum AnalyticsEventStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

// Analytics event interface
export interface AnalyticsEvent {
  id?: string;
  type: string;
  action: string;
  timestamp: string;
  userId?: string;
  traceId?: string;
  source: string;
  duration?: number;
  status: AnalyticsEventStatus;
  errorType?: string;
  eventCategory: AnalyticsEventCategory;
  properties: Record<string, unknown>;
}

// Process analytics event
export const processAnalyticsEvent = async (event: AnalyticsEvent): Promise<{ success: boolean; id: string }> => {
  try {
    // Validate the event
    validateAnalyticsEvent(event);

    // Generate an ID if not provided
    const eventId = event.id || uuidv4();

    // Store the event in the database
    await prisma.analyticsEvent.create({
      data: {
        id: eventId,
        type: event.type,
        action: event.action,
        timestamp: new Date(event.timestamp),
        userId: event.userId,
        traceId: event.traceId,
        source: event.source,
        duration: event.duration,
        status: event.status,
        errorType: event.errorType,
        eventCategory: event.eventCategory,
        properties: event.properties as any,
      },
    });

    console.log(`Successfully processed analytics event: ${eventId}`);
    return { success: true, id: eventId };
  } catch (error) {
    console.error('Error processing analytics event:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process analytics event',
    });
  }
};

// Process multiple analytics events
export const processBatchAnalyticsEvents = async (events: AnalyticsEvent[]): Promise<{ success: boolean; count: number }> => {
  try {
    // Process each event
    const results = await Promise.all(
      events.map(async (event) => {
        try {
          await processAnalyticsEvent(event);
          return { success: true };
        } catch (error) {
          console.error('Error processing batch analytics event:', error);
          return { success: false, error };
        }
      })
    );

    // Count successful events
    const successCount = results.filter((result) => result.success).length;

    console.log(`Successfully processed ${successCount} out of ${events.length} analytics events`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error('Error processing batch analytics events:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process batch analytics events',
    });
  }
};

// Get analytics events
export const getAnalyticsEvents = async (
  filters: {
    userId?: string;
    type?: string;
    action?: string;
    eventCategory?: AnalyticsEventCategory;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ events: any[]; total: number }> => {
  try {
    const { userId, type, action, eventCategory, startDate, endDate, limit = 50, offset = 0 } = filters;

    // Build the where clause
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (action) where.action = action;
    if (eventCategory) where.eventCategory = eventCategory;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Get the total count
    const total = await prisma.analyticsEvent.count({ where });

    // Get the events
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return { events, total };
  } catch (error) {
    console.error('Error getting analytics events:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get analytics events',
    });
  }
};

// Get analytics summary
export const getAnalyticsSummary = async (
  filters: {
    userId?: string;
    eventCategory?: AnalyticsEventCategory;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<any> => {
  try {
    const { userId, eventCategory, startDate, endDate } = filters;

    // Build the where clause
    const where: any = {};
    if (userId) where.userId = userId;
    if (eventCategory) where.eventCategory = eventCategory;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Get the total count
    const totalEvents = await prisma.analyticsEvent.count({ where });

    // Get counts by category
    const categoryCounts = await prisma.analyticsEvent.groupBy({
      by: ['eventCategory'],
      _count: true,
      where,
    });

    // Get counts by type
    const typeCounts = await prisma.analyticsEvent.groupBy({
      by: ['type'],
      _count: true,
      where,
    });

    // Get counts by status
    const statusCounts = await prisma.analyticsEvent.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    return {
      totalEvents,
      categoryCounts,
      typeCounts,
      statusCounts,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get analytics summary',
    });
  }
};

// Validate analytics event
const validateAnalyticsEvent = (event: AnalyticsEvent): void => {
  // Check required fields
  if (!event.type) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event type is required',
    });
  }

  if (!event.action) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event action is required',
    });
  }

  if (!event.timestamp) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event timestamp is required',
    });
  }

  if (!event.source) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event source is required',
    });
  }

  if (!event.eventCategory) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event category is required',
    });
  }

  if (!event.status) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Event status is required',
    });
  }

  // Validate timestamp format
  try {
    new Date(event.timestamp);
  } catch (error) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid timestamp format',
    });
  }
};
