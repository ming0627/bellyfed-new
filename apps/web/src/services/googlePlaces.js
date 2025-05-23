/**
 * Google Places Service
 *
 * This module provides integration with Google Places API for location search,
 * place details, and geocoding functionality. It includes specific optimizations
 * for Malaysian locations and proper error handling.
 */

import { getEnvironmentName } from '../utils/environment.js'

/**
 * Location Details interface
 */
export const LocationDetails = {
  placeId: '',
  name: '',
  formattedAddress: '',
  location: {
    lat: 0,
    lng: 0
  },
  types: [],
  rating: 0,
  priceLevel: 0,
  photos: [],
  openingHours: null,
  phoneNumber: '',
  website: '',
  vicinity: ''
}

/**
 * Place Photo interface
 */
export const PlacePhoto = {
  photoReference: '',
  width: 0,
  height: 0,
  htmlAttributions: []
}

/**
 * Opening Hours interface
 */
export const OpeningHours = {
  openNow: false,
  periods: [],
  weekdayText: []
}

/**
 * Google Places Service class
 */
export class GooglePlacesService {
  constructor() {
    this.API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''
    this.PLACE_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    this.PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'
    this.GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
    this.PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo'
    
    // Malaysian coordinates boundaries
    this.MALAYSIA_BOUNDS = {
      north: 7.363417,  // Northernmost point
      south: 0.855222,  // Southernmost point
      east: 119.267502, // Easternmost point
      west: 99.643448   // Westernmost point
    }
    
    this.environment = getEnvironmentName()
    
    if (!this.API_KEY) {
      console.warn('Google Places API key not found. Some features may not work.')
    }
  }

  /**
   * Check if API key is available
   * @returns {boolean} Whether API key is configured
   */
  isConfigured() {
    return !!this.API_KEY
  }

