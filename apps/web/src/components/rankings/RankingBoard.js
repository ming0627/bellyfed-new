/**
 * Ranking Board Component
 * 
 * Displays comprehensive ranking boards with multiple categories.
 * Shows top performers across different metrics and time periods.
 * 
 * Features:
 * - Multiple ranking categories (dishes, restaurants, users)
 * - Time period filtering
 * - Interactive leaderboards
 * - Trend indicators and changes
 * - Real-time updates
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { RankingCard } from './RankingCard.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const RankingBoard = ({
  categories = ['dishes', 'restaurants', 'users'],
  showTimeFilter = true,
  showTrends = true,
  showViewAll = true,
  itemsPerCategory = 5,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  // State
  const [rankingData, setRankingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Time periods
  const timePeriods = [
    { id: 'today', label: 'Today', icon: '📅' },
    { id: 'week', label: 'This Week', icon: '📊' },
    { id: 'month', label: 'This Month', icon: '📈' },
    { id: 'year', label: 'This Year', icon: '🏆' },
    { id: 'all', label: 'All Time', icon: '⭐' }
  ];

  // Category configurations
  const categoryConfigs = {
    dishes: {
      title: 'Top Dishes',
      icon: '🍽️',
      gradientFrom: 'orange-500',
      gradientTo: 'orange-600',
      valueLabel: 'avg rating',
      linkPath: '/dishes'
    },
    restaurants: {
      title: 'Top Restaurants',
      icon: '🏪',
      gradientFrom: 'blue-500',
      gradientTo: 'blue-600',
      valueLabel: 'avg rating',
      linkPath: '/restaurants'
    },
    users: {
      title: 'Top Reviewers',
      icon: '👥',
      gradientFrom: 'green-500',
      gradientTo: 'green-600',
      valueLabel: 'reviews',
      linkPath: '/users'
    },
    locations: {
      title: 'Top Areas',
      icon: '📍',
      gradientFrom: 'purple-500',
      gradientTo: 'purple-600',
      valueLabel: 'restaurants',
      linkPath: '/locations'
    },
    cuisines: {
      title: 'Top Cuisines',
      icon: '🌍',
      gradientFrom: 'indigo-500',
      gradientTo: 'indigo-600',
      valueLabel: 'dishes',
      linkPath: '/cuisines'
    }
  };

  // Fetch ranking data
  const fetchRankingData = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await analyticsService.getRankingBoard({
        categories,
        period: selectedPeriod,
        limit: itemsPerCategory,
        includeTrends: showTrends,
        country
      });

      setRankingData(data);
      
      // Track ranking board view
      trackUserEngagement('rankings', 'board', 'view', {
        categories,
        period: selectedPeriod,
        country
      });
    } catch (err) {
      console.error('Error fetching ranking data:', err);
      setError(err.message || 'Failed to load ranking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    trackUserEngagement('rankings', 'board', 'period_change', {
      newPeriod: period,
      previousPeriod: selectedPeriod
    });
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    trackUserEngagement('rankings', 'board', 'category_click', {
      category,
      period: selectedPeriod
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchRankingData(true);
  };

  // Get country link
  const getCountryLink = (path) => {
    return `/${country}${path}`;
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchRankingData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedPeriod]);

  // Load data on mount and period change
  useEffect(() => {
    fetchRankingData();
  }, [selectedPeriod]);

  if (loading && Object.keys(rankingData).length === 0) {
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
          <p className="text-lg font-semibold mb-2">Error Loading Rankings</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => fetchRankingData()} 
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
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🏆 Ranking Board
          </h2>
          <p className="text-gray-600 mt-1">
            Top performers across different categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </div>
          )}
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Period Filter */}
      {showTimeFilter && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {timePeriods.map(period => (
              <button
                key={period.id}
                onClick={() => handlePeriodChange(period.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${selectedPeriod === period.id
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{period.icon}</span>
                <span>{period.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Ranking Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {categories.map(category => {
          const config = categoryConfigs[category];
          const data = rankingData[category];
          
          if (!config || !data) return null;

          return (
            <div key={category} onClick={() => handleCategoryClick(category)}>
              <RankingCard
                title={config.title}
                viewAllLink={showViewAll ? getCountryLink(config.linkPath) : null}
                viewAllLabel={`View all ${config.title.toLowerCase()}`}
                icon={config.icon}
                gradientFrom={config.gradientFrom}
                gradientTo={config.gradientTo}
                items={data.items || []}
                itemValueLabel={config.valueLabel}
                type={category.slice(0, -1)} // Remove 's' from plural
                getCountryLink={getCountryLink}
                className="h-full"
              />
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {Object.keys(rankingData).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Summary Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => {
              const config = categoryConfigs[category];
              const data = rankingData[category];
              
              if (!config || !data) return null;

              return (
                <div key={category} className="text-center">
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.total?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total {config.title}
                  </p>
                  {showTrends && data.trend && (
                    <div className={`text-xs mt-1 ${
                      data.trend.direction === 'up' ? 'text-green-600' : 
                      data.trend.direction === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {data.trend.direction === 'up' ? '↗' : 
                       data.trend.direction === 'down' ? '↘' : '→'} 
                      {data.trend.percentage}% vs last period
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Featured Highlights */}
      {rankingData.highlights && rankingData.highlights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✨ Featured Highlights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankingData.highlights.map((highlight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{highlight.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{highlight.title}</h4>
                    <p className="text-sm text-gray-600">{highlight.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{highlight.description}</p>
                {highlight.link && (
                  <Link href={getCountryLink(highlight.link)}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Learn More
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleString()}
        {autoRefresh && (
          <span className="ml-2">• Auto-refresh enabled</span>
        )}
      </div>
    </div>
  );
};

export default RankingBoard;
