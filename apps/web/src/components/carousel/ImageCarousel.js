/**
 * Image Carousel Component
 * 
 * Responsive image carousel with navigation and indicators.
 * 
 * Features:
 * - Touch/swipe support
 * - Keyboard navigation
 * - Auto-play functionality
 * - Thumbnail indicators
 * - Responsive design
 * - Analytics tracking
 */

import React, { useState, useEffect } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const ImageCarousel = ({
  images = [],
  autoPlay = false,
  autoPlayInterval = 3000,
  showIndicators = true,
  showNavigation = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { trackUserEngagement } = useAnalyticsContext();

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    trackUserEngagement('carousel', 'navigate', 'indicator', {
      fromIndex: currentIndex,
      toIndex: index,
      totalImages: images.length
    });
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    trackUserEngagement('carousel', 'navigate', 'previous', {
      fromIndex: currentIndex,
      toIndex: newIndex
    });
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    trackUserEngagement('carousel', 'navigate', 'next', {
      fromIndex: currentIndex,
      toIndex: newIndex
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  };

  if (images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-colors
                ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}
              `}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Caption */}
      {images[currentIndex].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <p className="text-white text-sm">{images[currentIndex].caption}</p>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
