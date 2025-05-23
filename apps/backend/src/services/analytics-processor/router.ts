/**
 * Analytics Processor Router
 * 
 * This file defines the tRPC router for analytics processor operations.
 * It exposes endpoints for processing analytics events and retrieving
 * analytics data.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processAnalyticsEvent,
  processBatchAnalyticsEvents,
  getAnalyticsEvents,
  getAnalyticsSummary,
  AnalyticsEventCategory,
  AnalyticsEventStatus,
  type AnalyticsEvent,
} from './index.js';

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

// Define Zod schema for analytics filters
const analyticsFiltersSchema = z.object({
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
});

export const analyticsProcessorRouter = router({
  // Process a single analytics event
  processEvent: publicProcedure
    .input(analyticsEventSchema)
    .mutation(async ({ input }) => {
      return processAnalyticsEvent(input as AnalyticsEvent);
    }),

  // Process multiple analytics events
  processBatchEvents: publicProcedure
    .input(z.array(analyticsEventSchema))
    .mutation(async ({ input }) => {
      return processBatchAnalyticsEvents(input as AnalyticsEvent[]);
    }),

  // Get analytics events with filtering
  getEvents: protectedProcedure
    .input(analyticsFiltersSchema)
    .query(async ({ input }) => {
      return getAnalyticsEvents(input);
    }),

  // Get analytics summary
  getSummary: protectedProcedure
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
      return getAnalyticsSummary(input);
    }),
});
