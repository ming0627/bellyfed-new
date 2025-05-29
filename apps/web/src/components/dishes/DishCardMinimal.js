import React from 'react';

/**
 * Minimal Dish card component for testing
 * 
 * This is the most basic version possible to test core functionality
 * without any external dependencies or complex features.
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
function DishCardMinimal({ dish }) {
  if (!dish) return null;

  const dishName = dish.name || 'Unknown Dish';

  return (
    <div className="bg-white rounded border p-4 shadow">
      <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
        <span className="text-gray-500 text-xs">🍽️</span>
      </div>
      <h3 className="font-medium text-gray-900">{dishName}</h3>
      {dish.price && (
        <p className="text-sm text-orange-600 mt-1">{dish.price}</p>
      )}
    </div>
  );
}

export default DishCardMinimal;
