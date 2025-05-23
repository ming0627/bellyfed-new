/**
 * Analytics Service Router
 * 
 * This file defines the tRPC router for analytics service operations.
 * It exposes endpoints for tracking views, tracking engagement,
 * getting analytics data, and caching analytics data.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  trackView,
  trackEngagement,
  cacheData,
  getAnalytics,
  getTrending,
  getCachedData,
  type TrackViewParams,
  type TrackEngagementParams,
  type CacheDataParams,
  type GetAnalyticsParams,
  type GetTrendingParams,
  type GetCachedDataParams,
} from './index.js';

export const analyticsServiceRouter = router({
  // Track view
  trackView: publicProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
        userId: z.string().optional(),
        deviceType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trackView(input as TrackViewParams);
    }),

  // Track engagement
  trackEngagement: publicProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
        userId: z.string().optional(),
        engagementType: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return trackEngagement(input as TrackEngagementParams);
    }),

  // Cache data
  cacheData: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.unknown(),
        ttl: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return cacheData(input as CacheDataParams);
    }),

  // Get analytics
  getAnalytics: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
        period: z.enum(['day', 'week', 'month', 'year']).optional(),
      })
    )
    .query(async ({ input }) => {
      return getAnalytics(input as GetAnalyticsParams);
    }),

  // Get trending
  getTrending: publicProcedure
    .input(
      z.object({
        entityType: z.string(),
        limit: z.number().min(1).max(100).optional(),
        period: z.enum(['day', 'week', 'month', 'year']).optional(),
      })
    )
    .query(async ({ input }) => {
      return getTrending(input as GetTrendingParams);
    }),

  // Get cached data
  getCachedData: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getCachedData(input as GetCachedDataParams);
    }),
});
