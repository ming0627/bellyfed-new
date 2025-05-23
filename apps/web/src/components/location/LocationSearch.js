/**
 * Location Search Component
 * 
 * Provides location search functionality with Google Places integration.
 * Allows users to search for and select locations for restaurants, reviews, etc.
 * 
 * Features:
 * - Google Places autocomplete
 * - Current location detection
 * - Location suggestions
 * - Map integration
 * - Address formatting
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { analyticsService } from '../../services/analyticsService.js';

const LocationSearch = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
  showCurrentLocation = true,
  showMap = false,
  defaultValue = '',
  disabled = false,
  className = ''
}) => {
  // State
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Mock Google Places data (in real app, this would use Google Places API)
  const mockPlaces = [
    {
      id: 'place_1',
      name: 'KLCC, Kuala Lumpur',
      address: 'Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia',
      coordinates: { lat: 3.1578, lng: 101.7123 },
      type: 'establishment'
    },
    {
      id: 'place_2',
      name: 'Bukit Bintang, Kuala Lumpur',
      address: 'Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
      coordinates: { lat: 3.1478, lng: 101.7108 },
      type: 'neighborhood'
    },
    {
      id: 'place_3',
      name: 'Pavilion KL',
      address: '168, Jln Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
      coordinates: { lat: 3.1492, lng: 101.7138 },
      type: 'shopping_mall'
    },
    {
      id: 'place_4',
      name: 'Mid Valley Megamall',
      address: 'Lingkaran Syed Putra, Mid Valley City, 59200 Kuala Lumpur, Malaysia',
      coordinates: { lat: 3.1185, lng: 101.6774 },
      type: 'shopping_mall'
    },
    {
      id: 'place_5',
      name: 'Bangsar Village',
      address: '1, Jln Telawi 1, Bangsar, 59100 Kuala Lumpur, Malaysia',
      coordinates: { lat: 3.1319, lng: 101.6741 },
      type: 'shopping_mall'
    }
  ];

  // Search for locations
  const searchLocations = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would call Google Places API
      // For now, we'll filter mock data
      const filtered = mockPlaces.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestions(filtered);
      setShowSuggestions(true);

      // Track search
      trackUserEngagement('location', 'search', 'query', {
        query: searchQuery,
        resultCount: filtered.length
      });
    } catch (err) {
      console.error('Error searching locations:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [trackUserEngagement]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setQuery(location.name);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }

    trackUserEngagement('location', 'select', 'suggestion', {
      locationId: location.id,
      locationType: location.type
    });
  };

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setCurrentLocationLoading(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // In a real app, this would reverse geocode the coordinates
      const currentLocation = {
        id: 'current_location',
        name: 'Current Location',
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        coordinates: { lat: latitude, lng: longitude },
        type: 'current_location'
      };

      handleLocationSelect(currentLocation);

      trackUserEngagement('location', 'current_location', 'success', {
        coordinates: { lat: latitude, lng: longitude }
      });
    } catch (err) {
      console.error('Error getting current location:', err);
      alert('Unable to get your current location. Please try again or search manually.');
      
      trackUserEngagement('location', 'current_location', 'error', {
        error: err.message
      });
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get location type icon
  const getLocationIcon = (type) => {
    switch (type) {
      case 'establishment':
        return '🏢';
      case 'neighborhood':
        return '🏘️';
      case 'shopping_mall':
        return '🛍️';
      case 'restaurant':
        return '🍽️';
      case 'current_location':
        return '📍';
      default:
        return '📍';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span className="text-gray-400">🔍</span>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      {showCurrentLocation && (
        <div className="mt-2">
          <Button
            onClick={getCurrentLocation}
            disabled={currentLocationLoading || disabled}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {currentLocationLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Getting location...
              </>
            ) : (
              <>
                <span className="mr-2">📍</span>
                Use Current Location
              </>
            )}
          </Button>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto"
        >
          <div className="py-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleLocationSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {getLocationIcon(suggestion.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.address}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {showSuggestions && !loading && query.trim() && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No locations found for "{query}"</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600">
              {getLocationIcon(selectedLocation.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-green-800 truncate">
                {selectedLocation.name}
              </div>
              <div className="text-sm text-green-600 truncate">
                {selectedLocation.address}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLocation(null);
                setQuery('');
                if (onLocationSelect) {
                  onLocationSelect(null);
                }
              }}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Map Preview */}
      {showMap && selectedLocation && (
        <div className="mt-3">
          <Card className="p-4">
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <div className="text-sm text-gray-600">
                  Map preview for {selectedLocation.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
