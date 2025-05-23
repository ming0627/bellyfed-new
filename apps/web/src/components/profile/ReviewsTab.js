/**
 * ReviewsTab Component
 * 
 * A component for displaying a user's reviews in their profile.
 * It shows a list of reviews the user has written, with filtering and sorting options.
 * 
 * Features:
 * - Display user's reviews
 * - Filter reviews by rating, date, and search query
 * - Sort reviews by date, rating, or restaurant name
 * - Empty state handling
 * - Loading state
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Calendar,
  SortAsc,
  SortDesc,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import { useAuth } from '@bellyfed/hooks';
import ReviewItem from './ReviewItem.js';
import ReviewFilters from './ReviewFilters.js';

/**
 * ReviewsTab component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const ReviewsTab = memo(function ReviewsTab({
  user,
  getCountryLink,
}) {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Get authentication state
  const { isAuthenticated, user: currentUser } = useAuth();
  
  // Determine if this is the current user's profile
  const isCurrentUser = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    return currentUser.id === user.id;
  }, [isAuthenticated, currentUser, user.id]);
  
  // Mock data for user reviews (in a real app, this would come from an API)
  const [reviews, setReviews] = useState([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch reviews (simulated)
  useMemo(() => {
    // Simulate API call
    const fetchReviews = async () => {
      try {
        // In a real app, this would be a call to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockReviews = [
          {
            id: 'review1',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            restaurantLocation: 'Kuala Lumpur',
            restaurantImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            dishName: 'Nasi Lemak',
            title: 'Best Nasi Lemak in KL',
            content: 'This is the best Nasi Lemak I\'ve ever had! The sambal is spicy but not overwhelming, and the coconut rice is perfectly cooked.',
            rating: 5,
            visitDate: '2023-06-15T08:30:00Z',
            photos: ['https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
            helpfulCount: 12,
            comments: 3,
            isVerifiedVisit: true,
          },
          {
            id: 'review2',
            restaurantId: 'restaurant2',
            restaurantName: 'Penang Famous',
            restaurantLocation: 'Penang',
            restaurantImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
            dishName: 'Char Kway Teow',
            title: 'Authentic Penang Char Kway Teow',
            content: 'Very good Char Kway Teow, but I\'ve had better. The noodles could be a bit more charred.',
            rating: 4,
            visitDate: '2023-06-10T14:45:00Z',
            photos: ['https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
            helpfulCount: 8,
            comments: 2,
            isVerifiedVisit: true,
          },
          {
            id: 'review3',
            restaurantId: 'restaurant3',
            restaurantName: 'Mamak Corner',
            restaurantLocation: 'Kuala Lumpur',
            restaurantImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            dishName: 'Roti Canai',
            title: 'Average Roti Canai',
            content: 'It was okay, but nothing special. The roti was a bit too oily.',
            rating: 3,
            visitDate: '2023-06-05T11:20:00Z',
            photos: ['https://images.unsplash.com/photo-1626694733135-2d4c1b8c2f9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
            helpfulCount: 5,
            comments: 1,
            isVerifiedVisit: false,
          },
          {
            id: 'review4',
            restaurantId: 'restaurant4',
            restaurantName: 'Laksa House',
            restaurantLocation: 'Penang',
            restaurantImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            dishName: 'Laksa',
            title: 'Disappointing Laksa',
            content: 'I didn\'t like this Laksa at all. The broth was too watery and lacked flavor.',
            rating: 2,
            visitDate: '2023-05-20T09:15:00Z',
            photos: ['https://images.unsplash.com/photo-1618626422502-5f0cf2b9c2b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
            helpfulCount: 3,
            comments: 4,
            isVerifiedVisit: true,
          },
          {
            id: 'review5',
            restaurantId: 'restaurant5',
            restaurantName: 'Satay Station',
            restaurantLocation: 'Kuala Lumpur',
            restaurantImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
            dishName: 'Satay',
            title: 'Excellent Satay',
            content: 'The best satay in town! The meat is tender and the peanut sauce is perfect.',
            rating: 5,
            visitDate: '2023-05-15T18:30:00Z',
            photos: ['https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
            helpfulCount: 15,
            comments: 6,
            isVerifiedVisit: true,
          },
        ];
        
        setReviews(mockReviews);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);
  
  // Handle rating filter change
  const handleRatingFilterChange = useCallback((rating) => {
    setFilterRating(rating);
  }, []);
  
  // Handle date filter change
  const handleDateFilterChange = useCallback((date) => {
    setFilterDate(date);
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
    setFilterRating('all');
    setFilterDate('all');
    setSortBy('date');
    setSortOrder('desc');
  }, []);
  
  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    // First, filter reviews
    let result = reviews.filter(review => {
      // Search query filter
      const searchMatch =
        searchQuery === '' ||
        review.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Rating filter
      const ratingMatch =
        filterRating === 'all' ||
        (filterRating === '5' && review.rating === 5) ||
        (filterRating === '4' && review.rating === 4) ||
        (filterRating === '3' && review.rating === 3) ||
        (filterRating === '2' && review.rating === 2) ||
        (filterRating === '1' && review.rating === 1);
      
      // Date filter
      const reviewDate = new Date(review.visitDate);
      const now = new Date();
      const dateMatch =
        filterDate === 'all' ||
        (filterDate === 'last-week' && 
          reviewDate >= new Date(now.setDate(now.getDate() - 7))) ||
        (filterDate === 'last-month' && 
          reviewDate >= new Date(now.setMonth(now.getMonth() - 1))) ||
        (filterDate === 'last-year' && 
          reviewDate >= new Date(now.setFullYear(now.getFullYear() - 1)));
      
      return searchMatch && ratingMatch && dateMatch;
    });
    
    // Then, sort reviews
    return result.sort((a, b) => {
      const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'date':
          return sortMultiplier * (new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        case 'rating':
          return sortMultiplier * (b.rating - a.rating);
        case 'restaurant':
          return sortMultiplier * a.restaurantName.localeCompare(b.restaurantName);
        default:
          return 0;
      }
    });
  }, [reviews, searchQuery, filterRating, filterDate, sortBy, sortOrder]);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filterRating !== 'all' ||
      filterDate !== 'all' ||
      sortBy !== 'date' ||
      sortOrder !== 'desc'
    );
  }, [searchQuery, filterRating, filterDate, sortBy, sortOrder]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <LucideClientIcon
          icon={Star}
          className="w-5 h-5 mr-2 text-orange-500"
          aria-hidden="true"
        />
        {isCurrentUser ? 'Your Reviews' : `${user.name}'s Reviews`}
      </h3>
      
      {/* Search and Filter Bar */}
      <div className="mb-6">
        {/* Search Input */}
        <div className="relative mb-4">
          <LucideClientIcon
            icon={Search}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search reviews"
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
              <option value="rating">Rating</option>
              <option value="restaurant">Restaurant</option>
            </select>
            
            <button
              type="button"
              onClick={handleSortOrderChange}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              <LucideClientIcon
                icon={sortOrder === 'asc' ? SortAsc : SortDesc}
                className="w-5 h-5"
                aria-hidden="true"
              />
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
            <LucideClientIcon
              icon={Filter}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {(filterRating !== 'all' ? 1 : 0) + (filterDate !== 'all' ? 1 : 0) + (searchQuery.trim() !== '' ? 1 : 0)}
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
          <ReviewFilters 
            filterRating={filterRating}
            filterDate={filterDate}
            handleRatingFilterChange={handleRatingFilterChange}
            handleDateFilterChange={handleDateFilterChange}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />
        )}
      </div>
      
      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LucideClientIcon
            icon={Loader2}
            className="w-8 h-8 animate-spin text-orange-500"
            aria-label="Loading reviews"
          />
        </div>
      ) : filteredAndSortedReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredAndSortedReviews.map(review => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              getCountryLink={getCountryLink} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <LucideClientIcon
              icon={Star}
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Reviews Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {hasActiveFilters
              ? 'No reviews match your filters. Try adjusting your search criteria.'
              : isCurrentUser
                ? 'You haven\'t written any reviews yet. Start exploring and reviewing restaurants to see them here!'
                : `${user.name} hasn't written any reviews yet.`}
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

export default ReviewsTab;
