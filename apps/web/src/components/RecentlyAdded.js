/**
 * Recently Added Component
 * 
 * Displays recently added restaurants, dishes, and reviews.
 * Shows the latest additions to the platform with quick access.
 * 
 * Features:
 * - Recently added restaurants
 * - Recently added dishes
 * - Recent reviews and ratings
 * - Filtering by content type
 * - Quick navigation to details
 * - Real-time updates
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { restaurantService } from '../services/restaurantService.js'

const RecentlyAdded = ({
  contentType = 'all', // 'all', 'restaurants', 'dishes', 'reviews'
  maxItems = 10,
  showFilters = true,
  showTimestamps = true,
  showImages = true,
  className = ''
}) => {
  // State
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState(contentType)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Content type filters
  const filters = {
    all: { name: 'All', icon: '📱' },
    restaurants: { name: 'Restaurants', icon: '🏪' },
    dishes: { name: 'Dishes', icon: '🍽️' },
    reviews: { name: 'Reviews', icon: '📝' }
  }

  // Load recently added items
  useEffect(() => {
    const loadRecentItems = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock recently added data (in real app, would fetch from API)
        const mockItems = [
          {
            id: 'item_1',
            type: 'restaurant',
            data: {
              id: 'rest_1',
              name: 'Nasi Lemak Wanjo',
              cuisine: 'Malaysian',
              location: 'Kampung Baru, KL',
              rating: 4.5,
              reviewCount: 1250,
              image: '/images/restaurants/nasi-lemak-wanjo.jpg',
              priceRange: 'budget'
            },
            addedDate: '2024-01-15T10:30:00Z',
            addedBy: {
              id: 'user_1',
              name: 'Sarah Chen',
              avatar: '/images/avatars/sarah.jpg'
            }
          },
          {
            id: 'item_2',
            type: 'dish',
            data: {
              id: 'dish_1',
              name: 'Char Kway Teow',
              description: 'Stir-fried rice noodles with prawns and Chinese sausage',
              cuisine: 'Chinese',
              restaurant: {
                id: 'rest_2',
                name: 'Penang Road Famous Teochew Chendul'
              },
              rating: 4.3,
              reviewCount: 89,
              image: '/images/dishes/char-kway-teow.jpg',
              price: 15.00
            },
            addedDate: '2024-01-14T15:20:00Z',
            addedBy: {
              id: 'user_2',
              name: 'Ahmad Rahman',
              avatar: '/images/avatars/ahmad.jpg'
            }
          },
          {
            id: 'item_3',
            type: 'review',
            data: {
              id: 'review_1',
              rating: 5,
              text: 'Absolutely amazing! The sambal is perfectly spiced and the rice is so fragrant.',
              restaurant: {
                id: 'rest_1',
                name: 'Nasi Lemak Wanjo',
                image: '/images/restaurants/nasi-lemak-wanjo.jpg'
              },
              dish: {
                id: 'dish_2',
                name: 'Nasi Lemak'
              },
              images: ['/images/reviews/nasi-lemak-1.jpg']
            },
            addedDate: '2024-01-13T19:45:00Z',
            addedBy: {
              id: 'user_3',
              name: 'Lisa Wong',
              avatar: '/images/avatars/lisa.jpg'
            }
          },
          {
            id: 'item_4',
            type: 'restaurant',
            data: {
              id: 'rest_3',
              name: 'Din Tai Fung',
              cuisine: 'Chinese',
              location: 'Pavilion KL',
              rating: 4.7,
              reviewCount: 567,
              image: '/images/restaurants/din-tai-fung.jpg',
              priceRange: 'premium'
            },
            addedDate: '2024-01-12T14:30:00Z',
            addedBy: {
              id: 'user_4',
              name: 'David Tan',
              avatar: '/images/avatars/david.jpg'
            }
          },
          {
            id: 'item_5',
            type: 'dish',
            data: {
              id: 'dish_3',
              name: 'Xiaolongbao',
              description: 'Steamed soup dumplings with pork filling',
              cuisine: 'Chinese',
              restaurant: {
                id: 'rest_3',
                name: 'Din Tai Fung'
              },
              rating: 4.8,
              reviewCount: 234,
              image: '/images/dishes/xiaolongbao.jpg',
              price: 28.00
            },
            addedDate: '2024-01-11T11:15:00Z',
            addedBy: {
              id: 'user_5',
              name: 'Emily Lim',
              avatar: '/images/avatars/emily.jpg'
            }
          }
        ]

        // Filter by content type
        let filteredItems = mockItems
        if (activeFilter !== 'all') {
          filteredItems = mockItems.filter(item => item.type === activeFilter)
        }

        // Sort by date (most recent first)
        filteredItems.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))

        // Limit items
        setItems(filteredItems.slice(0, maxItems))

        // Track view
        trackUserEngagement('recently_added', 'view', activeFilter, {
          itemCount: filteredItems.length
        })
      } catch (err) {
        console.error('Error loading recent items:', err)
        setError(err.message || 'Failed to load recent items')
      } finally {
        setLoading(false)
      }
    }

    loadRecentItems()
  }, [activeFilter, maxItems, trackUserEngagement])

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    trackUserEngagement('recently_added', 'filter', filter)
  }

  // Handle item click
  const handleItemClick = (item) => {
    trackUserEngagement(item.type, item.data.id, 'view_from_recently_added', {
      source: 'recently_added'
    })

    // Navigate to appropriate page
    switch (item.type) {
      case 'restaurant':
        window.location.href = `/restaurants/${item.data.id}`
        break
      case 'dish':
        window.location.href = `/dishes/${item.data.id}`
        break
      case 'review':
        window.location.href = `/restaurants/${item.data.restaurant.id}#reviews`
        break
      default:
        break
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
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

  // Get price range color
  const getPriceRangeColor = (priceRange) => {
    switch (priceRange) {
      case 'budget': return 'green'
      case 'mid': return 'yellow'
      case 'premium': return 'purple'
      default: return 'gray'
    }
  }

  // Render item content
  const renderItemContent = (item) => {
    switch (item.type) {
      case 'restaurant':
        return (
          <div className="flex items-center gap-4">
            {showImages && (
              <img
                src={item.data.image}
                alt={item.data.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/images/placeholder-restaurant.jpg'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {item.data.name}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {item.data.cuisine} • {item.data.location}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{item.data.rating}</span>
                  <span className="text-sm text-gray-500">({item.data.reviewCount})</span>
                </div>
                <Badge variant={getPriceRangeColor(item.data.priceRange)} size="sm">
                  {item.data.priceRange}
                </Badge>
              </div>
            </div>
          </div>
        )

      case 'dish':
        return (
          <div className="flex items-center gap-4">
            {showImages && (
              <img
                src={item.data.image}
                alt={item.data.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {item.data.name}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {item.data.description}
              </p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{item.data.rating}</span>
                  <span className="text-sm text-gray-500">({item.data.reviewCount})</span>
                </div>
                <span className="text-sm font-medium text-orange-600">
                  RM{item.data.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                at {item.data.restaurant.name}
              </p>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="flex items-start gap-4">
            {showImages && item.data.images && item.data.images.length > 0 && (
              <img
                src={item.data.images[0]}
                alt="Review"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= item.data.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium">{item.data.rating}/5</span>
              </div>
              <p className="text-sm text-gray-900 line-clamp-2">
                {item.data.text}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.data.dish.name} at {item.data.restaurant.name}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading recent additions...</span>
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
            Recently Added
          </h2>
          <p className="text-gray-600">
            Latest additions to the platform
          </p>
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
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleItemClick(item)}
            >
              <div className="space-y-3">
                {/* Item Content */}
                {renderItemContent(item)}

                {/* Meta Information */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.addedBy.avatar}
                      alt={item.addedBy.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-avatar.jpg'
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      Added by {item.addedBy.name}
                    </span>
                  </div>
                  
                  {showTimestamps && (
                    <span className="text-sm text-gray-500">
                      {formatDate(item.addedDate)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No recent additions
          </h3>
          <p className="text-gray-600 mb-4">
            Check back later for new restaurants, dishes, and reviews.
          </p>
          <Button onClick={() => window.location.href = '/explore'}>
            Explore Restaurants
          </Button>
        </div>
      )}

      {/* View All Link */}
      {items.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/recent'}
          >
            View All Recent Additions
          </Button>
        </div>
      )}
    </div>
  )
}

export default RecentlyAdded
