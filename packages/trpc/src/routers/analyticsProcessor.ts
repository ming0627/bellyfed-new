/**
 * Analytics Processor Router
 * 
 * This file defines the tRPC router for analytics processor operations.
 * It's a wrapper around the backend analytics processor service.
 */

import { z } from 'zod';
import { router } from '../trpc.js';
import { privateProcedure, publicProcedure } from '../procedures/index.js';

// Analytics event categories
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

// Define Zod schema for analytics event
const analyticsEventSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  action: z.string(),
  timestamp: z.string(),
  userId: z.string().optional(),
  traceId: z.string().optional(),
  source: z.string(),
  duration: z.number().optional(),
  status: z.enum([AnalyticsEventStatus.SUCCESS, AnalyticsEventStatus.FAILURE]),
  errorType: z.string().optional(),
  eventCategory: z.enum([
    AnalyticsEventCategory.USER_ACTION,
    AnalyticsEventCategory.SYSTEM_EVENT,
    AnalyticsEventCategory.AUTH_EVENT,
    AnalyticsEventCategory.QUERY,
  ]),
  properties: z.record(z.unknown()),
});

export const analyticsProcessorRouter = router({
  // Process a single analytics event
  processEvent: publicProcedure
    .input(analyticsEventSchema)
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return { success: true, id: 'event-id' };
    }),

  // Process multiple analytics events
  processBatchEvents: publicProcedure
    .input(z.array(analyticsEventSchema))
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return { success: true, count: input.length };
    }),

  // Get analytics events with filtering
  getEvents: privateProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        type: z.string().optional(),
        action: z.string().optional(),
        eventCategory: z.enum([
          AnalyticsEventCategory.USER_ACTION,
          AnalyticsEventCategory.SYSTEM_EVENT,
          AnalyticsEventCategory.AUTH_EVENT,
          AnalyticsEventCategory.QUERY,
        ]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      // This will be implemented in the backend service
      return { events: [], total: 0 };
    }),

  // Get analytics summary
  getSummary: privateProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        eventCategory: z.enum([
          AnalyticsEventCategory.USER_ACTION,
          AnalyticsEventCategory.SYSTEM_EVENT,
          AnalyticsEventCategory.AUTH_EVENT,
          AnalyticsEventCategory.QUERY,
        ]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // This will be implemented in the backend service
      return {
        totalEvents: 0,
        categoryCounts: [],
        typeCounts: [],
        statusCounts: [],
      };
    }),
});
