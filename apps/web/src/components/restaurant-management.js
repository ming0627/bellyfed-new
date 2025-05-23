/**
 * Restaurant Management Component
 * 
 * Comprehensive restaurant management interface for restaurant owners and admins.
 * Provides tools for managing restaurant information, menu, photos, and settings.
 * 
 * Features:
 * - Restaurant profile management
 * - Menu item management
 * - Photo gallery management
 * - Operating hours configuration
 * - Review and rating monitoring
 * - Analytics and insights
 * - Staff management
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { restaurantService } from '../services/restaurantService.js'

const RestaurantManagement = ({
  restaurantId = null,
  showAnalytics = true,
  showStaffManagement = true,
  className = ''
}) => {
  // State
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [saving, setSaving] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Management tabs
  const tabs = {
    overview: { name: 'Overview', icon: '📊' },
    profile: { name: 'Profile', icon: '🏪' },
    menu: { name: 'Menu', icon: '🍽️' },
    photos: { name: 'Photos', icon: '📷' },
    hours: { name: 'Hours', icon: '🕒' },
    reviews: { name: 'Reviews', icon: '📝' },
    analytics: { name: 'Analytics', icon: '📈' },
    staff: { name: 'Staff', icon: '👥' }
  }

  // Load restaurant data
  useEffect(() => {
    const loadRestaurant = async () => {
      if (!isAuthenticated) {
        setError('Please sign in to manage restaurants')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Mock restaurant data (in real app, would fetch from API)
        const mockRestaurant = {
          id: restaurantId || 'rest_1',
          name: 'Nasi Lemak Wanjo',
          description: 'Authentic Malaysian nasi lemak served with traditional sambal and fresh ingredients.',
          cuisine: 'Malaysian',
          address: 'Jalan Raja Muda Abdul Aziz, Kampung Baru, 50300 Kuala Lumpur',
          phone: '+60 3-2691 4561',
          email: 'info@nasillemakwanjo.com',
          website: 'https://nasillemakwanjo.com',
          priceRange: 'budget',
          rating: 4.5,
          reviewCount: 1250,
          image: '/images/restaurants/nasi-lemak-wanjo.jpg',
          gallery: [
            '/images/restaurants/nasi-lemak-wanjo-1.jpg',
            '/images/restaurants/nasi-lemak-wanjo-2.jpg',
            '/images/restaurants/nasi-lemak-wanjo-3.jpg'
          ],
          operatingHours: {
            monday: { open: '07:00', close: '22:00', closed: false },
            tuesday: { open: '07:00', close: '22:00', closed: false },
            wednesday: { open: '07:00', close: '22:00', closed: false },
            thursday: { open: '07:00', close: '22:00', closed: false },
            friday: { open: '07:00', close: '22:00', closed: false },
            saturday: { open: '07:00', close: '23:00', closed: false },
            sunday: { open: '08:00', close: '21:00', closed: false }
          },
          menu: [
            {
              id: 'menu_1',
              name: 'Nasi Lemak Special',
              description: 'Coconut rice with sambal, anchovies, peanuts, boiled egg, and cucumber',
              price: 8.50,
              category: 'Main Dishes',
              available: true,
              image: '/images/menu/nasi-lemak-special.jpg'
            },
            {
              id: 'menu_2',
              name: 'Rendang Beef',
              description: 'Slow-cooked beef in coconut milk and spices',
              price: 15.00,
              category: 'Main Dishes',
              available: true,
              image: '/images/menu/rendang-beef.jpg'
            }
          ],
          staff: [
            {
              id: 'staff_1',
              name: 'Ahmad Rahman',
              role: 'Manager',
              email: 'ahmad@nasillemakwanjo.com',
              phone: '+60 12-345 6789',
              avatar: '/images/staff/ahmad.jpg'
            },
            {
              id: 'staff_2',
              name: 'Siti Nurhaliza',
              role: 'Chef',
              email: 'siti@nasillemakwanjo.com',
              phone: '+60 12-987 6543',
              avatar: '/images/staff/siti.jpg'
            }
          ],
          analytics: {
            monthlyViews: 15420,
            monthlyReviews: 89,
            averageRating: 4.5,
            popularDishes: ['Nasi Lemak Special', 'Rendang Beef', 'Sambal Udang'],
            peakHours: ['12:00-14:00', '19:00-21:00'],
            customerDemographics: {
              age: { '18-25': 25, '26-35': 40, '36-45': 20, '46+': 15 },
              gender: { male: 45, female: 55 }
            }
          },
          owner: {
            id: user?.id,
            name: user?.name,
            email: user?.email
          }
        }

        setRestaurant(mockRestaurant)

        // Track management view
        trackUserEngagement('restaurant_management', 'view', activeTab, {
          restaurantId: mockRestaurant.id,
          userId: user?.id
        })
      } catch (err) {
        console.error('Error loading restaurant:', err)
        setError(err.message || 'Failed to load restaurant data')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [restaurantId, isAuthenticated, user, activeTab, trackUserEngagement])

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    trackUserEngagement('restaurant_management', 'tab_change', tab, {
      restaurantId: restaurant?.id
    })
  }

  // Handle save
  const handleSave = async (data) => {
    setSaving(true)
    try {
      // In real app, would save to API
      console.log('Saving restaurant data:', data)
      
      trackUserEngagement('restaurant_management', 'save', activeTab, {
        restaurantId: restaurant?.id,
        dataType: activeTab
      })
      
      alert('Changes saved successfully!')
    } catch (err) {
      console.error('Error saving:', err)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    if (!restaurant) return null

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {restaurant.analytics.monthlyViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Monthly Views</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {restaurant.analytics.monthlyReviews}
                </div>
                <div className="text-sm text-gray-600">Monthly Reviews</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {restaurant.analytics.averageRating}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium">New review received</p>
                    <p className="text-sm text-gray-600">5 stars from Sarah Chen</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📷</span>
                  <div>
                    <p className="font-medium">Photo uploaded</p>
                    <p className="text-sm text-gray-600">New dish photo added</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'profile':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Restaurant Profile
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    defaultValue={restaurant.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="Malaysian">Malaysian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Indian">Indian</option>
                    <option value="Western">Western</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  defaultValue={restaurant.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  defaultValue={restaurant.address}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue={restaurant.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={restaurant.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <Button onClick={() => handleSave({ type: 'profile' })} disabled={saving}>
                {saving ? <LoadingSpinner size="sm" className="mr-2" /> : ''}
                Save Profile
              </Button>
            </div>
          </Card>
        )

      case 'menu':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Menu Management
              </h3>
              <Button>Add New Item</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.menu.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-food.jpg'
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-medium text-orange-600">
                          RM{item.price.toFixed(2)}
                        </span>
                        <Badge variant={item.available ? 'success' : 'error'} size="sm">
                          {item.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'hours':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Operating Hours
            </h3>
            <div className="space-y-4">
              {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24 font-medium text-gray-900 capitalize">
                    {day}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        defaultValue={hours.open}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-gray-600">to</span>
                      <input
                        type="time"
                        defaultValue={hours.close}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                    </>
                  )}
                </div>
              ))}
              <Button onClick={() => handleSave({ type: 'hours' })} disabled={saving}>
                {saving ? <LoadingSpinner size="sm" className="mr-2" /> : ''}
                Save Hours
              </Button>
            </div>
          </Card>
        )

      default:
        return (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600">
                This feature is under development.
              </p>
            </div>
          </Card>
        )
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 mb-4">
          Please sign in to access restaurant management.
        </p>
        <Button onClick={() => window.location.href = '/signin'}>
          Sign In
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading restaurant data...</span>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant Management
          </h1>
          <p className="text-gray-600">
            Manage {restaurant?.name || 'your restaurant'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = `/restaurants/${restaurant?.id}`}>
            View Public Page
          </Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {Object.entries(tabs).map(([key, tab]) => {
            // Hide certain tabs based on props
            if (key === 'analytics' && !showAnalytics) return null
            if (key === 'staff' && !showStaffManagement) return null
            
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === key 
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default RestaurantManagement
