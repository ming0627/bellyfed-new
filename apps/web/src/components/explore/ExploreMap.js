import React, { useState, useEffect, useCallback, memo } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * ExploreMap component for displaying an interactive map with restaurant locations
 *
 * @param {Object} props - Component props
 * @param {Array} props.restaurants - Array of restaurant objects with location data
 * @param {Function} props.onSelectRestaurant - Callback when a restaurant is selected
 * @param {string} props.selectedRestaurantId - ID of the currently selected restaurant
 * @param {Object} props.defaultCenter - Default map center coordinates
 * @param {number} props.defaultZoom - Default map zoom level
 * @returns {JSX.Element} - Rendered component
 */
const ExploreMap = memo(function ExploreMap({
  restaurants = [],
  selectedRestaurantId,
  defaultCenter = { lat: 3.139, lng: 101.6869 }, // Default to Kuala Lumpur
  defaultZoom = 12,
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [markers, setMarkers] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    // In a real app, this would use a map library like Google Maps, Mapbox, or Leaflet
    // For this demo, we'll simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update markers when restaurants change
  useEffect(() => {
    if (mapLoaded && restaurants.length > 0) {
      // In a real app, this would create actual map markers
      setMarkers(
        restaurants.map(restaurant => ({
          id: restaurant.id,
          position: restaurant.location,
          title: restaurant.name,
          isSelected: restaurant.id === selectedRestaurantId,
        })),
      );
    }
  }, [mapLoaded, restaurants, selectedRestaurantId]);

  // Handle search
  const handleSearch = useCallback(
    e => {
      e.preventDefault();
      // In a real app, this would search for locations on the map
      console.log('Searching for:', searchQuery);
    },
    [searchQuery],
  );

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(15);
          setIsLoadingLocation(false);
        },
        error => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <input
            type="text"
            placeholder="Search locations..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <LucideClientIcon
            icon={Search}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
            aria-hidden="true"
          />
        </form>

        <button
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Find my location"
        >
          {isLoadingLocation ? (
            <LucideClientIcon
              icon={Loader2}
              className="w-5 h-5 animate-spin mr-2"
              aria-hidden="true"
            />
          ) : (
            <LucideClientIcon
              icon={Navigation}
              className="w-5 h-5 mr-2"
              aria-hidden="true"
            />
          )}
          <span>My Location</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-[500px] bg-gray-100 dark:bg-gray-700">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LucideClientIcon
              icon={Loader2}
              className="w-8 h-8 animate-spin text-orange-500"
              aria-label="Loading map"
            />
          </div>
        ) : (
          <>
            {/* This would be replaced with an actual map component in a real app */}
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LucideClientIcon
                    icon={MapPin}
                    className="w-8 h-8 text-orange-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Interactive Map
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  In a real application, this would display an interactive map
                  with restaurant markers.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Latitude
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {mapCenter.lat.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Longitude
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {mapCenter.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Zoom Level
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {mapZoom}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {markers.length} restaurant markers would be displayed
                </div>
              </div>
            </div>

            {/* User location indicator */}
            {userLocation && (
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-md">
                <div className="flex items-center text-sm">
                  <LucideClientIcon
                    icon={Navigation}
                    className="w-4 h-4 text-orange-500 mr-2"
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Your location
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {restaurants.length} restaurants in this area
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Restaurant
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Your Location
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ExploreMap;
