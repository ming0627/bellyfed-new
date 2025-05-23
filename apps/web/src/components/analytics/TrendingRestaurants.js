/**
 * Trending Restaurants Component
 * 
 * Displays a list of trending restaurants based on analytics data.
 * Shows restaurants with increasing views, engagement, and popularity.
 * 
 * Features:
 * - Real-time trending data
 * - Multiple trending categories
 * - Time period filtering
 * - Interactive restaurant cards
 * - Performance metrics
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import RestaurantCard from '../restaurants/RestaurantCard.js';
import { useAnalyticsContext } from './AnalyticsProvider.js';
import { analyticsService } from '../../services/analyticsService.js';
import { useCountry } from '../../hooks/useCountry.js';

const TrendingRestaurants = ({
  limit = 10,
  showCategories = true,
  showMetrics = true,
  showViewAll = true,
  period = '24h',
  className = ''
}) => {
  // State
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Trending categories
  const categories = [
    { id: 'all', label: 'All Trending', icon: '🔥' },
    { id: 'views', label: 'Most Viewed', icon: '👀' },
    { id: 'engagement', label: 'Most Engaged', icon: '💬' },
    { id: 'new', label: 'Rising Stars', icon: '⭐' },
    { id: 'reviews', label: 'Most Reviewed', icon: '📝' }
  ];

  // Fetch trending restaurants
  const fetchTrendingRestaurants = async (category = selectedCategory, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      const data = await analyticsService.getTrendingRestaurants({
        category,
        period,
        limit,
        country,
        includeMetrics: showMetrics
      });

      setTrendingData(data);
      
      // Track trending view
      trackUserEngagement('trending', 'restaurants', 'view', {
        category,
        period,
        count: data.length
      });
    } catch (err) {
      console.error('Error fetching trending restaurants:', err);
      setError(err.message || 'Failed to load trending restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchTrendingRestaurants(category);
    
    trackUserEngagement('trending', 'restaurants', 'category_change', {
      from: selectedCategory,
      to: category
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTrendingRestaurants(selectedCategory, true);
  };

  // Handle restaurant click
  const handleRestaurantClick = (restaurant) => {
    trackUserEngagement('restaurant', restaurant.id, 'click_from_trending', {
      position: trendingData.findIndex(r => r.id === restaurant.id) + 1,
      category: selectedCategory,
      trendingScore: restaurant.trendingScore
    });
  };

  // Filter and sort data based on category
  const filteredData = useMemo(() => {
    if (!trendingData || selectedCategory === 'all') {
      return trendingData;
    }

    return trendingData.filter(restaurant => {
      switch (selectedCategory) {
        case 'views':
          return restaurant.metrics?.viewsGrowth > 0;
        case 'engagement':
          return restaurant.metrics?.engagementGrowth > 0;
        case 'new':
          return restaurant.isNew || restaurant.metrics?.isRising;
        case 'reviews':
          return restaurant.metrics?.reviewsGrowth > 0;
        default:
          return true;
      }
    });
  }, [trendingData, selectedCategory]);

  // Load data on mount
  useEffect(() => {
    fetchTrendingRestaurants();
  }, [period, country]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrendingRestaurants(selectedCategory, true);
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [selectedCategory]);

  if (loading && !refreshing) {
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
          <p className="text-lg font-semibold mb-2">Error Loading Trending Restaurants</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => fetchTrendingRestaurants()} 
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
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            🔥 Trending Restaurants
          </h2>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            Refresh
          </Button>
          
          {showViewAll && (
            <Link href={`/${country}/restaurants?trending=true`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Categories */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.id
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
      )}

      {/* Trending List */}
      {filteredData && filteredData.length > 0 ? (
        <div className="space-y-4">
          {filteredData.map((restaurant, index) => (
            <div key={restaurant.id} className="relative">
              {/* Trending Badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-700 border border-orange-200"
                >
                  #{index + 1} Trending
                </Badge>
              </div>

              {/* Restaurant Card */}
              <div onClick={() => handleRestaurantClick(restaurant)}>
                <RestaurantCard
                  restaurant={restaurant}
                  showMetrics={showMetrics}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                />
              </div>

              {/* Trending Metrics */}
              {showMetrics && restaurant.metrics && (
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  {restaurant.metrics.viewsGrowth > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">↗</span>
                      <span>+{restaurant.metrics.viewsGrowth}% views</span>
                    </div>
                  )}
                  
                  {restaurant.metrics.engagementGrowth > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600">💬</span>
                      <span>+{restaurant.metrics.engagementGrowth}% engagement</span>
                    </div>
                  )}
                  
                  {restaurant.metrics.reviewsGrowth > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-purple-600">⭐</span>
                      <span>+{restaurant.metrics.reviewsGrowth}% reviews</span>
                    </div>
                  )}
                  
                  {restaurant.trendingScore && (
                    <div className="flex items-center gap-1">
                      <span className="text-orange-600">🔥</span>
                      <span>Score: {restaurant.trendingScore}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Trending Restaurants</p>
            <p className="text-sm">
              {selectedCategory === 'all' 
                ? 'No restaurants are trending right now.'
                : `No restaurants are trending in the "${categories.find(c => c.id === selectedCategory)?.label}" category.`
              }
            </p>
          </div>
        </Card>
      )}

      {/* View All Link */}
      {showViewAll && filteredData && filteredData.length >= limit && (
        <div className="text-center">
          <Link href={`/${country}/restaurants?trending=true&category=${selectedCategory}`}>
            <Button variant="outline">
              View All Trending Restaurants
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrendingRestaurants;
