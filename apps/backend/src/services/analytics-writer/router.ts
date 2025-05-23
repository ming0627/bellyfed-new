/**
 * Analytics Writer tRPC Router
 *
 * This router provides tRPC procedures for writing analytics data.
 * It handles single events, batch events, and performance metrics.
 *
 * @module AnalyticsWriterRouter
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../../trpc.js';
import {
  analyticsWriterService,
  AnalyticsEventSchema,
  BatchAnalyticsEventsSchema
} from './index.js';

/**
 * User behavior tracking schema
 */
const UserBehaviorSchema = z.object({
  userId: z.string(),
  action: z.string(),
  target: z.string(),
  context: z.record(z.any()),
  timestamp: z.string().datetime().optional()
});

/**
 * Performance metrics schema
 */
const PerformanceMetricsSchema = z.object({
  page: z.string(),
  loadTime: z.number().positive(),
  renderTime: z.number().positive(),
  interactionTime: z.number().positive(),
  userId: z.string().optional(),
  sessionId: z.string()
});

/**
 * Analytics Writer Router
 *
 * Provides endpoints for writing various types of analytics data
 */
export const analyticsWriterRouter = router({
  /**
   * Write a single analytics event
   * Public endpoint for tracking anonymous events
   */
  writeEvent: publicProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input }: { input: z.infer<typeof AnalyticsEventSchema> }) => {
      return analyticsWriterService.writeEvent(input);
    }),

  /**
   * Write multiple analytics events in batch
   * Public endpoint for bulk event tracking
   */
  writeBatch: publicProcedure
    .input(BatchAnalyticsEventsSchema)
    .mutation(async ({ input }: { input: z.infer<typeof BatchAnalyticsEventsSchema> }) => {
      return analyticsWriterService.writeBatch(input);
    }),

  /**
   * Write user behavior analytics
   * Protected endpoint for authenticated user tracking
   */
  writeUserBehavior: protectedProcedure
    .input(UserBehaviorSchema)
    .mutation(async ({ input, ctx }: { input: z.infer<typeof UserBehaviorSchema>; ctx: any }) => {
      // Ensure the user can only write their own behavior data
      if (input.userId !== ctx.user.id) {
        throw new Error('Cannot write behavior data for other users');
      }

      return analyticsWriterService.writeUserBehavior(input);
    }),

  /**
   * Write performance metrics
   * Public endpoint for performance tracking
   */
  writePerformanceMetrics: publicProcedure
    .input(PerformanceMetricsSchema)
    .mutation(async ({ input }: { input: z.infer<typeof PerformanceMetricsSchema> }) => {
      return analyticsWriterService.writePerformanceMetrics(input);
    }),

  /**
   * Write page view event
   * Public endpoint for page view tracking
   */
  writePageView: publicProcedure
    .input(z.object({
      page: z.string(),
      userId: z.string().optional(),
      sessionId: z.string(),
      referrer: z.string().optional(),
      country: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input }: { input: {
      page: string;
      userId?: string;
      sessionId: string;
      referrer?: string;
      country?: string;
      metadata?: Record<string, any>;
    } }) => {
      const event = {
        eventType: 'page_view' as const,
        userId: input.userId,
        sessionId: input.sessionId,
        timestamp: new Date().toISOString(),
        properties: {
          page: input.page,
          referrer: input.referrer
        },
        metadata: {
          country: input.country,
          ...input.metadata
        }
      };

      return analyticsWriterService.writeEvent(event);
    }),

  /**
   * Write restaurant view event
   * Public endpoint for restaurant view tracking
   */
  writeRestaurantView: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      restaurantName: z.string(),
      userId: z.string().optional(),
      sessionId: z.string(),
      country: z.string().optional(),
      source: z.string().optional() // search, recommendation, direct, etc.
    }))
    .mutation(async ({ input }: { input: {
      restaurantId: string;
      restaurantName: string;
      userId?: string;
      sessionId: string;
      country?: string;
      source?: string;
    } }) => {
      const event = {
        eventType: 'restaurant_view' as const,
        userId: input.userId,
        sessionId: input.sessionId,
        timestamp: new Date().toISOString(),
        properties: {
          restaurantId: input.restaurantId,
          restaurantName: input.restaurantName,
          source: input.source
        },
        metadata: {
          country: input.country
        }
      };

      return analyticsWriterService.writeEvent(event);
    }),

  /**
   * Write search event
   * Public endpoint for search tracking
   */
  writeSearch: publicProcedure
    .input(z.object({
      query: z.string(),
      filters: z.record(z.any()).optional(),
      resultsCount: z.number().optional(),
      userId: z.string().optional(),
      sessionId: z.string(),
      country: z.string().optional()
    }))
    .mutation(async ({ input }: { input: {
      query: string;
      filters?: Record<string, any>;
      resultsCount?: number;
      userId?: string;
      sessionId: string;
      country?: string;
    } }) => {
      const event = {
        eventType: 'search' as const,
        userId: input.userId,
        sessionId: input.sessionId,
        timestamp: new Date().toISOString(),
        properties: {
          query: input.query,
          filters: input.filters,
          resultsCount: input.resultsCount
        },
        metadata: {
          country: input.country
        }
      };

      return analyticsWriterService.writeEvent(event);
    }),

  /**
   * Write ranking submission event
   * Protected endpoint for ranking tracking
   */
  writeRankingSubmit: protectedProcedure
    .input(z.object({
      dishId: z.string(),
      dishName: z.string(),
      restaurantId: z.string(),
      restaurantName: z.string(),
      ranking: z.number().min(1).max(10),
      sessionId: z.string(),
      country: z.string().optional()
    }))
    .mutation(async ({ input, ctx }: { input: {
      dishId: string;
      dishName: string;
      restaurantId: string;
      restaurantName: string;
      ranking: number;
      sessionId: string;
      country?: string;
    }; ctx: any }) => {
      const event = {
        eventType: 'ranking_submit' as const,
        userId: ctx.user.id,
        sessionId: input.sessionId,
        timestamp: new Date().toISOString(),
        properties: {
          dishId: input.dishId,
          dishName: input.dishName,
          restaurantId: input.restaurantId,
          restaurantName: input.restaurantName,
          ranking: input.ranking
        },
        metadata: {
          country: input.country
        }
      };

      return analyticsWriterService.writeEvent(event);
    }),

  /**
   * Health check endpoint
   * Public endpoint for service health monitoring
   */
  healthCheck: publicProcedure
    .query(async () => {
      return analyticsWriterService.healthCheck();
    })
});

export type AnalyticsWriterRouter = typeof analyticsWriterRouter;
