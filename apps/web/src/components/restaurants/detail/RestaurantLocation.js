import React, { memo } from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * RestaurantLocation component for displaying the restaurant's location and hours
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantLocation = memo(function RestaurantLocation({ restaurant }) {
  // Format address for display
  const formatAddress = () => {
    if (restaurant.address?.formatted) {
      return restaurant.address.formatted;
    }
    
    if (restaurant.address) {
      const { street, city, state, postalCode, country } = restaurant.address;
      const parts = [street, city, state, postalCode, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return 'Address not available';
  };
  
  // Format address for Google Maps
  const getGoogleMapsUrl = () => {
    if (restaurant.location?.latitude && restaurant.location?.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}`;
    }
    
    if (restaurant.address) {
      const address = formatAddress();
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    
    return '#';
  };
  
  // Format hours for display
  const formatHours = () => {
    if (!restaurant.hours) {
      return null;
    }
    
    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' },
    ];
    
    // Group days with the same hours
    const groupedHours = [];
    let currentGroup = null;
    
    days.forEach((day) => {
      const hours = restaurant.hours[day.key];
      
      if (!hours) {
        return;
      }
      
      if (currentGroup && currentGroup.hours === hours) {
        currentGroup.days.push(day.label);
      } else {
        if (currentGroup) {
          groupedHours.push(currentGroup);
        }
        
        currentGroup = {
          days: [day.label],
          hours,
        };
      }
    });
    
    if (currentGroup) {
      groupedHours.push(currentGroup);
    }
    
    return groupedHours.map((group) => {
      let dayLabel = '';
      
      if (group.days.length === 1) {
        dayLabel = group.days[0];
      } else if (group.days.length === 2) {
        dayLabel = group.days.join(' & ');
      } else {
        const firstDay = group.days[0];
        const lastDay = group.days[group.days.length - 1];
        dayLabel = `${firstDay} - ${lastDay}`;
      }
      
      return {
        days: dayLabel,
        hours: group.hours,
      };
    });
  };
  
  // Get current day for highlighting
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };
  
  const currentDay = getCurrentDay();
  const formattedHours = formatHours();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Location & Hours
      </h3>
      
      {/* Map */}
      <div className="mb-4 aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
        {restaurant.location?.latitude && restaurant.location?.longitude ? (
          <iframe
            title={`Map of ${restaurant.name}`}
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${restaurant.location.latitude},${restaurant.location.longitude}&zoom=15`}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Map not available</span>
          </div>
        )}
      </div>
      
      {/* Address */}
      <div className="flex items-start mb-4">
        <LucideClientIcon
          icon={MapPin}
          className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-gray-700 dark:text-gray-300">
            {formatAddress()}
          </p>
          <div className="mt-2 flex space-x-2">
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
            >
              <LucideClientIcon icon={Navigation} className="w-4 h-4 mr-1" aria-hidden="true" />
              Get Directions
            </a>
          </div>
        </div>
      </div>
      
      {/* Hours */}
      {formattedHours && formattedHours.length > 0 && (
        <div className="flex items-start">
          <LucideClientIcon
            icon={Clock}
            className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="w-full">
            <table className="w-full text-left">
              <tbody>
                {formattedHours.map((item, index) => {
                  const isCurrentDay = item.days.toLowerCase().includes(currentDay);
                  
                  return (
                    <tr
                      key={index}
                      className={`${
                        isCurrentDay ? 'font-medium text-orange-500 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <td className="py-1 pr-4">{item.days}</td>
                      <td className="py-1">{item.hours}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default RestaurantLocation;
