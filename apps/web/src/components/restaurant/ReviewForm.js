/**
 * Restaurant Review Form Component
 * 
 * Form for submitting reviews for restaurants with rating, photos, and detailed feedback.
 * Restaurant-specific version with enhanced features for restaurant reviews.
 * 
 * Features:
 * - Star rating system
 * - Review text input with character count
 * - Photo upload functionality
 * - Dish-specific reviews
 * - Visit date selection
 * - Recommendation toggle
 * - Anonymous review option
 * - Form validation and submission
 */

import React, { useState } from 'react'
import { Card, Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'
import { reviewService } from '../../services/reviewService.js'

const ReviewForm = ({
  restaurant,
  onSubmit = null,
  onCancel = null,
  showDishSelection = true,
  showPhotoUpload = true,
  showVisitDate = true,
  maxPhotos = 5,
  className = ''
}) => {
  // State
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    text: '',
    visitDate: '',
    dishes: [],
    photos: [],
    wouldRecommend: true,
    isAnonymous: false
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Mock dishes for selection
  const availableDishes = [
    { id: 'dish_1', name: 'Nasi Lemak Special' },
    { id: 'dish_2', name: 'Rendang Beef' },
    { id: 'dish_3', name: 'Char Kway Teow' },
    { id: 'dish_4', name: 'Teh Tarik' },
    { id: 'dish_5', name: 'Satay Chicken' }
  ]

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

  // Handle rating change
  const handleRatingChange = (rating) => {
    handleInputChange('rating', rating)
    trackUserEngagement('review', 'rating_select', 'rating', {
      restaurantId: restaurant.id,
      rating
    })
  }

  // Handle dish selection
  const handleDishToggle = (dishId) => {
    const currentDishes = formData.dishes
    const newDishes = currentDishes.includes(dishId)
      ? currentDishes.filter(id => id !== dishId)
      : [...currentDishes, dishId]
    
    handleInputChange('dishes', newDishes)
  }

  // Handle photo upload
  const handlePhotoUpload = async (files) => {
    if (files.length === 0) return
    
    setUploadingPhotos(true)
    
    try {
      const newPhotos = []
      
      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          alert('Please select only image files')
          continue
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('Please select images smaller than 5MB')
          continue
        }
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        
        // In real app, would upload to server
        newPhotos.push({
          id: `photo_${Date.now()}_${Math.random()}`,
          file: file,
          url: previewUrl,
          name: file.name
        })
      }
      
      const updatedPhotos = [...formData.photos, ...newPhotos].slice(0, maxPhotos)
      handleInputChange('photos', updatedPhotos)
      
      trackUserEngagement('review', 'photo_upload', 'upload', {
        restaurantId: restaurant.id,
        photoCount: newPhotos.length
      })
      
    } catch (err) {
      console.error('Error uploading photos:', err)
      alert('Failed to upload photos. Please try again.')
    } finally {
      setUploadingPhotos(false)
    }
  }

  // Remove photo
  const handlePhotoRemove = (photoId) => {
    const updatedPhotos = formData.photos.filter(photo => photo.id !== photoId)
    handleInputChange('photos', updatedPhotos)
    
    // Revoke object URL to prevent memory leaks
    const photo = formData.photos.find(p => p.id === photoId)
    if (photo && photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating'
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a review title'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }
    
    if (!formData.text.trim()) {
      newErrors.text = 'Please write your review'
    } else if (formData.text.length < 10) {
      newErrors.text = 'Review must be at least 10 characters'
    } else if (formData.text.length > 1000) {
      newErrors.text = 'Review must be 1000 characters or less'
    }
    
    if (showVisitDate && !formData.visitDate) {
      newErrors.visitDate = 'Please select your visit date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    
    try {
      // Prepare review data
      const reviewData = {
        restaurantId: restaurant.id,
        userId: user.id,
        rating: formData.rating,
        title: formData.title,
        text: formData.text,
        visitDate: formData.visitDate,
        dishes: formData.dishes,
        photos: formData.photos.map(photo => ({
          url: photo.url,
          name: photo.name
        })),
        wouldRecommend: formData.wouldRecommend,
        isAnonymous: formData.isAnonymous,
        createdAt: new Date().toISOString()
      }
      
      // Submit review (in real app, would call API)
      await reviewService.createReview(reviewData)
      
      // Track submission
      trackUserEngagement('review', 'submit', 'success', {
        restaurantId: restaurant.id,
        rating: formData.rating,
        hasPhotos: formData.photos.length > 0,
        dishCount: formData.dishes.length,
        textLength: formData.text.length
      })
      
      // Call success callback
      if (onSubmit) {
        onSubmit(reviewData)
      }
      
      // Reset form
      setFormData({
        rating: 0,
        title: '',
        text: '',
        visitDate: '',
        dishes: [],
        photos: [],
        wouldRecommend: true,
        isAnonymous: false
      })
      
      alert('Review submitted successfully!')
      
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Failed to submit review. Please try again.')
      
      trackUserEngagement('review', 'submit', 'error', {
        restaurantId: restaurant.id,
        error: err.message
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    // Clean up photo URLs
    formData.photos.forEach(photo => {
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
    })
    
    if (onCancel) {
      onCancel()
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-4xl mb-4">✍️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Sign in to Write a Review
        </h3>
        <p className="text-gray-600 mb-4">
          Share your experience with other food lovers!
        </p>
        <Button onClick={() => window.location.href = '/signin'}>
          Sign In
        </Button>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Write a Review
        </h2>
        <p className="text-gray-600">
          Share your experience at {restaurant.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`text-3xl transition-colors ${
                  star <= (hoveredRating || formData.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                ⭐
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {formData.rating > 0 && (
                <>
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  {formData.rating === 5 && ' - Excellent!'}
                  {formData.rating === 4 && ' - Very Good'}
                  {formData.rating === 3 && ' - Good'}
                  {formData.rating === 2 && ' - Fair'}
                  {formData.rating === 1 && ' - Poor'}
                </>
              )}
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Summarize your experience..."
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Tell us about your experience, the food, service, ambiance..."
            rows={5}
            maxLength={1000}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.text ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.text && (
              <p className="text-red-600 text-sm">{errors.text}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {formData.text.length}/1000
            </p>
          </div>
        </div>

        {/* Visit Date */}
        {showVisitDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Date *
            </label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => handleInputChange('visitDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.visitDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.visitDate && (
              <p className="text-red-600 text-sm mt-1">{errors.visitDate}</p>
            )}
          </div>
        )}

        {/* Dish Selection */}
        {showDishSelection && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dishes You Tried (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDishes.map((dish) => (
                <label
                  key={dish.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.dishes.includes(dish.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.dishes.includes(dish.id)}
                    onChange={() => handleDishToggle(dish.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm">{dish.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Photo Upload */}
        {showPhotoUpload && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photos (Optional)
            </label>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(Array.from(e.target.files))}
                className="hidden"
                id="photo-upload"
                disabled={uploadingPhotos || formData.photos.length >= maxPhotos}
              />
              <label
                htmlFor="photo-upload"
                className={`cursor-pointer ${
                  uploadingPhotos || formData.photos.length >= maxPhotos
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600">
                  {uploadingPhotos
                    ? 'Uploading photos...'
                    : formData.photos.length >= maxPhotos
                    ? `Maximum ${maxPhotos} photos allowed`
                    : 'Click to upload photos or drag and drop'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>

            {/* Photo Previews */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {formData.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoRemove(photo.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.wouldRecommend}
              onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">
              I would recommend this restaurant to others
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">
              Post this review anonymously
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || formData.rating === 0}
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ReviewForm
