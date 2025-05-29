import { Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRestaurantSearch } from '@/hooks/useRestaurant';
import { Restaurant } from '@/types/restaurant';

import { RestaurantCard } from './RestaurantCard';

/**
 * Restaurant search component
 */

interface RestaurantSearchProps {
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  // showMap is reserved for future use
  showMap?: boolean;
}

export function RestaurantSearch({
  onSelectRestaurant,
}: RestaurantSearchProps): JSX.Element {
  const [query, setQuery] = useState('');
  const {
    searchResults,
    isSearching,
    error,
    searchRestaurants,
    searchRestaurantsByLocation,
  } = useRestaurantSearch();
  const {
    location,
    isLoading: isLoadingLocation,
    error: locationError,
    getLocation,
  } = useGeolocation();

  // Search by query
  const handleSearch = (): void => {
    if (query.trim()) {
      searchRestaurants({ query });
    }
  };

  // Search by location
  const handleLocationSearch = (): void => {
    getLocation();
  };

  // When location is available, search nearby restaurants
  useEffect(() => {
    if (location) {
      searchRestaurantsByLocation(location.latitude, location.longitude);
    }
  }, [location, searchRestaurantsByLocation]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search restaurants..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleLocationSearch}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">Error: {error.message}</div>
      )}

      {locationError && (
        <div className="text-red-500 text-sm">
          Location error: {locationError.message}
        </div>
      )}

      {isSearching && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isSearching && searchResults.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No restaurants found. Try a different search or use your location.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((restaurant) => (
          <RestaurantCard
            key={restaurant.restaurantId}
            restaurant={restaurant}
            onClick={() => onSelectRestaurant?.(restaurant)}
          />
        ))}
      </div>
    </div>
  );
}
