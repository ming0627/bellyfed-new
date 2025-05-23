import { useCallback, useState } from 'react';
import { analyticsService } from '@bellyfed/services';

/**
 * Interface for analytics view data
 */
export interface AnalyticsViewData {
  /**
   * Total number of views
   */
  viewCount: number;

  /**
   * Number of unique viewers
   */
  uniqueViewers: number;
}

/**
 * Interface for analytics data
 */
export interface AnalyticsData {
  /**
   * View data
   */
  viewData: AnalyticsViewData;

  /**
   * Engagement data by type
   */
  engagementData: Record<string, number>;

  /**
   * Time series data by type
   */
  timeSeriesData: Record<string, number[]>;
}

/**
 * Interface for analytics state
 */
export interface AnalyticsState {
  /**
   * Whether analytics data is loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during analytics operations
   */
  error: Error | null;

  /**
   * Analytics data
   */
  data: AnalyticsData | null;
}

/**
 * Interface for analytics methods
 */
export interface AnalyticsMethods {
  /**
   * Track a page view
   * @param entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId - ID of the entity
   * @param userId - Optional user ID
   * @param deviceType - Optional device type (e.g., 'mobile', 'desktop', 'tablet')
   */
  trackView: (
    entityType: string,
    entityId: string,
    userId?: string,
    deviceType?: string
  ) => Promise<void>;

  /**
   * Track user engagement
   * @param entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId - ID of the entity
   * @param engagementType - Type of engagement (e.g., 'LIKE', 'SHARE', 'COMMENT', 'RANKING')
   * @param userId - Optional user ID
   * @param metadata - Optional additional data
   */
  trackEngagement: (
    entityType: string,
    entityId: string,
    engagementType: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;

  /**
   * Get analytics data for an entity
   * @param entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId - ID of the entity
   * @param period - Optional time period (e.g., 'day', 'week', 'month', 'year')
   */
  getAnalytics: (
    entityType: string,
    entityId: string,
    period?: string
  ) => Promise<void>;

  /**
   * Reset the analytics state
   */
  reset: () => void;
}

/**
 * Hook for tracking and analyzing user interactions
 *
 * @returns Analytics state and methods
 */
export function useAnalytics(): AnalyticsState & AnalyticsMethods {
  const [state, setState] = useState<AnalyticsState>({
    isLoading: false,
    error: null,
    data: null,
  });

  /**
   * Track a page view
   */
  const trackView = useCallback(
    async (
      entityType: string,
      entityId: string,
      userId?: string,
      deviceType?: string
    ): Promise<void> => {
      try {
        await analyticsService.trackView(entityType, entityId, userId, deviceType);
      } catch (error) {
        console.error('Error tracking view:', error);
        // Don't update state or throw - analytics errors shouldn't break the app
      }
    },
    []
  );

  /**
   * Track user engagement
   */
  const trackEngagement = useCallback(
    async (
      entityType: string,
      entityId: string,
      engagementType: string,
      userId?: string,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      try {
        await analyticsService.trackEngagement(
          entityType,
          entityId,
          engagementType,
          userId,
          metadata
        );
      } catch (error) {
        console.error('Error tracking engagement:', error);
        // Don't update state or throw - analytics errors shouldn't break the app
      }
    },
    []
  );

  /**
   * Get analytics data for an entity
   */
  const getAnalytics = useCallback(
    async (
      entityType: string,
      entityId: string,
      period?: string
    ): Promise<void> => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const data = await analyticsService.getAnalytics(
          entityType,
          entityId,
          period
        );

        setState({
          isLoading: false,
          error: null,
          data,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error
            ? error
            : new Error('Failed to get analytics data'),
          data: null,
        }));
      }
    },
    []
  );

  /**
   * Reset the analytics state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    ...state,
    trackView,
    trackEngagement,
    getAnalytics,
    reset,
  };
}
