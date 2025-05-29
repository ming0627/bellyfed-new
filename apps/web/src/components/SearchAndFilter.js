/**
 * SearchAndFilter Component
 * 
 * A versatile search and filter component that can be used across the application.
 * It combines search functionality with filtering options in a single component.
 * 
 * Features:
 * - Search input with customizable placeholder
 * - Optional location search
 * - Expandable filter panel
 * - Support for various filter types (price range, cuisine types, ratings, etc.)
 * - Mobile-friendly design with responsive layout
 * - Support for URL-based filtering and search
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/router';
import { Search, MapPin, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
/**
 * SearchAndFilter component
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.locationQuery - Current location query
 * @param {Object} props.filters - Current filters
 * @param {Function} props.onSearch - Function to handle search submission
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.locationPlaceholder - Placeholder text for location input
 * @param {boolean} props.showLocationSearch - Whether to show location search input
 * @param {boolean} props.showFilters - Whether to show filter options
 * @param {Array} props.availableFilters - Array of filter types to show
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const SearchAndFilter = memo(function SearchAndFilter({
  searchQuery = '',
  locationQuery = '',
  filters = {},
  onSearch,
  onFilterChange,
  searchPlaceholder = 'Search...',
  locationPlaceholder = 'Location...',
  showLocationSearch = true,
  showFilters = true,
  availableFilters = ['price', 'cuisine', 'rating', 'features'],
  className = '',
}) {
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localLocationQuery, setLocalLocationQuery] = useState(locationQuery);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
    setLocalLocationQuery(locationQuery);
    setLocalFilters(filters);
  }, [searchQuery, locationQuery, filters]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  // Handle location input change
  const handleLocationChange = useCallback((e) => {
    setLocalLocationQuery(e.target.value);
  }, []);

  // Handle search form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        q: localSearchQuery,
        location: localLocationQuery,
        ...localFilters,
      });
    }
  }, [localSearchQuery, localLocationQuery, localFilters, onSearch]);

  // Toggle filter panel
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = {
      ...localFilters,
      [filterType]: value,
    };
    
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [localFilters, onFilterChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const emptyFilters = {
      priceRange: [],
      cuisineTypes: [],
      rating: null,
      features: [],
      openNow: false,
      offerDelivery: false,
      offerTakeout: false,
    };
    
    setLocalFilters(emptyFilters);
    
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  }, [onFilterChange]);

  // Count active filters
  const activeFiltersCount = Object.entries(localFilters).reduce(
    (count, [key, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    },
    0,
  );

  // Mock price ranges for demo
  const priceRanges = [
    { value: '1', label: '$' },
    { value: '2', label: '$$' },
    { value: '3', label: '$$$' },
    { value: '4', label: '$$$$' },
  ];

  // Mock cuisine types for demo
  const cuisineTypes = [
    'Malaysian',
    'Japanese',
    'Chinese',
    'Indian',
    'Italian',
    'Mexican',
    'Thai',
    'Korean',
    'Western',
    'Fusion',
  ];

  // Mock features for demo
  const features = [
    'Parking',
    'Wifi',
    'Outdoor Seating',
    'Air Conditioning',
    'Wheelchair Accessible',
    'Family Friendly',
    'Pet Friendly',
  ];

  // Mock ratings for demo
  const ratings = [
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 1, label: '1+ Stars' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
             />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={localSearchQuery}
              onChange={handleSearchChange}
              aria-label="Search term"
            />
          </div>

          {/* Location Input (Optional) */}
          {showLocationSearch && (
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
               />
              <input
                type="text"
                placeholder={locationPlaceholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={localLocationQuery}
                onChange={handleLocationChange}
                aria-label="Location"
              />
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
          >
            Search
          </button>

          {/* Filter Toggle Button (Mobile) */}
          {showFilters && (
            <button
              type="button"
              onClick={toggleFilterPanel}
              className="md:hidden px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              aria-expanded={isFilterPanelOpen}
              aria-controls="filter-panel"
            >
              <Filter className="w-5 h-5 mr-2"
                aria-hidden="true"
               />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (isFilterPanelOpen || window.innerWidth >= 768) && (
          <div
            id="filter-panel"
            className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range Filter */}
              {availableFilters.includes('price') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Price Range
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map(range => (
                      <button
                        key={range.value}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          localFilters.priceRange?.includes(range.value)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => {
                          const currentValues = localFilters.priceRange || [];
                          const newValues = currentValues.includes(range.value)
                            ? currentValues.filter(v => v !== range.value)
                            : [...currentValues, range.value];
                          handleFilterChange('priceRange', newValues);
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisine Types Filter */}
              {availableFilters.includes('cuisine') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Cuisine Types
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                    {cuisineTypes.map(cuisine => (
                      <label
                        key={cuisine}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={localFilters.cuisineTypes?.includes(cuisine) || false}
                          onChange={() => {
                            const currentValues = localFilters.cuisineTypes || [];
                            const newValues = currentValues.includes(cuisine)
                              ? currentValues.filter(v => v !== cuisine)
                              : [...currentValues, cuisine];
                            handleFilterChange('cuisineTypes', newValues);
                          }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {cuisine}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Ratings Filter */}
              {availableFilters.includes('rating') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Ratings
                  </h4>
                  <div className="space-y-1">
                    {ratings.map(rating => (
                      <label
                        key={rating.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          className="border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={localFilters.rating === rating.value}
                          onChange={() => handleFilterChange('rating', rating.value)}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {rating.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Options */}
              {availableFilters.includes('features') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Additional Options
                  </h4>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={localFilters.openNow || false}
                        onChange={() => handleFilterChange('openNow', !localFilters.openNow)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Open Now
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={localFilters.offerDelivery || false}
                        onChange={() => handleFilterChange('offerDelivery', !localFilters.offerDelivery)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Offers Delivery
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={localFilters.offerTakeout || false}
                        onChange={() => handleFilterChange('offerTakeout', !localFilters.offerTakeout)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Offers Takeout
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
});

export default SearchAndFilter;
