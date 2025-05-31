/**
 * Add Menu Item Page
 * 
 * Form page for restaurant owners to add new menu items.
 * Provides comprehensive form with validation and image upload.
 * 
 * Features:
 * - Menu item creation form
 * - Image upload and preview
 * - Category selection
 * - Dietary information and allergens
 * - Pricing and availability controls
 * - Form validation
 * 
 * Next.js 15 Compatible:
 * - Uses getStaticPaths and getStaticProps
 * - Default export only
 * - JavaScript (.js) file
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext.js'

export default function AddMenuItemPage({ country }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: '',
    isAvailable: true,
    isSpecial: false,
    allergens: [],
    dietaryInfo: [],
    image: null
  })

  // Options
  const categories = [
    'Appetizers',
    'Main Courses',
    'Desserts',
    'Beverages',
    'Salads',
    'Soups',
    'Sides'
  ]

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
    { id: 'nut_free', label: 'Nut Free', icon: '🥜' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' }
  ]

  const allergenOptions = [
    'Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      setIsLoading(true)
      
      // TODO: Implement actual API call
      console.log('Creating menu item:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to menu management
      router.push(`/${country}/restaurant/menu`)
    } catch (error) {
      console.error('Error creating menu item:', error)
      alert('Failed to create menu item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to add menu items.
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${country}/restaurant/menu`}
                className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Menu
              </Link>
              <div className="h-6 w-px bg-orange-200 dark:bg-orange-700"></div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  Add Menu Item
                </h1>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Create a new item for your restaurant menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="e.g., Truffle Pasta"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                    placeholder="0.00"
                    required
                  />
                </div>
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
                rows={3}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                placeholder="Describe your dish..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Preparation Time
                </label>
                <input
                  type="text"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="e.g., 15 mins"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Item Image
            </h2>
            
            {imagePreview ? (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={192}
                  height={192}
                  className="w-48 h-48 object-cover rounded-lg"
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
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-orange-600 dark:text-orange-400 mb-2">
                  Upload an image of your dish
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
                  Choose Image
                </label>
              </div>
            )}
          </div>

          {/* Dietary Information */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Dietary Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-3">
                  Dietary Options
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryOptions.map(option => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dietaryInfo.includes(option.id)}
                        onChange={() => handleArrayChange('dietaryInfo', option.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-orange-700 dark:text-orange-300">
                        {option.icon} {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-3">
                  Allergens
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => handleArrayChange('allergens', allergen)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-orange-700 dark:text-orange-300">
                        {allergen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Availability Settings
            </h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Available for ordering
                  </span>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Customers can order this item
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSpecial"
                  checked={formData.isSpecial}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Mark as special item
                  </span>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Highlight this item as a chef&apos;s special or featured dish
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href={`/${country}/restaurant/menu`}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Menu Item
                </>
              )}
            </button>
          </div>
        </form>
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
