/**
 * Analytics Service
 * This service provides methods for tracking and analyzing user interactions
 * Uses EventBridge for event-driven architecture and PostgreSQL for data storage
 */

import { ApiService } from './api.js';

/**
 * Analytics Service class
 */
class AnalyticsService {
  constructor() {
    this.BASE_PATH = '/api/proxy/analytics';
    this.CACHE_PATH = '/api/proxy/cache';
    this.sessionId = null;

    // Initialize session ID if in browser
    if (typeof window !== 'undefined') {
      this.initializeSessionId();
    }
  }

  /**
   * Initialize session ID from cookie or create a new one
   * @private
   */
  initializeSessionId() {
    // Get session ID from cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('bellyfed-session=')
    );

    if (sessionCookie) {
      this.sessionId = sessionCookie.split('=')[1];
    }
  }

  /**
   * Get current page information
   * @private
   * @returns {Object} Page information
   */
  getPageInfo() {
    if (typeof window === 'undefined') {
      return { path: '', title: '', queryParams: {} };
    }

    const path = window.location.pathname;
    const title = document.title;

    // Parse query parameters
    const queryParams = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return { path, title, queryParams };
  }

  /**
   * Track a page view
   * @param {string} entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param {string} entityId - ID of the entity
   * @param {string} [userId] - Optional user ID
   * @param {string} [deviceType] - Optional device type (e.g., 'mobile', 'desktop', 'tablet')
   * @returns {Promise<void>} A promise that resolves when the view is tracked
   */
  async trackView(entityType, entityId, userId, deviceType) {
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
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw - analytics errors shouldn't break the app
    }
  }

  /**
   * Track user engagement
   * @param {string} entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param {string} entityId - ID of the entity
   * @param {string} engagementType - Type of engagement (e.g., 'LIKE', 'SHARE', 'COMMENT', 'RANKING')
   * @param {string} [userId] - Optional user ID
   * @param {Object} [metadata] - Optional additional data
   * @returns {Promise<void>} A promise that resolves when the engagement is tracked
   */
  async trackEngagement(entityType, entityId, engagementType, userId, metadata) {
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
    } catch (error) {
      console.error('Error tracking engagement:', error);
      // Don't throw - analytics errors shouldn't break the app
    }
  }

  /**
   * Get analytics data for an entity
   * @param {string} entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param {string} entityId - ID of the entity
   * @param {string} [period] - Optional time period (e.g., 'day', 'week', 'month', 'year')
   * @returns {Promise<Object>} A promise that resolves to the analytics data
   */
  async getAnalytics(entityType, entityId, period) {
    try {
      const params = new URLSearchParams({
        entityType,
        entityId,
      });

      if (period) {
        params.append('period', period);
      }

      return await ApiService.get(
        `${this.BASE_PATH}/get-analytics?${params.toString()}`
      );
    } catch (error) {
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
   * @param {string} entityType - Type of entity (e.g., 'RESTAURANT', 'DISH')
   * @param {number} [limit=10] - Maximum number of results
   * @param {string} [period] - Optional time period (e.g., 'day', 'week', 'month')
   * @returns {Promise<Array>} A promise that resolves to the trending entities
   */
  async getTrending(entityType, limit = 10, period) {
    try {
      const params = new URLSearchParams({
        entityType,
        limit: limit.toString(),
      });

      if (period) {
        params.append('period', period);
      }

      const response = await ApiService.get(
        `${this.BASE_PATH}/get-trending?${params.toString()}`
      );
      return response.trending || [];
    } catch (error) {
      console.error('Error getting trending entities:', error);
      return [];
    }
  }

  /**
   * Cache data
   * @param {string} key - Cache key
   * @param {*} value - Data to cache
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {Promise<void>} A promise that resolves when the data is cached
   */
  async cacheData(key, value, ttl) {
    try {
      await ApiService.post(`${this.CACHE_PATH}/cache-data`, {
        key,
        value,
        ttl,
      });
    } catch (error) {
      console.error('Error caching data:', error);
      // Don't throw - cache errors shouldn't break the app
    }
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<*>} A promise that resolves to the cached data
   */
  async getCachedData(key) {
    try {
      const response = await ApiService.get(
        `${this.CACHE_PATH}/get-cached-data?key=${key}`
      );
      return response.value;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Get device type based on user agent
   * @private
   * @returns {string} Device type
   */
  getDeviceType() {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }

    if (
      /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(
        userAgent
      )
    ) {
      return 'mobile';
    }

    return 'desktop';
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
