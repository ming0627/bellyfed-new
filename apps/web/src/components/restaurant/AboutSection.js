/**
 * Restaurant About Section Component
 * 
 * Displays comprehensive information about a restaurant including description,
 * history, specialties, awards, and other relevant details.
 * 
 * Features:
 * - Restaurant description and story
 * - Specialties and signature dishes
 * - Awards and certifications
 * - Operating hours and contact info
 * - Social media links
 * - Accessibility information
 */

import React, { useState } from 'react'
import { Card, Button, Badge } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'

const AboutSection = ({
  restaurant,
  showFullDescription = false,
  showAwards = true,
  showSpecialties = true,
  showContactInfo = true,
  showSocialLinks = true,
  className = ''
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(showFullDescription)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Handle expand/collapse
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    trackUserEngagement('restaurant', restaurant.id, 'about_expand', {
      expanded: !isExpanded
    })
  }

  // Handle contact action
  const handleContactAction = (action, value) => {
    trackUserEngagement('restaurant', restaurant.id, `contact_${action}`, {
      value
    })

    switch (action) {
      case 'phone':
        window.open(`tel:${value}`)
        break
      case 'email':
        window.open(`mailto:${value}`)
        break
      case 'website':
        window.open(value, '_blank')
        break
      case 'social':
        window.open(value, '_blank')
        break
      default:
        break
    }
  }

  // Format operating hours
  const formatOperatingHours = (hours) => {
    if (!hours) return 'Hours not available'

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    const groupedHours = {}
    
    days.forEach((day, index) => {
      const dayHours = hours[day]
      if (dayHours) {
        const timeString = dayHours.closed ? 'Closed' : `${dayHours.open} - ${dayHours.close}`
        if (!groupedHours[timeString]) {
          groupedHours[timeString] = []
        }
        groupedHours[timeString].push(dayNames[index])
      }
    })

    return Object.entries(groupedHours).map(([time, dayList]) => (
      <div key={time} className="flex justify-between">
        <span>{dayList.join(', ')}</span>
        <span className="font-medium">{time}</span>
      </div>
    ))
  }

  // Get price range display
  const getPriceRangeDisplay = (priceRange) => {
    switch (priceRange) {
      case 'budget':
        return { text: 'Budget-friendly', symbol: '$', color: 'green' }
      case 'mid':
        return { text: 'Mid-range', symbol: '$$', color: 'yellow' }
      case 'premium':
        return { text: 'Premium', symbol: '$$$', color: 'purple' }
      default:
        return { text: 'Price not available', symbol: '?', color: 'gray' }
    }
  }

  if (!restaurant) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-600">Restaurant information not available</p>
      </div>
    )
  }

  const priceInfo = getPriceRangeDisplay(restaurant.priceRange)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Description */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          About {restaurant.name}
        </h2>
        
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className={`text-gray-700 leading-relaxed ${
              !isExpanded && restaurant.description?.length > 300 ? 'line-clamp-4' : ''
            }`}>
              {restaurant.description || 'No description available for this restaurant.'}
            </p>
            
            {restaurant.description?.length > 300 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="mt-2 text-orange-600 hover:text-orange-700"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {restaurant.rating || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {restaurant.reviewCount || 0}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {priceInfo.symbol}
              </div>
              <div className="text-sm text-gray-600">{priceInfo.text}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {restaurant.cuisine || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Cuisine</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Specialties */}
      {showSpecialties && restaurant.specialties && restaurant.specialties.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Specialties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {restaurant.specialties.map((specialty, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
              >
                <span className="text-2xl">🍽️</span>
                <span className="font-medium text-gray-900">{specialty}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Awards and Certifications */}
      {showAwards && restaurant.awards && restaurant.awards.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Awards & Recognition
          </h3>
          <div className="space-y-3">
            {restaurant.awards.map((award, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <span className="text-3xl">🏆</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{award.name}</h4>
                  <p className="text-sm text-gray-600">{award.description}</p>
                  {award.year && (
                    <p className="text-xs text-gray-500 mt-1">{award.year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Operating Hours */}
      {restaurant.operatingHours && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Operating Hours
          </h3>
          <div className="space-y-2 text-sm">
            {formatOperatingHours(restaurant.operatingHours)}
          </div>
        </Card>
      )}

      {/* Contact Information */}
      {showContactInfo && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="space-y-4">
            {/* Address */}
            {restaurant.address && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">📍</span>
                <div>
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">{restaurant.address}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {restaurant.phone && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">📞</span>
                <div>
                  <h4 className="font-medium text-gray-900">Phone</h4>
                  <button
                    onClick={() => handleContactAction('phone', restaurant.phone)}
                    className="text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {restaurant.phone}
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            {restaurant.email && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">📧</span>
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <button
                    onClick={() => handleContactAction('email', restaurant.email)}
                    className="text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {restaurant.email}
                  </button>
                </div>
              </div>
            )}

            {/* Website */}
            {restaurant.website && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">🌐</span>
                <div>
                  <h4 className="font-medium text-gray-900">Website</h4>
                  <button
                    onClick={() => handleContactAction('website', restaurant.website)}
                    className="text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Visit Website
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Social Media Links */}
      {showSocialLinks && restaurant.socialMedia && Object.keys(restaurant.socialMedia).length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Follow Us
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(restaurant.socialMedia).map(([platform, url]) => (
              <Button
                key={platform}
                variant="outline"
                size="sm"
                onClick={() => handleContactAction('social', url)}
                className="flex items-center gap-2"
              >
                <span>
                  {platform === 'facebook' && '📘'}
                  {platform === 'instagram' && '📷'}
                  {platform === 'twitter' && '🐦'}
                  {platform === 'tiktok' && '🎵'}
                  {platform === 'youtube' && '📺'}
                </span>
                <span className="capitalize">{platform}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Additional Information */}
      {restaurant.features && restaurant.features.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Features & Amenities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {restaurant.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="text-green-500">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Accessibility Information */}
      {restaurant.accessibility && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Accessibility
          </h3>
          <div className="space-y-2">
            {restaurant.accessibility.wheelchairAccessible && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-blue-500">♿</span>
                <span>Wheelchair accessible</span>
              </div>
            )}
            {restaurant.accessibility.brailleMenu && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-blue-500">👁️</span>
                <span>Braille menu available</span>
              </div>
            )}
            {restaurant.accessibility.hearingAssistance && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-blue-500">👂</span>
                <span>Hearing assistance available</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AboutSection
