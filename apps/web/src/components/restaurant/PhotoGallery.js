/**
 * Restaurant Photo Gallery Component
 * 
 * Simplified photo gallery component focused on displaying restaurant photos
 * in a clean, responsive layout. Alternative to ImageGallery with different styling.
 * 
 * Features:
 * - Clean grid layout
 * - Photo categories
 * - Lightbox viewing
 * - Mobile responsive
 * - Social sharing
 */

import React, { useState } from 'react'
import { Card, Button, Badge } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'

const PhotoGallery = ({
  photos = [],
  restaurantId,
  showCategories = false,
  maxPhotos = 12,
  gridCols = 3,
  className = ''
}) => {
  // State
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Default photos if none provided
  const defaultPhotos = [
    {
      id: 'photo_1',
      url: '/images/gallery/restaurant-1.jpg',
      thumbnail: '/images/gallery/thumbs/restaurant-1.jpg',
      caption: 'Restaurant exterior',
      category: 'exterior'
    },
    {
      id: 'photo_2',
      url: '/images/gallery/food-1.jpg',
      thumbnail: '/images/gallery/thumbs/food-1.jpg',
      caption: 'Signature dish',
      category: 'food'
    },
    {
      id: 'photo_3',
      url: '/images/gallery/interior-1.jpg',
      thumbnail: '/images/gallery/thumbs/interior-1.jpg',
      caption: 'Dining area',
      category: 'interior'
    },
    {
      id: 'photo_4',
      url: '/images/gallery/food-2.jpg',
      thumbnail: '/images/gallery/thumbs/food-2.jpg',
      caption: 'Fresh ingredients',
      category: 'food'
    },
    {
      id: 'photo_5',
      url: '/images/gallery/chef-1.jpg',
      thumbnail: '/images/gallery/thumbs/chef-1.jpg',
      caption: 'Our chef at work',
      category: 'staff'
    },
    {
      id: 'photo_6',
      url: '/images/gallery/ambiance-1.jpg',
      thumbnail: '/images/gallery/thumbs/ambiance-1.jpg',
      caption: 'Evening ambiance',
      category: 'interior'
    }
  ]

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos
  const limitedPhotos = displayPhotos.slice(0, maxPhotos)

  // Get unique categories
  const categories = ['all', ...new Set(limitedPhotos.map(photo => photo.category))]

  // Filter photos by category
  const filteredPhotos = activeCategory === 'all' 
    ? limitedPhotos 
    : limitedPhotos.filter(photo => photo.category === activeCategory)

  // Handle photo click
  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto(photo)
    setSelectedIndex(index)
    
    trackUserEngagement('restaurant', restaurantId, 'photo_view', {
      photoId: photo.id,
      category: photo.category
    })
  }

  // Handle lightbox navigation
  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? filteredPhotos.length - 1 : selectedIndex - 1
    setSelectedIndex(newIndex)
    setSelectedPhoto(filteredPhotos[newIndex])
  }

  const handleNext = () => {
    const newIndex = selectedIndex === filteredPhotos.length - 1 ? 0 : selectedIndex + 1
    setSelectedIndex(newIndex)
    setSelectedPhoto(filteredPhotos[newIndex])
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    trackUserEngagement('restaurant', restaurantId, 'photo_filter', {
      category
    })
  }

  // Handle share
  const handleShare = async (photo) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.caption,
          text: `Check out this photo from the restaurant!`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
      
      trackUserEngagement('restaurant', restaurantId, 'photo_share', {
        photoId: photo.id
      })
    } catch (err) {
      console.error('Error sharing photo:', err)
    }
  }

  // Get grid class based on columns
  const getGridClass = () => {
    switch (gridCols) {
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2 sm:grid-cols-3'
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      default:
        return 'grid-cols-2 sm:grid-cols-3'
    }
  }

  if (filteredPhotos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">📷</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No photos available
        </h3>
        <p className="text-gray-600">
          Photos will appear here when available.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Filters */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      <div className={`grid ${getGridClass()} gap-4`}>
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square"
            onClick={() => handlePhotoClick(photo, index)}
          >
            <img
              src={photo.thumbnail || photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/images/placeholder-restaurant.jpg'
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {displayPhotos.length > maxPhotos && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Handle show more
              console.log('Show more photos')
            }}
          >
            View All Photos ({displayPhotos.length})
          </Button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {selectedIndex + 1} of {filteredPhotos.length}
                </span>
                {selectedPhoto.category && (
                  <Badge variant="secondary">
                    {selectedPhoto.category}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare(selectedPhoto)}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Share photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder-restaurant.jpg'
                }}
              />

              {/* Navigation Arrows */}
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Caption */}
            {selectedPhoto.caption && (
              <div className="text-center mt-4">
                <p className="text-white text-lg">
                  {selectedPhoto.caption}
                </p>
              </div>
            )}

            {/* Thumbnail Navigation */}
            {filteredPhotos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                {filteredPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setSelectedPhoto(photo)
                      setSelectedIndex(index)
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      index === selectedIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-restaurant.jpg'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery
