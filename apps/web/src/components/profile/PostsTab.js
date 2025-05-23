/**
 * Posts Tab Component
 * 
 * Displays user's posts including reviews, rankings, and social updates.
 * Supports post creation, editing, and interaction features.
 * 
 * Features:
 * - Post feed with multiple content types
 * - Post creation and editing
 * - Social interactions (like, comment, share)
 * - Post filtering and sorting
 * - Rich content support (text, images, ratings)
 * - Privacy controls
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'

const PostsTab = ({
  userId = null,
  showCreatePost = true,
  showFilters = true,
  postsPerPage = 10,
  className = ''
}) => {
  // State
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Determine if this is the current user's posts
  const isOwnPosts = !userId || userId === user?.id

  // Post filters
  const filters = {
    all: { name: 'All Posts', icon: '📱' },
    reviews: { name: 'Reviews', icon: '📝' },
    rankings: { name: 'Rankings', icon: '🏆' },
    photos: { name: 'Photos', icon: '📷' },
    achievements: { name: 'Achievements', icon: '🎖️' }
  }

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock posts data (in real app, would fetch from API)
        const mockPosts = [
          {
            id: 'post_1',
            type: 'review',
            content: {
              text: 'Just had the most amazing nasi lemak at Wanjo! The sambal is perfectly balanced - spicy but not overwhelming. The rice is so fragrant and the anchovies are crispy. Definitely coming back!',
              rating: 5,
              restaurant: {
                id: 'rest_1',
                name: 'Nasi Lemak Wanjo',
                image: '/images/restaurants/nasi-lemak-wanjo.jpg'
              },
              dish: {
                id: 'dish_1',
                name: 'Nasi Lemak'
              },
              images: ['/images/reviews/nasi-lemak-1.jpg', '/images/reviews/nasi-lemak-2.jpg']
            },
            timestamp: '2024-01-15T10:30:00Z',
            interactions: {
              likes: 24,
              comments: 8,
              shares: 3,
              userLiked: false
            },
            privacy: 'public'
          },
          {
            id: 'post_2',
            type: 'ranking',
            content: {
              title: 'My Top 5 Char Kway Teow in Penang',
              description: 'After trying dozens of char kway teow stalls in Penang, here are my absolute favorites!',
              rankings: [
                { rank: 1, name: 'Siam Road Char Kway Teow', score: 9.5 },
                { rank: 2, name: 'Sister Curry Mee', score: 9.2 },
                { rank: 3, name: 'Ah Leng Char Kway Teow', score: 9.0 },
                { rank: 4, name: 'Penang Road Famous Teochew Chendul', score: 8.8 },
                { rank: 5, name: 'Kafe Heng Huat', score: 8.5 }
              ]
            },
            timestamp: '2024-01-14T15:20:00Z',
            interactions: {
              likes: 45,
              comments: 12,
              shares: 8,
              userLiked: true
            },
            privacy: 'public'
          },
          {
            id: 'post_3',
            type: 'photo',
            content: {
              caption: 'Beautiful presentation at Din Tai Fung! Those xiaolongbao are works of art 🥟✨',
              images: ['/images/photos/xiaolongbao-1.jpg'],
              restaurant: {
                id: 'rest_3',
                name: 'Din Tai Fung'
              },
              location: 'Pavilion KL'
            },
            timestamp: '2024-01-13T19:45:00Z',
            interactions: {
              likes: 67,
              comments: 15,
              shares: 5,
              userLiked: false
            },
            privacy: 'public'
          },
          {
            id: 'post_4',
            type: 'achievement',
            content: {
              achievement: 'Food Explorer',
              description: 'Visited 50 different restaurants!',
              badge: '🏆',
              level: 'Gold',
              progress: {
                current: 50,
                target: 50
              }
            },
            timestamp: '2024-01-12T14:30:00Z',
            interactions: {
              likes: 89,
              comments: 23,
              shares: 12,
              userLiked: true
            },
            privacy: 'public'
          }
        ]

        // Filter posts
        let filteredPosts = mockPosts
        if (activeFilter !== 'all') {
          filteredPosts = mockPosts.filter(post => post.type === activeFilter)
        }

        // Simulate pagination
        const startIndex = (page - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        const pagePosts = filteredPosts.slice(startIndex, endIndex)

        if (page === 1) {
          setPosts(pagePosts)
        } else {
          setPosts(prev => [...prev, ...pagePosts])
        }

        setHasMore(endIndex < filteredPosts.length)

        // Track posts view
        trackUserEngagement('posts', 'view', activeFilter, {
          userId: userId || user?.id,
          isOwnPosts,
          postCount: pagePosts.length
        })
      } catch (err) {
        console.error('Error loading posts:', err)
        setError(err.message || 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [activeFilter, page, userId, user?.id, isOwnPosts, postsPerPage, trackUserEngagement])

  // Handle interaction
  const handleInteraction = async (postId, action) => {
    if (!isAuthenticated) {
      alert('Please sign in to interact with posts')
      return
    }

    try {
      // Update local state immediately
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const interactions = { ...post.interactions }
          
          if (action === 'like') {
            if (interactions.userLiked) {
              interactions.likes -= 1
              interactions.userLiked = false
            } else {
              interactions.likes += 1
              interactions.userLiked = true
            }
          }
          
          return { ...post, interactions }
        }
        return post
      }))

      // Track interaction
      trackUserEngagement('post', postId, action, {
        userId: user?.id,
        source: 'posts_tab'
      })
    } catch (err) {
      console.error(`Error ${action}ing post:`, err)
    }
  }

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setPage(1)
    trackUserEngagement('posts', 'filter', filter)
  }

  // Load more posts
  const loadMorePosts = () => {
    setPage(prev => prev + 1)
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

  // Render post content
  const renderPostContent = (post) => {
    switch (post.type) {
      case 'review':
        return (
          <div className="space-y-4">
            {/* Restaurant Info */}
            <div className="flex items-center gap-3">
              <img
                src={post.content.restaurant.image}
                alt={post.content.restaurant.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-restaurant.jpg'
                }}
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {post.content.dish.name}
                </h4>
                <p className="text-sm text-gray-600">
                  at {post.content.restaurant.name}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${star <= post.content.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {post.content.rating}/5 stars
              </span>
            </div>

            {/* Review Text */}
            <p className="text-gray-900">{post.content.text}</p>

            {/* Images */}
            {post.content.images && (
              <div className="grid grid-cols-2 gap-2">
                {post.content.images.map((image, index) => (
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
        )

      case 'ranking':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {post.content.title}
              </h4>
              <p className="text-gray-600 mt-1">
                {post.content.description}
              </p>
            </div>

            <div className="space-y-2">
              {post.content.rankings.map((item) => (
                <div key={item.rank} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.rank}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-sm font-medium text-orange-600">
                    {item.score}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-4">
            <p className="text-gray-900">{post.content.caption}</p>
            
            {post.content.images && (
              <div className="grid grid-cols-1 gap-2">
                {post.content.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg'
                    }}
                  />
                ))}
              </div>
            )}

            {post.content.restaurant && (
              <div className="text-sm text-gray-600">
                📍 {post.content.restaurant.name}
                {post.content.location && `, ${post.content.location}`}
              </div>
            )}
          </div>
        )

      case 'achievement':
        return (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{post.content.badge}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="warning">{post.content.level}</Badge>
                  <h4 className="font-semibold text-gray-900">
                    {post.content.achievement}
                  </h4>
                </div>
                <p className="text-gray-600">{post.content.description}</p>
                
                {post.content.progress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{post.content.progress.current}/{post.content.progress.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${(post.content.progress.current / post.content.progress.target) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading && page === 1) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading posts...</span>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isOwnPosts ? 'My Posts' : 'Posts'}
          </h2>
          <p className="text-gray-600">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isOwnPosts && showCreatePost && (
          <Button
            onClick={() => setCreatePostOpen(true)}
            className="flex items-center gap-2"
          >
            ✏️ Create Post
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, filter]) => (
            <Button
              key={key}
              variant={activeFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(key)}
              className="flex items-center gap-2"
            >
              <span>{filter.icon}</span>
              <span>{filter.name}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" size="sm">
                    {filters[post.type]?.icon} {filters[post.type]?.name}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(post.timestamp)}
                  </span>
                  {post.privacy === 'private' && (
                    <Badge variant="outline" size="sm">
                      🔒 Private
                    </Badge>
                  )}
                </div>

                {isOwnPosts && (
                  <Button variant="ghost" size="sm">
                    ⋯
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <div className="mb-4">
                {renderPostContent(post)}
              </div>

              {/* Post Interactions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleInteraction(post.id, 'like')}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    post.interactions.userLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {post.interactions.userLiked ? '❤️' : '🤍'} {post.interactions.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  💬 {post.interactions.comments}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  📤 {post.interactions.shares}
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 mb-4">
            {isOwnPosts 
              ? 'Share your food experiences by creating your first post!'
              : 'This user hasn\'t shared any posts yet.'
            }
          </p>
          {isOwnPosts && (
            <Button onClick={() => setCreatePostOpen(true)}>
              ✏️ Create Your First Post
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {hasMore && posts.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMorePosts}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      {createPostOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create Post
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="review">Review</option>
                    <option value="ranking">Ranking</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share your food experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCreatePostOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setCreatePostOpen(false)}>
                  Post
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PostsTab
