/**
 * Analytics Service Database Schema
 *
 * This file exports database schema definitions and utilities
 * for working with analytics service data.
 */

import { prisma } from '../index.js';
import { type Prisma, type AnalyticsViewer } from '@prisma/client';

// Analytics view schema types
export type AnalyticsViewCreateInput = Prisma.AnalyticsViewCreateInput;
export type AnalyticsViewUpdateInput = Prisma.AnalyticsViewUpdateInput;
export type AnalyticsViewWhereUniqueInput = Prisma.AnalyticsViewWhereUniqueInput;
export type AnalyticsViewWhereInput = Prisma.AnalyticsViewWhereInput;

// Analytics viewer schema types
export type AnalyticsViewerCreateInput = Prisma.AnalyticsViewerCreateInput;
export type AnalyticsViewerUpdateInput = Prisma.AnalyticsViewerUpdateInput;
export type AnalyticsViewerWhereUniqueInput = Prisma.AnalyticsViewerWhereUniqueInput;
export type AnalyticsViewerWhereInput = Prisma.AnalyticsViewerWhereInput;

// Analytics engagement schema types
export type AnalyticsEngagementCreateInput = Prisma.AnalyticsEngagementCreateInput;
export type AnalyticsEngagementWhereInput = Prisma.AnalyticsEngagementWhereInput;

// Analytics engagement count schema types
export type AnalyticsEngagementCountCreateInput = Prisma.AnalyticsEngagementCountCreateInput;
export type AnalyticsEngagementCountUpdateInput = Prisma.AnalyticsEngagementCountUpdateInput;
export type AnalyticsEngagementCountWhereUniqueInput = Prisma.AnalyticsEngagementCountWhereUniqueInput;
export type AnalyticsEngagementCountWhereInput = Prisma.AnalyticsEngagementCountWhereInput;

// Analytics cache schema types
export type AnalyticsCacheCreateInput = Prisma.AnalyticsCacheCreateInput;
export type AnalyticsCacheUpdateInput = Prisma.AnalyticsCacheUpdateInput;
export type AnalyticsCacheWhereUniqueInput = Prisma.AnalyticsCacheWhereUniqueInput;

// Database operations
export const analyticsServiceDb = {
  // Analytics view operations
  view: {
    create: (data: AnalyticsViewCreateInput) =>
      prisma.analyticsView.create({ data }),
    update: (where: AnalyticsViewWhereUniqueInput, data: AnalyticsViewUpdateInput) =>
      prisma.analyticsView.update({ where, data }),
    upsert: (where: AnalyticsViewWhereUniqueInput, create: AnalyticsViewCreateInput, update: AnalyticsViewUpdateInput) =>
      prisma.analyticsView.upsert({ where, create, update }),
    findUnique: (where: AnalyticsViewWhereUniqueInput) =>
      prisma.analyticsView.findUnique({ where }),
    findMany: (where: AnalyticsViewWhereInput) =>
      prisma.analyticsView.findMany({ where }),
  },

  // Analytics viewer operations
  viewer: {
    create: (data: AnalyticsViewerCreateInput) =>
      prisma.analyticsViewer.create({ data }),
    upsert: (where: AnalyticsViewerWhereUniqueInput, create: AnalyticsViewerCreateInput, update: AnalyticsViewerUpdateInput) =>
      prisma.analyticsViewer.upsert({ where, create, update }),
    findMany: (where: AnalyticsViewerWhereInput) =>
      prisma.analyticsViewer.findMany({ where }),
    countDistinct: (where: AnalyticsViewerWhereInput, distinctField: string) =>
      prisma.analyticsViewer.findMany({
        where,
        select: { [distinctField]: true },
        distinct: [distinctField as keyof AnalyticsViewer],
      }),
  },

  // Analytics engagement operations
  engagement: {
    create: (data: AnalyticsEngagementCreateInput) =>
      prisma.analyticsEngagement.create({ data }),
    findMany: (where: AnalyticsEngagementWhereInput) =>
      prisma.analyticsEngagement.findMany({ where }),
  },

  // Analytics engagement count operations
  engagementCount: {
    create: (data: AnalyticsEngagementCountCreateInput) =>
      prisma.analyticsEngagementCount.create({ data }),
    update: (where: AnalyticsEngagementCountWhereUniqueInput, data: AnalyticsEngagementCountUpdateInput) =>
      prisma.analyticsEngagementCount.update({ where, data }),
    upsert: (where: AnalyticsEngagementCountWhereUniqueInput, create: AnalyticsEngagementCountCreateInput, update: AnalyticsEngagementCountUpdateInput) =>
      prisma.analyticsEngagementCount.upsert({ where, create, update }),
    findMany: (where: AnalyticsEngagementCountWhereInput) =>
      prisma.analyticsEngagementCount.findMany({ where }),
  },

  // Analytics cache operations
  cache: {
    create: (data: AnalyticsCacheCreateInput) =>
      prisma.analyticsCache.create({ data }),
    update: (where: AnalyticsCacheWhereUniqueInput, data: AnalyticsCacheUpdateInput) =>
      prisma.analyticsCache.update({ where, data }),
    upsert: (where: AnalyticsCacheWhereUniqueInput, create: AnalyticsCacheCreateInput, update: AnalyticsCacheUpdateInput) =>
      prisma.analyticsCache.upsert({ where, create, update }),
    findUnique: (where: AnalyticsCacheWhereUniqueInput) =>
      prisma.analyticsCache.findUnique({ where }),
    delete: (where: AnalyticsCacheWhereUniqueInput) =>
      prisma.analyticsCache.delete({ where }),
  },
};
