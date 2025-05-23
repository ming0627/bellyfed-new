/**
 * Restaurant Hero Section Component
 * 
 * Main hero section for restaurant detail pages featuring large image,
 * restaurant name, key information, and primary action buttons.
 * 
 * Features:
 * - Large hero image with overlay
 * - Restaurant name and basic info
 * - Rating and review count
 * - Primary action buttons (book table, directions, etc.)
 * - Image gallery navigation
 * - Responsive design
 */

import React, { useState } from 'react'
import { Button, Badge } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import BookTableDialog from './BookTableDialog.js'

const HeroSection = ({
  restaurant,
  images = [],
  showBookingButton = true,
  showDirectionsButton = true,
  showShareButton = true,
  showFavoriteButton = true,
  onImageClick = null,
  className = ''
}) => {
  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Use restaurant image if no images provided
  const displayImages = images.length > 0 ? images : (restaurant.image ? [restaurant.image] : [])

  // Handle image navigation
  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
    trackUserEngagement('restaurant', restaurant.id, 'hero_image_prev')
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
    trackUserEngagement('restaurant', restaurant.id, 'hero_image_next')
  }

  // Handle image click
  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(currentImageIndex)
    }
    trackUserEngagement('restaurant', restaurant.id, 'hero_image_click', {
      imageIndex: currentImageIndex
    })
  }

  // Handle book table
  const handleBookTable = () => {
    setBookingDialogOpen(true)
    trackUserEngagement('restaurant', restaurant.id, 'book_table_click', {
      source: 'hero_section'
    })
  }

  // Handle directions
  const handleDirections = () => {
    if (restaurant.coordinates) {
      const { lat, lng } = restaurant.coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      window.open(url, '_blank')
    } else if (restaurant.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
      window.open(url, '_blank')
    }
    
    trackUserEngagement('restaurant', restaurant.id, 'directions_click', {
      source: 'hero_section'
    })
  }

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: restaurant.name,
      text: `Check out ${restaurant.name} on Bellyfed!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
      
      trackUserEngagement('restaurant', restaurant.id, 'share', {
        source: 'hero_section'
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    trackUserEngagement('restaurant', restaurant.id, 'favorite_toggle', {
      isFavorite: !isFavorite,
      source: 'hero_section'
    })
  }

  // Get status badge
  const getStatusBadge = () => {
    if (!restaurant.operatingHours) return null

    const now = new Date()
    const currentDay = now.toLocaleLowerCase().slice(0, 3) + 
      ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()].slice(3)
    
    const todayHours = restaurant.operatingHours[currentDay]
    if (!todayHours || todayHours.closed) {
      return <Badge variant="error" size="sm">Closed</Badge>
    }

    const currentTime = now.getHours() * 100 + now.getMinutes()
    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))

    if (currentTime >= openTime && currentTime <= closeTime) {
      return <Badge variant="success" size="sm">Open</Badge>
    } else {
      return <Badge variant="error" size="sm">Closed</Badge>
    }
  }

  // Get price range display
  const getPriceRangeDisplay = (priceRange) => {
    switch (priceRange) {
      case 'budget':
        return '$'
      case 'mid':
        return '$$'
      case 'premium':
        return '$$$'
      default:
        return ''
    }
  }

  if (!restaurant) {
    return (
      <div className={`h-96 bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-600">Restaurant information not available</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {displayImages.length > 0 ? (
          <>
            <img
              src={displayImages[currentImageIndex]}
              alt={restaurant.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleImageClick}
              onError={(e) => {
                e.target.src = '/images/placeholder-restaurant.jpg'
              }}
            />
            
            {/* Image Navigation */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-lg">No image available</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Top Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {showShareButton && (
            <button
              onClick={handleShare}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              title="Share restaurant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          )}
          
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full transition-all ${
                isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Restaurant Information Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Restaurant Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {restaurant.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">{restaurant.rating || 'N/A'}</span>
                    <span className="text-gray-300">
                      ({restaurant.reviewCount || 0} reviews)
                    </span>
                  </div>
                  
                  {restaurant.cuisine && (
                    <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                      {restaurant.cuisine}
                    </Badge>
                  )}
                  
                  {restaurant.priceRange && (
                    <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                      {getPriceRangeDisplay(restaurant.priceRange)}
                    </Badge>
                  )}
                  
                  {getStatusBadge()}
                </div>

                {restaurant.address && (
                  <p className="text-gray-200 text-sm md:text-base">
                    📍 {restaurant.address}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {showDirectionsButton && (
                  <Button
                    variant="outline"
                    onClick={handleDirections}
                    className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:text-gray-900"
                  >
                    📍 Directions
                  </Button>
                )}
                
                {showBookingButton && (
                  <Button
                    onClick={handleBookTable}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    📅 Book Table
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Table Dialog */}
      <BookTableDialog
        restaurant={restaurant}
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        onBookingComplete={(booking) => {
          console.log('Booking completed:', booking)
          alert('Table booked successfully!')
        }}
      />
    </div>
  )
}

export default HeroSection
