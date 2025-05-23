/**
 * Ranking Board Component
 * 
 * Displays comprehensive ranking boards across multiple categories.
 * Shows top performers with filtering, trends, and detailed metrics.
 * 
 * Features:
 * - Multi-category rankings (dishes, restaurants, users)
 * - Time-based filtering
 * - Trend indicators
 * - Interactive leaderboards
 * - Real-time updates
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const RankingBoard = ({
  categories = ['dishes', 'restaurants', 'users'],
  showTimeFilter = true,
  showTrends = true,
  showViewAll = true,
  itemsPerCategory = 10,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  // State
  const [rankingData, setRankingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week');
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Time filter options
  const timeframes = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  // Category configurations
  const categoryConfigs = {
    dishes: {
      title: 'Top Dishes',
      icon: '🍽️',
      description: 'Most popular and highest-rated dishes',
      linkPrefix: 'dishes'
    },
    restaurants: {
      title: 'Top Restaurants',
      icon: '🏪',
      description: 'Best performing restaurants',
      linkPrefix: 'restaurants'
    },
    users: {
      title: 'Top Foodies',
      icon: '👥',
      description: 'Most active and influential users',
      linkPrefix: 'users'
    },
    cuisines: {
      title: 'Top Cuisines',
      icon: '🌍',
      description: 'Most popular cuisine types',
      linkPrefix: 'cuisines'
    }
  };

  // Fetch ranking data
  const fetchRankingData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRankingBoard({
        categories,
        timeframe,
        limit: itemsPerCategory,
        includeTrends: showTrends
      });

      setRankingData(data);
      
      // Track ranking board view
      trackUserEngagement('rankings', 'board', 'view', {
        categories,
        timeframe,
        itemsPerCategory
      });
    } catch (err) {
      console.error('Error fetching ranking data:', err);
      setError(err.message || 'Failed to load ranking data');
    } finally {
      setLoading(false);
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    trackUserEngagement('rankings', 'board', 'category_switch', {
      category,
      timeframe
    });
  };

  // Handle item click
  const handleItemClick = (item, category, rank) => {
    trackUserEngagement('rankings', 'board', 'item_click', {
      category,
      itemId: item.id,
      rank,
      timeframe
    });
  };

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    if (!trend || !showTrends) return null;
    
    const { change, direction } = trend;
    if (!change) return null;

    const isPositive = direction === 'up';
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? '↗' : '↘';
    
    return (
      <span className={`text-xs ${color} flex items-center gap-1`}>
        <span>{icon}</span>
        <span>{Math.abs(change)}</span>
      </span>
    );
  };

  // Render ranking item
  const renderRankingItem = (item, index, category) => {
    const config = categoryConfigs[category];
    const rank = index + 1;
    const trend = item.trend;

    return (
      <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className={`font-bold text-lg ${
            rank === 1 ? 'text-yellow-600' :
            rank === 2 ? 'text-gray-500' :
            rank === 3 ? 'text-orange-600' :
            'text-gray-400'
          }`}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
          </span>
        </div>

        {/* Image */}
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/${country}/${config.linkPrefix}/${item.id}`}>
            <h4 
              className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer truncate"
              onClick={() => handleItemClick(item, category, rank)}
            >
              {item.name}
            </h4>
          </Link>
          {item.subtitle && (
            <p className="text-sm text-gray-600 truncate">{item.subtitle}</p>
          )}
        </div>

        {/* Metrics */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-2">
            {item.score && (
              <span className="font-bold text-gray-900">
                {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
              </span>
            )}
            {getTrendIndicator(trend)}
          </div>
          {item.metric && (
            <p className="text-xs text-gray-500">{item.metric}</p>
          )}
        </div>
      </div>
    );
  };

  // Render category section
  const renderCategorySection = (category) => {
    const config = categoryConfigs[category];
    const data = rankingData[category] || [];

    if (!config) return null;

    return (
      <Card key={category} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {config.title}
              </h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          
          {showViewAll && (
            <Link href={`/${country}/rankings/${category}`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>

        {data.length > 0 ? (
          <div className="space-y-1">
            {data.map((item, index) => renderRankingItem(item, index, category))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No ranking data available</p>
          </div>
        )}
      </Card>
    );
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchRankingData();
  }, [timeframe]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchRankingData, refreshInterval);
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
          <p className="text-lg font-semibold mb-2">Error Loading Rankings</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchRankingData} 
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🏆 Ranking Board
          </h2>
          <p className="text-gray-600 mt-1">
            Top performers across all categories
          </p>
        </div>

        {showTimeFilter && (
          <div className="flex gap-3">
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

            <Button
              onClick={fetchRankingData}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Category Tabs (Mobile) */}
      <div className="lg:hidden">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {categories.map(category => {
            const config = categoryConfigs[category];
            return config && (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${activeCategory === category
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{config.icon}</span>
                <span>{config.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Content (Mobile) */}
        {renderCategorySection(activeCategory)}
      </div>

      {/* All Categories (Desktop) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {categories.map(renderCategorySection)}
        </div>
      </div>

      {/* Summary Stats */}
      {Object.keys(rankingData).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Summary Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => {
              const config = categoryConfigs[category];
              const data = rankingData[category] || [];
              
              return config && (
                <div key={category} className="text-center">
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                  <div className="text-sm text-gray-600">{config.title}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleString()}
        {autoRefresh && (
          <span className="ml-2">
            • Auto-refresh enabled ({Math.floor(refreshInterval / 60000)}min)
          </span>
        )}
      </div>
    </div>
  );
};

export default RankingBoard;
