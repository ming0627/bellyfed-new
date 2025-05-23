import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * Restaurant menu component for displaying restaurant menu items
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data
 * @returns {JSX.Element} RestaurantMenu component
 */
export default function RestaurantMenu({ restaurant }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  
  if (!restaurant || !restaurant.menu) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Menu
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Menu information is not available for this restaurant.
        </p>
      </div>
    );
  }
  
  // Get all categories from menu items
  const categories = ['all', ...new Set(restaurant.menu.items.map(item => item.category))];
  
  // Filter menu items based on search query and active category
  const filteredItems = restaurant.menu.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Toggle item expansion
  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Menu
      </h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LucideClientIcon icon={Search} className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LucideClientIcon icon={Filter} className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <LucideClientIcon icon={ChevronDown} className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => toggleItemExpansion(item.id)}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-orange-500 font-medium">
                      {typeof item.price === 'object' 
                        ? `${item.price.currency}${item.price.min} - ${item.price.currency}${item.price.max}`
                        : `${item.price}`
                      }
                    </span>
                    {item.isPopular && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">
                        Popular
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                        Vegetarian
                      </span>
                    )}
                  </div>
                </div>
                
                {item.imageUrl && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 ml-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                
                <LucideClientIcon 
                  icon={expandedItems[item.id] ? ChevronUp : ChevronDown} 
                  className="h-5 w-5 text-gray-400 ml-4" 
                />
              </div>
              
              {expandedItems[item.id] && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  {item.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {item.description}
                    </p>
                  )}
                  
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ingredients:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.ingredients.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {item.allergens && item.allergens.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Allergens:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No menu items found matching your search.
          </p>
        </div>
      )}
      
      {/* Menu Notes */}
      {restaurant.menu.notes && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-md text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Note:</p>
          <p>{restaurant.menu.notes}</p>
        </div>
      )}
    </div>
  );
}
