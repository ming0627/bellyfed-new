import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, BadgeCheck, Heart, Award, Utensils } from 'lucide-react';
/**
 * Restaurant card component for displaying restaurant information
 * Consolidated from .js and .tsx versions - preserving best features from both.
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Restaurant ID
 * @param {string} props.name - Restaurant name
 * @param {string} props.imageUrl - Restaurant image URL
 * @param {number} props.rating - Restaurant rating (0-5)
 * @param {number} props.reviewCount - Number of reviews
 * @param {string} props.cuisine - Restaurant cuisine type
 * @param {string} props.priceRange - Restaurant price range ($-$$$$)
 * @param {string} props.location - Restaurant location
 * @param {string} props.distance - Distance from user
 * @param {boolean} props.isOpen - Whether the restaurant is currently open
 * @param {boolean} props.isVerified - Whether the restaurant is verified
 * @param {boolean} props.isPremium - Whether the restaurant is premium
 * @param {boolean} props.isNew - Whether the restaurant is new
 * @param {string} props.popularDish - Popular dish at the restaurant
 * @param {string} props.description - Restaurant description
 * @param {Function} props.onToggleFavorite - Function to toggle favorite status
 * @param {Function} props.getCountryLink - Function to get country-specific link
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Card variant (default, horizontal, minimal)
 * @returns {JSX.Element} RestaurantCard component
 */
const RestaurantCard = function RestaurantCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  cuisine,
  priceRange,
  location,
  distance,
  isOpen = true,
  isVerified = false,
  isPremium = false,
  isNew = false,
  popularDish,
  description,
  onToggleFavorite,
  getCountryLink = path => path,
  className = '',
  variant = 'default',
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Handle favorite toggle
  const handleFavoriteClick = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(id, !isFavorite);
    }
  };

  // Format rating to display with one decimal place
  const formattedRating = rating ? rating.toFixed(1) : 'N/A';

  // Get price range color - enhanced from .tsx version
  const getPriceRangeColor = () => {
    switch (priceRange) {
      case '$':
        return 'text-green-600 dark:text-green-400';
      case '$$':
        return 'text-blue-600 dark:text-blue-400';
      case '$$$':
        return 'text-orange-600 dark:text-orange-400';
      case '$$$$':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  // Get rating color - enhanced from .tsx version
  const getRatingColor = () => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
    if (rating >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 3.0) return 'text-gray-700 dark:text-gray-300';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Link
      href={getCountryLink(`/restaurant/${id}`)}
      className={`block h-full overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow group ${className}`}
    >
      {/* Restaurant Image */}
      <div className="relative h-48 w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image</span>
          </div>
        )}

        {/* Status badges - enhanced from .tsx version */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm flex items-center">
              <span className="mr-1">●</span> New
            </span>
          )}
          {isPremium && (
            <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-md shadow-sm flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Premium
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite
              ? 'bg-orange-500 text-white'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
          } hover:scale-110 transition-all`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Open/Closed Status */}
        <div className="absolute bottom-2 left-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
              isOpen ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
              {isVerified && (
                <BadgeCheck className="h-4 w-4 ml-1 text-blue-500" aria-label="Verified" />
              )}
            </h3>

            <div className="mt-1 flex items-center flex-wrap gap-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                {cuisine}
              </span>

              <span className="mx-1 text-gray-400">•</span>

              <span className={`text-xs font-medium ${getPriceRangeColor()}`}>
                {priceRange}
              </span>

              {isVerified && (
                <>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-md flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center ml-2 flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            <Star className={`h-4 w-4 mr-1 ${getRatingColor()}`} fill="currentColor" />
            <span className={`font-medium text-sm ${getRatingColor()}`}>
              {formattedRating}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                ({reviewCount})
              </span>
            )}
          </div>
        </div>

        {popularDish && (
          <div className="mt-3 flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Utensils className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-500" />
            <span>
              Popular: <span className="font-medium">{popularDish}</span>
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          {distance && (
            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
              {distance}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default RestaurantCard;
