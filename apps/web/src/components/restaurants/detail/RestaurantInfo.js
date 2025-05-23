import React from 'react';
import { Clock, DollarSign, Utensils, Tag, Award } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * Restaurant info component for displaying restaurant details
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data
 * @returns {JSX.Element} RestaurantInfo component
 */
export default function RestaurantInfo({ restaurant }) {
  if (!restaurant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        About {restaurant.name}
      </h2>
      
      {restaurant.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {restaurant.description}
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Restaurant Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Details
          </h3>
          
          <ul className="space-y-3">
            {restaurant.cuisine && (
              <li className="flex items-start">
                <LucideClientIcon 
                  icon={Utensils} 
                  className="h-5 w-5 text-orange-500 mr-2 mt-0.5" 
                />
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cuisine
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {restaurant.cuisine}
                  </span>
                </div>
              </li>
            )}
            
            {restaurant.priceRange && (
              <li className="flex items-start">
                <LucideClientIcon 
                  icon={DollarSign} 
                  className="h-5 w-5 text-orange-500 mr-2 mt-0.5" 
                />
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Range
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {restaurant.priceRange}
                  </span>
                </div>
              </li>
            )}
            
            {restaurant.specialties && restaurant.specialties.length > 0 && (
              <li className="flex items-start">
                <LucideClientIcon 
                  icon={Award} 
                  className="h-5 w-5 text-orange-500 mr-2 mt-0.5" 
                />
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specialties
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {restaurant.specialties.join(', ')}
                  </span>
                </div>
              </li>
            )}
            
            {restaurant.tags && restaurant.tags.length > 0 && (
              <li className="flex items-start">
                <LucideClientIcon 
                  icon={Tag} 
                  className="h-5 w-5 text-orange-500 mr-2 mt-0.5" 
                />
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
        
        {/* Hours */}
        {restaurant.hours && restaurant.hours.periods && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Hours
            </h3>
            
            <ul className="space-y-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const dayHours = restaurant.hours.periods.find(period => 
                  period.day.toLowerCase() === day.toLowerCase()
                );
                
                return (
                  <li key={day} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {day}
                    </span>
                    
                    {dayHours ? (
                      <span className="text-gray-600 dark:text-gray-400">
                        {dayHours.open} - {dayHours.close}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500">
                        Closed
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            
            {restaurant.hours.notes && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-start">
                <LucideClientIcon 
                  icon={Clock} 
                  className="h-4 w-4 text-orange-500 mr-1.5 mt-0.5" 
                />
                <span>{restaurant.hours.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
