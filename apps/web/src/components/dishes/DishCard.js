import React, { memo } from 'react';
// Temporarily removed complex imports to isolate runtime issues:
// import Link from 'next/link';
// import Image from 'next/image';
// import { Utensils, Star, ArrowRight } from 'lucide-react';

/**
 * Dish card component for displaying individual dish information
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
const DishCard = memo(function DishCard({ dish }) {
  // Add comprehensive error checking and logging
  console.log('DishCard render - dish data:', dish);

  if (!dish) {
    console.log('DishCard: No dish data provided');
    return null;
  }

  // Enhanced defensive programming with better validation
  const rating = typeof dish.rating === 'number' && !isNaN(dish.rating) ? dish.rating : 0;
  const reviewCount = typeof dish.reviewCount === 'number' && !isNaN(dish.reviewCount) ? dish.reviewCount : 0;
  const dishName = dish.name && typeof dish.name === 'string' ? dish.name.trim() : 'Unknown Dish';
  const dishId = dish.id && typeof dish.id === 'string' ? dish.id.trim() : 'unknown';
  const dishPrice = dish.price && typeof dish.price === 'string' ? dish.price.trim() : null;

  console.log('DishCard processed data:', { rating, reviewCount, dishName, dishId, dishPrice });

  // TEMPORARY: Return minimal version to isolate the issue
  return (
    <div className="block bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
        <span className="text-gray-500">🍽️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {dishName}
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {rating > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-medium text-gray-900">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
          {reviewCount > 0 && (
            <span className="text-gray-500 text-sm">
              ({reviewCount} reviews)
            </span>
          )}
        </div>
        {dishPrice && (
          <span className="text-sm font-bold text-gray-800">
            {dishPrice}
          </span>
        )}
      </div>
    </div>
  );
});

export default DishCard;
