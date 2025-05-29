/**
 * User Feed Filters Component
 * 
 * Provides filtering options for social feed content including
 * content type, time range, location, and user preferences.
 * 
 * Features:
 * - Content type filtering
 * - Time range selection
 * - Location-based filtering
 * - User preference filters
 * - Quick filter presets
 * - Analytics tracking
 */

import React, { useState, useCallback } from 'react';
import { Button, Card } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Image, 
  Video,
  MessageSquare,
  TrendingUp,
  X
} from 'lucide-react';

const UserFeedFilters = ({
  onFiltersChange,
  initialFilters = {},
  showQuickFilters = true,
  showAdvancedFilters = true,
  className = ''
}) => {
  // State
  const [filters, setFilters] = useState({
    contentType: 'all', // 'all', 'posts', 'reviews', 'photos', 'videos'
    timeRange: '7d', // '24h', '7d', '30d', 'all'
    location: 'all', // 'all', 'nearby', 'following'
    userType: 'all', // 'all', 'following', 'verified', 'local'
    sortBy: 'recent', // 'recent', 'popular', 'trending'
    ...initialFilters
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Filter options
  const contentTypeOptions = [
    { value: 'all', label: 'All Posts', icon: MessageSquare },
    { value: 'posts', label: 'Text Posts', icon: MessageSquare },
    { value: 'reviews', label: 'Reviews', icon: Star },
    { value: 'photos', label: 'Photos', icon: Image },
    { value: 'videos', label: 'Videos', icon: Video }
  ];

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'all', label: 'All time' }
  ];

  const locationOptions = [
    { value: 'all', label: 'Everywhere' },
    { value: 'nearby', label: 'Nearby' },
    { value: 'following', label: 'From following' }
  ];

  const userTypeOptions = [
    { value: 'all', label: 'All users' },
    { value: 'following', label: 'Following' },
    { value: 'verified', label: 'Verified users' },
    { value: 'local', label: 'Local users' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most recent', icon: Clock },
    { value: 'popular', label: 'Most popular', icon: Star },
    { value: 'trending', label: 'Trending', icon: TrendingUp }
  ];

  // Quick filter presets
  const quickFilters = [
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      filters: { sortBy: 'trending', timeRange: '24h' }
    },
    {
      id: 'following',
      label: 'Following',
      icon: Users,
      filters: { userType: 'following', sortBy: 'recent' }
    },
    {
      id: 'nearby',
      label: 'Nearby',
      icon: MapPin,
      filters: { location: 'nearby', sortBy: 'recent' }
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      filters: { contentType: 'photos', sortBy: 'popular' }
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      filters: { contentType: 'reviews', sortBy: 'recent' }
    }
  ];

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update active filters list
    const active = Object.entries(updatedFilters)
      .filter(([key, value]) => {
        const defaultValues = {
          contentType: 'all',
          timeRange: '7d',
          location: 'all',
          userType: 'all',
          sortBy: 'recent'
        };
        return value !== defaultValues[key];
      })
      .map(([key, value]) => ({ key, value }));
    
    setActiveFilters(active);

    // Track filter usage
    trackUserEngagement('social', 'filter', 'change', {
      filters: updatedFilters,
      activeCount: active.length
    });

    // Notify parent
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  }, [filters, trackUserEngagement, onFiltersChange]);

  // Handle quick filter
  const handleQuickFilter = useCallback((quickFilter) => {
    updateFilters(quickFilter.filters);
    
    trackUserEngagement('social', 'filter', 'quick_filter', {
      filterId: quickFilter.id,
      label: quickFilter.label
    });
  }, [updateFilters, trackUserEngagement]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      contentType: 'all',
      timeRange: '7d',
      location: 'all',
      userType: 'all',
      sortBy: 'recent'
    };
    
    updateFilters(defaultFilters);
    
    trackUserEngagement('social', 'filter', 'clear_all', {});
  }, [updateFilters, trackUserEngagement]);

  // Remove specific filter
  const removeFilter = useCallback((filterKey) => {
    const defaultValues = {
      contentType: 'all',
      timeRange: '7d',
      location: 'all',
      userType: 'all',
      sortBy: 'recent'
    };
    
    updateFilters({ [filterKey]: defaultValues[filterKey] });
  }, [updateFilters]);

  return (
    <Card className={`p-4 ${className}`}>
      {/* Quick Filters */}
      {showQuickFilters && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Quick Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((quickFilter) => (
              <Button
                key={quickFilter.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(quickFilter)}
                className="flex items-center gap-1"
              >
                <quickFilter.icon size={14} />
                {quickFilter.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear all
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {filter.value}
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      {showAdvancedFilters && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && showAdvancedFilters && (
        <div className="space-y-4">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ contentType: option.value })}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors
                    ${filters.contentType === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <option.icon size={16} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={filters.timeRange}
              onChange={(e) => updateFilters({ timeRange: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={filters.userType}
              onChange={(e) => updateFilters({ userType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {userTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-1 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ sortBy: option.value })}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors
                    ${filters.sortBy === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <option.icon size={16} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserFeedFilters;
