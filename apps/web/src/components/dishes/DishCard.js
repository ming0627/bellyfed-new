import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Utensils, Star, ArrowRight } from 'lucide-react';

/**
 * Dish card component for displaying individual dish information
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
const DishCard = memo(function DishCard({ dish }) {
  if (!dish) return null;

  // Defensive programming - provide defaults for missing data
  const rating = typeof dish.rating === 'number' ? dish.rating : 0;
  const reviewCount = typeof dish.reviewCount === 'number' ? dish.reviewCount : 0;
  const dishName = dish.name || 'Unknown Dish';
  const dishId = dish.id || 'unknown';

  return (
    <Link
      href={`/dishes/${dishId}`}
      className="block group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1"
      data-testid={`dish-card-${dishId}`}
    >
      {/* FIXED: Optimized image section with single Star component usage */}
      <div className="relative h-48 overflow-hidden">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dishName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <Utensils className="w-12 h-12 text-orange-400" />
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
        {rating > 0 && (
          <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-gray-800">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
          {dishName}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {rating > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐</span>
                <span className="font-bold text-gray-900">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            {reviewCount > 0 && (
              <span className="text-gray-500 text-sm">
                ({reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">View Details</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
});

export default DishCard;
