import { Button } from '@/components/ui/button';

import { RestaurantMapView } from '@/components/restaurant/RestaurantMapView';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CuisineType,
  PRICE_RANGE_DESCRIPTIONS,
  PriceRange,
} from '@/config/restaurantConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useCountry } from '@/contexts/CountryContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRestaurantSearch } from '@/hooks/useRestaurant';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant, formatPriceLevel } from '@/types/restaurant';
import { useQuery } from '@tanstack/react-query';
import { Clock, List, Loader2, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_IMAGE =
  'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png';

export default function Restaurants(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cuisine: initialCuisine, location: initialLocation } = router.query;
  const { currentCountry } = useCountry();

  // Get user location
  const { location } = useGeolocation();

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter state
  const [selectedCuisine, setSelectedCuisine] = useState<string>(
    typeof initialCuisine === 'string' ? initialCuisine : 'All',
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    typeof initialLocation === 'string' ? initialLocation : '',
  );
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | 'All'>('All');
  const [useNearby] = useState(false);

  // Check authentication first
  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = router.asPath;
      router.push({
        pathname: '/signin',
        query: {
          returnUrl: currentPath,
          message: 'Please sign in to view restaurants',
        },
      });
    }
  }, [isAuthenticated, router]);

  // Update filters when query params change
  useEffect(() => {
    if (initialCuisine && typeof initialCuisine === 'string') {
      setSelectedCuisine(initialCuisine);
    }
    if (initialLocation && typeof initialLocation === 'string') {
      setSelectedLocation(initialLocation);
    }
  }, [initialCuisine, initialLocation]);

  // Use restaurant search hook
  const {
    searchResults: restaurants,
    isSearching,
    error,
    hasMore,
    searchRestaurants,
    searchRestaurantsByLocation,
    loadMore,
  } = useRestaurantSearch();

  // Define map search handler
  const handleMapSearch = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Calculate center point
      const center = {
        latitude: (ne.lat() + sw.lat()) / 2,
        longitude: (ne.lng() + sw.lng()) / 2,
      };

      // Calculate radius (approximate)
      const earthRadius = 6371000; // meters
      const latDistance = ((ne.lat() - sw.lat()) * Math.PI) / 180;
      const lngDistance = ((ne.lng() - sw.lng()) * Math.PI) / 180;
      const latRadians = (center.latitude * Math.PI) / 180;

      const a =
        Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
        Math.cos(latRadians) *
          Math.cos(latRadians) *
          Math.sin(lngDistance / 2) *
          Math.sin(lngDistance / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const radius = (earthRadius * c) / 2; // half the diagonal distance

      searchRestaurantsByLocation(
        center.latitude,
        center.longitude,
        radius,
        selectedLocation,
        50,
      );
    },
    [searchRestaurantsByLocation, selectedLocation],
  );

  // Initial search
  useEffect(() => {
    if (isAuthenticated) {
      // Use location-based search if nearby is enabled
      if (useNearby && location) {
        searchRestaurantsByLocation(
          location.latitude,
          location.longitude,
          5000, // 5km radius
          selectedLocation,
          20,
        );
      } else {
        // Use regular search

        searchRestaurants({
          query: selectedLocation || undefined,
          cuisine:
            selectedCuisine === 'All'
              ? undefined
              : (selectedCuisine as CuisineType),
          maxPrice:
            selectedPrice === 'All' ? undefined : (selectedPrice as PriceRange),
          countryCode: currentCountry.code,
          limit: 20,
        });
      }
    }
  }, [
    isAuthenticated,
    selectedCuisine,
    selectedLocation,
    selectedPrice,
    useNearby,
    location,
    currentCountry.code,
    searchRestaurants,
    searchRestaurantsByLocation,
  ]);

  // Search by map bounds

  // Get unique cuisine types from all restaurants
  const { data: cuisineData } = useQuery({
    queryKey: ['cuisine-types'],
    queryFn: () => restaurantService.getCuisineTypes(),
  });

  // Get unique price ranges
  const { data: priceData } = useQuery({
    queryKey: ['price-ranges'],
    queryFn: () => restaurantService.getPriceRanges(),
  });

  const handleCuisineChange = useCallback((value: string) => {
    setSelectedCuisine(value);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setSelectedLocation(value);
  }, []);

  const handlePriceChange = useCallback((value: PriceRange | 'All') => {
    setSelectedPrice(value);
  }, []);

  // If error, show error state
  if (error) {
    if (
      error instanceof Error &&
      error.message === 'No authentication token available'
    ) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please sign in to view restaurants
              </p>
              <Button
                onClick={() =>
                  router.push({
                    pathname: '/signin',
                    query: { returnUrl: router.asPath },
                  })
                }
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Restaurants
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "Sorry, we couldn't load the restaurants. Please try again."}
            </p>
            <Button onClick={() => router.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
            <button
              onClick={() => router.push('/')}
              className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-2 text-sm"
            >
              ← Back to Home
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <div className="max-w-7xl mx-auto mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Discover Restaurants
                  </h1>
                  <p className="text-lg text-gray-600">
                    Find the best restaurants in your area
                  </p>
                </div>
                <Tabs
                  value={viewMode}
                  onValueChange={(value: string) =>
                    setViewMode(value as 'list' | 'map')
                  }
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger
                      value="list"
                      className="flex items-center gap-1"
                    >
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="map"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Map</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cuisine Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type
                    </label>
                    <select
                      value={selectedCuisine}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleCuisineChange(e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={isSearching}
                    >
                      <option value="All">All Cuisines</option>
                      {cuisineData?.types?.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleLocationChange(e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={isSearching}
                    />
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={selectedPrice}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handlePriceChange(e.target.value as PriceRange | 'All')
                      }
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={isSearching}
                    >
                      <option value="All">All Prices</option>
                      {priceData?.ranges?.map((price) => (
                        <option key={price} value={price}>
                          {price} - {PRICE_RANGE_DESCRIPTIONS[price]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant View (List or Map) */}
            <div className="max-w-7xl mx-auto">
              {isSearching && !restaurants.length ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {viewMode === 'list' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {restaurants.map((restaurant: Restaurant) => (
                          <Card
                            key={restaurant.restaurantId}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/${currentCountry.code}/restaurant/${restaurant.restaurantId}`,
                              )
                            }
                          >
                            <div className="relative h-48">
                              {restaurant.photos &&
                              restaurant.photos.length > 0 ? (
                                <Image
                                  src={restaurant.photos[0].photoUrl}
                                  alt={restaurant.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              ) : (
                                <Image
                                  src={DEFAULT_IMAGE}
                                  alt={restaurant.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              )}
                              {restaurant.rating && (
                                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span className="font-medium text-sm">
                                    {restaurant.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h2 className="text-xl font-semibold text-gray-900">
                                    {restaurant.name}
                                  </h2>
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {restaurant.address}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="bg-red-100 text-red-800 whitespace-nowrap"
                                >
                                  {formatPriceLevel(restaurant.priceLevel)}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                {restaurant.hours &&
                                  restaurant.hours.length > 0 && (
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span className="text-xs">
                                        {new Date().getHours() >= 8 &&
                                        new Date().getHours() <= 22 ? (
                                          <span className="text-green-600">
                                            Open Now
                                          </span>
                                        ) : (
                                          <span className="text-red-500">
                                            Closed
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}

                                {restaurant.phone && (
                                  <a
                                    href={`tel:${restaurant.phone}`}
                                    className="text-xs text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {restaurant.phone}
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mb-8">
                      <RestaurantMapView
                        restaurants={restaurants}
                        isLoading={isSearching}
                        onSearch={handleMapSearch}
                      />
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center mb-8">
                      <Button
                        onClick={loadMore}
                        disabled={isSearching}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
