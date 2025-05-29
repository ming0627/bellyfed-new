import React, { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, Clock, Phone, Globe, Share2, Heart, BadgeCheck } from 'lucide-react';
/**
 * Restaurant header component for displaying restaurant information
 *
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data
 * @param {Function} props.onToggleFavorite - Function to toggle favorite status
 * @returns {JSX.Element} RestaurantHeader component
 */
export default function RestaurantHeader({ restaurant, onToggleFavorite }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Handle favorite toggle
  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(!isFavorite);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name} on Bellyfed!`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Share URL copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!restaurant) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 animate-pulse h-64 rounded-lg"></div>
    );
  }

  return (
    <div className="relative">
      {/* Restaurant Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Restaurant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center">
              {restaurant.name}
              {restaurant.isVerified && (
                <BadgeCheck className="ml-2 h-6 w-6 text-blue-400" aria-label="Verified" />
              )}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-y-2">
              {restaurant.rating && (
                <div className="flex items-center mr-4">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                  {restaurant.reviewCount > 0 && (
                    <span className="ml-1 text-white/80">
                      ({restaurant.reviewCount} {restaurant.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              )}

              {restaurant.cuisine && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-sm mr-4">
                  {restaurant.cuisine}
                </span>
              )}

              {restaurant.priceRange && (
                <span className="mr-4">{restaurant.priceRange}</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-y-2">
              {restaurant.address && (
                <div className="flex items-center mr-4 text-sm text-white/80">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span>{restaurant.address}</span>
                </div>
              )}

              {restaurant.phone && (
                <div className="flex items-center mr-4 text-sm text-white/80">
                  <Phone className="h-4 w-4 mr-1.5" />
                  <span>{restaurant.phone}</span>
                </div>
              )}

              {restaurant.website && (
                <div className="flex items-center mr-4 text-sm text-white/80">
                  <Globe className="h-4 w-4 mr-1.5" />
                  <span>Website</span>
                </div>
              )}

              {restaurant.hours && restaurant.hours.status && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span className={restaurant.hours.isOpen ? 'text-green-400' : 'text-red-400'}>
                    {restaurant.hours.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full ${
                isFavorite
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } transition-colors`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
