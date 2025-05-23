/**
 * Statistics Component
 * 
 * Displays various statistics and metrics in an organized dashboard format.
 * Supports different visualization types and real-time data updates.
 * 
 * Features:
 * - Multiple statistic cards
 * - Trend indicators
 * - Percentage changes
 * - Interactive charts
 * - Real-time updates
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { BarChart } from '../charts/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { analyticsService } from '../../services/analyticsService.js';

const Statistics = ({
  entityType = 'general', // 'general', 'restaurant', 'user', 'dish'
  entityId = null,
  timeframe = 'month',
  showCharts = true,
  showExport = true,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  // State
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Timeframe options
  const timeframes = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  // Metric categories
  const metricCategories = {
    overview: {
      label: 'Overview',
      icon: '📊',
      description: 'General statistics and key metrics'
    },
    engagement: {
      label: 'Engagement',
      icon: '👥',
      description: 'User interaction and engagement metrics'
    },
    performance: {
      label: 'Performance',
      icon: '📈',
      description: 'Performance and growth metrics'
    },
    content: {
      label: 'Content',
      icon: '📝',
      description: 'Content creation and quality metrics'
    }
  };

  // Fetch statistics data
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getStatistics({
        entityType,
        entityId,
        timeframe,
        includeCharts: showCharts
      });

      setStatistics(data);
      
      // Track statistics view
      trackUserEngagement('statistics', entityType, 'view', {
        entityId,
        timeframe,
        metricCount: Object.keys(data.metrics || {}).length
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportStatistics({
        entityType,
        entityId,
        timeframe,
        format: 'csv'
      });

      // Create download link
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistics-${entityType}-${timeframe}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      trackUserEngagement('statistics', entityType, 'export', {
        timeframe,
        format: 'csv'
      });
    } catch (err) {
      console.error('Error exporting statistics:', err);
    }
  };

  // Format number for display
  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value?.toLocaleString() || '0';
  };

  // Get trend indicator
  const getTrendIndicator = (change) => {
    if (!change) return null;
    
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? '↗' : '↘';
    
    return (
      <span className={`text-sm ${color} flex items-center gap-1`}>
        <span>{icon}</span>
        <span>{Math.abs(change).toFixed(1)}%</span>
      </span>
    );
  };

  // Render statistic card
  const renderStatCard = (stat) => {
    return (
      <Card key={stat.id} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stat.value)}
            </div>
          </div>
          <div className="text-2xl">{stat.icon}</div>
        </div>
        
        <div className="flex items-center justify-between">
          {stat.change && getTrendIndicator(stat.change)}
          {stat.subtitle && (
            <span className="text-sm text-gray-500">{stat.subtitle}</span>
          )}
        </div>
        
        {stat.description && (
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        )}
      </Card>
    );
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchStatistics();
  }, [entityType, entityId, timeframe]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Statistics</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchStatistics} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Statistics Available</p>
          <p className="text-sm">No data available for the selected criteria</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Statistics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            {statistics.title || `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Statistics`}
          </p>
        </div>

        <div className="flex gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {timeframes.map(tf => (
              <option key={tf.id} value={tf.id}>
                {tf.label}
              </option>
            ))}
          </select>

          {showExport && (
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              Export Data
            </Button>
          )}

          <Button
            onClick={fetchStatistics}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {statistics.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.summary.map(renderStatCard)}
        </div>
      )}

      {/* Metric Categories */}
      {statistics.categories && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(metricCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedMetric === key
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Selected Category Metrics */}
          {statistics.categories[selectedMetric] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.categories[selectedMetric].map(renderStatCard)}
            </div>
          )}
        </Card>
      )}

      {/* Charts */}
      {showCharts && statistics.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statistics.charts.map((chart, index) => (
            <BarChart
              key={index}
              data={chart.data}
              title={chart.title}
              orientation={chart.orientation || 'vertical'}
              colorScheme={chart.colorScheme || 'orange'}
              height={chart.height || 300}
            />
          ))}
        </div>
      )}

      {/* Detailed Metrics */}
      {statistics.detailed && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Detailed Metrics
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Value</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                {statistics.detailed.map((metric, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{metric.icon}</span>
                        <span className="font-medium">{metric.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-gray-900">
                        {formatNumber(metric.value)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getTrendIndicator(metric.change)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {metric.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Last Updated */}
      {statistics.lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(statistics.lastUpdated).toLocaleString()}
          {autoRefresh && (
            <span className="ml-2">
              • Auto-refresh enabled ({Math.floor(refreshInterval / 60000)}min)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;
