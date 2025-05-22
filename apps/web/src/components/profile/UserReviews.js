import React, { useState, memo } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, MessageSquare, Calendar, Filter, Search } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

// Mock data for user reviews
const mockUserReviews = [
  {
    id: '1',
    restaurantId: '1',
    restaurantName: 'Nasi Lemak House',
    restaurantImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&h=200&fit=crop',
    rating: 5,
    title: 'Best Nasi Lemak in KL!',
    content: 'I have tried many Nasi Lemak places in KL, but this one tops them all. The sambal is perfectly balanced - spicy but not overwhelming. The chicken was crispy on the outside and juicy inside. Will definitely be back!',
    visitDate: '2023-04-15',
    createdAt: '2023-04-16T14:23:00Z',
    helpfulCount: 24,
    comments: 3,
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1626509653291-0d0162a9f664?q=80&w=200&h=200&fit=crop',
        caption: 'Nasi Lemak with Fried Chicken',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=200&h=200&fit=crop',
        caption: 'Sambal close-up',
      },
    ],
  },
  {
    id: '2',
    restaurantId: '2',
    restaurantName: 'Sushi Sensation',
    restaurantImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200&h=200&fit=crop',
    rating: 4.5,
    title: 'Great sushi, a bit pricey',
    content: 'The sushi here is incredibly fresh and well-prepared. The chef clearly knows what they\'re doing. My only complaint is that it\'s a bit on the expensive side, but for a special occasion, it\'s worth it.',
    visitDate: '2023-03-20',
    createdAt: '2023-03-21T18:45:00Z',
    helpfulCount: 18,
    comments: 2,
    images: [
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=200&h=200&fit=crop',
        caption: 'Sushi platter',
      },
    ],
  },
];

/**
 * UserReviews component for displaying a user's reviews
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const UserReviews = memo(function UserReviews({
  user,
  getCountryLink,
}) {
  const [reviews, setReviews] = useState(mockUserReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle rating filter change
  const handleRatingFilterChange = (e) => {
    setFilterRating(e.target.value);
  };

  // Filter reviews based on search query and rating filter
  const filteredReviews = reviews.filter((review) => {
    // Search filter
    const searchMatch = searchQuery === '' ||
      review.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Rating filter
    const ratingMatch = filterRating === 'all' ||
      (filterRating === '5' && review.rating === 5) ||
      (filterRating === '4' && review.rating >= 4 && review.rating < 5) ||
      (filterRating === '3' && review.rating >= 3 && review.rating < 4) ||
      (filterRating === '2' && review.rating >= 2 && review.rating < 3) ||
      (filterRating === '1' && review.rating >= 1 && review.rating < 2);

    return searchMatch && ratingMatch;
  });

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Generate stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <LucideClientIcon
            key={i}
            icon={Star}
            className="w-4 h-4 text-yellow-500 fill-current"
            aria-hidden="true"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="relative">
            <LucideClientIcon
              icon={Star}
              className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current"
              aria-hidden="true"
            />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <LucideClientIcon
                icon={Star}
                className="w-4 h-4 text-yellow-500 fill-current"
                aria-hidden="true"
              />
            </span>
          </span>
        );
      } else {
        stars.push(
          <LucideClientIcon
            key={i}
            icon={Star}
            className="w-4 h-4 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          />
        );
      }
    }

    return stars;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Reviews ({filteredReviews.length})
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideClientIcon
                icon={Search}
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideClientIcon
                icon={Filter}
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={filterRating}
              onChange={handleRatingFilterChange}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              {/* Restaurant Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                  {review.restaurantImage ? (
                    <img
                      src={review.restaurantImage}
                      alt={review.restaurantName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    href={getCountryLink(`/restaurants/${review.restaurantId}`)}
                    className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    {review.restaurantName}
                  </Link>

                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      <LucideClientIcon icon={Calendar} className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                      {formatDate(review.visitDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {review.title}
                </h4>
              )}

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.content}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                  {review.images.map((image) => (
                    <div key={image.id} className="flex-shrink-0 w-24 h-24">
                      <img
                        src={image.url}
                        alt={image.caption || 'Review image'}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <LucideClientIcon icon={ThumbsUp} className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span>Helpful ({review.helpfulCount})</span>
                </div>

                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <LucideClientIcon icon={MessageSquare} className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span>Comments ({review.comments})</span>
                </div>

                <Link
                  href={getCountryLink(`/reviews/${review.id}`)}
                  className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  View Details
                </Link>
              </div>
            </div>
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
            {searchQuery || filterRating !== 'all'
              ? 'No reviews match your search criteria. Try adjusting your filters.'
              : `${user.name} hasn't written any reviews yet.`}
          </p>
        </div>
      )}
    </div>
  );
});

export default UserReviews;
