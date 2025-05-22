import React, { memo } from 'react';
import Image from 'next/image';
import { Star, Utensils } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import Link from 'next/link';

/**
 * SimilarDishes component for displaying similar dishes
 *
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of dish categories to find similar dishes
 * @param {string} props.currentDishId - ID of the current dish to exclude from results
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {Array} props.similarDishes - Array of similar dish objects
 * @param {boolean} props.isLoading - Whether the similar dishes are loading
 * @returns {JSX.Element} - Rendered component
 */
const SimilarDishes = memo(function SimilarDishes({
  // categories, // Removed unused prop
  // currentDishId, // Removed unused prop
  getCountryLink,
  similarDishes,
  isLoading,
}) {
  // If no similar dishes and not loading, don't render the component
  if (!isLoading && (!similarDishes || similarDishes.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Similar Dishes
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="ml-3 flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {similarDishes.map(dish => (
            <Link
              key={dish.id}
              href={getCountryLink(`/dishes/${dish.id}`)}
              className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-md transition-colors"
            >
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                {dish.imageUrl ? (
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    width={64}
                    height={64}
                    objectFit="cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LucideClientIcon
                      icon={Utensils}
                      className="w-6 h-6 text-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="ml-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {dish.name}
                </h3>

                <div className="flex items-center mt-1">
                  {dish.rating && (
                    <>
                      <LucideClientIcon
                        icon={Star}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        aria-hidden="true"
                      />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                        {dish.rating.toFixed(1)}
                      </span>
                      <span className="mx-1 text-gray-400">•</span>
                    </>
                  )}

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {dish.restaurant?.name}
                  </span>
                </div>

                {dish.price && (
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    {dish.currency} {dish.price.toFixed(2)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

export default SimilarDishes;
