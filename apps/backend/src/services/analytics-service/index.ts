/**
 * Analytics Service
 *
 * This service handles analytics operations including:
 * - Tracking page views
 * - Tracking user engagement
 * - Getting analytics data
 * - Getting trending content
 * - Caching analytics data
 *
 * It uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to update unique viewers count
const updateUniqueViewersCount = async (entityType: string, entityId: string): Promise<void> => {
  // Get all unique viewers for this entity
  const uniqueViewers = await prisma.analyticsViewer.findMany({
    where: {
      entityType,
      entityId,
    },
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  // Update the view record with the count
  await prisma.analyticsView.update({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
    data: {
      uniqueViewers: uniqueViewers.length,
      lastUpdated: new Date(),
    },
  });
};

// Helper function to get entity views
const getEntityViews = async (entityType: string, entityId: string): Promise<any> => {
  const view = await prisma.analyticsView.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
  });

  return view || {
    viewCount: 0,
    uniqueViewers: 0,
    lastUpdated: new Date(),
  };
};

// Helper function to get entity engagement
const getEntityEngagement = async (entityType: string, entityId: string): Promise<Record<string, number>> => {
  const engagementCounts = await prisma.analyticsEngagementCount.findMany({
    where: {
      entityType,
      entityId,
    },
  });

  // Transform the results into a more usable format
  const result: Record<string, number> = {};
  engagementCounts.forEach((item) => {
    result[item.engagementType] = item.count;
  });

  return result;
};

// Helper function to get time series data
const getTimeSeriesData = async (entityType: string, entityId: string, period: string): Promise<any> => {
  // Calculate date range based on period
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7); // Default to week
  }

  // Get all viewers in the date range
  const viewers = await prisma.analyticsViewer.findMany({
    where: {
      entityType,
      entityId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Group viewers by date
  const viewersByDate: Record<string, string[]> = {};
  viewers.forEach((viewer) => {
    const dateStr = viewer.date.toISOString().split('T')[0];
    if (dateStr && !viewersByDate[dateStr]) {
      viewersByDate[dateStr] = [];
    }
    if (dateStr) {
      if (!viewersByDate[dateStr]) {
        viewersByDate[dateStr] = [];
      }
      viewersByDate[dateStr]!.push(viewer.userId);
    }
  });

  // Create time series data
  const timeSeriesData: Record<string, any> = {};

  // Initialize all dates in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateStr) {
      timeSeriesData[dateStr] = {
        views: 0,
        uniqueViewers: 0,
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Fill in actual data
  Object.keys(viewersByDate).forEach((dateStr) => {
    if (timeSeriesData[dateStr] && viewersByDate[dateStr]) {
      timeSeriesData[dateStr].views = viewersByDate[dateStr]!.length;
      timeSeriesData[dateStr].uniqueViewers = new Set(viewersByDate[dateStr]!).size;
    }
  });

  return timeSeriesData;
};

// Helper function to get trending entities
const getTrendingEntities = async (entityType: string, limit: number, period?: string): Promise<any[]> => {
  // Calculate date range if period is specified
  let startDate: Date | undefined;
  if (period) {
    const endDate = new Date();
    startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7); // Default to week
    }
  }

  // Get trending entities
  const views = await prisma.analyticsView.findMany({
    where: {
      entityType,
      ...(startDate && {
        lastUpdated: {
          gte: startDate,
        },
      }),
    },
    orderBy: {
      viewCount: 'desc',
    },
    take: limit,
  });

  return views.map((view) => ({
    entityId: view.entityId,
    viewCount: view.viewCount,
    uniqueViewers: view.uniqueViewers,
    lastUpdated: view.lastUpdated,
  }));
};

// Track view
export interface TrackViewParams {
  entityType: string;
  entityId: string;
  userId?: string;
  deviceType?: string;
}

export const trackView = async (params: TrackViewParams): Promise<{ viewCount: number }> => {
  try {
    const { entityType, entityId, userId, deviceType } = params;

    // Increment view count
    const view = await prisma.analyticsView.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      update: {
        viewCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        id: uuidv4(),
        entityType,
        entityId,
        viewCount: 1,
        uniqueViewers: 0,
        lastUpdated: new Date(),
      },
    });

    // Track unique viewer if userId is provided
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.analyticsViewer.upsert({
        where: {
          entityType_entityId_userId_date: {
            entityType,
            entityId,
            userId,
            date: today,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          entityType,
          entityId,
          userId,
          date: today,
        },
      });

      // Update unique viewers count
      await updateUniqueViewersCount(entityType, entityId);
    }

    return { viewCount: view.viewCount };
  } catch (error) {
    console.error('Error tracking view:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to track view',
    });
  }
};

// Track engagement
export interface TrackEngagementParams {
  entityType: string;
  entityId: string;
  userId?: string;
  engagementType: string;
  metadata?: Record<string, unknown>;
}

export const trackEngagement = async (params: TrackEngagementParams): Promise<{ engagementId: string; count: number }> => {
  try {
    const { entityType, entityId, userId, engagementType, metadata } = params;

    // Create engagement record
    const engagement = await prisma.analyticsEngagement.create({
      data: {
        id: uuidv4(),
        entityType,
        entityId,
        userId: userId || 'anonymous',
        engagementType,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
        timestamp: new Date(),
      },
    });

    // Increment engagement count
    const engagementCount = await prisma.analyticsEngagementCount.upsert({
      where: {
        entityType_entityId_engagementType: {
          entityType,
          entityId,
          engagementType,
        },
      },
      update: {
        count: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        id: uuidv4(),
        entityType,
        entityId,
        engagementType,
        count: 1,
        lastUpdated: new Date(),
      },
    });

    return { engagementId: engagement.id, count: engagementCount.count };
  } catch (error) {
    console.error('Error tracking engagement:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to track engagement',
    });
  }
};

// Cache data
export interface CacheDataParams {
  key: string;
  value: unknown;
  ttl?: number;
}

export const cacheData = async (params: CacheDataParams): Promise<{ key: string }> => {
  try {
    const { key, value, ttl } = params;

    // Calculate expiration date if TTL is provided
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null;

    // Cache the data
    await prisma.analyticsCache.upsert({
      where: { key },
      update: {
        value: value as any,
        lastUpdated: new Date(),
        expiresAt: expiresAt,
      },
      create: {
        id: uuidv4(),
        key,
        value: value as any,
        lastUpdated: new Date(),
        expiresAt: expiresAt,
      },
    });

    return { key };
  } catch (error) {
    console.error('Error caching data:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to cache data',
    });
  }
};

// Get analytics
export interface GetAnalyticsParams {
  entityType: string;
  entityId: string;
  period?: string;
}

export const getAnalytics = async (params: GetAnalyticsParams): Promise<any> => {
  try {
    const { entityType, entityId, period } = params;

    // Get view data
    const viewData = await getEntityViews(entityType, entityId);

    // Get engagement data
    const engagementData = await getEntityEngagement(entityType, entityId);

    // Get time series data if period is specified
    let timeSeriesData = {};
    if (period) {
      timeSeriesData = await getTimeSeriesData(entityType, entityId, period);
    }

    return {
      entityType,
      entityId,
      viewData,
      engagementData,
      timeSeriesData,
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get analytics',
    });
  }
};

// Get trending
export interface GetTrendingParams {
  entityType: string;
  limit?: number;
  period?: string;
}

export const getTrending = async (params: GetTrendingParams): Promise<any> => {
  try {
    const { entityType, limit = 10, period } = params;

    // Get trending entities
    const trendingEntities = await getTrendingEntities(entityType, limit, period);

    return {
      entityType,
      trending: trendingEntities,
    };
  } catch (error) {
    console.error('Error getting trending:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get trending',
    });
  }
};

// Get cached data
export interface GetCachedDataParams {
  key: string;
}

export const getCachedData = async (params: GetCachedDataParams): Promise<any> => {
  try {
    const { key } = params;

    // Get cached data
    const cachedData = await prisma.analyticsCache.findUnique({
      where: { key },
    });

    if (!cachedData) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Cached data not found',
      });
    }

    // Check if data is expired
    if (cachedData.expiresAt && cachedData.expiresAt < new Date()) {
      // Delete expired data
      await prisma.analyticsCache.delete({
        where: { key },
      });

      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Cached data has expired',
      });
    }

    return {
      key,
      value: cachedData.value,
      lastUpdated: cachedData.lastUpdated,
    };
  } catch (error) {
    console.error('Error getting cached data:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get cached data',
    });
  }
};
