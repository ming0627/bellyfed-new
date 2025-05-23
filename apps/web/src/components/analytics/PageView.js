/**
 * Page View Component
 * 
 * Automatically tracks page views when mounted.
 * Can be used to track specific page sections or custom page events.
 * 
 * Features:
 * - Automatic page view tracking
 * - Custom page metadata
 * - Performance tracking
 * - Error handling
 * - Conditional tracking
 */

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router.js';
import { useAnalyticsContext } from './AnalyticsProvider.js';

const PageView = ({
  // Page identification
  pageName = null,
  pageCategory = 'general',
  
  // Custom metadata
  metadata = {},
  
  // Tracking options
  trackOnMount = true,
  trackOnUnmount = false,
  trackTimeOnPage = true,
  
  // Performance tracking
  trackPerformance = true,
  
  // Conditional tracking
  shouldTrack = true,
  
  // Custom tracking data
  customData = {},
  
  // Debug mode
  debug = false
}) => {
  const router = useRouter();
  const { trackPageView, trackUserEngagement, enableDebugMode } = useAnalyticsContext();
  const mountTime = useRef(null);
  const hasTrackedMount = useRef(false);
  const performanceData = useRef({});

  // Debug logging
  const debugLog = (message, data = null) => {
    if (debug || enableDebugMode) {
      console.log(`[PageView] ${message}`, data);
    }
  };

  // Get page name from router if not provided
  const getPageName = () => {
    if (pageName) return pageName;
    
    const path = router.asPath;
    const pathname = router.pathname;
    
    // Extract meaningful page name from path
    if (path === '/') return 'home';
    if (pathname.includes('[country]')) {
      const parts = path.split('/').filter(Boolean);
      return parts.length > 1 ? parts.slice(1).join('-') : parts[0] || 'country-home';
    }
    
    return path.replace(/^\//, '').replace(/\//g, '-') || 'unknown';
  };

  // Collect performance data
  const collectPerformanceData = () => {
    if (!trackPerformance || typeof window === 'undefined') return {};

    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const performanceMetrics = {
        loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : null,
        domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : null,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        connectionType: navigator.connection?.effectiveType || 'unknown',
        deviceMemory: navigator.deviceMemory || null,
        hardwareConcurrency: navigator.hardwareConcurrency || null
      };

      debugLog('Collected performance data', performanceMetrics);
      return performanceMetrics;
    } catch (error) {
      debugLog('Error collecting performance data', error);
      return {};
    }
  };

  // Track page view with all data
  const trackPage = async (eventType = 'view') => {
    if (!shouldTrack) {
      debugLog('Tracking disabled, skipping');
      return;
    }

    const currentPageName = getPageName();
    const currentPath = router.asPath;
    
    // Collect all tracking data
    const trackingData = {
      pageName: currentPageName,
      pageCategory,
      path: currentPath,
      pathname: router.pathname,
      query: router.query,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : null,
      timestamp: new Date().toISOString(),
      eventType,
      ...metadata,
      ...customData
    };

    // Add performance data if enabled
    if (trackPerformance && eventType === 'view') {
      trackingData.performance = collectPerformanceData();
      performanceData.current = trackingData.performance;
    }

    // Add time on page for unmount events
    if (eventType === 'unload' && mountTime.current && trackTimeOnPage) {
      trackingData.timeOnPage = Date.now() - mountTime.current;
      trackingData.timeOnPageSeconds = Math.round(trackingData.timeOnPage / 1000);
    }

    debugLog(`Tracking page ${eventType}`, trackingData);

    try {
      if (eventType === 'view') {
        await trackPageView(currentPath, trackingData);
      } else {
        await trackUserEngagement('page', currentPageName, eventType, trackingData);
      }
    } catch (error) {
      debugLog(`Error tracking page ${eventType}`, error);
    }
  };

  // Track page view on mount
  useEffect(() => {
    if (!trackOnMount || hasTrackedMount.current) return;

    mountTime.current = Date.now();
    hasTrackedMount.current = true;
    
    debugLog('Component mounted, tracking page view');
    
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      trackPage('view');
    }, 100);

    return () => clearTimeout(timer);
  }, [trackOnMount, shouldTrack]);

  // Track page unload on unmount
  useEffect(() => {
    if (!trackOnUnmount) return;

    return () => {
      debugLog('Component unmounting, tracking page unload');
      trackPage('unload');
    };
  }, [trackOnUnmount]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (hasTrackedMount.current) {
        debugLog('Route changed, tracking new page view', { url });
        mountTime.current = Date.now();
        trackPage('view');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Track visibility changes (page focus/blur)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      const eventType = document.hidden ? 'blur' : 'focus';
      debugLog(`Page visibility changed: ${eventType}`);
      
      trackUserEngagement('page', getPageName(), eventType, {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: new Date().toISOString()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default PageView;
