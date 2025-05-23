/**
 * Analytics Components Index
 * 
 * Exports all analytics-related components for easy importing.
 * These components provide comprehensive analytics functionality
 * including tracking, reporting, and data visualization.
 */

export { default as AnalyticsProvider } from './AnalyticsProvider.js';
export { default as PageView } from './PageView.js';
export { default as RestaurantAnalytics } from './RestaurantAnalytics.js';
export { default as TrendingRestaurants } from './TrendingRestaurants.js';

// Re-export the analytics context hook for convenience
export { useAnalyticsContext } from './AnalyticsProvider.js';
