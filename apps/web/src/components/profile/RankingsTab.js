/**
 * RankingsTab Component
 *
 * A component for displaying a user's dish rankings in their profile.
 * It shows a list of dishes the user has ranked, with filtering and sorting options.
 *
 * Features:
 * - Display user's dish rankings
 * - Filter rankings by rank, cuisine, and search query
 * - Sort rankings by date, rank, or dish name
 * - Empty state handling
 * - Loading state
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Utensils,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAuth } from '@bellyfed/hooks';

/**
 * RankingsTab component
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const RankingsTab = memo(function RankingsTab({
  user,
  getCountryLink,
}) {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRank, setFilterRank] = useState('all');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get authentication state
  const { isAuthenticated, user: currentUser } = useAuth();

  // Determine if this is the current user's profile
  const isCurrentUser = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    return currentUser.id === user.id;
  }, [isAuthenticated, currentUser, user.id]);

  // Mock data for user rankings (in a real app, this would come from an API)
  const [rankings, setRankings] = useState([
    {
      id: 'ranking1',
      dishId: 'dish1',
      dishName: 'Nasi Lemak',
      dishSlug: 'nasi-lemak',
      dishImageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurantId: 'restaurant1',
      restaurantName: 'Village Park Restaurant',
      restaurantLocation: 'Kuala Lumpur',
      cuisine: 'Malaysian',
      rank: 5,
      tasteStatus: 'loved',
      notes: 'This is the best Nasi Lemak I\'ve ever had! The sambal is spicy but not overwhelming, and the coconut rice is perfectly cooked.',
      photoUrls: ['https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
      createdAt: '2023-06-15T08:30:00Z',
      updatedAt: '2023-06-15T08:30:00Z',
    },
    {
      id: 'ranking2',
      dishId: 'dish2',
      dishName: 'Char Kway Teow',
      dishSlug: 'char-kway-teow',
      dishImageUrl: 'https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurantId: 'restaurant2',
      restaurantName: 'Penang Famous',
      restaurantLocation: 'Penang',
      cuisine: 'Chinese',
      rank: 4,
      tasteStatus: 'liked',
      notes: 'Very good Char Kway Teow, but I\'ve had better. The noodles could be a bit more charred.',
      photoUrls: ['https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
      createdAt: '2023-06-10T14:45:00Z',
      updatedAt: '2023-06-10T14:45:00Z',
    },
    {
      id: 'ranking3',
      dishId: 'dish3',
      dishName: 'Roti Canai',
      dishSlug: 'roti-canai',
      dishImageUrl: 'https://images.unsplash.com/photo-1626694733135-2d4c1b8c2f9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurantId: 'restaurant3',
      restaurantName: 'Mamak Corner',
      restaurantLocation: 'Kuala Lumpur',
      cuisine: 'Indian',
      rank: 3,
      tasteStatus: 'okay',
      notes: 'It was okay, but nothing special. The roti was a bit too oily.',
      photoUrls: ['https://images.unsplash.com/photo-1626694733135-2d4c1b8c2f9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
      createdAt: '2023-06-05T11:20:00Z',
      updatedAt: '2023-06-05T11:20:00Z',
    },
    {
      id: 'ranking4',
      dishId: 'dish4',
      dishName: 'Laksa',
      dishSlug: 'laksa',
      dishImageUrl: 'https://images.unsplash.com/photo-1618626422502-5f0cf2b9c2b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurantId: 'restaurant4',
      restaurantName: 'Laksa House',
      restaurantLocation: 'Penang',
      cuisine: 'Malaysian',
      rank: 2,
      tasteStatus: 'disliked',
      notes: 'I didn\'t like this Laksa at all. The broth was too watery and lacked flavor.',
      photoUrls: ['https://images.unsplash.com/photo-1618626422502-5f0cf2b9c2b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
      createdAt: '2023-05-20T09:15:00Z',
      updatedAt: '2023-05-20T09:15:00Z',
    },
    {
      id: 'ranking5',
      dishId: 'dish5',
      dishName: 'Satay',
      dishSlug: 'satay',
      dishImageUrl: 'https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurantId: 'restaurant5',
      restaurantName: 'Satay Station',
      restaurantLocation: 'Kuala Lumpur',
      cuisine: 'Malaysian',
      rank: 5,
      tasteStatus: 'loved',
      notes: 'The best satay in town! The meat is tender and the peanut sauce is perfect.',
      photoUrls: ['https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
      createdAt: '2023-05-15T18:30:00Z',
      updatedAt: '2023-05-15T18:30:00Z',
    },
  ]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Get unique cuisines from rankings
  const cuisines = useMemo(() => {
    const uniqueCuisines = new Set(rankings.map(ranking => ranking.cuisine));
    return ['all', ...Array.from(uniqueCuisines)];
  }, [rankings]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  // Handle rank filter change
  const handleRankFilterChange = useCallback((rank) => {
    setFilterRank(rank);
  }, []);

  // Handle cuisine filter change
  const handleCuisineFilterChange = useCallback((cuisine) => {
    setFilterCuisine(cuisine);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  // Handle sort order change
  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterRank('all');
    setFilterCuisine('all');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  // Format taste status for display
  const formatTasteStatus = useCallback((status) => {
    switch (status) {
      case 'loved':
        return { label: 'Loved it', icon: Heart, color: 'text-red-500' };
      case 'liked':
        return { label: 'Liked it', icon: ThumbsUp, color: 'text-green-500' };
      case 'okay':
        return { label: 'It was okay', icon: Meh, color: 'text-yellow-500' };
      case 'disliked':
        return { label: 'Didn\'t like it', icon: ThumbsDown, color: 'text-gray-500' };
      default:
        return { label: 'Not specified', icon: null, color: '' };
    }
  }, []);

  // Filter and sort rankings
  const filteredAndSortedRankings = useMemo(() => {
    // First, filter rankings
    let result = rankings.filter(ranking => {
      // Search query filter
      const searchMatch =
        searchQuery === '' ||
        ranking.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ranking.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ranking.notes.toLowerCase().includes(searchQuery.toLowerCase());

      // Rank filter
      const rankMatch =
        filterRank === 'all' ||
        (filterRank === '5' && ranking.rank === 5) ||
        (filterRank === '4' && ranking.rank === 4) ||
        (filterRank === '3' && ranking.rank === 3) ||
        (filterRank === '2' && ranking.rank === 2) ||
        (filterRank === '1' && ranking.rank === 1);

      // Cuisine filter
      const cuisineMatch =
        filterCuisine === 'all' ||
        ranking.cuisine === filterCuisine;

      return searchMatch && rankMatch && cuisineMatch;
    });

    // Then, sort rankings
    return result.sort((a, b) => {
      const sortMultiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'date':
          return sortMultiplier * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        case 'rank':
          return sortMultiplier * (b.rank - a.rank);
        case 'name':
          return sortMultiplier * a.dishName.localeCompare(b.dishName);
        default:
          return 0;
      }
    });
  }, [rankings, searchQuery, filterRank, filterCuisine, sortBy, sortOrder]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filterRank !== 'all' ||
      filterCuisine !== 'all' ||
      sortBy !== 'date' ||
      sortOrder !== 'desc'
    );
  }, [searchQuery, filterRank, filterCuisine, sortBy, sortOrder]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-orange-500" aria-hidden="true" />
        {isCurrentUser ? 'Your Rankings' : `${user.name}'s Rankings`}
      </h3>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search rankings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search rankings"
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
              <option value="date">Date</option>
              <option value="rank">Rank</option>
              <option value="name">Dish Name</option>
            </select>

            <button
              type="button"
              onClick={handleSortOrderChange}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5" aria-hidden="true" />
              ) : (
                <SortDesc className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={handleFilterToggle}
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            aria-expanded={filterOpen}
            aria-controls="filter-panel"
          >
            <Filter className="w-4 h-4 mr-1" aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {(filterRank !== 'all' ? 1 : 0) + (filterCuisine !== 'all' ? 1 : 0) + (searchQuery.trim() !== '' ? 1 : 0)}
              </span>
            )}
            {filterOpen ? (
              <ChevronUp className="w-4 h-4 ml-1" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rank Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rank
                </h4>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rank-filter"
                      className="border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={filterRank === 'all'}
                      onChange={() => handleRankFilterChange('all')}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      All Ranks
                    </span>
                  </label>
                  {[5, 4, 3, 2, 1].map(rank => (
                    <label
                      key={rank}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rank-filter"
                        className="border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={filterRank === rank.toString()}
                        onChange={() => handleRankFilterChange(rank.toString())}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        {rank} <Star className="w-3 h-3 ml-1 text-yellow-500" />
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuisine
                </h4>
                <div className="space-y-1">
                  {cuisines.map(cuisine => (
                    <label
                      key={cuisine}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cuisine-filter"
                        className="border-gray-300 text-orange-500 focus:ring-orange-500"
                        checked={filterCuisine === cuisine}
                        onChange={() => handleCuisineFilterChange(cuisine)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cuisine === 'all' ? 'All Cuisines' : cuisine}
                      </span>
                    </label>
                  ))}
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

      {/* Rankings List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" aria-label="Loading rankings" />
        </div>
      ) : filteredAndSortedRankings.length > 0 ? (
        <div className="space-y-6">
          {filteredAndSortedRankings.map(ranking => {
            const tasteStatusDisplay = formatTasteStatus(ranking.tasteStatus);

            return (
              <div
                key={ranking.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Dish Image */}
                  <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4">
                    <div className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={ranking.dishImageUrl}
                        alt={ranking.dishName}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </div>

                  {/* Ranking Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={getCountryLink(`/dish/${ranking.dishSlug}`)}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                      >
                        {ranking.dishName}
                      </Link>

                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold">
                          {ranking.rank}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
                      <Link
                        href={getCountryLink(`/restaurant/${ranking.restaurantId}`)}
                        className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                      >
                        {ranking.restaurantName}
                      </Link>
                      <span className="mx-2">•</span>
                      <span>{ranking.cuisine}</span>
                      <span className="mx-2">•</span>
                      <span>{ranking.restaurantLocation}</span>
                    </div>

                    {tasteStatusDisplay.icon && (
                      <div className="flex items-center mb-2">
                        <tasteStatusDisplay.icon className={`w-4 h-4 mr-1 ${tasteStatusDisplay.color}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {tasteStatusDisplay.label}
                        </span>
                      </div>
                    )}

                    {ranking.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {ranking.notes}
                      </p>
                    )}

                    {ranking.photoUrls && ranking.photoUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {ranking.photoUrls.map((url, index) => (
                          <div key={index} className="aspect-square rounded-md overflow-hidden">
                            <Image
                              src={url}
                              alt={`Photo ${index + 1}`}
                              width={100}
                              height={100}
                              objectFit="cover"
                              className="w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>
                        {new Date(ranking.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Utensils className="w-8 h-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Rankings Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {isCurrentUser
              ? hasActiveFilters
                ? 'No rankings match your filters. Try adjusting your search criteria.'
                : 'You haven\'t ranked any dishes yet. Start exploring and ranking dishes to see them here!'
              : hasActiveFilters
                ? 'No rankings match your filters. Try adjusting your search criteria.'
                : `${user.name} hasn't ranked any dishes yet.`}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default RankingsTab;
