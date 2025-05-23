/**
 * Add Restaurant Button Component
 * 
 * Button component that triggers the restaurant creation flow.
 * Handles permissions, authentication, and navigation to restaurant creation.
 * 
 * Features:
 * - Permission checking
 * - Authentication validation
 * - Restaurant creation dialog
 * - Admin and user flows
 * - Analytics tracking
 */

import React, { useState } from 'react'
import { Button } from '@bellyfed/ui'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCountry } from '../hooks/useCountry.js'

const AddRestaurantButton = ({
  variant = 'default',
  size = 'md',
  showIcon = true,
  requiresAdmin = false,
  onRestaurantAdded,
  className = ''
}) => {
  // State
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { country } = useCountry()

  // Check if user can add restaurants
  const canAddRestaurant = () => {
    if (!isAuthenticated) return false
    if (requiresAdmin && !isAdmin) return false
    return true
  }

  // Handle button click
  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to sign in
      trackUserEngagement('restaurant', 'add_button', 'unauthenticated_click')
      window.location.href = `/${country}/signin?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    if (requiresAdmin && !isAdmin) {
      // Show permission error
      trackUserEngagement('restaurant', 'add_button', 'permission_denied')
      alert('You need admin permissions to add restaurants.')
      return
    }

    // Track button click
    trackUserEngagement('restaurant', 'add_button', 'click', {
      userType: isAdmin ? 'admin' : 'user'
    })

    // Navigate to restaurant creation page
    if (isAdmin) {
      // Admin flow - direct to admin creation page
      window.location.href = `/${country}/admin/restaurants/create`
    } else {
      // User flow - show dialog or navigate to user creation page
      setShowDialog(true)
    }
  }

  // Handle restaurant creation dialog
  const handleRestaurantCreated = (restaurant) => {
    setShowDialog(false)
    
    trackUserEngagement('restaurant', 'create', 'success', {
      restaurantId: restaurant.id,
      userType: isAdmin ? 'admin' : 'user'
    })

    if (onRestaurantAdded) {
      onRestaurantAdded(restaurant)
    }
  }

  // Get button text
  const getButtonText = () => {
    if (loading) return 'Loading...'
    if (requiresAdmin) return 'Add Restaurant (Admin)'
    return 'Add Restaurant'
  }

  // Get button icon
  const getButtonIcon = () => {
    if (!showIcon) return null
    
    return (
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
        />
      </svg>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={loading}
        className={`${className} ${!canAddRestaurant() ? 'opacity-75' : ''}`}
        title={
          !isAuthenticated 
            ? 'Sign in to add restaurants'
            : requiresAdmin && !isAdmin
            ? 'Admin permissions required'
            : 'Add a new restaurant'
        }
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>

      {/* Restaurant Creation Dialog for Users */}
      {showDialog && (
        <RestaurantCreationDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onRestaurantCreated={handleRestaurantCreated}
          userType="user"
        />
      )}
    </>
  )
}

// Simple Restaurant Creation Dialog for Users
const RestaurantCreationDialog = ({
  isOpen,
  onClose,
  onRestaurantCreated,
  userType = 'user'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    cuisine: '',
    priceRange: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { trackUserEngagement } = useAnalyticsContext()
  const { user } = useAuth()

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // For now, create a mock restaurant object
      // In production, this would call the restaurant service
      const newRestaurant = {
        id: `restaurant_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        createdBy: user.id,
        status: userType === 'admin' ? 'active' : 'pending_approval',
        createdAt: new Date().toISOString()
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      onRestaurantCreated(newRestaurant)
    } catch (error) {
      console.error('Error creating restaurant:', error)
      setErrors({ general: 'Failed to create restaurant. Please try again.' })
      
      trackUserEngagement('restaurant', 'create', 'error', {
        error: error.message,
        userType
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {userType === 'admin' ? 'Add Restaurant' : 'Suggest Restaurant'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {userType === 'user' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Your restaurant suggestion will be reviewed by our team before being added to the platform.
              </p>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter restaurant name"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter restaurant address"
                disabled={loading}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the restaurant..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Phone number"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Malaysian"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Creating...' : userType === 'admin' ? 'Add Restaurant' : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddRestaurantButton
