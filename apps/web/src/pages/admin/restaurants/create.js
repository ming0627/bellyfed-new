import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Building,
  MapPin,
  Phone,
  Globe,
  Clock,
  Camera,
  Plus,
  X,
  Star
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function CreateRestaurantPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    priceRange: '',
    features: [],
    hours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    },
    images: [],
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  // Check admin permissions
  useEffect(() => {
    if (!isAuthenticated || !user?.role?.includes('admin')) {
      router.push('/admin')
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (field, value) => {
    setRestaurantData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleHoursChange = (day, field, value) => {
    setRestaurantData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }))
  }

  const handleFeatureToggle = (feature) => {
    setRestaurantData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !restaurantData.tags.includes(newTag.trim())) {
      setRestaurantData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setRestaurantData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!restaurantData.name.trim()) {
      newErrors.name = 'Restaurant name is required'
    }

    if (!restaurantData.cuisine.trim()) {
      newErrors.cuisine = 'Cuisine type is required'
    }

    if (!restaurantData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!restaurantData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!restaurantData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (restaurantData.email && !/\S+@\S+\.\S+/.test(restaurantData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (restaurantData.website && !restaurantData.website.startsWith('http')) {
      newErrors.website = 'Website URL must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      })

      if (response.ok) {
        router.push('/admin/restaurants')
      } else {
        const data = await response.json()
        setErrors({ general: data.message || 'Failed to create restaurant' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableFeatures = [
    'Outdoor Seating',
    'Delivery',
    'Takeout',
    'Reservations',
    'WiFi',
    'Parking',
    'Wheelchair Accessible',
    'Pet Friendly',
    'Live Music',
    'Bar',
    'Private Dining',
    'Catering'
  ]

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Admin
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  Add New Restaurant
                </h1>
                <p className="text-orange-600 dark:text-orange-400">
                  Create a new restaurant listing
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Create Restaurant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restaurantData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.name ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                  placeholder="Enter restaurant name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Cuisine Type *
                </label>
                <select
                  value={restaurantData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.cuisine ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                >
                  <option value="">Select cuisine type</option>
                  <option value="American">American</option>
                  <option value="Italian">Italian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mexican">Mexican</option>
                  <option value="French">French</option>
                  <option value="Indian">Indian</option>
                  <option value="Thai">Thai</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Other">Other</option>
                </select>
                {errors.cuisine && (
                  <p className="text-red-600 text-sm mt-1">{errors.cuisine}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Price Range
                </label>
                <select
                  value={restaurantData.priceRange}
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                >
                  <option value="">Select price range</option>
                  <option value="$">$ - Budget</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                  <option value="$$$$">$$$$ - Very Expensive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={restaurantData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="Describe the restaurant..."
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Location Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={restaurantData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.address ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={restaurantData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.city ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={restaurantData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="State/Province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={restaurantData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="ZIP/Postal Code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={restaurantData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <input
                    type="tel"
                    value={restaurantData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                      errors.phone ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={restaurantData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.email ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                  placeholder="restaurant@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <input
                    type="url"
                    value={restaurantData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                      errors.website ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                    }`}
                    placeholder="https://restaurant-website.com"
                  />
                </div>
                {errors.website && (
                  <p className="text-red-600 text-sm mt-1">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Features & Amenities
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFeatures.map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restaurantData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-900 dark:text-orange-100">
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Tags
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {restaurantData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm dark:bg-orange-800 dark:text-orange-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Create Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
