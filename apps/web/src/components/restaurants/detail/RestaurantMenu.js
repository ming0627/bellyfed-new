import React, { useState, memo } from 'react';
import { ChevronDown, ChevronUp, Star, Award } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * MenuItem component for displaying a single menu item
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Menu item data
 * @returns {JSX.Element} - Rendered component
 */
const MenuItem = memo(function MenuItem({ item }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      {/* Item Image */}
      {item.imageUrl && (
        <div className="w-full md:w-24 h-24 mb-3 md:mb-0 md:mr-4 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Item Details */}
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              {item.name}
              {item.isSignature && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  <LucideClientIcon icon={Award} className="w-3 h-3 mr-1" aria-hidden="true" />
                  Signature
                </span>
              )}
            </h4>
            {item.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {item.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white">
              {item.currency} {item.price.toFixed(2)}
            </p>
            {item.rating && (
              <div className="flex items-center justify-end mt-1">
                <LucideClientIcon icon={Star} className="w-3.5 h-3.5 text-yellow-500 fill-current" aria-hidden="true" />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {item.rating.toFixed(1)} ({item.reviewCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * MenuCategory component for displaying a category of menu items
 * 
 * @param {Object} props - Component props
 * @param {Object} props.category - Category data
 * @returns {JSX.Element} - Rendered component
 */
const MenuCategory = memo(function MenuCategory({ category }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Toggle category expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="mb-6 last:mb-0">
      {/* Category Header */}
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left py-2 border-b-2 border-orange-500 dark:border-orange-400"
        aria-expanded={isExpanded}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {category.category}
        </h3>
        <LucideClientIcon
          icon={isExpanded ? ChevronUp : ChevronDown}
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
          aria-hidden="true"
        />
      </button>
      
      {/* Category Items */}
      {isExpanded && (
        <div className="mt-2">
          {category.items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * RestaurantMenu component for displaying the restaurant's menu
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantMenu = memo(function RestaurantMenu({ restaurant }) {
  const [activeTab, setActiveTab] = useState('menu');
  
  // Check if restaurant has featured dishes
  const hasFeaturedDishes = restaurant.featuredDishes && restaurant.featuredDishes.length > 0;
  
  // Check if restaurant has menu
  const hasMenu = restaurant.menu && restaurant.menu.length > 0;
  
  // If no menu or featured dishes, don't render the component
  if (!hasMenu && !hasFeaturedDishes) {
    return null;
  }
  
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Menu
      </h2>
      
      {/* Tabs */}
      {hasFeaturedDishes && hasMenu && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('featured')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'featured'
                ? 'text-orange-500 border-b-2 border-orange-500 dark:text-orange-400 dark:border-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
            }`}
          >
            Featured Dishes
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'menu'
                ? 'text-orange-500 border-b-2 border-orange-500 dark:text-orange-400 dark:border-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
            }`}
          >
            Full Menu
          </button>
        </div>
      )}
      
      {/* Featured Dishes */}
      {activeTab === 'featured' && hasFeaturedDishes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurant.featuredDishes.map((dish) => (
            <div key={dish.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
              {dish.imageUrl && (
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      {dish.name}
                      {dish.isSignature && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          <LucideClientIcon icon={Award} className="w-3 h-3 mr-1" aria-hidden="true" />
                          Signature
                        </span>
                      )}
                    </h4>
                    {dish.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {dish.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {dish.currency} {dish.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                {dish.rating && (
                  <div className="flex items-center mt-2">
                    <LucideClientIcon icon={Star} className="w-4 h-4 text-yellow-500 fill-current" aria-hidden="true" />
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      {dish.rating.toFixed(1)} ({dish.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Full Menu */}
      {(activeTab === 'menu' || !hasFeaturedDishes) && hasMenu && (
        <div>
          {restaurant.menu.map((category, index) => (
            <MenuCategory key={index} category={category} />
          ))}
        </div>
      )}
    </section>
  );
});

export default RestaurantMenu;
