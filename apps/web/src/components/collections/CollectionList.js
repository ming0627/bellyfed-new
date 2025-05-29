import React, { useState, memo } from 'react';
import { Search, MapPin, Utensils, Clock } from 'lucide-react';
import CollectionCard from './CollectionCard.js';

/**
 * CollectionList component for displaying a filterable list of collections
 *
 * @param {Object} props - Component props
 * @param {Array} props.collections - Array of collection objects
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {string} props.variant - Card variant (default, horizontal, compact)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const CollectionList = memo(function CollectionList({
  collections = [],
  getCountryLink,
  variant = 'default',
  className = '',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Extract unique locations from collections
  const locations = [
    ...new Set(
      collections.map(collection => collection.location).filter(Boolean),
    ),
  ].sort();

  // Handle search input change
  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  // Handle location filter change
  const handleLocationFilterChange = e => {
    setFilterLocation(e.target.value);
  };

  // Handle sort change
  const handleSortChange = e => {
    setSortBy(e.target.value);
  };

  // Filter collections based on search query and location filter
  const filteredCollections = collections.filter(collection => {
    // Search filter
    const searchMatch =
      searchQuery === '' ||
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      collection.curator?.toLowerCase().includes(searchQuery.toLowerCase());

    // Location filter
    const locationMatch =
      filterLocation === 'all' || collection.location === filterLocation;

    return searchMatch && locationMatch;
  });

  // Sort collections based on sort option
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    if (sortBy === 'newest') {
      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    } else if (sortBy === 'oldest') {
      return (
        new Date(a.updatedAt || a.createdAt || 0) -
        new Date(b.updatedAt || b.createdAt || 0)
      );
    } else if (sortBy === 'restaurants-high') {
      return b.restaurantCount - a.restaurantCount;
    } else if (sortBy === 'restaurants-low') {
      return a.restaurantCount - b.restaurantCount;
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search collections..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
               />
            </div>
            <select
              className="pl-10 pr-8 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="restaurants-high">Most Restaurants</option>
              <option value="restaurants-low">Fewest Restaurants</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Location Filter */}
        {locations.length > 0 && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
               />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={filterLocation}
              onChange={handleLocationFilterChange}
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedCollections.length}{' '}
        {sortedCollections.length === 1 ? 'collection' : 'collections'}
        {filterLocation !== 'all' && ` in ${filterLocation}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Collections Grid */}
      {sortedCollections.length > 0 ? (
        <div
          className={`grid gap-6 ${
            variant === 'compact'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              : variant === 'horizontal'
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {sortedCollections.map(collection => (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              title={collection.title}
              description={collection.description}
              imageUrl={collection.imageUrl}
              restaurantCount={collection.restaurantCount}
              location={collection.location}
              curator={collection.curator}
              updatedAt={collection.updatedAt || collection.createdAt}
              isFeatured={collection.isFeatured}
              isNew={collection.isNew}
              getCountryLink={getCountryLink}
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <UtensilsclassName="w-8 h-8 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
             />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Collections Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery || filterLocation !== 'all'
              ? 'No collections match your search criteria. Try adjusting your filters.'
              : 'There are no collections available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
});

export default CollectionList;
