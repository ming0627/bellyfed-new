import React, { useState, memo } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import Link from 'next/link';

/**
 * DishReviews component for displaying reviews of a dish
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const DishReviews = memo(function DishReviews({ dish, getCountryLink }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedReviews, setExpandedReviews] = useState([]);

  // If no reviews, don't render the component
  if (!dish.reviews || dish.reviews.length === 0) {
    return null;
  }

  // Toggle review expansion
  const toggleReviewExpansion = reviewId => {
    setExpandedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId],
    );
  };

  // Filter reviews based on active filter
  const filteredReviews = dish.reviews.filter(review => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'positive' && review.rating >= 4) return true;
    if (activeFilter === 'critical' && review.rating < 4) return true;
    if (
      activeFilter === 'with-photos' &&
      review.photos &&
      review.photos.length > 0
    )
      return true;
    return false;
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = dish.reviews.filter(
      review => Math.floor(review.rating) === rating,
    ).length;
    const percentage = (count / dish.reviews.length) * 100;
    return { rating, count, percentage };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-6">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {dish.rating.toFixed(1)}
          </div>
          <div className="flex items-center mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(dish.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {dish.reviewCount} reviews
          </div>
        </div>

        <div className="flex-grow">
          {ratingDistribution.map(item => (
            <div key={item.rating} className="flex items-center mb-1">
              <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                {item.rating} stars
              </div>
              <div className="flex-grow mx-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="w-10 text-sm text-gray-600 dark:text-gray-400 text-right">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActiveFilter('positive')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'positive'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Positive
        </button>
        <button
          onClick={() => setActiveFilter('critical')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'critical'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setActiveFilter('with-photos')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'with-photos'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          With Photos
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Link
                    href={getCountryLink(`/profile/${review.user.username}`)}
                    className="flex-shrink-0"
                  >
                    <Image
                      src={review.user.profilePicture}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </Link>
                  <div className="ml-3">
                    <Link
                      href={getCountryLink(`/profile/${review.user.username}`)}
                      className="font-medium text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
                    >
                      {review.user.name}
                    </Link>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(review.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-3">
                {review.content.length > 200 &&
                !expandedReviews.includes(review.id) ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.content.substring(0, 200)}...
                    </p>
                    <button
                      onClick={() => toggleReviewExpansion(review.id)}
                      className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium mt-1"
                    >
                      Read more
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.content}
                    </p>
                    {review.content.length > 200 && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium mt-1"
                      >
                        Show less
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {review.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden relative"
                    >
                      <Image
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  <ThumbsUp className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span>Helpful ({review.helpfulCount || 0})</span>
                </button>
                <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  <MessageSquare className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span>Comment ({review.commentCount || 0})</span>
                </button>
                <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  <Flag className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              No reviews found with the selected filter.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Show All Reviews
            </button>
          </div>
        )}
      </div>

      {/* Write Review Button */}
      <div className="mt-6 text-center">
        <Link
          href={getCountryLink(
            `/restaurants/${dish.restaurant.id}/review?dishId=${dish.id}`,
          )}
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
        >
          Write a Review
        </Link>
      </div>
    </div>
  );
});

export default DishReviews;
