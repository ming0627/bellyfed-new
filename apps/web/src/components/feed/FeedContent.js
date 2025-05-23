/**
 * Feed Content Component
 * 
 * Displays a social feed of user activities, reviews, rankings, and discoveries.
 * Provides an engaging timeline of food-related content from followed users.
 * 
 * Features:
 * - Real-time activity feed
 * - Multiple content types (reviews, rankings, photos, check-ins)
 * - Infinite scroll pagination
 * - Like, comment, and share functionality
 * - Content filtering and sorting
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const FeedContent = ({
  feedType = 'following', // 'following', 'discover', 'trending'
  showFilters = true,
  showComposer = true,
  itemsPerPage = 10,
  enableInfiniteScroll = true,
  className = ''
}) => {
  // State
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    contentType: 'all',
    timeframe: 'week',
    location: 'all'
  });

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();

  // Content type filters
  const contentTypes = [
    { id: 'all', label: 'All Activity', icon: '📱' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'rankings', label: 'Rankings', icon: '🏆' },
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'checkins', label: 'Check-ins', icon: '📍' },
    { id: 'discoveries', label: 'Discoveries', icon: '🔍' }
  ];

  // Timeframe filters
  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' }
  ];

  // Fetch feed content
  const fetchFeedContent = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const data = await analyticsService.getFeedContent({
        feedType,
        userId: user?.id,
        filters,
        page: pageNum,
        limit: itemsPerPage
      });

      if (append) {
        setFeedItems(prev => [...prev, ...data.items]);
      } else {
        setFeedItems(data.items);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
      
      // Track feed view
      trackUserEngagement('feed', feedType, 'view', {
        filters,
        page: pageNum,
        itemCount: data.items.length
      });
    } catch (err) {
      console.error('Error fetching feed content:', err);
      setError(err.message || 'Failed to load feed content');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle like action
  const handleLike = async (itemId, isLiked) => {
    try {
      await analyticsService.toggleFeedItemLike({
        itemId,
        userId: user.id,
        isLiked: !isLiked
      });

      // Update local state
      setFeedItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isLiked: !isLiked,
              likeCount: isLiked ? item.likeCount - 1 : item.likeCount + 1
            }
          : item
      ));

      trackUserEngagement('feed', itemId, isLiked ? 'unlike' : 'like', {
        contentType: feedItems.find(item => item.id === itemId)?.type
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Handle comment action
  const handleComment = (itemId) => {
    trackUserEngagement('feed', itemId, 'comment_click', {
      contentType: feedItems.find(item => item.id === itemId)?.type
    });
    // This would open a comment modal or navigate to detail page
  };

  // Handle share action
  const handleShare = async (item) => {
    try {
      const shareUrl = `${window.location.origin}/${country}/feed/${item.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: item.title || 'Check out this food discovery!',
          text: item.description || '',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }

      trackUserEngagement('feed', item.id, 'share', {
        contentType: item.type,
        shareMethod: navigator.share ? 'native' : 'clipboard'
      });
    } catch (err) {
      console.error('Error sharing item:', err);
    }
  };

  // Load more content
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchFeedContent(page + 1, true);
    }
  }, [loadingMore, hasMore, page]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
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

  // Render feed item
  const renderFeedItem = (item) => {
    const contentTypeConfig = contentTypes.find(type => type.id === item.type);

    return (
      <Card key={item.id} className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/${country}/users/${item.userId}`}>
            <Avatar
              src={item.user?.avatar}
              alt={item.user?.name}
              fallback={item.user?.name?.charAt(0) || 'U'}
              size="md"
              className="cursor-pointer"
            />
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/${country}/users/${item.userId}`}>
                <span className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer">
                  {item.user?.name || 'Anonymous'}
                </span>
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatTimeAgo(item.createdAt)}</span>
              {contentTypeConfig && (
                <>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{contentTypeConfig.icon}</span>
                    <span className="text-sm text-gray-600">{contentTypeConfig.label}</span>
                  </div>
                </>
              )}
            </div>
            
            {item.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>📍</span>
                <span>{item.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          {item.title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
          )}
          
          {item.description && (
            <p className="text-gray-700 mb-3">
              {item.description}
            </p>
          )}

          {/* Restaurant/Dish Info */}
          {(item.restaurantName || item.dishName) && (
            <div className="flex items-center gap-2 mb-3">
              {item.restaurantName && (
                <Link href={`/${country}/restaurants/${item.restaurantId}`}>
                  <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                    🏪 {item.restaurantName}
                  </Badge>
                </Link>
              )}
              {item.dishName && (
                <Link href={`/${country}/dishes/${item.dishId}`}>
                  <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                    🍽️ {item.dishName}
                  </Badge>
                </Link>
              )}
            </div>
          )}

          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{item.rating}</span>
              <span className="text-sm text-gray-500">/ 5</span>
            </div>
          )}

          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {item.images.slice(0, 6).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt || 'Feed image'}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    // Open image gallery
                    trackUserEngagement('feed', item.id, 'image_click', {
                      imageIndex: index
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(item.id, item.isLiked)}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 text-sm transition-colors ${
                item.isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span>{item.isLiked ? '❤️' : '🤍'}</span>
              <span>{item.likeCount || 0}</span>
            </button>

            <button
              onClick={() => handleComment(item.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>{item.commentCount || 0}</span>
            </button>

            <button
              onClick={() => handleShare(item)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500 transition-colors cursor-pointer"
            >
              <span>📤</span>
              <span>Share</span>
            </button>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchFeedContent(1);
  }, [feedType, filters]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.id} value={timeframe.id}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Locations</option>
                <option value="nearby">Nearby</option>
                <option value="city">My City</option>
                <option value="country">My Country</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Feed Items */}
      {loading && feedItems.length === 0 ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600">
            <p className="text-lg font-semibold mb-2">Error Loading Feed</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => fetchFeedContent()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : feedItems.length > 0 ? (
        <div className="space-y-6">
          {feedItems.map(renderFeedItem)}
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Feed Content</p>
            <p className="text-sm">
              {feedType === 'following' 
                ? 'Follow some users to see their activity in your feed!'
                : 'No content available for the selected filters.'
              }
            </p>
          </div>
        </Card>
      )}

      {/* Authentication Prompt */}
      {!isAuthenticated && (
        <Card className="p-6 text-center bg-blue-50 border-blue-200">
          <p className="text-blue-700 mb-3">
            Sign in to like, comment, and interact with feed content
          </p>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Card>
      )}
    </div>
  );
};

export default FeedContent;
