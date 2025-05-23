/**
 * Restaurant Reviews Section Component
 * 
 * Comprehensive reviews section displaying multiple reviews with filtering,
 * sorting, and pagination. Main reviews container for restaurant pages.
 * 
 * Features:
 * - Multiple review display
 * - Review filtering and sorting
 * - Pagination and load more
 * - Review statistics summary
 * - Write review integration
 * - Rating distribution chart
 * - Review search functionality
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'
import { reviewService } from '../../services/reviewService.js'
import ReviewSection from './ReviewSection.js'
import ReviewForm from './ReviewForm.js'

const ReviewsSection = ({
  restaurant,
  showWriteReview = true,
  showFilters = true,
  showSorting = true,
  showStats = true,
  reviewsPerPage = 10,
  className = ''
}) => {
  // State
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalReviews, setTotalReviews] = useState(0)
  const [reviewStats, setReviewStats] = useState(null)
  const [filters, setFilters] = useState({
    rating: 'all',
    sortBy: 'newest',
    withPhotos: false,
    verified: false
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Filter and sort options
  const ratingFilters = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
    { value: 'helpful', label: 'Most Helpful' }
  ]

  // Load reviews
  useEffect(() => {
    loadReviews(true)
  }, [restaurant.id, filters, searchQuery])

  const loadReviews = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const page = reset ? 1 : currentPage + 1

      // Mock reviews data (in real app, would fetch from API)
      const mockReviews = [
        {
          id: 'review_1',
          userId: 'user_1',
          user: {
            id: 'user_1',
            name: 'Sarah Chen',
            avatar: '/images/avatars/sarah.jpg'
          },
          rating: 5,
          title: 'Absolutely amazing nasi lemak!',
          text: 'This place serves the best nasi lemak I\'ve ever had. The sambal is perfectly spiced, not too hot but with great depth of flavor. The coconut rice is fragrant and the portions are generous. The staff is friendly and the atmosphere is authentic. Will definitely come back!',
          visitDate: '2024-01-10',
          createdAt: '2024-01-12T10:30:00Z',
          photos: [
            { url: '/images/reviews/nasi-lemak-1.jpg', thumbnail: '/images/reviews/thumbs/nasi-lemak-1.jpg' },
            { url: '/images/reviews/nasi-lemak-2.jpg', thumbnail: '/images/reviews/thumbs/nasi-lemak-2.jpg' }
          ],
          dishes: [
            { id: 'dish_1', name: 'Nasi Lemak Special' }
          ],
          helpfulCount: 23,
          unhelpfulCount: 1,
          wouldRecommend: true,
          isAnonymous: false,
          restaurantResponse: {
            text: 'Thank you so much for your wonderful review, Sarah! We\'re thrilled that you enjoyed our nasi lemak. We take great pride in our traditional sambal recipe and are delighted it met your expectations. We look forward to serving you again soon!',
            createdAt: '2024-01-13T14:20:00Z'
          }
        },
        {
          id: 'review_2',
          userId: 'user_2',
          user: {
            id: 'user_2',
            name: 'Ahmad Rahman',
            avatar: '/images/avatars/ahmad.jpg'
          },
          rating: 4,
          title: 'Good food, could improve service',
          text: 'The food here is really good, especially the rendang. However, the service was a bit slow during lunch hour. Had to wait about 20 minutes for our order. The taste makes up for it though.',
          visitDate: '2024-01-08',
          createdAt: '2024-01-09T16:45:00Z',
          photos: [],
          dishes: [
            { id: 'dish_2', name: 'Rendang Beef' }
          ],
          helpfulCount: 12,
          unhelpfulCount: 3,
          wouldRecommend: true,
          isAnonymous: false
        },
        {
          id: 'review_3',
          userId: 'user_3',
          user: {
            id: 'user_3',
            name: 'Lisa Wong',
            avatar: '/images/avatars/lisa.jpg'
          },
          rating: 3,
          title: 'Average experience',
          text: 'The food was okay but nothing special. Prices are reasonable for the portion size. The place could use some renovation as it looks quite dated.',
          visitDate: '2024-01-05',
          createdAt: '2024-01-06T12:15:00Z',
          photos: [],
          dishes: [],
          helpfulCount: 5,
          unhelpfulCount: 8,
          wouldRecommend: false,
          isAnonymous: false
        }
      ]

      // Mock review stats
      const mockStats = {
        totalReviews: 1250,
        averageRating: 4.5,
        ratingDistribution: {
          5: 650,
          4: 400,
          3: 150,
          2: 35,
          1: 15
        },
        withPhotos: 420,
        verified: 890
      }

      // Apply filters
      let filteredReviews = mockReviews.filter(review => {
        // Rating filter
        if (filters.rating !== 'all' && review.rating !== parseInt(filters.rating)) {
          return false
        }
        
        // Photos filter
        if (filters.withPhotos && (!review.photos || review.photos.length === 0)) {
          return false
        }
        
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase()
          if (!review.title.toLowerCase().includes(searchLower) &&
              !review.text.toLowerCase().includes(searchLower) &&
              !review.user.name.toLowerCase().includes(searchLower)) {
            return false
          }
        }
        
        return true
      })

      // Apply sorting
      filteredReviews.sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt)
          case 'highest':
            return b.rating - a.rating
          case 'lowest':
            return a.rating - b.rating
          case 'helpful':
            return b.helpfulCount - a.helpfulCount
          default: // newest
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
      })

      if (reset) {
        setReviews(filteredReviews.slice(0, reviewsPerPage))
        setReviewStats(mockStats)
        setTotalReviews(mockStats.totalReviews)
      } else {
        const startIndex = (page - 1) * reviewsPerPage
        const newReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage)
        setReviews(prev => [...prev, ...newReviews])
        setCurrentPage(page)
      }

      setHasMore(filteredReviews.length > (reset ? reviewsPerPage : currentPage * reviewsPerPage))

      // Track reviews view
      trackUserEngagement('restaurant', restaurant.id, 'reviews_view', {
        page: reset ? 1 : page,
        filters: filters,
        searchQuery: searchQuery
      })

    } catch (err) {
      console.error('Error loading reviews:', err)
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    
    trackUserEngagement('restaurant', restaurant.id, 'reviews_filter', {
      filterType,
      value
    })
  }

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    
    trackUserEngagement('restaurant', restaurant.id, 'reviews_search', {
      query: query.substring(0, 50)
    })
  }

  // Handle write review
  const handleWriteReview = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    setShowReviewForm(true)
    trackUserEngagement('restaurant', restaurant.id, 'write_review_click')
  }

  // Handle review submission
  const handleReviewSubmit = (reviewData) => {
    // Add new review to the top of the list
    const newReview = {
      ...reviewData,
      id: `review_${Date.now()}`,
      user: user,
      helpfulCount: 0,
      unhelpfulCount: 0
    }
    
    setReviews(prev => [newReview, ...prev])
    setTotalReviews(prev => prev + 1)
    setShowReviewForm(false)
    
    // Update stats
    if (reviewStats) {
      setReviewStats(prev => ({
        ...prev,
        totalReviews: prev.totalReviews + 1,
        ratingDistribution: {
          ...prev.ratingDistribution,
          [reviewData.rating]: (prev.ratingDistribution[reviewData.rating] || 0) + 1
        }
      }))
    }
  }

  // Get rating percentage
  const getRatingPercentage = (rating) => {
    if (!reviewStats) return 0
    return (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading reviews...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => loadReviews(true)}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div id="reviews-section" className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reviews ({totalReviews.toLocaleString()})
          </h2>
          {reviewStats && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= Math.round(reviewStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="font-semibold">{reviewStats.averageRating}</span>
              <span className="text-gray-600">average rating</span>
            </div>
          )}
        </div>

        {showWriteReview && (
          <Button onClick={handleWriteReview}>
            ✍️ Write a Review
          </Button>
        )}
      </div>

      {/* Review Stats */}
      {showStats && reviewStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Breakdown
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{rating} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {reviewStats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      {(showFilters || showSorting) && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Rating Filter */}
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {ratingFilters.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Additional Filters */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.withPhotos}
                  onChange={(e) => handleFilterChange('withPhotos', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">With Photos</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Write Review Form */}
      {showReviewForm && (
        <ReviewForm
          restaurant={restaurant}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewSection
              key={review.id}
              review={review}
              restaurant={restaurant}
            />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => loadReviews(false)}
                disabled={loadingMore}
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
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your experience at {restaurant.name}!
          </p>
          {showWriteReview && (
            <Button onClick={handleWriteReview}>
              ✍️ Write the First Review
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsSection
