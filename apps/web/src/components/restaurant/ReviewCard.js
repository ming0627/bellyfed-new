/**
 * ReviewCard Component
 * 
 * A component for displaying a restaurant review.
 * It shows the reviewer's information, rating, review content, and actions.
 * 
 * Features:
 * - Display reviewer information (name, avatar, verification status)
 * - Show review rating with stars
 * - Display review content with title and text
 * - Show review photos
 * - Display review date and verified visit status
 * - Provide actions like marking as helpful or commenting
 * - Support for expanding/collapsing long reviews
 */

import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Calendar,
  Check,
  Flag,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import { useAuth } from '@bellyfed/hooks';

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
 * ReviewCard component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.review - Review data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {Function} props.onMarkHelpful - Function to handle marking review as helpful
 * @param {Function} props.onReport - Function to handle reporting review
 * @param {Function} props.onShare - Function to handle sharing review
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isExpanded - Whether the review is expanded by default
 * @param {boolean} props.showActions - Whether to show action buttons
 * @returns {JSX.Element} - Rendered component
 */
const ReviewCard = memo(function ReviewCard({
  review,
  getCountryLink,
  onMarkHelpful,
  onReport,
  onShare,
  className = '',
  isExpanded = false,
  showActions = true,
}) {
  // Get authentication state
  const { isAuthenticated } = useAuth();
  
  // State for expanded content
  const [expanded, setExpanded] = useState(isExpanded);
  
  // State for helpful status
  const [isHelpful, setIsHelpful] = useState(review.isHelpful || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  
  // Check if review content is long
  const isLongContent = review.content && review.content.length > 300;
  
  // Get truncated content
  const truncatedContent = isLongContent && !expanded
    ? `${review.content.substring(0, 300)}...`
    : review.content;
  
  // Handle expanding/collapsing review
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // Handle marking review as helpful
  const handleMarkHelpful = useCallback(() => {
    if (!isAuthenticated) {
      // Redirect to sign in page if not authenticated
      window.location.href = getCountryLink('/signin');
      return;
    }
    
    setIsHelpful(prev => !prev);
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
    
    if (onMarkHelpful) {
      onMarkHelpful(review.id, !isHelpful);
    }
  }, [isHelpful, isAuthenticated, review.id, onMarkHelpful, getCountryLink]);
  
  // Handle reporting review
  const handleReport = useCallback(() => {
    if (!isAuthenticated) {
      // Redirect to sign in page if not authenticated
      window.location.href = getCountryLink('/signin');
      return;
    }
    
    if (onReport) {
      onReport(review.id);
    }
  }, [isAuthenticated, review.id, onReport, getCountryLink]);
  
  // Handle sharing review
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(review.id);
    }
  }, [review.id, onShare]);

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 ${className}`}>
      {/* Reviewer Info */}
      <div className="flex items-center mb-4">
        <Link
          href={getCountryLink(`/profile/${review.userId}`)}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {review.userProfilePicture ? (
              <Image
                src={review.userProfilePicture}
                alt={review.userName}
                width={48}
                height={48}
                objectFit="cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {review.userName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="ml-3">
          <Link
            href={getCountryLink(`/profile/${review.userId}`)}
            className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            {review.userName}
          </Link>

          <div className="flex items-center mt-1">
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              <LucideClientIcon
                icon={Calendar}
                className="w-3.5 h-3.5 inline mr-1"
                aria-hidden="true"
              />
              {formatDate(review.visitDate || review.createdAt)}
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
        {truncatedContent}
      </p>

      {/* Expand/Collapse Button */}
      {isLongContent && (
        <button
          type="button"
          onClick={toggleExpanded}
          className="mb-4 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-sm font-medium flex items-center"
        >
          {expanded ? (
            <>
              <LucideClientIcon
                icon={ChevronUp}
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              Show Less
            </>
          ) : (
            <>
              <LucideClientIcon
                icon={ChevronDown}
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              Read More
            </>
          )}
        </button>
      )}

      {/* Review Photos */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {review.images.map((image, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden">
              <Image
                src={image.url}
                alt={image.caption || `Photo ${index + 1}`}
                width={100}
                height={100}
                objectFit="cover"
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Dish Ratings */}
      {review.dishRatings && review.dishRatings.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Dish Ratings
          </h5>
          <div className="space-y-2">
            {review.dishRatings.map((dishRating) => (
              <div
                key={dishRating.dishId}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {dishRating.dishName}
                </span>
                <div className="flex items-center">
                  {renderStars(dishRating.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Ratings */}
      {review.categoryRatings && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Category Ratings
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(review.categoryRatings).map(([category, rating]) => (
              <div
                key={category}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {category}
                </span>
                <div className="flex items-center">
                  {renderStars(rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Actions */}
      {showActions && (
        <div className="flex items-center space-x-4 text-sm">
          <button
            type="button"
            onClick={handleMarkHelpful}
            className={`flex items-center ${
              isHelpful
                ? 'text-orange-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
            }`}
          >
            <LucideClientIcon
              icon={ThumbsUp}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span>Helpful ({helpfulCount})</span>
          </button>

          <Link
            href={getCountryLink(`/reviews/${review.id}#comments`)}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
          >
            <LucideClientIcon
              icon={MessageSquare}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span>Comments ({review.comments || 0})</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
          >
            <LucideClientIcon
              icon={Share2}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleReport}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <LucideClientIcon
              icon={Flag}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span>Report</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default ReviewCard;