  /**
   * Search for places by text query
   * @param {string} query The search query
   * @param {object} options Search options
   * @returns {Promise<Array>} Array of place results
   */
  async searchPlaces(query, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Google Places API key not configured')
      }

      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required and must be a string')
      }

      const {
        location = null,
        radius = 50000, // 50km default radius
        type = null,
        language = 'en',
        region = 'my'
      } = options

      const params = new URLSearchParams({
        query: `${query} malaysia`,
        key: this.API_KEY,
        language,
        region
      })

      // Add location bias for Malaysia
      params.append('locationbias', 
        `rectangle:${this.MALAYSIA_BOUNDS.south},${this.MALAYSIA_BOUNDS.west}|${this.MALAYSIA_BOUNDS.north},${this.MALAYSIA_BOUNDS.east}`
      )

      if (location) {
        params.append('location', `${location.lat},${location.lng}`)
        params.append('radius', radius.toString())
      }

      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`${this.PLACE_SEARCH_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }

      return this.transformSearchResults(data.results || [])
    } catch (error) {
      console.error('Error searching places:', error)
      throw new Error(`Failed to search places: ${error.message}`)
    }
  }

  /**
   * Get detailed information about a place
   * @param {string} placeId The place ID
   * @param {object} options Request options
   * @returns {Promise<object>} Place details
   */
  async getPlaceDetails(placeId, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Google Places API key not configured')
      }

      if (!placeId || typeof placeId !== 'string') {
        throw new Error('Place ID is required and must be a string')
      }

      const {
        fields = [
          'place_id', 'name', 'formatted_address', 'geometry',
          'types', 'rating', 'price_level', 'photos',
          'opening_hours', 'international_phone_number',
          'website', 'vicinity'
        ],
        language = 'en'
      } = options

      const params = new URLSearchParams({
        place_id: placeId,
        fields: fields.join(','),
        key: this.API_KEY,
        language
      })

      const response = await fetch(`${this.PLACE_DETAILS_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }

      return this.transformPlaceDetails(data.result)
    } catch (error) {
      console.error('Error getting place details:', error)
      throw new Error(`Failed to get place details: ${error.message}`)
    }
  }

  /**
   * Search for a place by query and return the first result's place ID
   * @param {string} query The search query
   * @returns {Promise<string|null>} Place ID or null if not found
   */
  async searchPlaceByQuery(query) {
    try {
      const params = new URLSearchParams({
        query: `${query} malaysia`,
        key: this.API_KEY,
        region: 'my',
        locationbias: `rectangle:${this.MALAYSIA_BOUNDS.south},${this.MALAYSIA_BOUNDS.west}|${this.MALAYSIA_BOUNDS.north},${this.MALAYSIA_BOUNDS.east}`
      })

      const response = await fetch(`${this.PLACE_SEARCH_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.results?.length) {
        return null
      }

      return data.results[0].place_id
    } catch (error) {
      console.error('Error searching place:', error)
      return null
    }
  }

  /**
   * Search for location details by query
   * @param {string} query The search query
   * @returns {Promise<object|null>} Location details or null if not found
   */
  async searchLocation(query) {
    try {
      console.log('\n=== Starting Location Search ===')
      console.log('Query:', query)

      // First, try to find the place ID
      const placeId = await this.searchPlaceByQuery(query)
      if (!placeId) {
        console.log('❌ No place ID found for query')
        return null
      }
      console.log('✅ Found Place ID:', placeId)

      // Get detailed place information
      const placeDetails = await this.getPlaceDetails(placeId)
      if (!placeDetails) {
        console.log('❌ No place details found')
        return null
      }

      console.log('✅ Location search completed successfully')
      return placeDetails
    } catch (error) {
      console.error('Error in location search:', error)
      return null
    }
  }

  /**
   * Get photo URL for a place photo
   * @param {string} photoReference The photo reference
   * @param {object} options Photo options
   * @returns {string} Photo URL
   */
  getPhotoUrl(photoReference, options = {}) {
    if (!this.isConfigured()) {
      return ''
    }

    const {
      maxWidth = 400,
      maxHeight = 400
    } = options

    const params = new URLSearchParams({
      photoreference: photoReference,
      maxwidth: maxWidth.toString(),
      maxheight: maxHeight.toString(),
      key: this.API_KEY
    })

    return `${this.PHOTO_URL}?${params}`
  }

  /**
   * Geocode an address to get coordinates
   * @param {string} address The address to geocode
   * @returns {Promise<object|null>} Geocoding result or null
   */
  async geocodeAddress(address) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Google Places API key not configured')
      }

      if (!address || typeof address !== 'string') {
        throw new Error('Address is required and must be a string')
      }

      const params = new URLSearchParams({
        address: `${address}, Malaysia`,
        key: this.API_KEY,
        region: 'my'
      })

      const response = await fetch(`${this.GEOCODING_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results?.length) {
        return null
      }

      const result = data.results[0]
      return {
        formattedAddress: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        placeId: result.place_id,
        types: result.types || []
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param {number} lat Latitude
   * @param {number} lng Longitude
   * @returns {Promise<object|null>} Reverse geocoding result or null
   */
  async reverseGeocode(lat, lng) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Google Places API key not configured')
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Latitude and longitude must be numbers')
      }

      const params = new URLSearchParams({
        latlng: `${lat},${lng}`,
        key: this.API_KEY,
        result_type: 'street_address|premise',
        location_type: 'ROOFTOP|GEOMETRIC_CENTER',
        language: 'en'
      })

      const response = await fetch(`${this.GEOCODING_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results?.length) {
        return null
      }

      const result = data.results[0]
      return {
        formattedAddress: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        placeId: result.place_id,
        types: result.types || []
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return null
    }
  }

  /**
   * Transform search results to standard format
   * @param {Array} results Raw Google Places results
   * @returns {Array} Transformed results
   */
  transformSearchResults(results) {
    return results.map(place => ({
      placeId: place.place_id,
      name: place.name,
      formattedAddress: place.formatted_address,
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      types: place.types || [],
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      photos: (place.photos || []).map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        htmlAttributions: photo.html_attributions || []
      }))
    }))
  }

  /**
   * Transform place details to standard format
   * @param {object} place Raw Google Places place details
   * @returns {object} Transformed place details
   */
  transformPlaceDetails(place) {
    return {
      placeId: place.place_id,
      name: place.name,
      formattedAddress: place.formatted_address,
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      types: place.types || [],
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      photos: (place.photos || []).map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        htmlAttributions: photo.html_attributions || []
      })),
      openingHours: place.opening_hours ? {
        openNow: place.opening_hours.open_now || false,
        periods: place.opening_hours.periods || [],
        weekdayText: place.opening_hours.weekday_text || []
      } : null,
      phoneNumber: place.international_phone_number || '',
      website: place.website || '',
      vicinity: place.vicinity || ''
    }
  }

  /**
   * Get service health status
   * @returns {Promise<object>} Service health information
   */
  async getHealthStatus() {
    try {
      const isConfigured = this.isConfigured()
      
      // Test API connectivity if configured
      let isConnected = false
      if (isConfigured) {
        try {
          // Test with a simple geocoding request
          const testResult = await this.geocodeAddress('Kuala Lumpur')
          isConnected = !!testResult
        } catch (error) {
          console.warn('Google Places API connectivity test failed:', error.message)
        }
      }
      
      return {
        status: isConfigured && isConnected ? 'healthy' : 'degraded',
        isConfigured,
        isConnected,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting Google Places service health status:', error)
      return {
        status: 'unhealthy',
        isConfigured: this.isConfigured(),
        isConnected: false,
        error: error.message,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Export a singleton instance
export const googlePlacesService = new GooglePlacesService()
