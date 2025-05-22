import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * Restaurant location component for displaying restaurant location information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data
 * @returns {JSX.Element} RestaurantLocation component
 */
export default function RestaurantLocation({ restaurant }) {
  if (!restaurant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }
  
  // Handle directions click
  const handleGetDirections = () => {
    if (restaurant.coordinates) {
      const { latitude, longitude } = restaurant.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else if (restaurant.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`, '_blank');
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Location & Contact
      </h2>
      
      {/* Map Placeholder */}
      <div className="relative h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 overflow-hidden">
        {restaurant.coordinates ? (
          <iframe
            title={`Map of ${restaurant.name}`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`}
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 dark:text-gray-400">Map not available</span>
          </div>
        )}
      </div>
      
      {/* Location & Contact Info */}
      <div className="space-y-4">
        {restaurant.address && (
          <div className="flex items-start">
            <LucideClientIcon 
              icon={MapPin} 
              className="h-5 w-5 text-orange-500 mr-3 mt-0.5" 
            />
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {restaurant.address}
              </p>
              <button
                onClick={handleGetDirections}
                className="mt-2 flex items-center text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-sm font-medium"
              >
                <LucideClientIcon icon={Navigation} className="h-4 w-4 mr-1" />
                Get Directions
              </button>
            </div>
          </div>
        )}
        
        {restaurant.phone && (
          <div className="flex items-start">
            <LucideClientIcon 
              icon={Phone} 
              className="h-5 w-5 text-orange-500 mr-3 mt-0.5" 
            />
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </h3>
              <a 
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
              >
                {restaurant.phone}
              </a>
            </div>
          </div>
        )}
        
        {restaurant.website && (
          <div className="flex items-start">
            <LucideClientIcon 
              icon={ExternalLink} 
              className="h-5 w-5 text-orange-500 mr-3 mt-0.5" 
            />
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </h3>
              <a 
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
              >
                {restaurant.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          </div>
        )}
        
        {restaurant.hours && restaurant.hours.status && (
          <div className="flex items-start">
            <LucideClientIcon 
              icon={Clock} 
              className="h-5 w-5 text-orange-500 mr-3 mt-0.5" 
            />
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hours
              </h3>
              <p className={`${
                restaurant.hours.isOpen 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {restaurant.hours.status}
              </p>
              {restaurant.hours.today && (
                <p className="text-gray-600 dark:text-gray-400">
                  Today: {restaurant.hours.today}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
