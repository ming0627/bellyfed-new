import React, { memo, useState, useCallback } from 'react';
import { Loader2, Filter, ChevronDown } from 'lucide-react';
import RestaurantCard from './RestaurantCard.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * RestaurantList component for displaying a grid of restaurant cards with filtering and sorting options
 * 
 * @param {Object} props - Component props
 * @param {Array} props.restaurants - Array of restaurant objects
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {string} props.variant - Card variant to use (default, compact, featured)
 * @param {Function} props.onFavoriteToggle - Function to handle favorite toggle
 * @param {boolean} props.showFilters - Whether to show filtering and sorting options
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantList = memo(function RestaurantList({
  restaurants,
  getCountryLink,
  isLoading = false,
  variant = 'default',
  onFavoriteToggle,
  showFilters = true,
}) {
  const [sortOption, setSortOption] = useState('rating');
  const [filterOptions, setFilterOptions] = useState({
    priceRange: [],
    cuisineTypes: [],
    openNow: false,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);

  // Toggle filter panel
  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((type, value) => {
    setFilterOptions(prev => {
      if (type === 'priceRange') {
        // Toggle price range selection
        const newPriceRange = prev.priceRange.includes(value)
          ? prev.priceRange.filter(p => p !== value)
          : [...prev.priceRange, value];
        
        return { ...prev, priceRange: newPriceRange };
      }
      
      if (type === 'cuisineTypes') {
        // Toggle cuisine type selection
        const newCuisineTypes = prev.cuisineTypes.includes(value)
          ? prev.cuisineTypes.filter(c => c !== value)
          : [...prev.cuisineTypes, value];
        
        return { ...prev, cuisineTypes: newCuisineTypes };
      }
      
      if (type === 'openNow') {
        // Toggle open now filter
        return { ...prev, openNow: !prev.openNow };
      }
      
      return prev;
    });
  }, []);

  // Apply filters and sorting to restaurants
  const filteredAndSortedRestaurants = React.useMemo(() => {
    if (!restaurants || restaurants.length === 0) return [];
    
    // Apply filters
    let filtered = [...restaurants];
    
    // Filter by price range
    if (filterOptions.priceRange.length > 0) {
      filtered = filtered.filter(restaurant => 
        filterOptions.priceRange.includes(restaurant.priceRange)
      );
    }
    
    // Filter by cuisine types
    if (filterOptions.cuisineTypes.length > 0) {
      filtered = filtered.filter(restaurant => 
        restaurant.cuisineTypes?.some(cuisine => 
          filterOptions.cuisineTypes.includes(cuisine)
        )
      );
    }
    
    // Filter by open now
    if (filterOptions.openNow) {
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[now.getDay()];
      
      filtered = filtered.filter(restaurant => {
        const hoursToday = restaurant.hours?.[today];
        if (!hoursToday || hoursToday === 'Closed') return false;
        
        try {
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          const [openTime, closeTime] = hoursToday.split('-');
          
          const [openHour, openMinute] = openTime.split(':').map(Number);
          const [closeHour, closeMinute] = closeTime.split(':').map(Number);
          
          const currentTimeMinutes = currentHour * 60 + currentMinute;
          const openTimeMinutes = openHour * 60 + openMinute;
          const closeTimeMinutes = closeHour * 60 + closeMinute;
          
          return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
        } catch (error) {
          return false;
        }
      });
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'reviews':
        return filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'priceAsc':
        return filtered.sort((a, b) => {
          const aPrice = typeof a.priceRange === 'string' 
            ? a.priceRange.length 
            : a.priceRange || 0;
          const bPrice = typeof b.priceRange === 'string' 
            ? b.priceRange.length 
            : b.priceRange || 0;
          return aPrice - bPrice;
        });
      case 'priceDesc':
        return filtered.sort((a, b) => {
          const aPrice = typeof a.priceRange === 'string' 
            ? a.priceRange.length 
            : a.priceRange || 0;
          const bPrice = typeof b.priceRange === 'string' 
            ? b.priceRange.length 
            : b.priceRange || 0;
          return bPrice - aPrice;
        });
      case 'nameAsc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [restaurants, filterOptions, sortOption]);

  // Get unique cuisine types from all restaurants
  const allCuisineTypes = React.useMemo(() => {
    if (!restaurants) return [];
    
    const cuisines = new Set();
    restaurants.forEach(restaurant => {
      restaurant.cuisineTypes?.forEach(cuisine => {
        cuisines.add(cuisine);
      });
    });
    
    return Array.from(cuisines).sort();
  }, [restaurants]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LucideClientIcon
          icon={Loader2}
          className="w-8 h-8 animate-spin text-orange-500"
          aria-label="Loading restaurants"
        />
      </div>
    );
  }

  // Empty state
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No restaurants found matching your criteria.
        </p>
        <button
          onClick={() => {
            setSortOption('rating');
            setFilterOptions({
              priceRange: [],
              cuisineTypes: [],
              openNow: false,
            });
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Sort Options */}
            <div className="flex items-center">
              <label htmlFor="sort-options" className="text-gray-700 dark:text-gray-300 mr-2">
                Sort by:
              </label>
              <select
                id="sort-options"
                value={sortOption}
                onChange={handleSortChange}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="rating">Highest Rating</option>
                <option value="reviews">Most Reviews</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name: A to Z</option>
                <option value="nameDesc">Name: Z to A</option>
              </select>
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={toggleFilter}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LucideClientIcon icon={Filter} className="w-4 h-4 mr-2" aria-hidden="true" />
              Filters
              <LucideClientIcon
                icon={ChevronDown}
                className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
          
          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {['$', '$$', '$$$', '$$$$'].map((price) => (
                      <button
                        key={price}
                        onClick={() => handleFilterChange('priceRange', price)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          filterOptions.priceRange.includes(price)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Cuisine Types Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cuisine Types</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allCuisineTypes.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => handleFilterChange('cuisineTypes', cuisine)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          filterOptions.cuisineTypes.includes(cuisine)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Other Filters */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Other Filters</h3>
                  <div className="flex items-center">
                    <input
                      id="open-now"
                      type="checkbox"
                      checked={filterOptions.openNow}
                      onChange={() => handleFilterChange('openNow')}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="open-now" className="ml-2 text-gray-700 dark:text-gray-300">
                      Open Now
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setFilterOptions({
                      priceRange: [],
                      cuisineTypes: [],
                      openNow: false,
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Showing {filteredAndSortedRestaurants.length} of {restaurants.length} restaurants
          </div>
        </div>
      )}
      
      {/* Restaurant Grid */}
      <div className={`grid grid-cols-1 ${
        variant === 'compact' 
          ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'md:grid-cols-2 lg:grid-cols-3'
      } gap-6`}>
        {filteredAndSortedRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            getCountryLink={getCountryLink}
            variant={variant}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
});

export default RestaurantList;
