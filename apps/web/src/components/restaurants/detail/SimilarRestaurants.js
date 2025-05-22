import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

// Mock data for similar restaurants
const mockSimilarRestaurants = [
  {
    id: '2',
    name: 'Sushi Sensation',
    cuisineTypes: ['Japanese', 'Seafood'],
    rating: 4.8,
    reviewCount: 189,
    priceRange: '$$$',
    imageUrl:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Taco Temple',
    cuisineTypes: ['Mexican', 'Fusion'],
    rating: 4.5,
    reviewCount: 142,
    priceRange: '$$',
    imageUrl:
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Char Kuey Teow Corner',
    cuisineTypes: ['Malaysian', 'Street Food'],
    rating: 4.6,
    reviewCount: 178,
    priceRange: '$',
    imageUrl:
      'https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=600&h=400&fit=crop',
  },
];

/**
 * SimilarRestaurantItem component for displaying a single similar restaurant
 *
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const SimilarRestaurantItem = memo(function SimilarRestaurantItem({
  restaurant,
  getCountryLink,
}) {
  return (
    <Link
      href={getCountryLink(`/restaurants/${restaurant.id}`)}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {/* Restaurant Image */}
      <div className="w-16 h-16 flex-shrink-0 mr-3 relative">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Restaurant Details */}
      <div className="flex-grow min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">
          {restaurant.name}
        </h4>

        {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
            {restaurant.cuisineTypes.join(' • ')}
          </p>
        )}

        <div className="flex items-center mt-1">
          <div className="flex items-center text-yellow-500 mr-2">
            <LucideClientIcon
              icon={Star}
              className="w-4 h-4 fill-current"
              aria-hidden="true"
            />
            <span className="ml-1 text-xs font-medium">
              {restaurant.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            ({restaurant.reviewCount?.toLocaleString() || 0})
          </span>
          {restaurant.priceRange && (
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
              {restaurant.priceRange}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

/**
 * SimilarRestaurants component for displaying similar restaurants
 *
 * @param {Object} props - Component props
 * @param {Array} props.cuisineTypes - Array of cuisine types to find similar restaurants
 * @param {string} props.currentRestaurantId - ID of the current restaurant to exclude from results
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const SimilarRestaurants = memo(function SimilarRestaurants({
  cuisineTypes,
  currentRestaurantId,
  getCountryLink,
}) {
  // Fetch similar restaurants
  const { data: similarRestaurants, isLoading } = useQuery({
    queryKey: ['similarRestaurants', cuisineTypes, currentRestaurantId],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the cuisine types
      // For now, we'll just filter the mock data
      return Promise.resolve(
        mockSimilarRestaurants.filter(
          restaurant =>
            restaurant.id !== currentRestaurantId &&
            restaurant.cuisineTypes?.some(cuisine =>
              cuisineTypes?.includes(cuisine),
            ),
        ),
      );
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
  });

  // If no cuisine types or no similar restaurants, don't render the component
  if (
    !cuisineTypes ||
    cuisineTypes.length === 0 ||
    (similarRestaurants && similarRestaurants.length === 0)
  ) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Similar Restaurants
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <LucideClientIcon
            icon={Loader2}
            className="w-6 h-6 animate-spin text-orange-500"
            aria-label="Loading similar restaurants"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {similarRestaurants?.map(restaurant => (
            <SimilarRestaurantItem
              key={restaurant.id}
              restaurant={restaurant}
              getCountryLink={getCountryLink}
            />
          ))}

          <div className="pt-2 text-center">
            <Link
              href={getCountryLink(
                `/restaurants?cuisines=${cuisineTypes.join(',')}`,
              )}
              className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
            >
              View More Similar Restaurants
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});

export default SimilarRestaurants;
