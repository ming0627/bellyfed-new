import React, { useState, useEffect } from 'react';

import { useAnalytics, usePageView } from '../../hooks/useAnalytics';

interface RestaurantAnalyticsProps {
  restaurantId: string;
  restaurantName: string;
}

interface AnalyticsData {
  viewData: {
    viewCount: number;
    uniqueViewers: number;
  };
  engagementData: {
    SHARE?: number;
    CLICK?: number;
    SAVE?: number;
    [key: string]: number | undefined;
  };
}

/**
 * Component for displaying restaurant analytics
 */
export function RestaurantAnalytics({
  restaurantId,
  restaurantName,
}: RestaurantAnalyticsProps): JSX.Element {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('week');
  const { getAnalytics, trackEngagement } = useAnalytics();

  // Track page view when component mounts
  usePageView('RESTAURANT', restaurantId);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics('RESTAURANT', restaurantId, period);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [restaurantId, period, getAnalytics]);

  // Handle period change
  const handlePeriodChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setPeriod(e.target.value);
  };

  // Handle share button click
  const handleShare = (): void => {
    trackEngagement('RESTAURANT', restaurantId, 'SHARE', {
      method: 'button',
      restaurantName,
    });

    // Implement actual sharing functionality here
    alert(`Sharing ${restaurantName}`);
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="restaurant-analytics">
      <div className="analytics-header">
        <h3>Restaurant Analytics</h3>
        <select value={period} onChange={handlePeriodChange}>
          <option value="day">Last 24 hours</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last year</option>
        </select>
      </div>

      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-value">
            {analytics.viewData.viewCount || 0}
          </div>
          <div className="metric-label">Total Views</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {analytics.viewData.uniqueViewers || 0}
          </div>
          <div className="metric-label">Unique Visitors</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {analytics.engagementData.SHARE || 0}
          </div>
          <div className="metric-label">Shares</div>
        </div>
      </div>

      <div className="analytics-actions">
        <button onClick={handleShare} className="share-button">
          Share Restaurant
        </button>
      </div>

      {}
      <style jsx>{`
        .restaurant-analytics {
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .analytics-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .metric-card {
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .analytics-actions {
          display: flex;
          justify-content: flex-end;
        }

        .share-button {
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .share-button:hover {
          background-color: #0060df;
        }
      `}</style>
    </div>
  );
}
