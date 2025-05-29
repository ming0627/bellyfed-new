/**
 * Restaurant Settings Page
 * 
 * Comprehensive settings management for restaurant owners.
 * Allows configuration of restaurant profile, operating hours,
 * contact information, and business preferences.
 * 
 * Features:
 * - Restaurant profile management
 * - Operating hours configuration
 * - Contact information updates
 * - Business settings and preferences
 * - Account management
 * - Notification settings
 * 
 * Next.js 15 Compatible:
 * - Uses getStaticPaths and getStaticProps
 * - Default export only
 * - JavaScript (.js) file
 */

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Clock,
  Camera,
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function RestaurantSettingsPage({ country }) {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [imagePreview, setImagePreview] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    // Profile settings
    name: 'The Golden Spoon',
    description: 'Fine dining restaurant specializing in contemporary cuisine with a focus on fresh, local ingredients.',
    cuisine: 'Contemporary',
    priceRange: '$$$$',
    address: '123 Main Street, Downtown',
    city: 'Kuala Lumpur',
    postalCode: '50000',
    phone: '+60 3-1234-5678',
    email: 'info@goldenspoon.com',
    website: 'https://goldenspoon.com',
    
    // Operating hours
    operatingHours: {
      monday: { open: '17:00', close: '23:00', closed: false },
      tuesday: { open: '17:00', close: '23:00', closed: false },
      wednesday: { open: '17:00', close: '23:00', closed: false },
      thursday: { open: '17:00', close: '23:00', closed: false },
      friday: { open: '17:00', close: '24:00', closed: false },
      saturday: { open: '12:00', close: '24:00', closed: false },
      sunday: { open: '12:00', close: '22:00', closed: false }
    },
    
    // Business settings
    acceptsReservations: true,
    maxPartySize: 8,
    advanceBookingDays: 30,
    cancellationPolicy: '24 hours',
    
    // Notification settings
    emailNotifications: {
      newBookings: true,
      reviews: true,
      promotions: false,
      analytics: true
    },
    smsNotifications: {
      urgentBookings: true,
      cancellations: true
    }
  })

  const tabs = [
    { id: 'profile', label: 'Restaurant Profile', icon: SettingsIcon },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'business', label: 'Business Settings', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account Security', icon: Shield }
  ]

  const cuisineTypes = [
    'Contemporary', 'Italian', 'French', 'Asian', 'Japanese', 'Chinese',
    'Thai', 'Indian', 'Mediterranean', 'Mexican', 'American', 'Fusion'
  ]



  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      // TODO: Implement actual API call
      console.log('Updating restaurant settings:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to manage settings.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${country}/restaurant/dashboard`}
                className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-orange-200 dark:bg-orange-700"></div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  Restaurant Settings
                </h1>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Manage your restaurant profile and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Restaurant Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                  <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
                    Restaurant Profile
                  </h2>
                  
                  {/* Restaurant Image */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                      Restaurant Image
                    </label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <Image
                          src={imagePreview}
                          alt="Restaurant"
                          width={192}
                          height={128}
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                        <p className="text-orange-600 dark:text-orange-400 mb-2">
                          Upload restaurant image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Restaurant Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Cuisine Type
                      </label>
                      <select
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        {cuisineTypes.map(cuisine => (
                          <option key={cuisine} value={cuisine}>
                            {cuisine}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      placeholder="Describe your restaurant..."
                    />
                  </div>
                </div>
              )}

              {/* Operating Hours Tab */}
              {activeTab === 'hours' && (
                <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                  <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
                    Operating Hours
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(formData.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4 p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                        <div className="w-24">
                          <span className="font-medium text-orange-900 dark:text-orange-100">
                            {dayNames[day]}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-orange-700 dark:text-orange-300">Open</span>
                        </div>

                        {!hours.closed && (
                          <>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-orange-700 dark:text-orange-300">From:</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                className="px-2 py-1 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-100"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-orange-700 dark:text-orange-300">To:</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                className="px-2 py-1 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-100"
                              />
                            </div>
                          </>
                        )}

                        {hours.closed && (
                          <span className="text-sm text-orange-500 italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Settings Tab */}
              {activeTab === 'business' && (
                <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                  <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
                    Business Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="acceptsReservations"
                        checked={formData.acceptsReservations}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          Accept Online Reservations
                        </span>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Allow customers to book tables through your profile
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                          Maximum Party Size
                        </label>
                        <input
                          type="number"
                          name="maxPartySize"
                          value={formData.maxPartySize}
                          onChange={handleInputChange}
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                          Advance Booking (Days)
                        </label>
                        <input
                          type="number"
                          name="advanceBookingDays"
                          value={formData.advanceBookingDays}
                          onChange={handleInputChange}
                          min="1"
                          max="90"
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Cancellation Policy
                      </label>
                      <select
                        name="cancellationPolicy"
                        value={formData.cancellationPolicy}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="2 hours">2 hours notice</option>
                        <option value="24 hours">24 hours notice</option>
                        <option value="48 hours">48 hours notice</option>
                        <option value="72 hours">72 hours notice</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                  <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(formData.emailNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNestedChange('emailNotifications', key, e.target.checked)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-4">
                        SMS Notifications
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(formData.smsNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNestedChange('smsNotifications', key, e.target.checked)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Security Tab */}
              {activeTab === 'account' && (
                <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                  <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
                    Account Security
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-orange-200 dark:border-orange-700">
                      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-end space-x-4">
                <Link
                  href={`/${country}/restaurant/dashboard`}
                  className="px-6 py-2 border border-orange-300 text-orange-700 font-medium rounded-lg hover:bg-orange-50 transition-colors dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } }
    ],
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country
    },
    revalidate: 300 // 5 minutes
  }
}
