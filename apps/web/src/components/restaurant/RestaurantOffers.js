/**
 * Restaurant Offers Component
 * 
 * Displays current offers, promotions, and deals for a restaurant.
 * Shows special discounts, happy hour deals, and seasonal promotions.
 * 
 * Features:
 * - Current active offers
 * - Promotional banners
 * - Discount codes and coupons
 * - Time-limited deals
 * - Special event promotions
 * - Terms and conditions
 * - Social sharing of offers
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'

const RestaurantOffers = ({
  restaurantId,
  offers = [],
  showExpired = false,
  showTerms = true,
  showShare = true,
  maxOffers = 10,
  className = ''
}) => {
  // State
  const [activeOffers, setActiveOffers] = useState(offers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedOffer, setExpandedOffer] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Load offers
  useEffect(() => {
    const loadOffers = async () => {
      if (offers.length > 0) {
        setActiveOffers(offers)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Mock offers data (in real app, would fetch from API)
        const mockOffers = [
          {
            id: 'offer_1',
            title: '20% Off First Order',
            description: 'Get 20% discount on your first order when you sign up for our newsletter',
            type: 'discount',
            discountType: 'percentage',
            discountValue: 20,
            code: 'FIRST20',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            minOrderValue: 25.00,
            maxDiscount: 15.00,
            usageLimit: 1,
            isActive: true,
            image: '/images/offers/first-order-discount.jpg',
            terms: [
              'Valid for new customers only',
              'Minimum order value of RM25',
              'Cannot be combined with other offers',
              'Valid for dine-in and takeaway only'
            ]
          },
          {
            id: 'offer_2',
            title: 'Happy Hour Special',
            description: 'Buy 1 Get 1 Free on selected beverages from 3PM to 6PM daily',
            type: 'bogo',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            timeRestriction: {
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              startTime: '15:00',
              endTime: '18:00'
            },
            isActive: true,
            image: '/images/offers/happy-hour.jpg',
            terms: [
              'Valid Monday to Friday only',
              'Available from 3PM to 6PM',
              'Selected beverages only',
              'Dine-in only'
            ]
          },
          {
            id: 'offer_3',
            title: 'Weekend Family Deal',
            description: 'Family set meal for 4 people at special price - includes 4 main dishes, 4 drinks, and dessert',
            type: 'set_meal',
            originalPrice: 120.00,
            offerPrice: 89.00,
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            timeRestriction: {
              days: ['saturday', 'sunday'],
              startTime: '12:00',
              endTime: '22:00'
            },
            isActive: true,
            image: '/images/offers/family-deal.jpg',
            terms: [
              'Available weekends only',
              'For 4 people',
              'Advance booking required',
              'Subject to availability'
            ]
          },
          {
            id: 'offer_4',
            title: 'Student Discount',
            description: '15% off for students with valid student ID',
            type: 'discount',
            discountType: 'percentage',
            discountValue: 15,
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            requirements: ['Valid student ID required'],
            isActive: true,
            image: '/images/offers/student-discount.jpg',
            terms: [
              'Valid student ID must be presented',
              'Cannot be combined with other offers',
              'Valid for dine-in only'
            ]
          },
          {
            id: 'offer_5',
            title: 'Birthday Special',
            description: 'Free dessert on your birthday month',
            type: 'free_item',
            validFrom: '2024-01-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            requirements: ['Valid ID showing birth month'],
            isActive: false, // Expired offer
            image: '/images/offers/birthday-special.jpg',
            terms: [
              'Valid throughout birthday month',
              'ID verification required',
              'One per customer per year',
              'Minimum order of RM30'
            ]
          }
        ]

        // Filter offers based on showExpired
        let filteredOffers = showExpired 
          ? mockOffers 
          : mockOffers.filter(offer => offer.isActive)

        // Limit offers
        filteredOffers = filteredOffers.slice(0, maxOffers)

        setActiveOffers(filteredOffers)

        // Track offers view
        trackUserEngagement('restaurant', restaurantId, 'offers_view', {
          offerCount: filteredOffers.length
        })
      } catch (err) {
        console.error('Error loading offers:', err)
        setError(err.message || 'Failed to load offers')
      } finally {
        setLoading(false)
      }
    }

    loadOffers()
  }, [offers, restaurantId, showExpired, maxOffers, trackUserEngagement])

  // Check if offer is currently valid
  const isOfferValid = (offer) => {
    const now = new Date()
    const validFrom = new Date(offer.validFrom)
    const validUntil = new Date(offer.validUntil)
    
    if (now < validFrom || now > validUntil) {
      return false
    }

    // Check time restrictions
    if (offer.timeRestriction) {
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
      
      if (offer.timeRestriction.days && !offer.timeRestriction.days.includes(currentDay)) {
        return false
      }
      
      if (offer.timeRestriction.startTime && offer.timeRestriction.endTime) {
        if (currentTime < offer.timeRestriction.startTime || currentTime > offer.timeRestriction.endTime) {
          return false
        }
      }
    }

    return offer.isActive
  }

  // Get offer badge
  const getOfferBadge = (offer) => {
    if (!isOfferValid(offer)) {
      return <Badge variant="error" size="sm">Expired</Badge>
    }

    switch (offer.type) {
      case 'discount':
        return <Badge variant="success" size="sm">Discount</Badge>
      case 'bogo':
        return <Badge variant="warning" size="sm">BOGO</Badge>
      case 'set_meal':
        return <Badge variant="secondary" size="sm">Set Meal</Badge>
      case 'free_item':
        return <Badge variant="success" size="sm">Free Item</Badge>
      default:
        return <Badge variant="default" size="sm">Special</Badge>
    }
  }

  // Format discount text
  const getDiscountText = (offer) => {
    switch (offer.type) {
      case 'discount':
        return offer.discountType === 'percentage' 
          ? `${offer.discountValue}% OFF`
          : `RM${offer.discountValue} OFF`
      case 'bogo':
        return 'BUY 1 GET 1 FREE'
      case 'set_meal':
        return `RM${offer.offerPrice} (was RM${offer.originalPrice})`
      case 'free_item':
        return 'FREE ITEM'
      default:
        return 'SPECIAL OFFER'
    }
  }

  // Handle copy code
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
      
      trackUserEngagement('restaurant', restaurantId, 'offer_code_copy', {
        code
      })
    } catch (err) {
      console.error('Error copying code:', err)
    }
  }

  // Handle share offer
  const handleShareOffer = async (offer) => {
    const shareData = {
      title: `${offer.title} - Restaurant Offer`,
      text: `Check out this great offer: ${offer.description}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Offer link copied to clipboard!')
      }
      
      trackUserEngagement('restaurant', restaurantId, 'offer_share', {
        offerId: offer.id,
        offerTitle: offer.title
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing offer:', err)
      }
    }
  }

  // Handle expand offer
  const handleExpandOffer = (offerId) => {
    setExpandedOffer(expandedOffer === offerId ? null : offerId)
    
    trackUserEngagement('restaurant', restaurantId, 'offer_expand', {
      offerId,
      expanded: expandedOffer !== offerId
    })
  }

  // Format time restriction
  const formatTimeRestriction = (timeRestriction) => {
    if (!timeRestriction) return null

    const parts = []
    
    if (timeRestriction.days) {
      const dayNames = {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
        thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
      }
      const formattedDays = timeRestriction.days.map(day => dayNames[day]).join(', ')
      parts.push(formattedDays)
    }
    
    if (timeRestriction.startTime && timeRestriction.endTime) {
      parts.push(`${timeRestriction.startTime} - ${timeRestriction.endTime}`)
    }
    
    return parts.join(' • ')
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading offers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (activeOffers.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">🎁</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Current Offers
        </h3>
        <p className="text-gray-600">
          Check back later for special deals and promotions!
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Current Offers
          </h2>
          <p className="text-gray-600">
            {activeOffers.length} offer{activeOffers.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {activeOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <div className="flex">
              {/* Offer Image */}
              {offer.image && (
                <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-offer.jpg'
                    }}
                  />
                </div>
              )}

              {/* Offer Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.title}
                      </h3>
                      {getOfferBadge(offer)}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {offer.description}
                    </p>

                    {/* Discount Display */}
                    <div className="text-2xl font-bold text-orange-600 mb-3">
                      {getDiscountText(offer)}
                    </div>

                    {/* Time Restriction */}
                    {offer.timeRestriction && (
                      <p className="text-sm text-gray-500 mb-3">
                        📅 {formatTimeRestriction(offer.timeRestriction)}
                      </p>
                    )}

                    {/* Promo Code */}
                    {offer.code && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gray-100 px-3 py-1 rounded border-2 border-dashed border-gray-300">
                          <span className="font-mono font-semibold text-gray-900">
                            {offer.code}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(offer.code)}
                        >
                          {copiedCode === offer.code ? '✓ Copied' : '📋 Copy'}
                        </Button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {showTerms && offer.terms && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExpandOffer(offer.id)}
                        >
                          {expandedOffer === offer.id ? 'Hide Terms' : 'View Terms'}
                        </Button>
                      )}
                      
                      {showShare && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareOffer(offer)}
                        >
                          📤 Share
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Validity Indicator */}
                  <div className="text-right text-sm text-gray-500 ml-4">
                    {isOfferValid(offer) ? (
                      <span className="text-green-600">✓ Valid Now</span>
                    ) : (
                      <span className="text-red-600">✗ Expired</span>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                {expandedOffer === offer.id && offer.terms && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Terms & Conditions:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {offer.terms.map((term, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>
          Offers are subject to availability and terms & conditions apply.
          Please check with the restaurant for the latest information.
        </p>
      </div>
    </div>
  )
}

export default RestaurantOffers
