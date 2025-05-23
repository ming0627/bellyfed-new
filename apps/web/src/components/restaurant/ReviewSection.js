/**
 * Restaurant Review Section Component
 * 
 * Displays individual review with rating, text, photos, and interaction options.
 * Focused on single review display with detailed information.
 * 
 * Features:
 * - Review rating display
 * - Review text with expand/collapse
 * - Review photos gallery
 * - Reviewer information
 * - Helpful/unhelpful voting
 * - Review date and visit date
 * - Response from restaurant
 * - Report review option
 */

import React, { useState } from 'react'
import { Card, Button, Badge } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'

const ReviewSection = ({
  review,
  restaurant,
  showPhotos = true,
  showVoting = true,
  showReport = true,
  showRestaurantResponse = true,
  maxTextLength = 300,
  className = ''
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [voteStatus, setVoteStatus] = useState(null) // 'helpful' or 'unhelpful'
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0)
  const [unhelpfulCount, setUnhelpfulCount] = useState(review.unhelpfulCount || 0)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Handle text expand/collapse
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    trackUserEngagement('review', review.id, 'text_expand', {
      expanded: !isExpanded,
      restaurantId: restaurant.id
    })
  }

  // Handle photo click
  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto({ photo, index })
    trackUserEngagement('review', review.id, 'photo_view', {
      photoIndex: index,
      restaurantId: restaurant.id
    })
  }

  // Handle vote
  const handleVote = async (type) => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    try {
      // Prevent voting on own review
      if (review.userId === user?.id) {
        alert("You can't vote on your own review")
        return
      }

      // Toggle vote or change vote
      let newVoteStatus = voteStatus === type ? null : type
      
      // Update counts
      if (voteStatus === 'helpful' && type === 'unhelpful') {
        setHelpfulCount(prev => prev - 1)
        setUnhelpfulCount(prev => prev + 1)
      } else if (voteStatus === 'unhelpful' && type === 'helpful') {
        setUnhelpfulCount(prev => prev - 1)
        setHelpfulCount(prev => prev + 1)
      } else if (voteStatus === null && type === 'helpful') {
        setHelpfulCount(prev => prev + 1)
      } else if (voteStatus === null && type === 'unhelpful') {
        setUnhelpfulCount(prev => prev + 1)
      } else if (voteStatus === 'helpful' && type === 'helpful') {
        setHelpfulCount(prev => prev - 1)
        newVoteStatus = null
      } else if (voteStatus === 'unhelpful' && type === 'unhelpful') {
        setUnhelpfulCount(prev => prev - 1)
        newVoteStatus = null
      }

      setVoteStatus(newVoteStatus)

      // Track vote
      trackUserEngagement('review', review.id, 'vote', {
        type: newVoteStatus,
        restaurantId: restaurant.id,
        userId: user?.id
      })

      // In real app, would call API to save vote
      console.log('Vote submitted:', { reviewId: review.id, type: newVoteStatus })

    } catch (err) {
      console.error('Error voting on review:', err)
    }
  }

  // Handle report
  const handleReport = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    const reason = prompt('Please tell us why you want to report this review:')
    if (reason) {
      trackUserEngagement('review', review.id, 'report', {
        reason: reason.substring(0, 100),
        restaurantId: restaurant.id,
        userId: user?.id
      })
      alert('Thank you for your report. We will review it shortly.')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffWeeks === 1) return '1 week ago'
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`
    if (diffMonths === 1) return '1 month ago'
    if (diffMonths < 12) return `${diffMonths} months ago`
    return formatDate(dateString)
  }

  // Check if text should be truncated
  const shouldTruncate = review.text.length > maxTextLength
  const displayText = shouldTruncate && !isExpanded 
    ? review.text.substring(0, maxTextLength) + '...'
    : review.text

  return (
    <div className={className}>
      <Card className="p-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Reviewer Avatar */}
            <img
              src={review.user?.avatar || '/images/placeholder-avatar.jpg'}
              alt={review.user?.name || 'Anonymous'}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/images/placeholder-avatar.jpg'
              }}
            />

            {/* Reviewer Info */}
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.isAnonymous ? 'Anonymous' : review.user?.name}
              </h4>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium">{review.rating}/5</span>
              </div>

              {/* Review Date */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>Reviewed {getTimeAgo(review.createdAt)}</span>
                {review.visitDate && (
                  <>
                    <span>•</span>
                    <span>Visited {formatDate(review.visitDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Review Actions */}
          <div className="flex items-center gap-2">
            {review.wouldRecommend && (
              <Badge variant="success" size="sm">
                👍 Recommends
              </Badge>
            )}
            
            {showReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                className="text-gray-400 hover:text-gray-600"
              >
                ⚠️
              </Button>
            )}
          </div>
        </div>

        {/* Review Title */}
        {review.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {review.title}
          </h3>
        )}

        {/* Review Text */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="mt-2 text-orange-600 hover:text-orange-700 p-0"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>

        {/* Dishes Mentioned */}
        {review.dishes && review.dishes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Dishes mentioned:</p>
            <div className="flex flex-wrap gap-2">
              {review.dishes.map((dish) => (
                <Badge key={dish.id} variant="outline" size="sm">
                  🍽️ {dish.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Review Photos */}
        {showPhotos && review.photos && review.photos.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {review.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => handlePhotoClick(photo, index)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-200 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review Voting */}
        {showVoting && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Was this review helpful?</span>
            
            <div className="flex items-center gap-2">
              <Button
                variant={voteStatus === 'helpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('helpful')}
                className="flex items-center gap-1"
              >
                👍 Yes ({helpfulCount})
              </Button>
              
              <Button
                variant={voteStatus === 'unhelpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('unhelpful')}
                className="flex items-center gap-1"
              >
                👎 No ({unhelpfulCount})
              </Button>
            </div>
          </div>
        )}

        {/* Restaurant Response */}
        {showRestaurantResponse && review.restaurantResponse && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">🏪</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      Response from {restaurant.name}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(review.restaurantResponse.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.restaurantResponse.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between text-white mb-4">
              <div>
                <span className="text-sm">
                  Photo {selectedPhoto.index + 1} of {review.photos.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.photo.url}
                alt={`Review photo ${selectedPhoto.index + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>

            {/* Navigation */}
            {review.photos.length > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevIndex = selectedPhoto.index === 0 
                      ? review.photos.length - 1 
                      : selectedPhoto.index - 1
                    setSelectedPhoto({
                      photo: review.photos[prevIndex],
                      index: prevIndex
                    })
                  }}
                >
                  ← Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const nextIndex = selectedPhoto.index === review.photos.length - 1 
                      ? 0 
                      : selectedPhoto.index + 1
                    setSelectedPhoto({
                      photo: review.photos[nextIndex],
                      index: nextIndex
                    })
                  }}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewSection
