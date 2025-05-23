import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Utensils, Clock, ChevronRight } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * CollectionCard component for displaying a restaurant collection
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Collection ID
 * @param {string} props.title - Collection title
 * @param {string} props.description - Collection description
 * @param {string} props.imageUrl - Collection image URL
 * @param {number} props.restaurantCount - Number of restaurants in the collection
 * @param {string} props.location - Collection location
 * @param {string} props.curator - Collection curator name
 * @param {string} props.updatedAt - Collection last updated date
 * @param {boolean} props.isFeatured - Whether the collection is featured
 * @param {boolean} props.isNew - Whether the collection is new
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {string} props.variant - Card variant (default, horizontal, compact)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const CollectionCard = memo(function CollectionCard({
  id,
  title,
  description,
  imageUrl,
  restaurantCount,
  location,
  curator,
  updatedAt,
  isFeatured = false,
  isNew = false,
  getCountryLink,
  variant = 'default',
  className = '',
}) {
  // Format date for display
  const formatDate = dateString => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        return 'Today';
      } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else if (diffDays <= 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Determine card layout based on variant
  if (variant === 'horizontal') {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex ${className}`}
      >
        {/* Image */}
        <div className="relative w-1/3 min-w-[120px]">
          <div className="absolute inset-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                style={{ objectFit: 'cover' }}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <LucideClientIcon
                  icon={Utensils}
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isFeatured && (
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                Featured
              </span>
            )}
            {isNew && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                New
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <Link
            href={getCountryLink(`/collections/${id}`)}
            className="block font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-1"
          >
            {title}
          </Link>

          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center mr-4">
              <LucideClientIcon
                icon={Utensils}
                className="w-3.5 h-3.5 mr-1"
                aria-hidden="true"
              />
              <span>
                {restaurantCount}{' '}
                {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}
              </span>
            </div>

            {location && (
              <div className="flex items-center mr-4">
                <LucideClientIcon
                  icon={MapPin}
                  className="w-3.5 h-3.5 mr-1"
                  aria-hidden="true"
                />
                <span>{location}</span>
              </div>
            )}

            {updatedAt && (
              <div className="flex items-center">
                <LucideClientIcon
                  icon={Clock}
                  className="w-3.5 h-3.5 mr-1"
                  aria-hidden="true"
                />
                <span>Updated {formatDate(updatedAt)}</span>
              </div>
            )}
          </div>

          {curator && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Curated by{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {curator}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}
      >
        {/* Image */}
        <div className="relative h-32">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <LucideClientIcon
                icon={Utensils}
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isFeatured && (
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-sm">
                Featured
              </span>
            )}
            {isNew && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-sm">
                New
              </span>
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-medium text-white line-clamp-1">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <div className="flex items-center">
              <LucideClientIcon
                icon={Utensils}
                className="w-3.5 h-3.5 mr-1"
                aria-hidden="true"
              />
              <span>
                {restaurantCount}{' '}
                {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}
              </span>
            </div>

            {location && (
              <div className="flex items-center">
                <LucideClientIcon
                  icon={MapPin}
                  className="w-3.5 h-3.5 mr-1"
                  aria-hidden="true"
                />
                <span className="truncate max-w-[100px]">{location}</span>
              </div>
            )}
          </div>

          <Link
            href={getCountryLink(`/collections/${id}`)}
            className="flex items-center justify-center w-full py-1.5 text-xs font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
          >
            View Collection
            <LucideClientIcon
              icon={ChevronRight}
              className="w-3.5 h-3.5 ml-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group ${className}`}
    >
      {/* Image */}
      <div className="relative h-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <LucideClientIcon
              icon={Utensils}
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFeatured && (
            <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
              Featured
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-orange-300 transition-colors">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center mr-4">
            <LucideClientIcon
              icon={Utensils}
              className="w-4 h-4 mr-1.5"
              aria-hidden="true"
            />
            <span>
              {restaurantCount}{' '}
              {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}
            </span>
          </div>

          {location && (
            <div className="flex items-center mr-4">
              <LucideClientIcon
                icon={MapPin}
                className="w-4 h-4 mr-1.5"
                aria-hidden="true"
              />
              <span>{location}</span>
            </div>
          )}

          {updatedAt && (
            <div className="flex items-center">
              <LucideClientIcon
                icon={Clock}
                className="w-4 h-4 mr-1.5"
                aria-hidden="true"
              />
              <span>Updated {formatDate(updatedAt)}</span>
            </div>
          )}
        </div>

        {curator && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Curated by{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {curator}
            </span>
          </div>
        )}

        <Link
          href={getCountryLink(`/collections/${id}`)}
          className="mt-4 inline-flex items-center text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
        >
          View Collection
          <LucideClientIcon
            icon={ChevronRight}
            className="w-4 h-4 ml-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
});

export default CollectionCard;
