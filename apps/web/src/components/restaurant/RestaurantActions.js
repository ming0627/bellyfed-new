/**
 * Restaurant Actions Component
 * 
 * Provides action buttons and interactions for restaurant pages including
 * booking, directions, sharing, favorites, and other restaurant-specific actions.
 * 
 * Features:
 * - Book table action
 * - Get directions action
 * - Share restaurant action
 * - Add to favorites action
 * - Call restaurant action
 * - View menu action
 * - Write review action
 * - Report restaurant action
 */

import React, { useState } from 'react'
import { Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'
import BookTableDialog from './BookTableDialog.js'

const RestaurantActions = ({
  restaurant,
  showBookTable = true,
  showDirections = true,
  showShare = true,
  showFavorite = true,
  showCall = true,
  showMenu = true,
  showReview = true,
  showReport = false,
  layout = 'horizontal', // 'horizontal', 'vertical', 'grid'
  size = 'default', // 'sm', 'default', 'lg'
  className = ''
}) => {
  // State
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState({})

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Handle book table
  const handleBookTable = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    setBookingDialogOpen(true)
    trackUserEngagement('restaurant', restaurant.id, 'book_table_click', {
      source: 'restaurant_actions'
    })
  }

  // Handle directions
  const handleDirections = () => {
    setLoading(prev => ({ ...prev, directions: true }))
    
    try {
      if (restaurant.coordinates) {
        const { lat, lng } = restaurant.coordinates
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        window.open(url, '_blank')
      } else if (restaurant.address) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
        window.open(url, '_blank')
      }
      
      trackUserEngagement('restaurant', restaurant.id, 'directions_click', {
        source: 'restaurant_actions',
        hasCoordinates: !!restaurant.coordinates
      })
    } catch (err) {
      console.error('Error opening directions:', err)
    } finally {
      setTimeout(() => {
        setLoading(prev => ({ ...prev, directions: false }))
      }, 1000)
    }
  }

  // Handle share
  const handleShare = async () => {
    setLoading(prev => ({ ...prev, share: true }))
    
    const shareData = {
      title: restaurant.name,
      text: `Check out ${restaurant.name} on Bellyfed! ${restaurant.description || ''}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        alert('Restaurant link copied to clipboard!')
      }
      
      trackUserEngagement('restaurant', restaurant.id, 'share', {
        source: 'restaurant_actions',
        method: navigator.share ? 'native' : 'clipboard'
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing restaurant:', err)
      }
    } finally {
      setLoading(prev => ({ ...prev, share: false }))
    }
  }

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    setLoading(prev => ({ ...prev, favorite: true }))
    
    try {
      // In real app, would call API to toggle favorite
      const newFavoriteState = !isFavorite
      setIsFavorite(newFavoriteState)
      
      trackUserEngagement('restaurant', restaurant.id, 'favorite_toggle', {
        source: 'restaurant_actions',
        isFavorite: newFavoriteState,
        userId: user?.id
      })
      
      // Show feedback
      const message = newFavoriteState 
        ? `Added ${restaurant.name} to favorites!` 
        : `Removed ${restaurant.name} from favorites!`
      
      // Simple toast notification (in real app, would use proper toast system)
      const toast = document.createElement('div')
      toast.textContent = message
      toast.className = 'fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      document.body.appendChild(toast)
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
      
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setLoading(prev => ({ ...prev, favorite: false }))
    }
  }

  // Handle call restaurant
  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`)
      trackUserEngagement('restaurant', restaurant.id, 'call_click', {
        source: 'restaurant_actions',
        phone: restaurant.phone
      })
    }
  }

  // Handle view menu
  const handleViewMenu = () => {
    const menuSection = document.getElementById('menu-section')
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to menu page if separate
      window.location.href = `#menu`
    }
    
    trackUserEngagement('restaurant', restaurant.id, 'view_menu_click', {
      source: 'restaurant_actions'
    })
  }

  // Handle write review
  const handleWriteReview = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    const reviewSection = document.getElementById('reviews-section')
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth' })
    }
    
    trackUserEngagement('restaurant', restaurant.id, 'write_review_click', {
      source: 'restaurant_actions',
      userId: user?.id
    })
  }

  // Handle report restaurant
  const handleReport = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    // In real app, would open report modal
    const reason = prompt('Please tell us why you want to report this restaurant:')
    if (reason) {
      trackUserEngagement('restaurant', restaurant.id, 'report', {
        source: 'restaurant_actions',
        reason: reason.substring(0, 100), // Limit for analytics
        userId: user?.id
      })
      alert('Thank you for your report. We will review it shortly.')
    }
  }

  // Get button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2'
    }
  }

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-3'
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
      default:
        return 'flex flex-wrap gap-3'
    }
  }

  // Action buttons configuration
  const actions = [
    {
      key: 'book',
      show: showBookTable,
      label: 'Book Table',
      icon: '📅',
      variant: 'default',
      onClick: handleBookTable,
      loading: loading.book
    },
    {
      key: 'directions',
      show: showDirections && (restaurant.address || restaurant.coordinates),
      label: 'Directions',
      icon: '📍',
      variant: 'outline',
      onClick: handleDirections,
      loading: loading.directions
    },
    {
      key: 'call',
      show: showCall && restaurant.phone,
      label: 'Call',
      icon: '📞',
      variant: 'outline',
      onClick: handleCall,
      loading: loading.call
    },
    {
      key: 'menu',
      show: showMenu,
      label: 'View Menu',
      icon: '🍽️',
      variant: 'outline',
      onClick: handleViewMenu,
      loading: loading.menu
    },
    {
      key: 'review',
      show: showReview,
      label: 'Write Review',
      icon: '✍️',
      variant: 'outline',
      onClick: handleWriteReview,
      loading: loading.review
    },
    {
      key: 'favorite',
      show: showFavorite,
      label: isFavorite ? 'Remove Favorite' : 'Add Favorite',
      icon: isFavorite ? '❤️' : '🤍',
      variant: isFavorite ? 'default' : 'outline',
      onClick: handleFavoriteToggle,
      loading: loading.favorite
    },
    {
      key: 'share',
      show: showShare,
      label: 'Share',
      icon: '📤',
      variant: 'outline',
      onClick: handleShare,
      loading: loading.share
    },
    {
      key: 'report',
      show: showReport,
      label: 'Report',
      icon: '⚠️',
      variant: 'outline',
      onClick: handleReport,
      loading: loading.report
    }
  ]

  const visibleActions = actions.filter(action => action.show)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant}
          onClick={action.onClick}
          disabled={action.loading}
          className={`${getSizeClasses()} flex items-center gap-2 justify-center`}
        >
          {action.loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span>{action.icon}</span>
          )}
          <span>{action.label}</span>
        </Button>
      ))}

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

export default RestaurantActions
