import React, { createContext, useContext, ReactNode } from 'react';

import { useAnalytics } from '../../hooks/useAnalytics';

import PageView from './PageView';

// Create context
const AnalyticsContext = createContext<
  ReturnType<typeof useAnalytics> | undefined
>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  /**
   * Whether to track page views automatically
   * @default true
   */
  trackPageViews?: boolean;
}

/**
 * Provider component for analytics
 * This should be included in the app layout to make analytics available throughout the application
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  trackPageViews = true,
}) => {
  const analytics = useAnalytics();

  return (
    <AnalyticsContext.Provider value={analytics}>
      {trackPageViews && <PageView />}
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook for using analytics in components
 * This is a convenience wrapper around useContext(AnalyticsContext)
 */
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error(
      'useAnalyticsContext must be used within an AnalyticsProvider',
    );
  }
  return context;
};

export default AnalyticsProvider;
