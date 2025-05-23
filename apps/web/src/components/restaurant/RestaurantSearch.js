/**
 * Restaurant Search Component
 * 
 * Provides comprehensive search functionality for restaurants with filters,
 * sorting options, and real-time results.
 * 
 * Features:
 * - Text search with autocomplete
 * - Location-based search
 * - Cuisine type filtering
 * - Price range filtering
 * - Rating filtering
 * - Distance sorting
 * - Real-time search results
 * - Search history and suggestions
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { restaurantService } from '../../services/restaurantService.js'
import { googleMapsService } from '../../services/googleMapsService.js'

const RestaurantSearch = ({
  onResults = null,
  onLocationChange = null,
  showFilters = true,
  showSorting = true,
  showMap = false,
  placeholder = 'Search restaurants, cuisines, or dishes...',
  className = ''
}) => {
  // State
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState({
    cuisine: 'all',
    priceRange: 'all',
    rating: 'all',
    distance: 'all',
    openNow: false
  })
  const [sortBy, setSortBy] = useState('relevance')

  // Refs
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Filter options
  const cuisineOptions = [
    { value: 'all', label: 'All Cuisines' },
    { value: 'malaysian', label: 'Malaysian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'indian', label: 'Indian' },
    { value: 'western', label: 'Western' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'thai', label: 'Thai' },
    { value: 'italian', label: 'Italian' }
  ]

  const priceRangeOptions = [
    { value: 'all', label: 'Any Price' },
    { value: 'budget', label: 'Budget ($)' },
    { value: 'mid', label: 'Mid-range ($$)' },
    { value: 'premium', label: 'Premium ($$$)' }
  ]

  const ratingOptions = [
    { value: 'all', label: 'Any Rating' },
    { value: '4+', label: '4+ Stars' },
    { value: '4.5+', label: '4.5+ Stars' }
  ]

  const distanceOptions = [
    { value: 'all', label: 'Any Distance' },
    { value: '1km', label: 'Within 1km' },
    { value: '5km', label: 'Within 5km' },
    { value: '10km', label: 'Within 10km' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' }
  ]

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          
          // Reverse geocode to get location name
          googleMapsService.reverseGeocode(userPos).then(address => {
            if (address) {
              setLocation(address)
            }
          }).catch(err => {
            console.log('Reverse geocoding failed:', err)
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Handle search input change
  const handleQueryChange = (value) => {
    setQuery(value)
    
    if (value.length >= 2) {
      loadSuggestions(value)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Load search suggestions
  const loadSuggestions = async (searchQuery) => {
    try {
      // Mock suggestions (in real app, would fetch from API)
      const mockSuggestions = [
        { type: 'restaurant', text: 'Nasi Lemak Wanjo', icon: '🏪' },
        { type: 'cuisine', text: 'Malaysian cuisine', icon: '🍽️' },
        { type: 'dish', text: 'Nasi Lemak', icon: '🍚' },
        { type: 'location', text: 'Kampung Baru, KL', icon: '📍' },
        { type: 'restaurant', text: 'Din Tai Fung', icon: '🏪' },
        { type: 'dish', text: 'Char Kway Teow', icon: '🍜' }
      ].filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)

      setSuggestions(mockSuggestions)
    } catch (err) {
      console.error('Error loading suggestions:', err)
    }
  }

  // Handle search submission
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setShowSuggestions(false)

    try {
      // Build search parameters
      const searchParams = {
        query: searchQuery,
        location: userLocation,
        filters: filters,
        sortBy: sortBy,
        limit: 20
      }

      // Mock search results (in real app, would call API)
      const mockResults = [
        {
          id: 'rest_1',
          name: 'Nasi Lemak Wanjo',
          cuisine: 'Malaysian',
          rating: 4.5,
          reviewCount: 1250,
          priceRange: 'budget',
          distance: 0.8,
          image: '/images/restaurants/nasi-lemak-wanjo.jpg',
          address: 'Jalan Raja Muda Abdul Aziz, Kampung Baru',
          isOpen: true,
          coordinates: { lat: 3.1569, lng: 101.7009 }
        },
        {
          id: 'rest_2',
          name: 'Din Tai Fung',
          cuisine: 'Chinese',
          rating: 4.7,
          reviewCount: 567,
          priceRange: 'premium',
          distance: 2.3,
          image: '/images/restaurants/din-tai-fung.jpg',
          address: 'Pavilion KL, Bukit Bintang',
          isOpen: true,
          coordinates: { lat: 3.1478, lng: 101.7123 }
        },
        {
          id: 'rest_3',
          name: 'Restoran Yusoof Dan Zakhir',
          cuisine: 'Indian',
          rating: 4.3,
          reviewCount: 892,
          priceRange: 'budget',
          distance: 1.5,
          image: '/images/restaurants/yusoof-zakhir.jpg',
          address: 'Jalan Masjid India, Kuala Lumpur',
          isOpen: false,
          coordinates: { lat: 3.1516, lng: 101.6942 }
        }
      ]

      // Apply filters
      let filteredResults = mockResults.filter(restaurant => {
        // Cuisine filter
        if (filters.cuisine !== 'all' && restaurant.cuisine.toLowerCase() !== filters.cuisine) {
          return false
        }
        
        // Price range filter
        if (filters.priceRange !== 'all' && restaurant.priceRange !== filters.priceRange) {
          return false
        }
        
        // Rating filter
        if (filters.rating === '4+' && restaurant.rating < 4) {
          return false
        }
        if (filters.rating === '4.5+' && restaurant.rating < 4.5) {
          return false
        }
        
        // Distance filter
        if (filters.distance !== 'all') {
          const maxDistance = parseFloat(filters.distance.replace('km', ''))
          if (restaurant.distance > maxDistance) {
            return false
          }
        }
        
        // Open now filter
        if (filters.openNow && !restaurant.isOpen) {
          return false
        }
        
        return true
      })

      // Apply sorting
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating
          case 'distance':
            return a.distance - b.distance
          case 'price_low':
            const priceOrder = { budget: 1, mid: 2, premium: 3 }
            return priceOrder[a.priceRange] - priceOrder[b.priceRange]
          case 'price_high':
            const priceOrderHigh = { budget: 3, mid: 2, premium: 1 }
            return priceOrderHigh[a.priceRange] - priceOrderHigh[b.priceRange]
          case 'newest':
            return Math.random() - 0.5 // Random for demo
          default:
            return 0 // Relevance (keep original order)
        }
      })

      setResults(filteredResults)

      // Call callback if provided
      if (onResults) {
        onResults(filteredResults)
      }

      // Track search
      trackUserEngagement('search', 'restaurant_search', 'search', {
        query: searchQuery,
        resultCount: filteredResults.length,
        filters: filters,
        sortBy: sortBy
      })

    } catch (err) {
      console.error('Error performing search:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    handleSearch(suggestion.text)
    
    trackUserEngagement('search', 'suggestion_click', suggestion.type, {
      text: suggestion.text
    })
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    
    if (query) {
      handleSearch()
    }
    
    trackUserEngagement('search', 'filter_change', filterType, {
      value
    })
  }

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value)
    
    if (query) {
      handleSearch()
    }
    
    trackUserEngagement('search', 'sort_change', 'sort', {
      value
    })
  }

  // Handle location change
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation)
    
    if (onLocationChange) {
      onLocationChange(newLocation)
    }
    
    trackUserEngagement('search', 'location_change', 'manual', {
      location: newLocation
    })
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 pl-12 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Search'}
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span>{suggestion.icon}</span>
                    <span className="text-gray-900">{suggestion.text}</span>
                    <Badge variant="outline" size="sm" className="ml-auto">
                      {suggestion.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📍</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and Sorting */}
      {(showFilters || showSorting) && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cuisine Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine
                  </label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {cuisineOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {priceRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance
                  </label>
                  <select
                    value={filters.distance}
                    onChange={(e) => handleFilterChange('distance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {distanceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Open now</span>
              </label>

              {/* Sort By */}
              {showSorting && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
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
          </div>
        </Card>
      )}

      {/* Search Results Summary */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Found {results.length} restaurant{results.length !== 1 ? 's' : ''}
            {query && ` for "${query}"`}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery('')
              setResults([])
              setFilters({
                cuisine: 'all',
                priceRange: 'all',
                rating: 'all',
                distance: 'all',
                openNow: false
              })
              setSortBy('relevance')
            }}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

export default RestaurantSearch
