/**
 * Feed Content Component
 * 
 * Displays a social feed of user activities, reviews, rankings, and updates.
 * Shows personalized content based on user preferences and following.
 * 
 * Features:
 * - Activity feed with multiple content types
 * - Real-time updates
 * - Infinite scrolling
 * - Content filtering and sorting
 * - Social interactions (like, comment, share)
 * - User following and recommendations
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'

const FeedContent = ({
  feedType = 'following', // 'following', 'discover', 'trending', 'local'
  showFilters = true,
  showInteractions = true,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  pageSize = 10,
  className = ''
}) => {
  // State
  const [feedItems, setFeedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    contentType: 'all', // 'all', 'reviews', 'rankings', 'photos', 'achievements'
    timeframe: '7d' // '24h', '7d', '30d'
  })

  // Refs
  const observerRef = useRef()
  const lastItemRef = useRef()

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Load feed content
  useEffect(() => {
    const loadFeedContent = async (pageNum = 1, reset = true) => {
      try {
        if (reset) {
          setLoading(true)
          setError(null)
        } else {
          setLoadingMore(true)
        }

        // Mock feed data (in real app, would fetch from API)
        const mockFeedItems = [
          {
            id: 'feed_1',
            type: 'review',
            user: {
              id: 'user_1',
              name: 'Sarah Chen',
              avatar: '/images/avatars/sarah.jpg',
              isFollowing: true
            },
            restaurant: {
              id: 'rest_1',
              name: 'Nasi Lemak Wanjo',
              image: '/images/restaurants/nasi-lemak-wanjo.jpg'
            },
            dish: {
              id: 'dish_1',
              name: 'Nasi Lemak'
            },
            content: {
              rating: 5,
              text: 'Absolutely amazing! The sambal is perfectly spiced and the rice is so fragrant. Best nasi lemak in KL!',
              images: ['/images/reviews/nasi-lemak-1.jpg', '/images/reviews/nasi-lemak-2.jpg']
            },
            timestamp: '2024-01-15T10:30:00Z',
            interactions: {
              likes: 24,
              comments: 8,
              shares: 3,
              userLiked: false
            }
          },
          {
            id: 'feed_2',
            type: 'ranking',
            user: {
              id: 'user_2',
              name: 'Ahmad Rahman',
              avatar: '/images/avatars/ahmad.jpg',
              isFollowing: false
            },
            content: {
              title: 'Top 5 Char Kway Teow in Penang',
              dishes: [
                { name: 'Siam Road Char Kway Teow', rank: 1 },
                { name: 'Sister Curry Mee', rank: 2 },
                { name: 'Ah Leng Char Kway Teow', rank: 3 }
              ]
            },
            timestamp: '2024-01-15T09:15:00Z',
            interactions: {
              likes: 45,
              comments: 12,
              shares: 8,
              userLiked: true
            }
          },
          {
            id: 'feed_3',
            type: 'achievement',
            user: {
              id: 'user_3',
              name: 'Lisa Wong',
              avatar: '/images/avatars/lisa.jpg',
              isFollowing: true
            },
            content: {
              achievement: 'Food Explorer',
              description: 'Visited 50 different restaurants!',
              badge: '🏆',
              level: 'Gold'
            },
            timestamp: '2024-01-15T08:45:00Z',
            interactions: {
              likes: 67,
              comments: 15,
              shares: 5,
              userLiked: false
            }
          },
          {
            id: 'feed_4',
            type: 'photo',
            user: {
              id: 'user_4',
              name: 'David Tan',
              avatar: '/images/avatars/david.jpg',
              isFollowing: false
            },
            restaurant: {
              id: 'rest_2',
              name: 'Din Tai Fung',
              image: '/images/restaurants/din-tai-fung.jpg'
            },
            content: {
              caption: 'Perfect xiaolongbao! The soup inside is incredible 🥟',
              images: ['/images/photos/xiaolongbao-1.jpg']
            },
            timestamp: '2024-01-15T07:20:00Z',
            interactions: {
              likes: 89,
              comments: 23,
              shares: 12,
              userLiked: true
            }
          }
        ]

        // Apply filters
        let filteredItems = mockFeedItems
        if (filters.contentType !== 'all') {
          filteredItems = filteredItems.filter(item => item.type === filters.contentType)
        }

        // Simulate pagination
        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize
        const pageItems = filteredItems.slice(startIndex, endIndex)

        if (reset) {
          setFeedItems(pageItems)
        } else {
          setFeedItems(prev => [...prev, ...pageItems])
        }

        setHasMore(endIndex < filteredItems.length)

        // Track feed view
        trackUserEngagement('feed', 'view', feedType, {
          filters,
          page: pageNum,
          itemCount: pageItems.length
        })
      } catch (err) {
        console.error('Error loading feed:', err)
        setError(err.message || 'Failed to load feed')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    loadFeedContent(page, page === 1)
  }, [feedType, filters, page, pageSize, trackUserEngagement])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 1.0 }
    )

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadingMore])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setPage(1)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Handle interaction
  const handleInteraction = async (itemId, action) => {
    if (!isAuthenticated) {
      alert('Please sign in to interact with posts')
      return
    }

    try {
      // Update local state immediately
      setFeedItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const interactions = { ...item.interactions }
          
          if (action === 'like') {
            if (interactions.userLiked) {
              interactions.likes -= 1
              interactions.userLiked = false
            } else {
              interactions.likes += 1
              interactions.userLiked = true
            }
          }
          
          return { ...item, interactions }
        }
        return item
      }))

      // Track interaction
      trackUserEngagement('feed_item', itemId, action, {
        feedType,
        userId: user?.id
      })

      // In real app, would call API
      console.log(`${action} on item ${itemId}`)
    } catch (err) {
      console.error(`Error ${action}ing item:`, err)
    }
  }

  // Handle follow user
  const handleFollowUser = async (userId) => {
    if (!isAuthenticated) {
      alert('Please sign in to follow users')
      return
    }

    try {
      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.user.id === userId) {
          return {
            ...item,
            user: {
              ...item.user,
              isFollowing: !item.user.isFollowing
            }
          }
        }
        return item
      }))

      trackUserEngagement('user', userId, 'follow_toggle', {
        source: 'feed'
      })
    } catch (err) {
      console.error('Error following user:', err)
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Render feed item
  const renderFeedItem = (item) => {
    switch (item.type) {
      case 'review':
        return (
          <Card key={item.id} className="p-6">
            {/* User Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-avatar.jpg'
                  }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                  <p className="text-sm text-gray-600">
                    reviewed {item.dish.name} at {item.restaurant.name}
                  </p>
                </div>
              </div>
              
              {!item.user.isFollowing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFollowUser(item.user.id)}
                >
                  Follow
                </Button>
              )}
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= item.content.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{formatTimestamp(item.timestamp)}</span>
              </div>
              
              <p className="text-gray-900 mb-3">{item.content.text}</p>
              
              {item.content.images && (
                <div className="grid grid-cols-2 gap-2">
                  {item.content.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-food.jpg'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Interactions */}
            {showInteractions && (
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleInteraction(item.id, 'like')}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    item.interactions.userLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {item.interactions.userLiked ? '❤️' : '🤍'} {item.interactions.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  💬 {item.interactions.comments}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  📤 {item.interactions.shares}
                </button>
              </div>
            )}
          </Card>
        )

      case 'ranking':
        return (
          <Card key={item.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                  <p className="text-sm text-gray-600">created a ranking</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">{formatTimestamp(item.timestamp)}</span>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                {item.content.title}
              </h4>
              <div className="space-y-2">
                {item.content.dishes.map((dish, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {dish.rank}
                    </span>
                    <span className="text-gray-900">{dish.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {showInteractions && (
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleInteraction(item.id, 'like')}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    item.interactions.userLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {item.interactions.userLiked ? '❤️' : '🤍'} {item.interactions.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  💬 {item.interactions.comments}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  📤 {item.interactions.shares}
                </button>
              </div>
            )}
          </Card>
        )

      case 'achievement':
        return (
          <Card key={item.id} className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-4">
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{item.content.badge}</span>
                  <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                  <span className="text-sm text-gray-600">earned an achievement!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{item.content.level}</Badge>
                  <span className="font-medium text-gray-900">{item.content.achievement}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.content.description}</p>
              </div>
              <span className="text-sm text-gray-600">{formatTimestamp(item.timestamp)}</span>
            </div>

            {showInteractions && (
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => handleInteraction(item.id, 'like')}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    item.interactions.userLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {item.interactions.userLiked ? '❤️' : '🤍'} {item.interactions.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  💬 {item.interactions.comments}
                </button>
              </div>
            )}
          </Card>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading feed...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Content:</label>
              <select
                value={filters.contentType}
                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="reviews">Reviews</option>
                <option value="rankings">Rankings</option>
                <option value="photos">Photos</option>
                <option value="achievements">Achievements</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Time:</label>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Feed Items */}
      <div className="space-y-6">
        {feedItems.map((item, index) => (
          <div
            key={item.id}
            ref={index === feedItems.length - 1 ? lastItemRef : null}
          >
            {renderFeedItem(item)}
          </div>
        ))}
      </div>

      {/* Loading More */}
      {loadingMore && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner className="mr-2" />
          <span className="text-gray-600">Loading more...</span>
        </div>
      )}

      {/* Empty State */}
      {feedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 mb-4">
            Follow some users or explore to see content in your feed.
          </p>
          <Button onClick={() => window.location.href = '/explore'}>
            Explore Restaurants
          </Button>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && feedItems.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">You've reached the end of your feed!</p>
        </div>
      )}
    </div>
  )
}

export default FeedContent
