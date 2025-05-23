/**
 * Dish Restaurants Component
 * 
 * Displays a list of restaurants that serve a specific dish.
 * Shows restaurant details, ratings, and dish-specific information.
 * 
 * Features:
 * - Restaurant list with dish details
 * - Sorting and filtering options
 * - Distance and rating information
 * - Price comparison
 * - Quick actions (view, favorite, order)
 * - Map integration
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '@bellyfed/ui'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { restaurantService } from '../services/restaurantService.js'

const DishRestaurants = ({
  dishId,
  dishName = 'Dish',
  userLocation = null,
  showMap = false,
  showPrices = true,
  showDistance = true,
  sortBy = 'rating', // 'rating', 'distance', 'price', 'popularity'
  maxResults = 20,
  className = ''
}) => {
  // State
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOption, setSortOption] = useState(sortBy)
  const [filterOptions, setFilterOptions] = useState({
    priceRange: 'all', // 'budget', 'mid', 'premium', 'all'
    distance: 'all', // '1km', '5km', '10km', 'all'
    rating: 'all' // '4+', '3+', 'all'
  })

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Load restaurants serving the dish
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock restaurant data (in real app, would fetch from API)
        const mockRestaurants = [
          {
            id: 'rest_1',
            name: 'Nasi Lemak Wanjo',
            address: 'Kampung Baru, Kuala Lumpur',
            rating: 4.5,
            reviewCount: 1250,
            distance: 2.3,
            priceRange: 'budget',
            cuisine: 'Malaysian',
            image: '/images/restaurants/nasi-lemak-wanjo.jpg',
            dishDetails: {
              price: 8.50,
              availability: 'available',
              rating: 4.6,
              reviewCount: 89,
              description: 'Traditional nasi lemak with sambal, anchovies, and egg',
              spiceLevel: 'medium',
              portionSize: 'regular'
            },
            openingHours: {
              current: 'Open until 10:00 PM',
              isOpen: true
            }
          },
          {
            id: 'rest_2',
            name: 'Village Park Restaurant',
            address: 'Damansara Uptown, Petaling Jaya',
            rating: 4.3,
            reviewCount: 890,
            distance: 5.7,
            priceRange: 'budget',
            cuisine: 'Malaysian',
            image: '/images/restaurants/village-park.jpg',
            dishDetails: {
              price: 12.00,
              availability: 'available',
              rating: 4.4,
              reviewCount: 156,
              description: 'Famous nasi lemak with crispy chicken and special sambal',
              spiceLevel: 'mild',
              portionSize: 'large'
            },
            openingHours: {
              current: 'Open 24 hours',
              isOpen: true
            }
          },
          {
            id: 'rest_3',
            name: 'Coconut House',
            address: 'Bangsar, Kuala Lumpur',
            rating: 4.7,
            reviewCount: 567,
            distance: 8.2,
            priceRange: 'mid',
            cuisine: 'Malaysian',
            image: '/images/restaurants/coconut-house.jpg',
            dishDetails: {
              price: 18.50,
              availability: 'limited',
              rating: 4.8,
              reviewCount: 78,
              description: 'Premium nasi lemak with organic ingredients',
              spiceLevel: 'medium',
              portionSize: 'regular'
            },
            openingHours: {
              current: 'Closes at 9:00 PM',
              isOpen: true
            }
          }
        ]

        setRestaurants(mockRestaurants)

        // Track dish restaurant search
        trackUserEngagement('dish', dishId, 'view_restaurants', {
          dishName,
          resultCount: mockRestaurants.length,
          sortBy: sortOption
        })
      } catch (err) {
        console.error('Error loading restaurants:', err)
        setError(err.message || 'Failed to load restaurants')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [dishId, sortOption, trackUserEngagement, dishName])

  // Sort restaurants
  const sortRestaurants = (restaurants, sortBy) => {
    const sorted = [...restaurants]
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.dishDetails.rating - a.dishDetails.rating)
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance)
      case 'price':
        return sorted.sort((a, b) => a.dishDetails.price - b.dishDetails.price)
      case 'popularity':
        return sorted.sort((a, b) => b.dishDetails.reviewCount - a.dishDetails.reviewCount)
      default:
        return sorted
    }
  }

  // Filter restaurants
  const filterRestaurants = (restaurants, filters) => {
    return restaurants.filter(restaurant => {
      // Price range filter
      if (filters.priceRange !== 'all') {
        if (restaurant.priceRange !== filters.priceRange) return false
      }

      // Distance filter
      if (filters.distance !== 'all') {
        const maxDistance = parseInt(filters.distance.replace('km', ''))
        if (restaurant.distance > maxDistance) return false
      }

      // Rating filter
      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating.replace('+', ''))
        if (restaurant.dishDetails.rating < minRating) return false
      }

      return true
    })
  }

  // Handle restaurant click
  const handleRestaurantClick = (restaurant) => {
    trackUserEngagement('restaurant', restaurant.id, 'view_from_dish', {
      dishId,
      dishName,
      source: 'dish_restaurants'
    })
    
    // Navigate to restaurant page
    window.location.href = `/restaurants/${restaurant.id}`
  }

  // Handle favorite toggle
  const handleFavoriteToggle = (restaurant, event) => {
    event.stopPropagation()
    
    trackUserEngagement('restaurant', restaurant.id, 'favorite_toggle', {
      dishId,
      source: 'dish_restaurants'
    })
    
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for restaurant:', restaurant.id)
  }

  // Get price range badge color
  const getPriceRangeColor = (priceRange) => {
    switch (priceRange) {
      case 'budget': return 'green'
      case 'mid': return 'yellow'
      case 'premium': return 'purple'
      default: return 'gray'
    }
  }

  // Get availability badge
  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case 'available':
        return <Badge variant="success" size="sm">Available</Badge>
      case 'limited':
        return <Badge variant="warning" size="sm">Limited</Badge>
      case 'unavailable':
        return <Badge variant="error" size="sm">Unavailable</Badge>
      default:
        return null
    }
  }

  const sortedAndFilteredRestaurants = sortRestaurants(
    filterRestaurants(restaurants, filterOptions),
    sortOption
  ).slice(0, maxResults)

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Finding restaurants that serve {dishName}...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">
            Restaurants serving {dishName}
          </h2>
          <p className="text-gray-600 mt-1">
            {sortedAndFilteredRestaurants.length} restaurant{sortedAndFilteredRestaurants.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="rating">Dish Rating</option>
            <option value="distance">Distance</option>
            <option value="price">Price</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Price:</label>
          <select
            value={filterOptions.priceRange}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, priceRange: e.target.value }))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="budget">Budget</option>
            <option value="mid">Mid-range</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {showDistance && userLocation && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Distance:</label>
            <select
              value={filterOptions.distance}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, distance: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All</option>
              <option value="1km">Within 1km</option>
              <option value="5km">Within 5km</option>
              <option value="10km">Within 10km</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Rating:</label>
          <select
            value={filterOptions.rating}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, rating: e.target.value }))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="4+">4+ stars</option>
            <option value="3+">3+ stars</option>
          </select>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="space-y-4">
        {sortedAndFilteredRestaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleRestaurantClick(restaurant)}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Restaurant Image */}
              <div className="lg:w-48 h-32 lg:h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-restaurant.jpg'
                  }}
                />
              </div>

              {/* Restaurant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{restaurant.address}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-gray-500 text-sm">({restaurant.reviewCount})</span>
                      </div>
                      
                      {showDistance && (
                        <div className="text-sm text-gray-600">
                          📍 {restaurant.distance}km away
                        </div>
                      )}
                      
                      <Badge variant={getPriceRangeColor(restaurant.priceRange)} size="sm">
                        {restaurant.priceRange}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleFavoriteToggle(restaurant, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    ❤️
                  </button>
                </div>

                {/* Dish Details */}
                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{dishName}</h4>
                        {getAvailabilityBadge(restaurant.dishDetails.availability)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {restaurant.dishDetails.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>🌶️ {restaurant.dishDetails.spiceLevel}</span>
                        <span>🍽️ {restaurant.dishDetails.portionSize}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span>{restaurant.dishDetails.rating}</span>
                          <span>({restaurant.dishDetails.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {showPrices && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          RM{restaurant.dishDetails.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {restaurant.openingHours.current}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedAndFilteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No restaurants found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search for a different dish.
          </p>
          <Button
            variant="outline"
            onClick={() => setFilterOptions({
              priceRange: 'all',
              distance: 'all',
              rating: 'all'
            })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default DishRestaurants
