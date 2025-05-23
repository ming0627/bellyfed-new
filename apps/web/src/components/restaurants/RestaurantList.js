/**
 * RestaurantList Component
 * 
 * A versatile component for displaying a list of restaurants with filtering and sorting options.
 * 
 * Features:
 * - Responsive grid layout
 * - Filtering by cuisine, price range, rating, etc.
 * - Sorting by various criteria
 * - Search functionality
 * - Pagination
 * - Empty state handling
 * - Loading state
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import RestaurantCard from './RestaurantCard.js';

/**
 * RestaurantList component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.restaurants - Array of restaurant objects
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {Function} props.onLoadMore - Function to load more restaurants
 * @param {boolean} props.hasMore - Whether there are more restaurants to load
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {boolean} props.showFilters - Whether to show filter options
 * @param {string} props.emptyMessage - Message to display when there are no restaurants
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantList = memo(function RestaurantList({
  restaurants = [],
  isLoading = false,
  onLoadMore,
  hasMore = false,
  getCountryLink = (path) => path,
  showFilters = true,
  emptyMessage = 'No restaurants found',
  className = '',
}) {
  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    cuisines: [],
    priceRange: [],
    minRating: 0,
    openNow: false,
  });

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => {
      if (type === 'cuisines' || type === 'priceRange') {
        // Toggle array values
        const currentValues = prev[type] || [];
        return {
          ...prev,
          [type]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value],
        };
      }
      
      // Toggle boolean values or set other values directly
      return {
        ...prev,
        [type]: type === 'openNow' ? !prev.openNow : value,
      };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      cuisines: [],
      priceRange: [],
      minRating: 0,
      openNow: false,
    });
    setSearchQuery('');
  }, []);

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    // First, filter restaurants
    let result = restaurants.filter(restaurant => {
      // Search query filter
      if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Cuisine filter
      if (filters.cuisines.length > 0 && !filters.cuisines.includes(restaurant.cuisine)) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange.length > 0 && !filters.priceRange.includes(restaurant.priceRange)) {
        return false;
      }
      
      // Rating filter
      if (filters.minRating > 0 && restaurant.rating < filters.minRating) {
        return false;
      }
      
      // Open now filter
      if (filters.openNow && !restaurant.isOpen) {
        return false;
      }
      
      return true;
    });
    
    // Then, sort restaurants
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviewCount':
          return b.reviewCount - a.reviewCount;
        case 'priceAsc':
          return a.priceRange.length - b.priceRange.length;
        case 'priceDesc':
          return b.priceRange.length - a.priceRange.length;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          if (!a.distance || !b.distance) return 0;
          const aDistance = parseFloat(a.distance.replace(/[^0-9.]/g, ''));
          const bDistance = parseFloat(b.distance.replace(/[^0-9.]/g, ''));
          return aDistance - bDistance;
        default:
          return 0;
      }
    });
  }, [restaurants, searchQuery, filters, sortBy]);

  // Get unique cuisines from restaurants
  const availableCuisines = useMemo(() => {
    const cuisines = new Set();
    restaurants.forEach(restaurant => {
      if (restaurant.cuisine) {
        cuisines.add(restaurant.cuisine);
      }
    });
    return Array.from(cuisines).sort();
  }, [restaurants]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filters.cuisines.length > 0 ||
      filters.priceRange.length > 0 ||
      filters.minRating > 0 ||
      filters.openNow
    );
  }, [searchQuery, filters]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Bar */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <LucideClientIcon
              icon={Search}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search restaurants"
            />
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Sort by:
              </label>
              <select
                id="sort-by"
                className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="rating">Highest Rated</option>
                <option value="reviewCount">Most Reviewed</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={handleFilterToggle}
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
            >
              <LucideClientIcon
                icon={Filter}
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {filters.cuisines.length + filters.priceRange.length + (filters.minRating > 0 ? 1 : 0) + (filters.openNow ? 1 : 0) + (searchQuery.trim() !== '' ? 1 : 0)}
                </span>
              )}
              <LucideClientIcon
                icon={filterOpen ? ChevronUp : ChevronDown}
                className="w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cuisine Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuisine
                  </h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {availableCuisines.map(cuisine => (
                      <label
                        key={cuisine}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={filters.cuisines.includes(cuisine)}
                          onChange={() => handleFilterChange('cuisines', cuisine)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {cuisine}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </h3>
                  <div className="space-y-1">
                    {['$', '$$', '$$$', '$$$$'].map(price => (
                      <label
                        key={price}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={filters.priceRange.includes(price)}
                          onChange={() => handleFilterChange('priceRange', price)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </h3>
                  <div className="space-y-1">
                    {[4, 3, 2, 1].map(rating => (
                      <label
                        key={rating}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          className="border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={filters.minRating === rating}
                          onChange={() => handleFilterChange('minRating', rating)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                          {rating}+ <LucideClientIcon icon={Star} className="w-3 h-3 ml-1 text-yellow-500" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Filters
                  </h3>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={filters.openNow}
                        onChange={() => handleFilterChange('openNow')}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Open Now
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Restaurant Grid */}
      {isLoading && restaurants.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <LucideClientIcon
            icon={Loader2}
            className="w-8 h-8 animate-spin text-orange-500"
            aria-label="Loading restaurants"
          />
        </div>
      ) : filteredAndSortedRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              imageUrl={restaurant.imageUrl}
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
              cuisine={restaurant.cuisine}
              priceRange={restaurant.priceRange}
              location={restaurant.location}
              distance={restaurant.distance}
              isOpen={restaurant.isOpen}
              isVerified={restaurant.isVerified}
              description={restaurant.description}
              onToggleFavorite={() => {}}
              getCountryLink={getCountryLink}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{emptyMessage}</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Load More
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && restaurants.length > 0 && (
        <div className="flex justify-center mt-4">
          <LucideClientIcon
            icon={Loader2}
            className="w-6 h-6 animate-spin text-orange-500"
            aria-label="Loading more restaurants"
          />
        </div>
      )}
    </div>
  );
});

export default RestaurantList;
