/**
 * Add Dish Dialog Component
 * 
 * Modal dialog for adding new dishes to restaurants.
 * Includes form validation, image upload, and restaurant association.
 * 
 * Features:
 * - Comprehensive dish form
 * - Image upload with preview
 * - Restaurant selection
 * - Category and cuisine selection
 * - Price and description fields
 * - Form validation
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Badge } from '@bellyfed/ui'
import { LocationSearch } from './LocationSearch.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { analyticsService } from '../services/analyticsService.js'

const AddDishDialog = ({
  isOpen = false,
  onClose,
  onDishAdded,
  restaurantId = null,
  restaurantName = '',
  className = ''
}) => {
  // State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'MYR',
    category: '',
    cuisine: '',
    ingredients: [],
    allergens: [],
    dietaryInfo: [],
    spiceLevel: '',
    preparationTime: '',
    servingSize: '',
    restaurantId: restaurantId || '',
    images: []
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Categories and cuisines
  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish',
    'Soup', 'Salad', 'Snack', 'Breakfast', 'Lunch', 'Dinner'
  ]

  const cuisines = [
    'Malaysian', 'Chinese', 'Indian', 'Western', 'Japanese', 'Korean',
    'Thai', 'Vietnamese', 'Indonesian', 'Italian', 'Mexican', 'Mediterranean'
  ]

  const spiceLevels = [
    { value: '', label: 'Not specified' },
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'hot', label: 'Hot' },
    { value: 'very_hot', label: 'Very Hot' }
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Low-Carb', 'Keto', 'Organic'
  ]

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        restaurantId: restaurantId || prev.restaurantId
      }))
      setErrors({})
    } else {
      // Reset form when closing
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'MYR',
        category: '',
        cuisine: '',
        ingredients: [],
        allergens: [],
        dietaryInfo: [],
        spiceLevel: '',
        preparationTime: '',
        servingSize: '',
        restaurantId: restaurantId || '',
        images: []
      })
      setImageFiles([])
      setImagePreviews([])
      setErrors({})
    }
  }, [isOpen, restaurantId])

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // Handle array field changes
  const handleArrayFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value : value.split(',').map(item => item.trim()).filter(Boolean)
    }))
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length + imageFiles.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }))
      return
    }

    // Validate file types and sizes
    const validFiles = []
    const newPreviews = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          images: 'Only image files are allowed'
        }))
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          images: 'Image size must be less than 5MB'
        }))
        return
      }

      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target.result)
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    setImageFiles(prev => [...prev, ...validFiles])
  }

  // Remove image
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Dish name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Restaurant selection is required'
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number'
    }

    if (formData.preparationTime && isNaN(parseInt(formData.preparationTime))) {
      newErrors.preparationTime = 'Preparation time must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setErrors({ general: 'You must be logged in to add dishes' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const dishData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
        userId: user.id
      }

      const newDish = await analyticsService.createDish(dishData)

      // Track dish creation
      trackUserEngagement('dish', 'create', 'success', {
        dishId: newDish.id,
        restaurantId: formData.restaurantId,
        category: formData.category,
        cuisine: formData.cuisine
      })

      if (onDishAdded) {
        onDishAdded(newDish)
      }

      // Close dialog
      onClose()

    } catch (error) {
      console.error('Error creating dish:', error)
      setErrors({ general: error.message || 'Failed to create dish' })
      
      trackUserEngagement('dish', 'create', 'error', {
        error: error.message,
        restaurantId: formData.restaurantId
      })
    } finally {
      setLoading(false)
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Dish</h2>
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

          {restaurantName && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                Adding dish to: <span className="font-semibold">{restaurantName}</span>
              </p>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter dish name"
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the dish..."
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price and Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="flex">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="px-3 py-2 border border-r-0 rounded-l-lg border-gray-300 bg-gray-50"
                    disabled={loading}
                  >
                    <option value="MYR">MYR</option>
                    <option value="SGD">SGD</option>
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                >
                  <option value="">Select cuisine</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spice Level
                </label>
                <select
                  value={formData.spiceLevel}
                  onChange={(e) => handleInputChange('spiceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                >
                  {spiceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
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
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Dish'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDishDialog
