import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { MapPin, Star, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import Link from 'next/link';

/**
 * NearbyRestaurants component for displaying a list of restaurants near the user
 *
 * @param {Object} props - Component props
 * @param {Array} props.restaurants - Array of restaurant objects
 * @param {Function} props.onSelectRestaurant - Callback when a restaurant is selected
 * @param {string} props.selectedRestaurantId - ID of the currently selected restaurant
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const NearbyRestaurants = memo(function NearbyRestaurants({
  restaurants = [],
  onSelectRestaurant,
  selectedRestaurantId,
  getCountryLink,
}) {
  const [sortBy, setSortBy] = useState('distance');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 10,
    cuisines: [],
    priceRange: [],
    openNow: false,
  });

  // Toggle filter panel
  const toggleFilter = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback(e => {
    setSortBy(e.target.value);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Apply filters and sorting to restaurants
  const filteredAndSortedRestaurants = [...restaurants]
    // Apply filters
    .filter(restaurant => {
      // Filter by minimum rating
      if (restaurant.rating < filters.minRating) return false;

      // Filter by maximum distance
      if (parseFloat(restaurant.distance) > filters.maxDistance) return false;

      // Filter by cuisine types
      if (
        filters.cuisines.length > 0 &&
        !restaurant.cuisineTypes?.some(cuisine =>
          filters.cuisines.includes(cuisine),
        )
      ) {
        return false;
      }

      // Filter by price range
      if (
        filters.priceRange.length > 0 &&
        !filters.priceRange.includes(restaurant.priceRange)
      ) {
        return false;
      }

      // Filter by open now
      if (filters.openNow && !restaurant.isOpen) return false;

      return true;
    })
    // Apply sorting
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'rating':
          return b.rating - a.rating;
        case 'reviewCount':
          return b.reviewCount - a.reviewCount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nearby Restaurants
          </h2>

          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                value={sortBy}
                onChange={handleSortChange}
                aria-label="Sort restaurants by"
              >
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="reviewCount">Most Reviewed</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* Filter Button */}
            <button
              onClick={toggleFilter}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
            >
              <LucideClientIcon
                icon={Filter}
                className="w-4 h-4 mr-2"
                aria-hidden="true"
              />
              Filter
              <LucideClientIcon
                icon={filterOpen ? ChevronUp : ChevronDown}
                className="w-4 h-4 ml-2"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div
            id="filter-panel"
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Rating
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={e =>
                      handleFilterChange(
                        'minRating',
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                    {filters.minRating}
                  </span>
                </div>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Distance (km)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={filters.maxDistance}
                    onChange={e =>
                      handleFilterChange(
                        'maxDistance',
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                    {filters.maxDistance}
                  </span>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  {['$', '$$', '$$$', '$$$$'].map(price => (
                    <button
                      key={price}
                      onClick={() => {
                        const newPriceRange = filters.priceRange.includes(price)
                          ? filters.priceRange.filter(p => p !== price)
                          : [...filters.priceRange, price];
                        handleFilterChange('priceRange', newPriceRange);
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${
                        filters.priceRange.includes(price)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open Now Filter */}
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.openNow}
                    onChange={e =>
                      handleFilterChange('openNow', e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Open Now
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {filteredAndSortedRestaurants.length > 0 ? (
          filteredAndSortedRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              className={`p-3 cursor-pointer transition-colors ${
                restaurant.id === selectedRestaurantId
                  ? 'bg-orange-50 dark:bg-orange-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
              onClick={() => onSelectRestaurant(restaurant.id)}
            >
              <div className="flex items-start">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  {restaurant.imageUrl ? (
                    <Image
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      width={64}
                      height={64}
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="ml-4 flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        <Link
                          href={getCountryLink(`/restaurants/${restaurant.id}`)}
                          className="hover:text-orange-500 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          {restaurant.name}
                        </Link>
                      </h3>

                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <LucideClientIcon
                            icon={Star}
                            className="w-4 h-4 text-yellow-400"
                            aria-hidden="true"
                          />
                          <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {restaurant.reviewCount} reviews
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {restaurant.priceRange}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.cuisineTypes?.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <LucideClientIcon
                        icon={MapPin}
                        className="w-4 h-4 text-orange-500 mr-1"
                        aria-hidden="true"
                      />
                      <span className="text-gray-600 dark:text-gray-400">
                        {restaurant.distance}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        restaurant.isOpen
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {restaurant.isOpen ? 'Open Now' : 'Closed'}
                    </span>

                    {restaurant.isVerified && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No restaurants found matching your filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  minRating: 0,
                  maxDistance: 10,
                  cuisines: [],
                  priceRange: [],
                  openNow: false,
                })
              }
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default NearbyRestaurants;
