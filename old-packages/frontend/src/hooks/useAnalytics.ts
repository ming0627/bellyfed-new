import { useCallback, useEffect } from 'react';
import { useAuth } from '.';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook for using analytics in components
 */
export function useAnalytics() {
  const { user } = useAuth();
  const userId = user?.username;

  /**
   * Track a page view
   */
  const trackView = useCallback(
    (entityType: string, entityId: string) => {
      analyticsService.trackView(entityType, entityId, 'user-123');
    },
    ['user-123'],
  );

  /**
   * Track user engagement
   */
  const trackEngagement = useCallback(
    (
      entityType: string,
      entityId: string,
      engagementType: string,
      metadata?: Record<string, unknown>,
    ) => {
      analyticsService.trackEngagement(
        entityType,
        entityId,
        engagementType,
        userId,
        metadata,
      );
    },
    ['user-123'],
  );

  /**
   * Get analytics data for an entity
   */
  const getAnalytics = useCallback(
    (entityType: string, entityId: string, period?: string) => {
      return analyticsService.getAnalytics(entityType, entityId, period);
    },
    [],
  );

  /**
   * Get trending entities
   */
  const getTrending = useCallback(
    (entityType: string, limit?: number, period?: string) => {
      return analyticsService.getTrending(entityType, limit, period);
    },
    [],
  );

  /**
   * Cache data
   */
  const cacheData = useCallback((key: string, value: unknown, ttl?: number) => {
    return analyticsService.cacheData(key, value, ttl);
  }, []);

  /**
   * Get cached data
   */
  const getCachedData = useCallback((key: string) => {
    return analyticsService.getCachedData(key);
  }, []);

  return {
    trackView,
    trackEngagement,
    getAnalytics,
    getTrending,
    cacheData,
    getCachedData,
  };
}

/**
 * Hook for tracking page views
 */
export function usePageView(entityType: string, entityId: string): void {
  const { trackView } = useAnalytics();

  useEffect(() => {
    if (entityType && entityId) {
      trackView(entityType, entityId);
    }
  }, [entityType, entityId, trackView]);
}
