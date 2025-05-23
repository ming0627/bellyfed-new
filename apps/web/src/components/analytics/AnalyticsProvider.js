/**
 * Analytics Provider Component
 * 
 * Provides analytics context and functionality throughout the application.
 * Handles tracking page views, user engagement, and analytics data collection.
 * 
 * Features:
 * - Page view tracking
 * - User engagement tracking
 * - Analytics data caching
 * - Error handling and retry logic
 * - Performance optimization
 */

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router.js';
import { useAnalytics } from '@bellyfed/hooks';
import { analyticsService } from '../../services/analyticsService.js';

// Analytics Context
const AnalyticsContext = createContext(null);

// Analytics Provider Props
const AnalyticsProvider = ({ 
  children, 
  userId = null,
  enableAutoTracking = true,
  enableDebugMode = false 
}) => {
  const router = useRouter();
  const { trackView, trackEngagement, isLoading, error } = useAnalytics();
  const lastTrackedPage = useRef(null);
  const trackingQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  // Debug logging
  const debugLog = useCallback((message, data = null) => {
    if (enableDebugMode) {
      console.log(`[Analytics] ${message}`, data);
    }
  }, [enableDebugMode]);

  // Process tracking queue
  const processTrackingQueue = useCallback(async () => {
    if (isProcessingQueue.current || trackingQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    debugLog('Processing tracking queue', { queueLength: trackingQueue.current.length });

    try {
      while (trackingQueue.current.length > 0) {
        const event = trackingQueue.current.shift();
        
        if (event.type === 'view') {
          await trackView(event.data);
        } else if (event.type === 'engagement') {
          await trackEngagement(event.data);
        }
        
        debugLog('Processed tracking event', event);
      }
    } catch (error) {
      debugLog('Error processing tracking queue', error);
      // Re-add failed events to queue for retry
      if (trackingQueue.current.length < 10) { // Prevent infinite queue growth
        trackingQueue.current.unshift(...trackingQueue.current.splice(0, 5));
      }
    } finally {
      isProcessingQueue.current = false;
    }
  }, [trackView, trackEngagement, debugLog]);

  // Track page view
  const trackPageView = useCallback(async (path, additionalData = {}) => {
    if (!enableAutoTracking) return;

    const pageData = {
      entityType: 'page',
      entityId: path,
      userId,
      deviceType: typeof window !== 'undefined' ? 
        (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'unknown',
      ...additionalData
    };

    debugLog('Tracking page view', pageData);

    try {
      await trackView(pageData);
    } catch (error) {
      debugLog('Failed to track page view, adding to queue', error);
      trackingQueue.current.push({ type: 'view', data: pageData });
      processTrackingQueue();
    }
  }, [enableAutoTracking, userId, trackView, debugLog, processTrackingQueue]);

  // Track user engagement
  const trackUserEngagement = useCallback(async (entityType, entityId, engagementType, metadata = {}) => {
    const engagementData = {
      entityType,
      entityId,
      userId,
      engagementType,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        ...metadata
      }
    };

    debugLog('Tracking user engagement', engagementData);

    try {
      await trackEngagement(engagementData);
    } catch (error) {
      debugLog('Failed to track engagement, adding to queue', error);
      trackingQueue.current.push({ type: 'engagement', data: engagementData });
      processTrackingQueue();
    }
  }, [userId, trackEngagement, debugLog, processTrackingQueue]);

  // Track restaurant view
  const trackRestaurantView = useCallback((restaurantId, metadata = {}) => {
    return trackUserEngagement('restaurant', restaurantId, 'view', metadata);
  }, [trackUserEngagement]);

  // Track dish view
  const trackDishView = useCallback((dishId, metadata = {}) => {
    return trackUserEngagement('dish', dishId, 'view', metadata);
  }, [trackUserEngagement]);

  // Track search
  const trackSearch = useCallback((query, filters = {}, results = 0) => {
    return trackUserEngagement('search', query, 'search', {
      filters,
      resultCount: results,
      query
    });
  }, [trackUserEngagement]);

  // Track user action
  const trackUserAction = useCallback((action, entityType = 'app', entityId = 'global', metadata = {}) => {
    return trackUserEngagement(entityType, entityId, action, metadata);
  }, [trackUserEngagement]);

  // Auto-track page views on route changes
  useEffect(() => {
    if (!enableAutoTracking) return;

    const handleRouteChange = (url) => {
      // Avoid tracking the same page multiple times
      if (lastTrackedPage.current === url) return;
      
      lastTrackedPage.current = url;
      trackPageView(url);
    };

    // Track initial page load
    if (router.asPath && lastTrackedPage.current !== router.asPath) {
      handleRouteChange(router.asPath);
    }

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, enableAutoTracking, trackPageView]);

  // Process queue periodically
  useEffect(() => {
    if (!enableAutoTracking) return;

    const interval = setInterval(() => {
      if (trackingQueue.current.length > 0) {
        processTrackingQueue();
      }
    }, 5000); // Process queue every 5 seconds

    return () => clearInterval(interval);
  }, [enableAutoTracking, processTrackingQueue]);

  // Context value
  const contextValue = {
    // Tracking functions
    trackPageView,
    trackUserEngagement,
    trackRestaurantView,
    trackDishView,
    trackSearch,
    trackUserAction,
    
    // State
    isLoading,
    error,
    userId,
    
    // Configuration
    enableAutoTracking,
    enableDebugMode,
    
    // Queue info (for debugging)
    queueLength: trackingQueue.current.length,
    isProcessingQueue: isProcessingQueue.current
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics context
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsProvider;
