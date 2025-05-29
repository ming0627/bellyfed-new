import { ApiService } from './api';

/**
 * Service for interacting with the analytics API
 * Uses EventBridge for event-driven architecture and PostgreSQL for data storage
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly BASE_PATH = '/api/proxy/analytics';
  private readonly CACHE_PATH = '/api/proxy/cache';
  private sessionId: string | null = null;

  private constructor() {
    // Initialize session ID if in browser
    if (typeof window !== 'undefined') {
      this.initializeSessionId();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize session ID from cookie or create a new one
   */
  private initializeSessionId(): void {
    // Get session ID from cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('bellyfed-session='),
    );

    if (sessionCookie) {
      this.sessionId = sessionCookie.split('=')[1];
    }
  }

  /**
   * Get current page information
   */
  private getPageInfo(): {
    path: string;
    title: string;
    queryParams: Record<string, string>;
  } {
    if (typeof window === 'undefined') {
      return { path: '', title: '', queryParams: {} };
    }

    const path = window.location.pathname;
    const title = document.title;

    // Parse query parameters
    const queryParams: Record<string, string> = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return { path, title, queryParams };
  }

  /**
   * Track a page view
   * @param entityType Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId ID of the entity
   * @param userId Optional user ID
   * @param deviceType Optional device type (e.g., 'mobile', 'desktop', 'tablet')
   */
  public async trackView(
    entityType: string,
    entityId: string,
    userId?: string,
    deviceType?: string,
  ): Promise<void> {
    try {
      const pageInfo = this.getPageInfo();

      await ApiService.post(`${this.BASE_PATH}/track-view`, {
        entityType,
        entityId,
        userId,
        sessionId: this.sessionId,
        deviceType: deviceType || this.getDeviceType(),
        pagePath: pageInfo.path,
        pageTitle: pageInfo.title,
        queryParams: pageInfo.queryParams,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error('Error tracking view:', error);
      // Don't throw - analytics errors shouldn't break the app
    }
  }

  /**
   * Track user engagement
   * @param entityType Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId ID of the entity
   * @param engagementType Type of engagement (e.g., 'LIKE', 'SHARE', 'COMMENT', 'RANKING')
   * @param userId Optional user ID
   * @param metadata Optional additional data
   */
  public async trackEngagement(
    entityType: string,
    entityId: string,
    engagementType: string,
    userId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const pageInfo = this.getPageInfo();

      await ApiService.post(`${this.BASE_PATH}/track-engagement`, {
        entityType,
        entityId,
        engagementType,
        userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        pagePath: pageInfo.path,
        metadata: {
          ...metadata,
          pageTitle: pageInfo.title,
          queryParams: pageInfo.queryParams,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error('Error tracking engagement:', error);
      // Don't throw - analytics errors shouldn't break the app
    }
  }

  /**
   * Get analytics data for an entity
   * @param entityType Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param entityId ID of the entity
   * @param period Optional time period (e.g., 'day', 'week', 'month', 'year')
   */
  // Define return type for analytics data
  public async getAnalytics(
    entityType: string,
    entityId: string,
    period?: string,
  ): Promise<{
    viewData: { viewCount: number; uniqueViewers: number };
    engagementData: Record<string, number>;
    timeSeriesData: Record<string, number[]>;
  }> {
    try {
      const params = new URLSearchParams({
        entityType,
        entityId,
      });

      if (period) {
        params.append('period', period);
      }

      return await ApiService.get(
        `${this.BASE_PATH}/get-analytics?${params.toString()}`,
      );
    } catch (error: unknown) {
      console.error('Error getting analytics:', error);
      return {
        viewData: { viewCount: 0, uniqueViewers: 0 },
        engagementData: {},
        timeSeriesData: {},
      };
    }
  }

  /**
   * Get trending entities
   * @param entityType Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param limit Maximum number of results
   * @param period Optional time period (e.g., 'day', 'week', 'month')
   */
  public async getTrending(
    entityType: string,
    limit: number = 10,
    period?: string,
  ): Promise<Array<Record<string, unknown>>> {
    try {
      const params = new URLSearchParams({
        entityType,
        limit: limit.toString(),
      });

      if (period) {
        params.append('period', period);
      }

      const response = await ApiService.get<{
        trending: Array<Record<string, unknown>>;
      }>(`${this.BASE_PATH}/get-trending?${params.toString()}`);
      return response.trending || [];
    } catch (error: unknown) {
      console.error('Error getting trending entities:', error);
      return [];
    }
  }

  /**
   * Cache data
   * @param key Cache key
   * @param value Data to cache
   * @param ttl Time to live in seconds (optional)
   */
  public async cacheData(
    key: string,
    value: unknown,
    ttl?: number,
  ): Promise<void> {
    try {
      await ApiService.post(`${this.CACHE_PATH}/cache-data`, {
        key,
        value,
        ttl,
      });
    } catch (error: unknown) {
      console.error('Error caching data:', error);
      // Don't throw - cache errors shouldn't break the app
    }
  }

  /**
   * Get cached data
   * @param key Cache key
   */
  public async getCachedData(key: string): Promise<unknown> {
    try {
      const response = await ApiService.get<{ value: unknown }>(
        `${this.CACHE_PATH}/get-cached-data?key=${key}`,
      );
      return response.value;
    } catch (error: unknown) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Get device type based on user agent
   */
  private getDeviceType(): string {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }

    if (
      /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(
        userAgent,
      )
    ) {
      return 'mobile';
    }

    return 'desktop';
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
