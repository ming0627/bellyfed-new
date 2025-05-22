import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image
import { Utensils, Star, ArrowRight } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Dish card component for displaying individual dish information
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
const DishCard = memo(function DishCard({ dish }) {
  if (!dish) return null;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={`dish-card-${dish.id}`}
    >
      <div className="relative h-40">
        {dish.imageUrl ? (
          <Image // Changed from img
            src={dish.imageUrl}
            alt={dish.name}
            layout="fill" // Added layout
            objectFit="cover" // Added objectFit
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <LucideClientIcon
              icon={Utensils}
              className="w-8 h-8 text-gray-400"
            />
          </div>
        )}
        {dish.price && (
          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-800">
            {dish.price}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{dish.name}</h3>
        <p className="text-gray-600 text-sm mb-2 truncate">{dish.restaurant}</p>
        <div className="flex items-center">
          <div className="flex items-center text-yellow-500 mr-2">
            <LucideClientIcon
              icon={Star}
              className="w-4 h-4 fill-current"
              aria-hidden="true"
            />
            <span className="ml-1 text-sm font-medium">
              {dish.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-500 text-xs">
            ({dish.reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      </div>
    </div>
  );
});

/**
 * TopRatedDishes component displays a grid of top-rated dishes
 *
 * @returns {JSX.Element} - Rendered component
 */
export const TopRatedDishes = memo(function TopRatedDishes() {
  // Mock data for top rated dishes - in a real app, this would come from props or an API
  const topDishes = useMemo(
    () => [
      {
        id: '1',
        name: 'Nasi Lemak Special',
        restaurant: 'Nasi Lemak House',
        rating: 4.8,
        reviewCount: 120,
        imageUrl:
          'https://images.unsplash.com/photo-1628517394226-4f0c0f9a8b79?q=80&w=300&h=200&fit=crop',
        price: 'RM 15.90',
      },
      {
        id: '2',
        name: 'Premium Sushi Platter',
        restaurant: 'Sushi Sensation',
        rating: 4.9,
        reviewCount: 87,
        imageUrl:
          'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&h=200&fit=crop',
        price: 'RM 88.00',
      },
      {
        id: '3',
        name: 'Street Tacos Trio',
        restaurant: 'Taco Temple',
        rating: 4.7,
        reviewCount: 78,
        imageUrl:
          'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=300&h=200&fit=crop',
        price: 'RM 24.90',
      },
      {
        id: '4',
        name: 'Char Kuey Teow',
        restaurant: 'Penang Delights',
        rating: 4.7,
        reviewCount: 92,
        imageUrl:
          'https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=300&h=200&fit=crop',
        price: 'RM 12.90',
      },
    ],
    [],
  );

  // Early return if no dishes are available
  if (!topDishes || topDishes.length === 0) {
    return null;
  }

  return (
    <section className="mb-12" aria-labelledby="top-dishes-heading">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <LucideClientIcon
            icon={Utensils}
            className="w-5 h-5 text-orange-500 mr-2"
            aria-hidden="true"
          />
          <h2 id="top-dishes-heading" className="text-xl font-bold">
            Top Rated Dishes
          </h2>
        </div>
        <Link
          href="/dish-restaurants"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          aria-label="View all top rated dishes"
        >
          View All
          <LucideClientIcon
            icon={ArrowRight}
            className="w-4 h-4 ml-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topDishes.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </section>
  );
});

// Default export for easier imports
export default TopRatedDishes;
