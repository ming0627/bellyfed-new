/**
 * Restaurant Analytics Component
 * 
 * Displays analytics data for restaurants including views, engagement,
 * popular dishes, peak hours, and trending metrics.
 * 
 * Features:
 * - Real-time analytics data
 * - Interactive charts and graphs
 * - Time period filtering
 * - Export functionality
 * - Performance metrics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from './AnalyticsProvider.js';
import { analyticsService } from '../../services/analyticsService.js';

const RestaurantAnalytics = ({
  restaurantId,
  restaurantName = 'Restaurant',
  showExportButton = true,
  showRealTimeData = true,
  defaultPeriod = '7d',
  className = ''
}) => {
  // State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [realTimeData, setRealTimeData] = useState({});

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Period options
  const periodOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  // Fetch analytics data
  const fetchAnalyticsData = async (period = selectedPeriod) => {
    if (!restaurantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRestaurantAnalytics(restaurantId, {
        period,
        includeEngagement: true,
        includeTrending: true,
        includeComparisons: true
      });

      setAnalyticsData(data);
      
      // Track analytics view
      trackUserEngagement('restaurant', restaurantId, 'analytics_view', {
        period,
        dataPoints: data?.totalViews || 0
      });
    } catch (err) {
      console.error('Error fetching restaurant analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    if (!showRealTimeData || !restaurantId) return;

    try {
      const data = await analyticsService.getRealTimeData(restaurantId);
      setRealTimeData(data);
    } catch (err) {
      console.error('Error fetching real-time data:', err);
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchAnalyticsData(period);
  };

  // Export analytics data
  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportRestaurantAnalytics(restaurantId, {
        period: selectedPeriod,
        format: 'csv'
      });
      
      // Create download link
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${restaurantName}-analytics-${selectedPeriod}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      trackUserEngagement('restaurant', restaurantId, 'analytics_export', {
        period: selectedPeriod,
        format: 'csv'
      });
    } catch (err) {
      console.error('Error exporting analytics:', err);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!analyticsData) return {};

    const {
      totalViews = 0,
      uniqueViews = 0,
      totalEngagement = 0,
      averageTimeOnPage = 0,
      bounceRate = 0,
      conversionRate = 0,
      previousPeriodViews = 0
    } = analyticsData;

    const viewsChange = previousPeriodViews > 0 
      ? ((totalViews - previousPeriodViews) / previousPeriodViews) * 100 
      : 0;

    return {
      totalViews,
      uniqueViews,
      totalEngagement,
      averageTimeOnPage: Math.round(averageTimeOnPage),
      bounceRate: Math.round(bounceRate * 100),
      conversionRate: Math.round(conversionRate * 100),
      viewsChange: Math.round(viewsChange * 10) / 10,
      engagementRate: totalViews > 0 ? Math.round((totalEngagement / totalViews) * 100) : 0
    };
  }, [analyticsData]);

  // Load data on mount and period change
  useEffect(() => {
    fetchAnalyticsData();
  }, [restaurantId]);

  // Set up real-time data polling
  useEffect(() => {
    if (!showRealTimeData) return;

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [showRealTimeData, restaurantId]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => fetchAnalyticsData()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics for {restaurantName}
          </h2>
          {showRealTimeData && realTimeData.activeUsers > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {realTimeData.activeUsers} active users
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          {showExportButton && (
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalViews.toLocaleString()}</p>
            </div>
            {metrics.viewsChange !== 0 && (
              <Badge 
                variant={metrics.viewsChange > 0 ? 'success' : 'destructive'}
                className="text-xs"
              >
                {metrics.viewsChange > 0 ? '+' : ''}{metrics.viewsChange}%
              </Badge>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Unique Views</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.uniqueViews.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.engagementRate}%</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Time on Page</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.averageTimeOnPage}s</p>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
            <p className="text-xl font-bold text-gray-900">{metrics.bounceRate}%</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p className="text-xl font-bold text-gray-900">{metrics.conversionRate}%</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Engagement</p>
            <p className="text-xl font-bold text-gray-900">{metrics.totalEngagement.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Popular Dishes */}
      {analyticsData?.popularDishes && analyticsData.popularDishes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Dishes</h3>
          <div className="space-y-3">
            {analyticsData.popularDishes.slice(0, 5).map((dish, index) => (
              <div key={dish.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{dish.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{dish.views} views</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {dish.engagementRate}% engagement
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RestaurantAnalytics;
