/**
 * Map View Component
 * 
 * Displays interactive maps with restaurant locations, user positions,
 * and various map-based features for location discovery.
 * 
 * Features:
 * - Interactive map with zoom and pan
 * - Restaurant location markers
 * - User location detection
 * - Clustering for multiple markers
 * - Custom marker icons and popups
 * - Search within map bounds
 * - Directions integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const MapView = ({
  center = { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur default
  zoom = 12,
  markers = [],
  showUserLocation = true,
  showSearch = true,
  showDirections = true,
  enableClustering = true,
  onMarkerClick,
  onMapClick,
  className = ''
}) => {
  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Mock map implementation (in real app, would use Google Maps or Mapbox)
  const initializeMap = () => {
    setLoading(true);
    
    // Simulate map loading
    setTimeout(() => {
      setMapLoaded(true);
      setLoading(false);
      
      // Track map initialization
      trackUserEngagement('map', 'initialize', 'success', {
        center,
        zoom,
        markerCount: markers.length
      });
    }, 1000);
  };

  // Get user location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(location);
      
      // Track location access
      trackUserEngagement('map', 'user_location', 'success', {
        accuracy: position.coords.accuracy
      });
    } catch (err) {
      console.error('Error getting user location:', err);
      trackUserEngagement('map', 'user_location', 'error', {
        error: err.message
      });
    }
  };

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    
    if (onMarkerClick) {
      onMarkerClick(marker);
    }

    trackUserEngagement('map', 'marker_click', 'interaction', {
      markerId: marker.id,
      markerType: marker.type
    });
  };

  // Handle directions request
  const handleDirections = (destination) => {
    if (!userLocation) {
      alert('Please enable location access to get directions');
      return;
    }

    // In a real app, this would integrate with Google Maps or similar
    const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination.lat},${destination.lng}`;
    window.open(directionsUrl, '_blank');

    trackUserEngagement('map', 'directions', 'request', {
      destinationId: destination.id,
      hasUserLocation: !!userLocation
    });
  };

  // Get marker icon based on type
  const getMarkerIcon = (marker) => {
    switch (marker.type) {
      case 'restaurant':
        return marker.rating >= 4.5 ? '🌟' : '🏪';
      case 'user':
        return '👤';
      case 'current_location':
        return '📍';
      default:
        return '📍';
    }
  };

  // Get marker color based on rating or type
  const getMarkerColor = (marker) => {
    if (marker.type === 'restaurant' && marker.rating) {
      if (marker.rating >= 4.5) return 'bg-green-500';
      if (marker.rating >= 4.0) return 'bg-yellow-500';
      if (marker.rating >= 3.5) return 'bg-orange-500';
      return 'bg-red-500';
    }
    return 'bg-blue-500';
  };

  // Render marker popup
  const renderMarkerPopup = (marker) => {
    return (
      <Card className="p-4 max-w-xs">
        <div className="flex items-start gap-3">
          {marker.image && (
            <img
              src={marker.image}
              alt={marker.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {marker.name}
            </h3>
            
            {marker.address && (
              <p className="text-sm text-gray-600 mt-1">
                {marker.address}
              </p>
            )}
            
            {marker.rating && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">{marker.rating}</span>
                {marker.reviewCount && (
                  <span className="text-sm text-gray-500">
                    ({marker.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}
            
            {marker.cuisine && (
              <Badge variant="outline" className="mt-2 text-xs">
                {marker.cuisine}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          {marker.type === 'restaurant' && (
            <Button
              onClick={() => window.location.href = `/restaurants/${marker.id}`}
              size="sm"
              className="flex-1"
            >
              View Details
            </Button>
          )}
          
          {showDirections && (
            <Button
              onClick={() => handleDirections(marker)}
              variant="outline"
              size="sm"
            >
              Directions
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    
    if (showUserLocation) {
      getUserLocation();
    }
  }, []);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading map...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Map</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={initializeMap} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-96 bg-gray-100 rounded-lg relative overflow-hidden"
      >
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Mock markers */}
          <div className="absolute inset-0">
            {/* User location marker */}
            {userLocation && (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: '50%', 
                  top: '50%' 
                }}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
            )}
            
            {/* Restaurant markers */}
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${30 + (index % 5) * 15}%`,
                  top: `${25 + Math.floor(index / 5) * 20}%`
                }}
                onClick={() => handleMarkerClick(marker)}
              >
                <div className={`
                  w-8 h-8 rounded-full border-2 border-white shadow-lg
                  flex items-center justify-center text-white text-sm font-bold
                  hover:scale-110 transition-transform
                  ${getMarkerColor(marker)}
                `}>
                  {getMarkerIcon(marker)}
                </div>
                
                {/* Marker label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium text-gray-900 whitespace-nowrap">
                    {marker.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            onClick={() => trackUserEngagement('map', 'zoom_in', 'control')}
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 bg-white"
          >
            +
          </Button>
          <Button
            onClick={() => trackUserEngagement('map', 'zoom_out', 'control')}
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 bg-white"
          >
            -
          </Button>
          
          {showUserLocation && (
            <Button
              onClick={getUserLocation}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-white"
              title="My Location"
            >
              📍
            </Button>
          )}
        </div>

        {/* Search Box */}
        {showSearch && (
          <div className="absolute top-4 left-4 right-20">
            <input
              type="text"
              placeholder="Search this area..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  trackUserEngagement('map', 'search', 'query', {
                    query: e.target.value
                  });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Selected Marker Popup */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {renderMarkerPopup(selectedMarker)}
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Highly Rated (4.5+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>Good Rating (4.0+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
