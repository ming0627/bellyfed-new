/**
 * ReviewItem Component
 * 
 * A component for displaying a single review item in the ReviewsTab.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Calendar,
  Check
} from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Format date to a readable string
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Render star rating
 * 
 * @param {number} rating - Rating value (1-5)
 * @returns {JSX.Element} - Rendered star rating
 */
const renderStars = (rating) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <LucideClientIcon
          key={star}
          icon={Star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

/**
 * ReviewItem component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.review - Review data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const ReviewItem = memo(function ReviewItem({
  review,
  getCountryLink,
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
      {/* Restaurant Info */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
          {review.restaurantImage ? (
            <Image
              src={review.restaurantImage}
              alt={review.restaurantName}
              width={48}
              height={48}
              objectFit="cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                No Image
              </span>
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
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              <LucideClientIcon
                icon={Calendar}
                className="w-3.5 h-3.5 inline mr-1"
                aria-hidden="true"
              />
              {formatDate(review.visitDate)}
            </span>
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

      {/* Review Content */}
      {review.title && (
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {review.title}
        </h4>
      )}

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {review.content}
      </p>

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {review.photos.map((photo, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden">
              <Image
                src={photo}
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

      {/* Review Actions */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <LucideClientIcon
            icon={ThumbsUp}
            className="w-4 h-4 mr-1"
            aria-hidden="true"
          />
          <span>Helpful ({review.helpfulCount})</span>
        </div>

        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <LucideClientIcon
            icon={MessageSquare}
            className="w-4 h-4 mr-1"
            aria-hidden="true"
          />
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
  );
});

export default ReviewItem;
