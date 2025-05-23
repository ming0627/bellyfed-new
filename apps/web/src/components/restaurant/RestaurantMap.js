/**
 * Restaurant Map Component
 * 
 * Displays an interactive map showing the restaurant location with markers,
 * directions, and nearby points of interest.
 * 
 * Features:
 * - Interactive Google Maps integration
 * - Restaurant location marker
 * - Directions functionality
 * - Nearby restaurants and landmarks
 * - Street view integration
 * - Map controls and zoom
 * - Mobile-responsive design
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { googleMapsService } from '../../services/googleMapsService.js'

const RestaurantMap = ({
  restaurant,
  showDirections = true,
  showNearby = true,
  showStreetView = true,
  showControls = true,
  height = '400px',
  zoom = 15,
  className = ''
}) => {
  // State
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [showingDirections, setShowingDirections] = useState(false)

  // Refs
  const mapRef = useRef(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if restaurant has coordinates
        if (!restaurant.coordinates && !restaurant.address) {
          setError('Restaurant location not available')
          return
        }

        // Load Google Maps
        await googleMapsService.loadGoogleMaps()

        let restaurantLocation
        
        if (restaurant.coordinates) {
          restaurantLocation = {
            lat: restaurant.coordinates.lat,
            lng: restaurant.coordinates.lng
          }
        } else {
          // Geocode address
          const geocoder = new window.google.maps.Geocoder()
          const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: restaurant.address }, (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0].geometry.location)
              } else {
                reject(new Error('Failed to geocode address'))
              }
            })
          })
          
          restaurantLocation = {
            lat: result.lat(),
            lng: result.lng()
          }
        }

        // Create map
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: restaurantLocation,
          zoom: zoom,
          mapTypeControl: showControls,
          streetViewControl: showControls,
          fullscreenControl: showControls,
          zoomControl: showControls,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        })

        // Add restaurant marker
        const restaurantMarker = new window.google.maps.Marker({
          position: restaurantLocation,
          map: mapInstance,
          title: restaurant.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#ea580c" stroke="#fff" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🍽️</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-2">${restaurant.name}</h3>
              ${restaurant.address ? `<p class="text-sm text-gray-600 mb-2">${restaurant.address}</p>` : ''}
              ${restaurant.phone ? `<p class="text-sm text-gray-600 mb-2">📞 ${restaurant.phone}</p>` : ''}
              ${restaurant.rating ? `
                <div class="flex items-center gap-1 mb-2">
                  <span class="text-yellow-400">⭐</span>
                  <span class="text-sm font-medium">${restaurant.rating}</span>
                  ${restaurant.reviewCount ? `<span class="text-sm text-gray-500">(${restaurant.reviewCount})</span>` : ''}
                </div>
              ` : ''}
              <div class="flex gap-2 mt-3">
                <button onclick="window.open('tel:${restaurant.phone}')" class="text-xs bg-orange-600 text-white px-2 py-1 rounded">Call</button>
                <button onclick="window.open('/restaurants/${restaurant.id}')" class="text-xs bg-gray-600 text-white px-2 py-1 rounded">View Details</button>
              </div>
            </div>
          `
        })

        restaurantMarker.addListener('click', () => {
          infoWindow.open(mapInstance, restaurantMarker)
          trackUserEngagement('restaurant', restaurant.id, 'map_marker_click')
        })

        // Initialize directions service
        const directionsServiceInstance = new window.google.maps.DirectionsService()
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#ea580c',
            strokeWeight: 4
          }
        })

        setMap(mapInstance)
        setDirectionsService(directionsServiceInstance)
        setDirectionsRenderer(directionsRendererInstance)

        // Get user location if available
        if (navigator.geolocation) {
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
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
                      <circle cx="12" cy="12" r="4" fill="#fff"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12)
                }
              })
            },
            (error) => {
              console.log('Geolocation error:', error)
            }
          )
        }

        // Load nearby places if enabled
        if (showNearby) {
          loadNearbyPlaces(mapInstance, restaurantLocation)
        }

        // Track map view
        trackUserEngagement('restaurant', restaurant.id, 'map_view', {
          hasCoordinates: !!restaurant.coordinates,
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
  }, [restaurant, zoom, showNearby, showControls, trackUserEngagement])

  // Load nearby places
  const loadNearbyPlaces = async (mapInstance, location) => {
    try {
      const service = new window.google.maps.places.PlacesService(mapInstance)
      
      const request = {
        location: location,
        radius: 1000, // 1km radius
        type: ['restaurant', 'food', 'meal_takeaway']
      }

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.slice(0, 5) // Limit to 5 nearby places
          setNearbyPlaces(places)
          
          // Add markers for nearby places
          places.forEach((place) => {
            if (place.place_id !== restaurant.place_id) { // Don't duplicate restaurant marker
              new window.google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#6b7280" stroke="#fff" stroke-width="1"/>
                      <text x="12" y="16" text-anchor="middle" fill="white" font-size="10">🍽️</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12)
                }
              })
            }
          })
        }
      })
    } catch (err) {
      console.error('Error loading nearby places:', err)
    }
  }

  // Handle get directions
  const handleGetDirections = () => {
    if (!userLocation) {
      // Try to get user location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            setUserLocation(userPos)
            calculateDirections(userPos)
          },
          () => {
            // Fallback to opening Google Maps
            const restaurantLocation = restaurant.coordinates || restaurant.address
            const url = `https://www.google.com/maps/dir/?api=1&destination=${
              restaurant.coordinates 
                ? `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
                : encodeURIComponent(restaurant.address)
            }`
            window.open(url, '_blank')
          }
        )
      } else {
        // Fallback to opening Google Maps
        const url = `https://www.google.com/maps/dir/?api=1&destination=${
          restaurant.coordinates 
            ? `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
            : encodeURIComponent(restaurant.address)
        }`
        window.open(url, '_blank')
      }
    } else {
      calculateDirections(userLocation)
    }
    
    trackUserEngagement('restaurant', restaurant.id, 'map_directions_click')
  }

  // Calculate directions
  const calculateDirections = (origin) => {
    if (!directionsService || !directionsRenderer || !map) return

    const destination = restaurant.coordinates || restaurant.address

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
          directionsRenderer.setMap(map)
          setShowingDirections(true)
        } else {
          console.error('Directions request failed:', status)
        }
      }
    )
  }

  // Clear directions
  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null)
      setShowingDirections(false)
    }
    
    trackUserEngagement('restaurant', restaurant.id, 'map_clear_directions')
  }

  // Handle street view
  const handleStreetView = () => {
    if (!map) return

    const streetView = map.getStreetView()
    const location = restaurant.coordinates || { lat: 0, lng: 0 }
    
    streetView.setPosition(location)
    streetView.setVisible(true)
    
    trackUserEngagement('restaurant', restaurant.id, 'map_street_view')
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
          {restaurant.address && (
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
                window.open(url, '_blank')
              }}
            >
              Open in Google Maps
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Location
          </h3>
          
          <div className="flex gap-2">
            {showDirections && (
              <Button
                variant={showingDirections ? 'default' : 'outline'}
                size="sm"
                onClick={showingDirections ? clearDirections : handleGetDirections}
              >
                {showingDirections ? '✕ Clear Route' : '📍 Directions'}
              </Button>
            )}
            
            {showStreetView && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStreetView}
              >
                👁️ Street View
              </Button>
            )}
          </div>
        </div>
        
        {restaurant.address && (
          <p className="text-sm text-gray-600 mt-2">
            {restaurant.address}
          </p>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height: `calc(${height} - 80px)` }}
        className="w-full"
      />

      {/* Nearby Places */}
      {showNearby && nearbyPlaces.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Nearby Restaurants
          </h4>
          <div className="space-y-2">
            {nearbyPlaces.slice(0, 3).map((place) => (
              <div key={place.place_id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">🍽️</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{place.name}</span>
                  {place.rating && (
                    <span className="ml-2 text-gray-500">
                      ⭐ {place.rating}
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {place.vicinity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default RestaurantMap
