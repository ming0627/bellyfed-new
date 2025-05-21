import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { Store, Star, ArrowRight, MapPin } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * RestaurantCard component for displaying individual restaurant information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantCard = memo(function RestaurantCard({ restaurant, getCountryLink }) {
  if (!restaurant) return null;
  
  return (
    <Link
      href={getCountryLink(`/restaurants/${restaurant.id}`)}
      className="block group"
      aria-label={`View details for ${restaurant.name}`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-48">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <LucideClientIcon icon={Store} className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {restaurant.isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}
          {restaurant.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              FEATURED
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
          {restaurant.cuisines && restaurant.cuisines.length > 0 && (
            <p className="text-gray-600 text-sm mb-2">
              {restaurant.cuisines.join(' • ')}
            </p>
          )}
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-500 mr-2">
              <LucideClientIcon icon={Star} className="w-4 h-4 fill-current" aria-hidden="true" />
              <span className="ml-1 text-sm font-medium">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              ({restaurant.reviewCount.toLocaleString()} reviews)
            </span>
            <span className="ml-auto text-gray-500 text-sm">
              {restaurant.priceRange}
            </span>
          </div>
          {restaurant.location && (
            <p className="text-gray-500 text-sm flex items-center">
              <LucideClientIcon
                icon={MapPin}
                className="w-3 h-3 mr-1 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{restaurant.location}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});

/**
 * FeaturedRestaurants component displays a grid of featured restaurants
 * 
 * @param {Object} props - Component props
 * @param {string} props.countryName - Name of the current country
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
export const FeaturedRestaurants = memo(function FeaturedRestaurants({
  countryName,
  getCountryLink,
}) {
  // Mock data for featured restaurants - in a real app, this would come from an API
  const featuredRestaurants = useMemo(() => [
    {
      id: '1',
      name: 'Nasi Lemak House',
      cuisines: ['Malaysian', 'Halal'],
      rating: 4.7,
      reviewCount: 256,
      priceRange: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
      location: 'Bukit Bintang, KL',
      isNew: false,
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Sushi Sensation',
      cuisines: ['Japanese', 'Seafood'],
      rating: 4.8,
      reviewCount: 189,
      priceRange: '$$$',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
      location: 'KLCC, Kuala Lumpur',
      isNew: true,
      isFeatured: true,
    },
    {
      id: '3',
      name: 'Taco Temple',
      cuisines: ['Mexican', 'Fusion'],
      rating: 4.5,
      reviewCount: 142,
      priceRange: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
      location: 'Petaling Jaya',
      isNew: false,
      isFeatured: true,
    },
  ], []);

  // Early return if no restaurants are available
  if (!featuredRestaurants || featuredRestaurants.length === 0) {
    return null;
  }

  // Validate required props
  if (!countryName || typeof getCountryLink !== 'function') {
    console.error('FeaturedRestaurants component missing required props');
    return null;
  }

  return (
    <section className="mb-12" aria-labelledby="featured-restaurants-heading">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <LucideClientIcon 
            icon={Store} 
            className="w-5 h-5 text-green-600 mr-2" 
            aria-hidden="true" 
          />
          <h2 
            id="featured-restaurants-heading" 
            className="text-xl font-bold"
          >
            Featured Restaurants in {countryName}
          </h2>
        </div>
        <Link
          href={getCountryLink('/restaurants')}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          aria-label="View all restaurants"
        >
          View All
          <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredRestaurants.map((restaurant) => (
          <RestaurantCard 
            key={restaurant.id} 
            restaurant={restaurant} 
            getCountryLink={getCountryLink} 
          />
        ))}
      </div>
    </section>
  );
});

// Default export for easier imports
export default FeaturedRestaurants;
