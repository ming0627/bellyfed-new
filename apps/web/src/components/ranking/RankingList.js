/**
 * Ranking List Component
 * 
 * Displays a list of rankings with filtering, sorting, and pagination.
 * Supports different ranking types and view modes.
 * 
 * Features:
 * - Multiple view modes (grid, list, compact)
 * - Advanced filtering and sorting
 * - Pagination and infinite scroll
 * - Real-time updates
 * - User interaction tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const RankingList = ({
  entityType = 'dish', // 'dish', 'restaurant', 'user'
  entityId = null,
  userId = null,
  showFilters = true,
  showSorting = true,
  showViewToggle = true,
  defaultView = 'grid', // 'grid', 'list', 'compact'
  itemsPerPage = 12,
  enableInfiniteScroll = false,
  className = ''
}) => {
  // State
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState(defaultView);
  const [filters, setFilters] = useState({
    rank: 'all',
    timeframe: 'all',
    criteria: [],
    tags: [],
    isPublic: null
  });
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();

  // Filter options
  const rankOptions = [
    { value: 'all', label: 'All Ranks' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const timeframeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Ranked' },
    { value: 'lowest', label: 'Lowest Ranked' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  const viewOptions = [
    { value: 'grid', label: 'Grid', icon: '⊞' },
    { value: 'list', label: 'List', icon: '☰' },
    { value: 'compact', label: 'Compact', icon: '≡' }
  ];

  // Fetch rankings
  const fetchRankings = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const data = await analyticsService.getRankings({
        entityType,
        entityId,
        userId,
        filters,
        sortBy,
        page: pageNum,
        limit: itemsPerPage
      });

      if (append) {
        setRankings(prev => [...prev, ...data.rankings]);
      } else {
        setRankings(data.rankings);
      }
      
      setHasMore(data.hasMore);
      setTotalCount(data.total);
      setPage(pageNum);
      
      // Track rankings view
      trackUserEngagement('rankings', 'list', 'view', {
        entityType,
        entityId,
        userId,
        filters,
        sortBy,
        page: pageNum,
        totalCount: data.total
      });
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError(err.message || 'Failed to load rankings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  };

  // Handle ranking click
  const handleRankingClick = (ranking) => {
    trackUserEngagement('ranking', ranking.id, 'click', {
      entityType,
      rank: ranking.rank,
      userId: ranking.userId
    });
  };

  // Get rank display
  const getRankDisplay = (rank) => {
    const rankData = {
      1: { emoji: '😞', color: 'text-red-600', label: 'Poor' },
      2: { emoji: '😐', color: 'text-orange-600', label: 'Fair' },
      3: { emoji: '🙂', color: 'text-yellow-600', label: 'Good' },
      4: { emoji: '😊', color: 'text-blue-600', label: 'Very Good' },
      5: { emoji: '🤩', color: 'text-green-600', label: 'Excellent' }
    };
    return rankData[rank] || rankData[3];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render ranking item
  const renderRankingItem = (ranking) => {
    const rankDisplay = getRankDisplay(ranking.rank);
    const isOwner = user && ranking.userId === user.id;

    if (view === 'compact') {
      return (
        <div
          key={ranking.id}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleRankingClick(ranking)}
        >
          <div className={`text-2xl ${rankDisplay.color}`}>
            {rankDisplay.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{ranking.title}</h3>
            <p className="text-sm text-gray-600">
              by {ranking.user?.name || 'Anonymous'} • {formatDate(ranking.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className={`font-bold ${rankDisplay.color}`}>
              {ranking.rank}/5
            </div>
            {ranking.helpfulCount > 0 && (
              <p className="text-xs text-gray-500">
                {ranking.helpfulCount} helpful
              </p>
            )}
          </div>
        </div>
      );
    }

    if (view === 'list') {
      return (
        <Card
          key={ranking.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleRankingClick(ranking)}
        >
          <div className="flex items-start gap-4">
            <div className={`text-3xl ${rankDisplay.color}`}>
              {rankDisplay.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{ranking.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar
                      src={ranking.user?.avatar}
                      alt={ranking.user?.name}
                      fallback={ranking.user?.name?.charAt(0) || 'U'}
                      size="xs"
                    />
                    <span className="text-sm text-gray-600">
                      {ranking.user?.name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(ranking.createdAt)}
                    </span>
                    {isOwner && (
                      <Badge variant="secondary" className="text-xs">
                        Your ranking
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${rankDisplay.color}`}>
                    {ranking.rank}/5
                  </div>
                  <p className="text-xs text-gray-500">{rankDisplay.label}</p>
                </div>
              </div>
              
              {ranking.description && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {ranking.description}
                </p>
              )}
              
              {ranking.criteria && ranking.criteria.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ranking.criteria.slice(0, 3).map(criteria => (
                    <Badge key={criteria} variant="outline" className="text-xs">
                      {criteria}
                    </Badge>
                  ))}
                  {ranking.criteria.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{ranking.criteria.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {ranking.helpfulCount > 0 && (
                    <span>👍 {ranking.helpfulCount} helpful</span>
                  )}
                  {ranking.commentCount > 0 && (
                    <span>💬 {ranking.commentCount} comments</span>
                  )}
                </div>
                {ranking.tags && ranking.tags.length > 0 && (
                  <div className="flex gap-1">
                    {ranking.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Grid view
    return (
      <Card
        key={ranking.id}
        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleRankingClick(ranking)}
      >
        <div className="text-center mb-3">
          <div className={`text-4xl ${rankDisplay.color} mb-2`}>
            {rankDisplay.emoji}
          </div>
          <div className={`text-2xl font-bold ${rankDisplay.color}`}>
            {ranking.rank}/5
          </div>
          <p className="text-xs text-gray-500">{rankDisplay.label}</p>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {ranking.title}
        </h3>
        
        {ranking.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {ranking.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            src={ranking.user?.avatar}
            alt={ranking.user?.name}
            fallback={ranking.user?.name?.charAt(0) || 'U'}
            size="xs"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 truncate">
              {ranking.user?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(ranking.createdAt)}
            </p>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              Yours
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {ranking.helpfulCount > 0 && (
              <span>👍 {ranking.helpfulCount}</span>
            )}
            {ranking.commentCount > 0 && (
              <span>💬 {ranking.commentCount}</span>
            )}
          </div>
          {ranking.isPublic === false && (
            <Badge variant="outline" className="text-xs">
              Private
            </Badge>
          )}
        </div>
      </Card>
    );
  };

  // Load more rankings
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRankings(page + 1, true);
    }
  };

  // Refresh data when filters or sort change
  useEffect(() => {
    fetchRankings(1);
  }, [filters, sortBy, entityType, entityId, userId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Rankings {totalCount > 0 && `(${totalCount})`}
          </h2>
          <p className="text-gray-600 mt-1">
            {entityType === 'dish' ? 'Dish rankings' : 
             entityType === 'restaurant' ? 'Restaurant rankings' : 
             'User rankings'}
          </p>
        </div>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {viewOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setView(option.value)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${view === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Sorting */}
      {(showFilters || showSorting) && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rank Filter */}
            {showFilters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank
                </label>
                <select
                  value={filters.rank}
                  onChange={(e) => handleFilterChange('rank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {rankOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Timeframe Filter */}
            {showFilters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe
                </label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {timeframeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            {showSorting && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rankings List */}
      {loading && rankings.length === 0 ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600">
            <p className="text-lg font-semibold mb-2">Error Loading Rankings</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => fetchRankings()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : rankings.length > 0 ? (
        <div>
          <div className={`
            ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
              view === 'list' ? 'space-y-4' : 
              'space-y-3'}
          `}>
            {rankings.map(renderRankingItem)}
          </div>

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="text-center mt-8">
              {enableInfiniteScroll ? (
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              ) : (
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More Rankings'}
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Rankings Found</p>
            <p className="text-sm">
              No rankings match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RankingList;
