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
      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-primary-200/50 transform hover:-translate-y-1"
      data-testid={`dish-card-${dish.id}`}
    >
      <div className="relative h-48 overflow-hidden">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            layout="fill"
            objectFit="cover"
            loading="lazy"
            className="group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <LucideClientIcon
              icon={Utensils}
              className="w-12 h-12 text-primary-400"
            />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Price Badge */}
        {dish.price && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-gray-800 shadow-lg">
            {dish.price}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
          <LucideClientIcon
            icon={Star}
            className="w-4 h-4 text-yellow-400 fill-current"
          />
          <span className="text-sm font-bold text-gray-800">{dish.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-heading font-bold text-neutral-900 mb-2 text-lg group-hover:text-primary-600 transition-colors">
          {dish.name}
        </h3>
        <p className="text-neutral-700 mb-4 font-medium">{dish.restaurant}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <LucideClientIcon
                icon={Star}
                className="w-4 h-4 text-yellow-400 fill-current"
              />
              <span className="font-bold text-neutral-900">{dish.rating.toFixed(1)}</span>
            </div>
            <span className="text-neutral-500 text-sm">
              ({dish.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-center space-x-1 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">View Details</span>
            <LucideClientIcon
              icon={ArrowRight}
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
            />
          </div>
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
    <section className="mb-16" aria-labelledby="top-dishes-heading">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-primary rounded-xl shadow-lg">
            <LucideClientIcon
              icon={Utensils}
              className="w-6 h-6 text-white"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 id="top-dishes-heading" className="font-heading text-2xl font-bold text-neutral-900">
              Top Rated Dishes
            </h2>
            <p className="text-neutral-700 text-sm">Discover the most loved dishes in your area</p>
          </div>
        </div>
        <Link
          href="/dish-restaurants"
          className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="View all top rated dishes"
        >
          <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">View All</span>
          <LucideClientIcon
            icon={ArrowRight}
            className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {topDishes.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </section>
  );
});

// Default export for easier imports
export default TopRatedDishes;
