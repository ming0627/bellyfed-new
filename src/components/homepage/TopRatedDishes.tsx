import React from 'react';
import Link from 'next/link';
import { Utensils, Star, ArrowRight } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

export function TopRatedDishes(): JSX.Element {
  // Mock data for top rated dishes
  const topDishes = [
    {
      id: '1',
      name: 'Nasi Lemak Special',
      restaurant: 'Nasi Lemak House',
      rating: 4.8,
      reviewCount: 120,
      imageUrl: 'https://images.unsplash.com/photo-1628517394226-4f0c0f9a8b79?q=80&w=300&h=200&fit=crop',
      price: 'RM 15.90',
    },
    {
      id: '2',
      name: 'Premium Sushi Platter',
      restaurant: 'Sushi Sensation',
      rating: 4.9,
      reviewCount: 87,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&h=200&fit=crop',
      price: 'RM 88.00',
    },
    {
      id: '3',
      name: 'Street Tacos Trio',
      restaurant: 'Taco Temple',
      rating: 4.7,
      reviewCount: 78,
      imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=300&h=200&fit=crop',
      price: 'RM 24.90',
    },
    {
      id: '4',
      name: 'Char Kuey Teow',
      restaurant: 'Penang Delights',
      rating: 4.7,
      reviewCount: 92,
      imageUrl: 'https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=300&h=200&fit=crop',
      price: 'RM 12.90',
    },
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <LucideClientIcon icon={Utensils} className="w-5 h-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-bold">Top Rated Dishes</h2>
        </div>
        <Link
          href="/dish-restaurants"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          View All
          <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-800">
                {dish.price}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{dish.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{dish.restaurant}</p>
              <div className="flex items-center">
                <div className="flex items-center text-yellow-500 mr-2">
                  <LucideClientIcon icon={Star} className="w-4 h-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">{dish.rating}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  ({dish.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
