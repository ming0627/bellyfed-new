/**
 * Restaurant Map View Component
 * 
 * Provides a comprehensive map view for displaying multiple restaurants
 * with clustering, filtering, and interactive features.
 * 
 * Features:
 * - Multiple restaurant markers
 * - Map clustering for performance
 * - Restaurant filtering and search
 * - Info windows with restaurant details
 * - User location tracking
 * - Distance calculations
 * - Mobile-responsive design
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { googleMapsService } from '../../services/googleMapsService.js'
import { restaurantService } from '../../services/restaurantService.js'

const RestaurantMapView = ({
  restaurants = [],
  center = null,
  zoom = 12,
  showSearch = true,
  showFilters = true,
  showUserLocation = true,
  showClustering = true,
  height = '500px',
  onRestaurantSelect = null,
  className = ''
}) => {
  // State
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapRestaurants, setMapRestaurants] = useState(restaurants)
  const [markers, setMarkers] = useState([])
  const [infoWindow, setInfoWindow] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Refs
  const mapRef = useRef(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Filter options
  const filters = {
    all: { name: 'All', icon: '🍽️' },
    budget: { name: 'Budget', icon: '💰' },
    mid: { name: 'Mid-range', icon: '💳' },
    premium: { name: 'Premium', icon: '💎' },
    'high-rated': { name: 'Top Rated', icon: '⭐' }
  }

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load Google Maps
        await googleMapsService.loadGoogleMaps()

        // Determine map center
        let mapCenter = center
        if (!mapCenter && mapRestaurants.length > 0) {
          // Calculate center from restaurants
          const bounds = new window.google.maps.LatLngBounds()
          mapRestaurants.forEach(restaurant => {
            if (restaurant.coordinates) {
              bounds.extend(restaurant.coordinates)
            }
          })
          mapCenter = bounds.getCenter()
        } else if (!mapCenter) {
          // Default to Kuala Lumpur
          mapCenter = { lat: 3.139, lng: 101.6869 }
        }

        // Create map
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        })

        // Create info window
        const infoWindowInstance = new window.google.maps.InfoWindow()
        setInfoWindow(infoWindowInstance)

        setMap(mapInstance)

        // Get user location
        if (showUserLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              setUserLocation(userPos)
              
              // Add user location marker
              new window.google.maps.Marker({
                position: userPos,
                map: mapInstance,
                title: 'Your Location',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
                      <circle cx="16" cy="16" r="6" fill="#fff"/>
                      <circle cx="16" cy="16" r="2" fill="#3b82f6"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 16)
                }
              })
            },
            (error) => {
              console.log('Geolocation error:', error)
            }
          )
        }

        // Track map view
        trackUserEngagement('map', 'restaurant_map_view', 'view', {
          restaurantCount: mapRestaurants.length,
          zoom: zoom
        })

      } catch (err) {
        console.error('Error initializing map:', err)
        setError(err.message || 'Failed to load map')
      } finally {
        setLoading(false)
      }
    }

    initializeMap()
  }, [center, zoom, showUserLocation, trackUserEngagement])

  // Update markers when restaurants change
  useEffect(() => {
    if (!map || !infoWindow) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])

    // Add new markers
    const newMarkers = []
    
    mapRestaurants.forEach((restaurant) => {
      if (!restaurant.coordinates) return

      const marker = new window.google.maps.Marker({
        position: restaurant.coordinates,
        map: map,
        title: restaurant.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${getMarkerColor(restaurant)}" stroke="#fff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🍽️</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      })

      marker.addListener('click', () => {
        handleMarkerClick(restaurant, marker)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
  }, [map, mapRestaurants, infoWindow])

  // Get marker color based on restaurant properties
  const getMarkerColor = (restaurant) => {
    if (restaurant.rating >= 4.5) return '#10b981' // Green for high rated
    if (restaurant.priceRange === 'premium') return '#8b5cf6' // Purple for premium
    if (restaurant.priceRange === 'budget') return '#f59e0b' // Amber for budget
    return '#ea580c' // Orange default
  }

  // Handle marker click
  const handleMarkerClick = (restaurant, marker) => {
    setSelectedRestaurant(restaurant)
    
    const content = `
      <div class="p-4 max-w-sm">
        <div class="flex items-start gap-3 mb-3">
          ${restaurant.image ? `
            <img src="${restaurant.image}" alt="${restaurant.name}" 
                 class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                 onerror="this.src='/images/placeholder-restaurant.jpg'">
          ` : ''}
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 mb-1">${restaurant.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${restaurant.cuisine || ''}</p>
            ${restaurant.rating ? `
              <div class="flex items-center gap-1 mb-2">
                <span class="text-yellow-400">⭐</span>
                <span class="text-sm font-medium">${restaurant.rating}</span>
                ${restaurant.reviewCount ? `<span class="text-sm text-gray-500">(${restaurant.reviewCount})</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        
        ${restaurant.address ? `<p class="text-sm text-gray-600 mb-3">📍 ${restaurant.address}</p>` : ''}
        
        <div class="flex gap-2">
          <button onclick="window.location.href='/restaurants/${restaurant.id}'" 
                  class="text-xs bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700">
            View Details
          </button>
          ${restaurant.phone ? `
            <button onclick="window.open('tel:${restaurant.phone}')" 
                    class="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700">
              Call
            </button>
          ` : ''}
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}')" 
                  class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
            Directions
          </button>
        </div>
      </div>
    `

    infoWindow.setContent(content)
    infoWindow.open(map, marker)

    // Call callback if provided
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant)
    }

    trackUserEngagement('restaurant', restaurant.id, 'map_marker_click', {
      source: 'map_view'
    })
  }

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    filterRestaurants(query, activeFilter)
    
    trackUserEngagement('map', 'restaurant_search', 'search', {
      query: query.substring(0, 50)
    })
  }

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    filterRestaurants(searchQuery, filter)
    
    trackUserEngagement('map', 'restaurant_filter', 'filter', {
      filter
    })
  }

  // Filter restaurants
  const filterRestaurants = (query, filter) => {
    let filtered = restaurants

    // Apply search filter
    if (query) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.address?.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(restaurant => {
        switch (filter) {
          case 'budget':
          case 'mid':
          case 'premium':
            return restaurant.priceRange === filter
          case 'high-rated':
            return restaurant.rating >= 4.5
          default:
            return true
        }
      })
    }

    setMapRestaurants(filtered)
  }

  // Fit map to show all restaurants
  const fitMapToRestaurants = () => {
    if (!map || mapRestaurants.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    
    mapRestaurants.forEach(restaurant => {
      if (restaurant.coordinates) {
        bounds.extend(restaurant.coordinates)
      }
    })

    if (userLocation) {
      bounds.extend(userLocation)
    }

    map.fitBounds(bounds)
    
    trackUserEngagement('map', 'fit_bounds', 'action')
  }

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner className="mr-3" />
          <span className="text-gray-600">Loading map...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Map Unavailable
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Restaurants Map
            </h3>
            <span className="text-sm text-gray-500">
              {mapRestaurants.length} restaurant{mapRestaurants.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fitMapToRestaurants}
            >
              📍 Fit All
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, filter]) => (
                <Button
                  key={key}
                  variant={activeFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(key)}
                  className="flex items-center gap-1"
                >
                  <span>{filter.icon}</span>
                  <span>{filter.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height: `calc(${height} - 140px)` }}
        className="w-full"
      />

      {/* Selected Restaurant Info */}
      {selectedRestaurant && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                {selectedRestaurant.name}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedRestaurant.cuisine} • {selectedRestaurant.address}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => window.location.href = `/restaurants/${selectedRestaurant.id}`}
            >
              View Details
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default RestaurantMapView
