import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, BadgeCheck, Heart } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Restaurant card component for displaying restaurant information
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Restaurant ID
 * @param {string} props.name - Restaurant name
 * @param {string} props.imageUrl - Restaurant image URL
 * @param {number} props.rating - Restaurant rating (0-5)
 * @param {number} props.reviewCount - Number of reviews
 * @param {string} props.cuisine - Restaurant cuisine type
 * @param {string} props.priceRange - Restaurant price range ($-$$$$)
 * @param {string} props.location - Restaurant location
 * @param {string} props.distance - Distance from user
 * @param {boolean} props.isOpen - Whether the restaurant is currently open
 * @param {boolean} props.isVerified - Whether the restaurant is verified
 * @param {string} props.description - Restaurant description
 * @param {Function} props.onToggleFavorite - Function to toggle favorite status
 * @param {Function} props.getCountryLink - Function to get country-specific link
 * @returns {JSX.Element} RestaurantCard component
 */
export default function RestaurantCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  cuisine,
  priceRange,
  location,
  distance,
  isOpen,
  isVerified,
  description,
  onToggleFavorite,
  getCountryLink = (path) => path,
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Handle favorite toggle
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(id, !isFavorite);
    }
  };
  
  // Format rating to display with one decimal place
  const formattedRating = rating ? rating.toFixed(1) : 'N/A';
  
  return (
    <Link 
      href={getCountryLink(`/restaurant/${id}`)}
      className="block h-full overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Restaurant Image */}
      <div className="relative h-48 w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
          } hover:scale-110 transition-all`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <LucideClientIcon 
            icon={Heart} 
            className="h-5 w-5" 
            fill={isFavorite ? 'currentColor' : 'none'} 
          />
        </button>
        
        {/* Open/Closed Status */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isOpen 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-white'
          }`}>
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              {name}
              {isVerified && (
                <LucideClientIcon 
                  icon={BadgeCheck} 
                  className="h-4 w-4 ml-1 text-blue-500" 
                  aria-label="Verified" 
                />
              )}
            </h3>
            
            <div className="mt-1 flex items-center">
              <div className="flex items-center text-orange-500">
                <LucideClientIcon icon={Star} className="h-4 w-4 mr-1" />
                <span className="font-medium">{formattedRating}</span>
              </div>
              {reviewCount > 0 && (
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {priceRange}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start">
            <LucideClientIcon icon={MapPin} className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{location}</span>
          </div>
          {distance && (
            <div className="flex items-center mt-1">
              <LucideClientIcon icon={Clock} className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{distance} away</span>
            </div>
          )}
        </div>
        
        {cuisine && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
              {cuisine}
            </span>
          </div>
        )}
        
        {description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
