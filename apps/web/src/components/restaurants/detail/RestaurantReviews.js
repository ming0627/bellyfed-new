import React, { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * ReviewItem component for displaying a single review
 *
 * @param {Object} props - Component props
 * @param {Object} props.review - Review data
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const ReviewItem = memo(function ReviewItem({ review, getCountryLink }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Toggle review expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle like button click
  const handleLike = e => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  // Format date for display
  const formatDate = dateString => {
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
  const renderStars = rating => {
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
          />,
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
          </span>,
        );
      } else {
        stars.push(
          <LucideClientIcon
            key={i}
            icon={Star}
            className="w-4 h-4 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          />,
        );
      }
    }

    return stars;
  };

  return (
    <div className="py-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          {review.userProfilePicture ? (
            <Image
              src={review.userProfilePicture}
              alt={review.userName}
              width={40}
              height={40}
              objectFit="cover"
              className="rounded-full mr-3"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
              <span className="text-gray-500 dark:text-gray-400 text-lg">
                {review.userName.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <Link
              href={getCountryLink(`/users/${review.userId}`)}
              className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              {review.userName}
            </Link>
            <div className="flex items-center mt-1">
              <div className="flex">{renderStars(review.rating)}</div>
              {review.isVerifiedVisit && (
                <span className="ml-2 inline-flex items-center text-xs text-green-600 dark:text-green-400">
                  <LucideClientIcon
                    icon={Check}
                    className="w-3 h-3 mr-0.5"
                    aria-hidden="true"
                  />
                  Verified Visit
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <LucideClientIcon
            icon={Calendar}
            className="w-4 h-4 mr-1"
            aria-hidden="true"
          />
          <span>{formatDate(review.visitDate)}</span>
        </div>
      </div>

      {/* Review Title and Content */}
      {review.title && (
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {review.title}
        </h4>
      )}

      <div
        className={`text-gray-700 dark:text-gray-300 ${!isExpanded && review.content.length > 200 ? 'line-clamp-3' : ''}`}
      >
        {review.content}
      </div>

      {review.content.length > 200 && (
        <button
          onClick={toggleExpand}
          className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-sm font-medium mt-2 flex items-center"
        >
          {isExpanded ? 'Show less' : 'Read more'}
          <LucideClientIcon
            icon={isExpanded ? ChevronUp : ChevronDown}
            className="w-4 h-4 ml-1"
            aria-hidden="true"
          />
        </button>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {review.images.map((image, index) => (
            <div key={index} className="flex-shrink-0 w-24 h-24 relative">
              <Image
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Category Ratings */}
      {review.categoryRatings && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(review.categoryRatings).map(([category, rating]) => (
            <div
              key={category}
              className="bg-gray-50 dark:bg-gray-700 rounded-md p-2"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
                {category}
              </div>
              <div className="flex items-center">
                <div className="flex">{renderStars(rating)}</div>
                <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Actions */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={handleLike}
          className={`flex items-center text-sm ${
            isLiked
              ? 'text-orange-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
          } transition-colors`}
        >
          <LucideClientIcon
            icon={ThumbsUp}
            className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
          <span>Helpful ({review.helpfulCount + (isLiked ? 1 : 0)})</span>
        </button>

        <Link
          href={getCountryLink(`/reviews/${review.id}`)}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <LucideClientIcon
            icon={MessageSquare}
            className="w-4 h-4 mr-1"
            aria-hidden="true"
          />
          <span>Comment ({review.comments})</span>
        </Link>
      </div>
    </div>
  );
});

/**
 * RestaurantReviews component for displaying reviews for a restaurant
 *
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantReviews = memo(function RestaurantReviews({
  restaurant,
  getCountryLink,
}) {
  const [sortOption, setSortOption] = useState('newest');

  // Handle sort change
  const handleSortChange = e => {
    setSortOption(e.target.value);
  };

  // Sort reviews based on selected option
  const sortedReviews = React.useMemo(() => {
    if (!restaurant.reviews || restaurant.reviews.length === 0) {
      return [];
    }

    const reviews = [...restaurant.reviews];

    switch (sortOption) {
      case 'newest':
        return reviews.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case 'oldest':
        return reviews.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      case 'highest':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return reviews.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
      default:
        return reviews;
    }
  }, [restaurant.reviews, sortOption]);

  // If no reviews, show a message
  if (!restaurant.reviews || restaurant.reviews.length === 0) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Reviews
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No reviews yet. Be the first to review this restaurant!
        </p>
        <Link
          href={getCountryLink(`/restaurants/${restaurant.id}/review`)}
          className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Write a Review
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Reviews ({restaurant.reviewCount})
        </h2>

        <div className="flex items-center mt-2 sm:mt-0">
          <label
            htmlFor="sort-reviews"
            className="text-sm text-gray-600 dark:text-gray-400 mr-2"
          >
            Sort by:
          </label>
          <select
            id="sort-reviews"
            value={sortOption}
            onChange={handleSortChange}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Overall Rating */}
          <div className="flex flex-col items-center md:border-r md:border-gray-300 md:dark:border-gray-600 md:pr-6 mb-4 md:mb-0">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {restaurant.rating?.toFixed(1) || 'N/A'}
            </div>
            <div className="flex mt-1 mb-2">
              {renderStars(restaurant.rating || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Based on {restaurant.reviewCount} reviews
            </div>
          </div>

          {/* Category Ratings */}
          {restaurant.ranking && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-6 flex-grow">
              {Object.entries(restaurant.ranking).map(([category, rating]) => {
                if (category === 'totalScore') return null;

                return (
                  <div key={category} className="flex flex-col">
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                      {category.replace('Score', '')}
                    </div>
                    <div className="flex items-center">
                      <div className="flex">{renderStars(rating)}</div>
                      <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="mb-6">
        <Link
          href={getCountryLink(`/restaurants/${restaurant.id}/review`)}
          className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Write a Review
        </Link>
      </div>

      {/* Reviews List */}
      <div>
        {sortedReviews.map(review => (
          <ReviewItem
            key={review.id}
            review={review}
            getCountryLink={getCountryLink}
          />
        ))}
      </div>

      {/* View All Reviews Button */}
      {restaurant.reviewCount > sortedReviews.length && (
        <div className="mt-6 text-center">
          <Link
            href={getCountryLink(`/restaurants/${restaurant.id}/reviews`)}
            className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View All {restaurant.reviewCount} Reviews
          </Link>
        </div>
      )}
    </section>
  );
});

// Helper function to render stars
const renderStars = rating => {
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
        />,
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
        </span>,
      );
    } else {
      stars.push(
        <LucideClientIcon
          key={i}
          icon={Star}
          className="w-4 h-4 text-gray-300 dark:text-gray-600"
          aria-hidden="true"
        />,
      );
    }
  }

  return stars;
};

export default RestaurantReviews;
