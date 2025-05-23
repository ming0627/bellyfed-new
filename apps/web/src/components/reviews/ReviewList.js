/**
 * Review List Component
 * 
 * Displays a list of reviews with filtering, sorting, and pagination.
 * Shows detailed review information with ratings, photos, and interactions.
 * 
 * Features:
 * - Review filtering and sorting
 * - Pagination and infinite scroll
 * - Review interactions (helpful, report)
 * - Photo gallery integration
 * - Rating breakdown display
 * - Review moderation features
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const ReviewList = ({
  targetType = 'restaurant', // 'restaurant' or 'dish'
  targetId,
  showFilters = true,
  showSorting = true,
  showPhotos = true,
  showRatingBreakdown = true,
  itemsPerPage = 10,
  enableInfiniteScroll = false,
  className = ''
}) => {
  // State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    sortBy: 'newest',
    hasPhotos: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true,
    total: 0
  });
  const [ratingBreakdown, setRatingBreakdown] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();
  const { country } = useCountry();

  // Filter options
  const filterOptions = {
    rating: [
      { value: 'all', label: 'All Ratings' },
      { value: '5', label: '5 Stars' },
      { value: '4', label: '4+ Stars' },
      { value: '3', label: '3+ Stars' },
      { value: '2', label: '2+ Stars' },
      { value: '1', label: '1+ Stars' }
    ],
    sortBy: [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'highest', label: 'Highest Rated' },
      { value: 'lowest', label: 'Lowest Rated' },
      { value: 'helpful', label: 'Most Helpful' }
    ]
  };

  // Fetch reviews
  const fetchReviews = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const data = await analyticsService.getReviews({
        targetType,
        targetId,
        page,
        limit: itemsPerPage,
        filters,
        includeBreakdown: showRatingBreakdown && page === 1
      });

      if (append) {
        setReviews(prev => [...prev, ...(data.reviews || [])]);
      } else {
        setReviews(data.reviews || []);
      }

      setPagination({
        page,
        hasMore: data.hasMore || false,
        total: data.total || 0
      });

      if (data.ratingBreakdown) {
        setRatingBreakdown(data.ratingBreakdown);
      }

      // Track reviews view
      trackUserEngagement('reviews', 'list', 'view', {
        targetType,
        targetId,
        page,
        filters,
        reviewCount: data.reviews?.length || 0
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    trackUserEngagement('reviews', 'filter', filterType, {
      value,
      targetType,
      targetId
    });
  };

  // Handle review interaction
  const handleReviewInteraction = async (reviewId, action) => {
    if (!isAuthenticated) {
      alert('Please sign in to interact with reviews');
      return;
    }

    try {
      await analyticsService.interactWithReview({
        reviewId,
        userId: user.id,
        action // 'helpful', 'not_helpful', 'report'
      });

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              helpfulCount: action === 'helpful' 
                ? (review.helpfulCount || 0) + 1 
                : review.helpfulCount,
              userInteraction: action
            }
          : review
      ));

      trackUserEngagement('reviews', 'interaction', action, {
        reviewId,
        targetType,
        targetId
      });
    } catch (err) {
      console.error('Error interacting with review:', err);
    }
  };

  // Load more reviews
  const loadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      fetchReviews(pagination.page + 1, true);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  // Render rating breakdown
  const renderRatingBreakdown = () => {
    if (!ratingBreakdown) return null;

    return (
      <Card className="p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingBreakdown[rating] || 0;
            const percentage = ratingBreakdown.total > 0 
              ? (count / ratingBreakdown.total) * 100 
              : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Total: {ratingBreakdown.total} review{ratingBreakdown.total !== 1 ? 's' : ''}
        </div>
      </Card>
    );
  };

  // Render review item
  const renderReview = (review) => {
    return (
      <Card key={review.id} className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Avatar
            src={review.user?.avatar}
            alt={review.user?.name}
            fallback={review.user?.name?.charAt(0) || 'U'}
            size="md"
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link href={`/${country}/users/${review.user?.id}`}>
                  <h4 className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer">
                    {review.user?.name || 'Anonymous'}
                  </h4>
                </Link>
                {renderStarRating(review.rating)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </div>
            </div>

            {/* Review Title */}
            {review.title && (
              <h5 className="font-medium text-gray-900 mb-2">
                {review.title}
              </h5>
            )}

            {/* Review Content */}
            <p className="text-gray-700 mb-3 leading-relaxed">
              {review.content}
            </p>

            {/* Photos */}
            {showPhotos && review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt={`Review photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // In a real app, this would open a photo gallery
                      trackUserEngagement('reviews', 'photo_view', 'click', {
                        reviewId: review.id,
                        photoIndex: index
                      });
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {review.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => handleReviewInteraction(review.id, 'helpful')}
                className={`
                  flex items-center gap-1 transition-colors
                  ${review.userInteraction === 'helpful' 
                    ? 'text-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                  }
                `}
              >
                <span>👍</span>
                <span>Helpful ({review.helpfulCount || 0})</span>
              </button>

              <button
                onClick={() => handleReviewInteraction(review.id, 'report')}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Report
              </button>

              {review.visitDate && (
                <span className="text-gray-500">
                  Visited: {formatDate(review.visitDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Load reviews on mount and filter changes
  useEffect(() => {
    fetchReviews(1);
  }, [targetId, filters]);

  return (
    <div className={className}>
      {/* Rating Breakdown */}
      {showRatingBreakdown && renderRatingBreakdown()}

      {/* Filters and Sorting */}
      {(showFilters || showSorting) && (
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {showFilters && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rating:
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {filterOptions.rating.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasPhotos}
                    onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">With Photos</span>
                </label>
              </>
            )}

            {showSorting && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {filterOptions.sortBy.map(option => (
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

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600">
            <p className="font-semibold mb-2">Error Loading Reviews</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => fetchReviews(1)} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(renderReview)}

          {/* Load More / Pagination */}
          {pagination.hasMore && (
            <div className="text-center pt-4">
              {enableInfiniteScroll ? (
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Reviews'
                  )}
                </Button>
              ) : (
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => fetchReviews(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {pagination.page}
                  </span>
                  <Button
                    onClick={() => fetchReviews(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Reviews Yet</p>
            <p className="text-sm">
              Be the first to share your experience!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewList;
