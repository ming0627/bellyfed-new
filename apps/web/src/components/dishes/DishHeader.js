import React, { useState, memo } from 'react';
import Image from 'next/image';
import { Heart, Share2, Star, AlertTriangle, Info } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import Link from 'next/link';

/**
 * DishHeader component for displaying the header section of a dish detail page
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const DishHeader = memo(function DishHeader({ dish, getCountryLink }) {
  const [isFavorite, setIsFavorite] = useState(dish.isFavorite || false);

  // Toggle favorite status
  const handleToggleFavorite = () => {
    // In a real app, this would call an API to update the favorite status
    setIsFavorite(!isFavorite);
  };

  // Share dish
  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator
        .share({
          title: dish.name,
          text: dish.description,
          url: window.location.href,
        })
        .catch(err => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Share URL copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="mb-8">
      {/* Image Gallery */}
      <div className="relative rounded-lg overflow-hidden mb-6">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 relative">
          {dish.imageUrl ? (
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">
                No image available
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full ${
              isFavorite
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            } shadow-md hover:shadow-lg transition-all`}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <LucideClientIcon
              icon={Heart}
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
            />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg transition-all"
            aria-label="Share dish"
          >
            <LucideClientIcon icon={Share2} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dish Info */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {dish.name}
          </h1>

          <div className="flex items-center">
            {dish.rating && (
              <div className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full">
                <LucideClientIcon
                  icon={Star}
                  className="w-4 h-4 mr-1 fill-current text-yellow-500"
                />
                <span className="font-medium">{dish.rating.toFixed(1)}</span>
                <span className="mx-1 text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dish.reviewCount} reviews
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Link */}
        {dish.restaurant && (
          <div className="mb-4">
            <Link
              href={getCountryLink(`/restaurants/${dish.restaurant.id}`)}
              className="text-lg font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              {dish.restaurant.name}
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {dish.restaurant.location}
            </div>
          </div>
        )}

        {/* Price and Categories */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {dish.price && (
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {dish.currency} {dish.price.toFixed(2)}
            </div>
          )}

          {dish.categories && dish.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dish.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {dish.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {dish.description}
          </p>
        )}

        {/* Dietary Information */}
        {dish.dietaryOptions && dish.dietaryOptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Dietary Information
            </h3>
            <div className="flex flex-wrap gap-2">
              {dish.dietaryOptions.map((option, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergens */}
        {dish.allergens && dish.allergens.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <LucideClientIcon
                icon={AlertTriangle}
                className="w-5 h-5 text-yellow-500 mr-2 mt-0.5"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Allergen Information
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  This dish contains the following allergens:
                </p>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-yellow-300 dark:border-yellow-700 rounded-full text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spicy Level */}
        {dish.spicyLevel > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Spicy Level
            </h3>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(level => (
                  <span
                    key={level}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${
                      level <= dish.spicyLevel
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    🌶️
                  </span>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {dish.spicyLevel === 1 && 'Mild'}
                {dish.spicyLevel === 2 && 'Medium'}
                {dish.spicyLevel === 3 && 'Spicy'}
                {dish.spicyLevel === 4 && 'Very Spicy'}
                {dish.spicyLevel === 5 && 'Extremely Spicy'}
              </span>
            </div>
          </div>
        )}

        {/* Availability */}
        {dish.isAvailable === false && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-start">
              <LucideClientIcon
                icon={Info}
                className="w-5 h-5 text-gray-500 mr-2 mt-0.5"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Currently Unavailable
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This dish is currently not available. Please check back later
                  or contact the restaurant for more information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default DishHeader;
