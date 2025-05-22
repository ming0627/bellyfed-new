import React, { memo } from 'react';
import { Check } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * DishIngredients component for displaying the ingredients of a dish
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @returns {JSX.Element} - Rendered component
 */
const DishIngredients = memo(function DishIngredients({ dish }) {
  // If no ingredients, don't render the component
  if (!dish.ingredients || dish.ingredients.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Ingredients
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dish.ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center">
            <LucideClientIcon
              icon={Check}
              className="w-5 h-5 text-green-500 mr-2"
              aria-hidden="true"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {ingredient}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default DishIngredients;
