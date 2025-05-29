import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '../../hooks';
import { analyticsService } from '../../services/analyticsService';

interface PageViewProps {
  /**
   * Whether to track the page view automatically
   * @default true
   */
  autoTrack?: boolean;
}

/**
 * Component for tracking page views
 * This should be included in the layout component to track all page views
 */
export const PageView: React.FC<PageViewProps> = ({ autoTrack = true }) => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.username;

  useEffect(() => {
    // Don't track page views during development or if router is not ready
    if (
      (process.env.NODE_ENV === 'development' &&
        !process.env.NEXT_PUBLIC_TRACK_DEV_ANALYTICS) ||
      !router.isReady
    ) {
      return () => {}; // Return empty cleanup function
    }

    // Function to track page view
    const trackPageView = (): void => {
      try {
        analyticsService.trackView('PAGE', router.pathname, 'user-123');
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    // Track page view on mount and route change if autoTrack is enabled
    if (autoTrack) {
      trackPageView();

      // Track page view on route change
      const handleRouteChange = (): void => {
        trackPageView();
      };

      router.events.on('routeChangeComplete', handleRouteChange);

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }

    // Return empty cleanup function for the case when autoTrack is false
    return () => {};
  }, [router, userId, autoTrack, router.isReady, router.pathname]);

  // This component doesn't render anything
  return null;
};

export default PageView;
