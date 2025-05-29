import React, { memo } from 'react';
import Link from 'next/link';
import { Utensils, Star } from 'lucide-react';

/**
 * Simplified Dish card component for reliable homepage display
 * 
 * Features included:
 * - Basic dish information display
 * - Simple image placeholder (no Next.js Image)
 * - Essential rating display
 * - Minimal styling without complex animations
 * - Reliable rendering without edge cases
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
const DishCardSimple = memo(function DishCardSimple({ dish }) {
  if (!dish) return null;

  // Simplified data handling
  const dishName = dish.name || 'Unknown Dish';
  const dishId = dish.id || 'unknown';
  const rating = typeof dish.rating === 'number' ? dish.rating : 0;
  const hasRating = rating > 0;

  return (
    <Link
      href={`/dishes/${dishId}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
      data-testid={`dish-card-${dishId}`}
    >
      {/* Image Section - Simplified */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
        {dish.imageUrl ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">📷 {dishName}</span>
          </div>
        ) : (
          <Utensils className="w-12 h-12 text-orange-400" />
        )}
      </div>

      {/* Content Section - Simplified */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {dishName}
        </h3>

        {/* Rating - Simplified */}
        {hasRating && (
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price - Simplified */}
        {dish.price && (
          <div className="mt-2">
            <span className="text-sm font-medium text-orange-600">
              {dish.price}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
});

export default DishCardSimple;
