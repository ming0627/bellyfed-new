import React, { memo } from 'react';
import Link from 'next/link';
import { Utensils, Star } from 'lucide-react';

/**
 * Progressive Enhancement Dish Card
 * 
 * Features can be enabled/disabled via props for incremental testing:
 * - enableLink: Wrap in Next.js Link component
 * - enableRating: Show rating display
 * - enablePrice: Show price badge
 * - enableHover: Add hover effects
 * - enableImage: Show image placeholder
 *
 * @param {Object} props - Component props
 * @param {Object} props.dish - Dish data object
 * @param {boolean} props.enableLink - Enable Link wrapper (default: true)
 * @param {boolean} props.enableRating - Enable rating display (default: true)
 * @param {boolean} props.enablePrice - Enable price display (default: true)
 * @param {boolean} props.enableHover - Enable hover effects (default: false)
 * @param {boolean} props.enableImage - Enable image section (default: true)
 * @returns {JSX.Element} - Rendered component
 */
const DishCardProgressive = memo(function DishCardProgressive({ 
  dish,
  enableLink = true,
  enableRating = true,
  enablePrice = true,
  enableHover = false,
  enableImage = true
}) {
  if (!dish) return null;

  const dishName = dish.name || 'Unknown Dish';
  const dishId = dish.id || 'unknown';
  const rating = typeof dish.rating === 'number' ? dish.rating : 0;

  // Base card classes
  const baseClasses = "bg-white rounded-lg border border-gray-200 overflow-hidden";
  const hoverClasses = enableHover 
    ? "shadow-md hover:shadow-lg transition-shadow duration-200" 
    : "shadow-sm";
  
  const cardClasses = `${baseClasses} ${hoverClasses}`;

  const CardContent = () => (
    <div className={cardClasses} data-testid={`dish-card-${dishId}`}>
      {/* Image Section */}
      {enableImage && (
        <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          <Utensils className="w-10 h-10 text-orange-400" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {dishName}
        </h3>

        {/* Rating Section */}
        {enableRating && rating > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price Section */}
        {enablePrice && dish.price && (
          <div className="text-sm font-medium text-orange-600">
            {dish.price}
          </div>
        )}
      </div>
    </div>
  );

  // Conditionally wrap with Link
  if (enableLink) {
    return (
      <Link href={`/dishes/${dishId}`} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
});

export default DishCardProgressive;
