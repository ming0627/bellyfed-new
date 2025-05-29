import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { Utensils, ArrowRight } from 'lucide-react';
import DishCard from '../dishes/DishCard.js';


/**
 * TopRatedDishes component displays a grid of top-rated dishes
 *
 * @returns {JSX.Element} - Rendered component
 */
const TopRatedDishes = memo(function TopRatedDishes() {
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
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <Utensils
              className="w-6 h-6 text-white"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              id="top-dishes-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Top Rated Dishes
            </h2>
            <p className="text-gray-700 text-sm">
              Discover the most loved dishes in your area
            </p>
          </div>
        </div>
        <Link
          href="/dish-restaurants"
          className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="View all top rated dishes"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
            View All
          </span>
          <ArrowRight
            className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200"
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

export default TopRatedDishes;
