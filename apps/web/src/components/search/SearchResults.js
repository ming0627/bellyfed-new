import React, { memo } from 'react';
import { useRouter } from 'next/router';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import RestaurantList from '../restaurants/RestaurantList.js';
import SearchFilters from './SearchFilters.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * SearchResults component for displaying search results with filtering options
 * 
 * @param {Object} props - Component props
 * @param {Array} props.results - Array of search results
 * @param {boolean} props.isLoading - Whether data is currently loading
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.locationQuery - Current location query
 * @param {Function} props.onSearch - Function to handle search submission
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const SearchResults = memo(function SearchResults({
  results,
  isLoading,
  searchQuery,
  locationQuery,
  onSearch,
  getCountryLink,
}) {
  const router = useRouter();
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, locationQuery);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LucideClientIcon
          icon={Loader2}
          className="w-8 h-8 animate-spin text-orange-500"
          aria-label="Loading search results"
        />
      </div>
    );
  }
  
  // No results state
  if (!results || results.length === 0) {
    return (
      <div className="py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            No results found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find any results matching your search criteria.
          </p>
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <LucideClientIcon
                  icon={Search}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Try a different search term..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => onSearch({ ...router.query, q: e.target.value })}
                />
              </div>
              <div className="relative">
                <LucideClientIcon
                  icon={MapPin}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Location (city, area, street...)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={locationQuery}
                  onChange={(e) => onSearch({ ...router.query, location: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors"
              >
                Search Again
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <LucideClientIcon
              icon={Search}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, dishes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => onSearch({ ...router.query, q: e.target.value })}
              aria-label="Search term"
            />
          </div>
          
          <div className="flex-1 relative">
            <LucideClientIcon
              icon={MapPin}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Location (city, area, street...)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={locationQuery}
              onChange={(e) => onSearch({ ...router.query, location: e.target.value })}
              aria-label="Location"
            />
          </div>
          
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Results Count */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {results.length} results for "{searchQuery}"
          {locationQuery && ` in "${locationQuery}"`}
        </p>
      </div>
      
      {/* Search Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters
            onFilterChange={(filters) => {
              // In a real app, this would update the URL with filter parameters
              console.log('Filters changed:', filters);
            }}
          />
        </div>
        
        {/* Results */}
        <div className="lg:col-span-3">
          <RestaurantList
            restaurants={results}
            getCountryLink={getCountryLink}
            showFilters={false}
          />
        </div>
      </div>
    </div>
  );
});

export default SearchResults;
