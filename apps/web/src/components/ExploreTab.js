/**
 * Explore Tab Component
 * 
 * Interactive exploration interface with map integration and discovery features.
 * Allows users to explore restaurants, dishes, and locations.
 * 
 * Features:
 * - Interactive map with restaurant markers
 * - Location-based search and filtering
 * - Category and cuisine filters
 * - Distance and rating filters
 * - Real-time location detection
 * - Restaurant discovery recommendations
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { ExploreMap } from './explore/ExploreMap.js'
import { NearbyRestaurants } from './explore/NearbyRestaurants.js'
import { restaurantService } from '../services/restaurantService.js'

const ExploreTab = ({
  defaultLocation = null,
  showMap = true,
  showFilters = true,
  showRecommendations = true,
  maxResults = 20,
  className = ''
}) => {
  // State
  const [activeView, setActiveView] = useState('map') // 'map', 'list', 'grid'
  const [userLocation, setUserLocation] = useState(defaultLocation)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    cuisine: 'all',
    priceRange: 'all',
    rating: 'all',
    distance: '10km',
    openNow: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Load nearby restaurants
  useEffect(() => {
    const loadNearbyRestaurants = async () => {
      if (!userLocation) return

      try {
        setLoading(true)
        setError(null)

        // Mock restaurant data (in real app, would fetch from API)
        const mockRestaurants = [
          {
            id: 'rest_1',
            name: 'Nasi Lemak Wanjo',
            address: 'Kampung Baru, Kuala Lumpur',
            coordinates: { lat: 3.1578, lng: 101.7123 },
            rating: 4.5,
            reviewCount: 1250,
            priceRange: 'budget',
            cuisine: 'Malaysian',
            image: '/images/restaurants/nasi-lemak-wanjo.jpg',
            distance: 2.3,
            isOpen: true,
            openingHours: 'Open until 10:00 PM',
            specialties: ['Nasi Lemak', 'Rendang', 'Sambal']
          },
          {
            id: 'rest_2',
            name: 'Village Park Restaurant',
            address: 'Damansara Uptown, Petaling Jaya',
            coordinates: { lat: 3.1478, lng: 101.7108 },
            rating: 4.3,
            reviewCount: 890,
            priceRange: 'budget',
            cuisine: 'Malaysian',
            image: '/images/restaurants/village-park.jpg',
            distance: 5.7,
            isOpen: true,
            openingHours: 'Open 24 hours',
            specialties: ['Nasi Lemak', 'Fried Chicken']
          },
          {
            id: 'rest_3',
            name: 'Din Tai Fung',
            address: 'Pavilion KL, Bukit Bintang',
            coordinates: { lat: 3.1492, lng: 101.7138 },
            rating: 4.7,
            reviewCount: 567,
            priceRange: 'premium',
            cuisine: 'Chinese',
            image: '/images/restaurants/din-tai-fung.jpg',
            distance: 8.2,
            isOpen: false,
            openingHours: 'Closed - Opens at 11:00 AM',
            specialties: ['Xiaolongbao', 'Fried Rice', 'Noodles']
          },
          {
            id: 'rest_4',
            name: 'Banana Leaf Apolo',
            address: 'Brickfields, Kuala Lumpur',
            coordinates: { lat: 3.1319, lng: 101.6841 },
            rating: 4.2,
            reviewCount: 423,
            priceRange: 'mid',
            cuisine: 'Indian',
            image: '/images/restaurants/banana-leaf.jpg',
            distance: 4.1,
            isOpen: true,
            openingHours: 'Open until 11:00 PM',
            specialties: ['Fish Head Curry', 'Biryani', 'Tandoori']
          }
        ]

        // Apply filters
        let filteredRestaurants = mockRestaurants

        if (filters.cuisine !== 'all') {
          filteredRestaurants = filteredRestaurants.filter(r => r.cuisine === filters.cuisine)
        }

        if (filters.priceRange !== 'all') {
          filteredRestaurants = filteredRestaurants.filter(r => r.priceRange === filters.priceRange)
        }

        if (filters.rating !== 'all') {
          const minRating = parseFloat(filters.rating.replace('+', ''))
          filteredRestaurants = filteredRestaurants.filter(r => r.rating >= minRating)
        }

        if (filters.distance !== 'all') {
          const maxDistance = parseFloat(filters.distance.replace('km', ''))
          filteredRestaurants = filteredRestaurants.filter(r => r.distance <= maxDistance)
        }

        if (filters.openNow) {
          filteredRestaurants = filteredRestaurants.filter(r => r.isOpen)
        }

        if (searchQuery.trim()) {
          filteredRestaurants = filteredRestaurants.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        }

        setRestaurants(filteredRestaurants.slice(0, maxResults))

        // Track exploration
        trackUserEngagement('explore', 'search', 'restaurants', {
          location: userLocation,
          filters,
          resultCount: filteredRestaurants.length
        })
      } catch (err) {
        console.error('Error loading restaurants:', err)
        setError(err.message || 'Failed to load restaurants')
      } finally {
        setLoading(false)
      }
    }

    loadNearbyRestaurants()
  }, [userLocation, filters, searchQuery, maxResults, trackUserEngagement])

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    try {
      setLoading(true)
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })

      trackUserEngagement('explore', 'location', 'current_location', {
        coordinates: { latitude, longitude }
      })
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Unable to get your location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant)
    
    trackUserEngagement('restaurant', restaurant.id, 'view_from_explore', {
      source: 'explore_tab',
      view: activeView
    })
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Explore Restaurants
          </h2>
          <p className="text-gray-600 mt-1">
            Discover amazing food near you
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('map')}
          >
            🗺️ Map
          </Button>
          <Button
            variant={activeView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('list')}
          >
            📋 List
          </Button>
          <Button
            variant={activeView === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('grid')}
          >
            ⊞ Grid
          </Button>
        </div>
      </div>

      {/* Search and Location */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        {!userLocation && (
          <Button
            onClick={getCurrentLocation}
            disabled={loading}
            className="whitespace-nowrap"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : '📍'}
            Get Location
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="Malaysian">Malaysian</option>
                <option value="Chinese">Chinese</option>
                <option value="Indian">Indian</option>
                <option value="Western">Western</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="budget">Budget</option>
                <option value="mid">Mid-range</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="4+">4+ stars</option>
                <option value="3+">3+ stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="1km">1km</option>
                <option value="5km">5km</option>
                <option value="10km">10km</option>
                <option value="20km">20km</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Open now</span>
              </label>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  cuisine: 'all',
                  priceRange: 'all',
                  rating: 'all',
                  distance: '10km',
                  openNow: false
                })}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner className="mr-3" />
          <span className="text-gray-600">Exploring restaurants...</span>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Map View */}
          {activeView === 'map' && showMap && userLocation && (
            <div className="h-96 rounded-lg overflow-hidden">
              <ExploreMap
                center={userLocation}
                restaurants={restaurants}
                onRestaurantSelect={handleRestaurantSelect}
                selectedRestaurant={selectedRestaurant}
              />
            </div>
          )}

          {/* List View */}
          {activeView === 'list' && (
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleRestaurantSelect(restaurant)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-restaurant.jpg'
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {restaurant.address}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-medium">{restaurant.rating}</span>
                          <span className="text-gray-500 text-sm">({restaurant.reviewCount})</span>
                        </div>
                        <Badge variant={getPriceRangeColor(restaurant.priceRange)} size="sm">
                          {restaurant.priceRange}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          📍 {restaurant.distance}km
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        {restaurant.openingHours}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Grid View */}
          {activeView === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  onClick={() => handleRestaurantSelect(restaurant)}
                >
                  <div className="h-32 bg-gray-200 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-restaurant.jpg'
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {restaurant.cuisine}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium text-sm">{restaurant.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {restaurant.distance}km
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {restaurants.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms.
              </p>
              {!userLocation && (
                <Button onClick={getCurrentLocation}>
                  📍 Get My Location
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExploreTab
