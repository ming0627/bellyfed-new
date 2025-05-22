import React, { memo } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * RestaurantCard component for displaying restaurant information in a card format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {string} props.variant - Card variant (default, compact, featured)
 * @param {Function} props.onFavoriteToggle - Function to handle favorite toggle
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantCard = memo(function RestaurantCard({
  restaurant,
  getCountryLink,
  variant = 'default',
  onFavoriteToggle,
}) {
  if (!restaurant) return null;

  // Determine card height based on variant
  const imageHeightClass = variant === 'compact' ? 'h-32' : 'h-48';
  
  // Determine card width based on variant
  const cardWidthClass = variant === 'featured' ? 'w-full' : '';

  // Format price range with dollar signs
  const formatPriceRange = (priceRange) => {
    if (!priceRange) return '';
    
    // If price range is already formatted (e.g., "$$$"), return as is
    if (typeof priceRange === 'string' && priceRange.includes('$')) {
      return priceRange;
    }
    
    // Otherwise, convert number to dollar signs
    const price = typeof priceRange === 'number' ? priceRange : parseInt(priceRange, 10);
    return '$'.repeat(price);
  };

  // Handle favorite toggle with proper event handling
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(restaurant.id);
    }
  };

  // Get current day for opening hours
  const getCurrentDayHours = () => {
    if (!restaurant.hours) return 'Hours not available';
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    return restaurant.hours[today] || 'Closed';
  };

  // Check if restaurant is currently open
  const isOpenNow = () => {
    if (!restaurant.hours) return false;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hoursToday = restaurant.hours[today];
    
    if (!hoursToday || hoursToday === 'Closed') return false;
    
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [openTime, closeTime] = hoursToday.split('-');
      
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      const openTimeMinutes = openHour * 60 + openMinute;
      const closeTimeMinutes = closeHour * 60 + closeMinute;
      
      return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
    } catch (error) {
      console.error('Error parsing restaurant hours:', error);
      return false;
    }
  };

  return (
    <Link
      href={getCountryLink(`/restaurants/${restaurant.id}`)}
      className={`block group ${cardWidthClass}`}
      aria-label={`View details for ${restaurant.name}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className={`relative ${imageHeightClass}`}>
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {restaurant.isNew && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </span>
            )}
            {restaurant.isFeatured && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                FEATURED
              </span>
            )}
            {isOpenNow() ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                OPEN NOW
              </span>
            ) : (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                CLOSED
              </span>
            )}
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={restaurant.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <LucideClientIcon 
              icon={Heart} 
              className={`w-5 h-5 ${
                restaurant.isFavorite 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} 
              aria-hidden="true"
            />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
            {restaurant.name}
          </h3>
          
          {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {restaurant.cuisineTypes.join(' • ')}
            </p>
          )}
          
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-500 mr-2">
              <LucideClientIcon icon={Star} className="w-4 h-4 fill-current" aria-hidden="true" />
              <span className="ml-1 text-sm font-medium">
                {restaurant.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              ({restaurant.reviewCount?.toLocaleString() || 0} reviews)
            </span>
            <span className="ml-auto text-gray-500 dark:text-gray-400 text-sm">
              {formatPriceRange(restaurant.priceRange)}
            </span>
          </div>
          
          {restaurant.address && (
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mb-1">
              <LucideClientIcon
                icon={MapPin}
                className="w-3.5 h-3.5 mr-1 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">
                {restaurant.address.city}, {restaurant.address.state}
              </span>
            </p>
          )}
          
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <LucideClientIcon
              icon={Clock}
              className="w-3.5 h-3.5 mr-1 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">
              {getCurrentDayHours()}
            </span>
          </p>
          
          {variant === 'featured' && restaurant.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {restaurant.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});

export default RestaurantCard;
