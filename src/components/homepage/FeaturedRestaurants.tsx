import React from 'react';
import Link from 'next/link';
import { Store, Star, ArrowRight } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

interface FeaturedRestaurantsProps {
  countryName: string;
  getCountryLink: (path: string) => string;
}

export function FeaturedRestaurants({
  countryName,
  getCountryLink,
}: FeaturedRestaurantsProps): JSX.Element {
  // Mock data for featured restaurants
  const featuredRestaurants = [
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
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <LucideClientIcon icon={Store} className="w-5 h-5 text-green-600 mr-2" />
          <h2 className="text-xl font-bold">
            Featured Restaurants in {countryName}
          </h2>
        </div>
        <Link
          href={getCountryLink('/restaurants')}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          View All
          <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredRestaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={getCountryLink(`/restaurants/${restaurant.id}`)}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="relative h-48">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
                <p className="text-gray-600 text-sm mb-2">
                  {restaurant.cuisines.join(' • ')}
                </p>
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-500 mr-2">
                    <LucideClientIcon icon={Star} className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {restaurant.rating}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    ({restaurant.reviewCount} reviews)
                  </span>
                  <span className="ml-auto text-gray-500 text-sm">
                    {restaurant.priceRange}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  <LucideClientIcon
                    icon={MapPin}
                    className="w-3 h-3 inline mr-1"
                    aria-hidden="true"
                  />
                  {restaurant.location}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
