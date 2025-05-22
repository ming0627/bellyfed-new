import React, { useState, memo } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Heart, Share2, Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * RestaurantHeader component for displaying the restaurant header with images, name, and key information
 *
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantHeader = memo(function RestaurantHeader({ restaurant, getCountryLink }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

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

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: restaurant.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.error('Error copying link', error));
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? restaurant.images.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === restaurant.images.length - 1 ? 0 : prev + 1
    );
  };

  // Toggle gallery view
  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  return (
    <div className="relative">
      {/* Main Image Carousel */}
      <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
        {restaurant.images && restaurant.images.length > 0 ? (
          <img
            src={restaurant.images[currentImageIndex].url}
            alt={restaurant.images[currentImageIndex].caption || restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">No images available</span>
          </div>
        )}

        {/* Image Navigation */}
        {restaurant.images && restaurant.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <LucideClientIcon icon={ChevronLeft} className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <LucideClientIcon icon={ChevronRight} className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter and Gallery Button */}
        {restaurant.images && restaurant.images.length > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              {currentImageIndex + 1} / {restaurant.images.length}
            </span>
            <button
              onClick={toggleGallery}
              className="bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
              aria-label="View all images"
            >
              <LucideClientIcon icon={Camera} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Restaurant Info Overlay */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-t-lg -mt-8 relative z-10 mx-4 md:mx-auto md:max-w-4xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
              {/* Cuisine Types */}
              {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  {restaurant.cuisineTypes.join(' • ')}
                </span>
              )}

              {/* Price Range */}
              <span className="text-gray-600 dark:text-gray-300 text-sm">
                {formatPriceRange(restaurant.priceRange)}
              </span>

              {/* Open/Closed Status */}
              {isOpenNow() ? (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  Open Now
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                  Closed
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex items-center text-yellow-500 mr-2">
                <LucideClientIcon icon={Star} className="w-5 h-5 fill-current" aria-hidden="true" />
                <span className="ml-1 text-lg font-medium">
                  {restaurant.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm">
                ({restaurant.reviewCount?.toLocaleString() || 0} reviews)
              </span>
            </div>

            {/* Address and Hours */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
              {restaurant.address && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <LucideClientIcon
                    icon={MapPin}
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{restaurant.address.formatted || `${restaurant.address.street}, ${restaurant.address.city}`}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <LucideClientIcon
                  icon={Clock}
                  className="w-4 h-4 mr-1 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{getCurrentDayHours()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <button
              onClick={handleFavoriteToggle}
              className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <LucideClientIcon
                icon={Heart}
                className={`w-5 h-5 mr-1 ${
                  isFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                aria-hidden="true"
              />
              <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                {isFavorite ? 'Saved' : 'Save'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share restaurant"
            >
              <LucideClientIcon
                icon={Share2}
                className="w-5 h-5 mr-1 text-gray-600 dark:text-gray-300"
                aria-hidden="true"
              />
              <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                Share
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showGallery && restaurant.images && restaurant.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={toggleGallery}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <LucideClientIcon icon={X} className="w-6 h-6" />
          </button>

          <div className="w-full max-w-4xl">
            <img
              src={restaurant.images[currentImageIndex].url}
              alt={restaurant.images[currentImageIndex].caption || restaurant.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevImage}
                className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Previous image"
              >
                <LucideClientIcon icon={ChevronLeft} className="w-6 h-6" />
              </button>

              <div className="text-white text-sm">
                {restaurant.images[currentImageIndex].caption && (
                  <p className="mb-1">{restaurant.images[currentImageIndex].caption}</p>
                )}
                <p>{currentImageIndex + 1} / {restaurant.images.length}</p>
              </div>

              <button
                onClick={nextImage}
                className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Next image"
              >
                <LucideClientIcon icon={ChevronRight} className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex overflow-x-auto space-x-2 mt-4 pb-2">
              {restaurant.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 ${
                    index === currentImageIndex
                      ? 'ring-2 ring-orange-500'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default RestaurantHeader;
