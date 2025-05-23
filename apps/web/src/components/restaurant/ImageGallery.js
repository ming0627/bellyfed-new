/**
 * Restaurant Image Gallery Component
 * 
 * Displays restaurant images in a responsive gallery layout with lightbox functionality.
 * Supports multiple image categories and interactive viewing.
 * 
 * Features:
 * - Responsive grid layout
 * - Image categories (food, interior, exterior, etc.)
 * - Lightbox modal with navigation
 * - Image zoom and pan
 * - Social sharing
 * - Image upload (for restaurant owners)
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'

const ImageGallery = ({
  restaurantId,
  images = [],
  showCategories = true,
  showUpload = false,
  maxImages = 50,
  className = ''
}) => {
  // State
  const [galleryImages, setGalleryImages] = useState(images)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Image categories
  const categories = {
    all: { name: 'All Photos', icon: '📷' },
    food: { name: 'Food', icon: '🍽️' },
    interior: { name: 'Interior', icon: '🏠' },
    exterior: { name: 'Exterior', icon: '🏪' },
    menu: { name: 'Menu', icon: '📋' },
    events: { name: 'Events', icon: '🎉' }
  }

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      if (images.length > 0) {
        setGalleryImages(images)
        return
      }

      try {
        setLoading(true)

        // Mock image data (in real app, would fetch from API)
        const mockImages = [
          {
            id: 'img_1',
            url: '/images/gallery/nasi-lemak-1.jpg',
            thumbnail: '/images/gallery/thumbs/nasi-lemak-1.jpg',
            category: 'food',
            caption: 'Signature Nasi Lemak',
            uploadedBy: 'Restaurant',
            uploadDate: '2024-01-15T10:30:00Z',
            likes: 45,
            tags: ['nasi-lemak', 'signature', 'malaysian']
          },
          {
            id: 'img_2',
            url: '/images/gallery/restaurant-interior-1.jpg',
            thumbnail: '/images/gallery/thumbs/restaurant-interior-1.jpg',
            category: 'interior',
            caption: 'Cozy dining area',
            uploadedBy: 'Restaurant',
            uploadDate: '2024-01-14T15:20:00Z',
            likes: 32,
            tags: ['interior', 'dining', 'ambiance']
          },
          {
            id: 'img_3',
            url: '/images/gallery/char-kway-teow-1.jpg',
            thumbnail: '/images/gallery/thumbs/char-kway-teow-1.jpg',
            category: 'food',
            caption: 'Fresh Char Kway Teow',
            uploadedBy: 'Customer',
            uploadDate: '2024-01-13T19:45:00Z',
            likes: 67,
            tags: ['char-kway-teow', 'noodles', 'wok-hei']
          },
          {
            id: 'img_4',
            url: '/images/gallery/restaurant-exterior-1.jpg',
            thumbnail: '/images/gallery/thumbs/restaurant-exterior-1.jpg',
            category: 'exterior',
            caption: 'Street view of restaurant',
            uploadedBy: 'Restaurant',
            uploadDate: '2024-01-12T14:30:00Z',
            likes: 28,
            tags: ['exterior', 'street', 'signage']
          },
          {
            id: 'img_5',
            url: '/images/gallery/menu-board-1.jpg',
            thumbnail: '/images/gallery/thumbs/menu-board-1.jpg',
            category: 'menu',
            caption: 'Daily specials menu',
            uploadedBy: 'Restaurant',
            uploadDate: '2024-01-11T11:15:00Z',
            likes: 19,
            tags: ['menu', 'specials', 'prices']
          },
          {
            id: 'img_6',
            url: '/images/gallery/rendang-1.jpg',
            thumbnail: '/images/gallery/thumbs/rendang-1.jpg',
            category: 'food',
            caption: 'Traditional Beef Rendang',
            uploadedBy: 'Customer',
            uploadDate: '2024-01-10T18:00:00Z',
            likes: 89,
            tags: ['rendang', 'beef', 'traditional']
          }
        ]

        setGalleryImages(mockImages.slice(0, maxImages))

        // Track gallery view
        trackUserEngagement('restaurant', restaurantId, 'gallery_view', {
          imageCount: mockImages.length
        })
      } catch (err) {
        console.error('Error loading images:', err)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [images, restaurantId, maxImages, trackUserEngagement])

  // Filter images by category
  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory)

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    trackUserEngagement('restaurant', restaurantId, 'gallery_filter', {
      category
    })
  }

  // Handle image click
  const handleImageClick = (image, index) => {
    setSelectedImage(image)
    setSelectedImageIndex(index)
    trackUserEngagement('restaurant', restaurantId, 'gallery_image_view', {
      imageId: image.id,
      category: image.category
    })
  }

  // Handle lightbox navigation
  const handlePreviousImage = () => {
    const newIndex = selectedImageIndex === 0 ? filteredImages.length - 1 : selectedImageIndex - 1
    setSelectedImageIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  const handleNextImage = () => {
    const newIndex = selectedImageIndex === filteredImages.length - 1 ? 0 : selectedImageIndex + 1
    setSelectedImageIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  // Handle image like
  const handleImageLike = (imageId) => {
    setGalleryImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, likes: img.likes + 1 }
        : img
    ))
    
    trackUserEngagement('restaurant', restaurantId, 'gallery_image_like', {
      imageId
    })
  }

  // Handle image share
  const handleImageShare = async (image) => {
    const shareData = {
      title: `${image.caption} - Restaurant Gallery`,
      text: `Check out this photo from the restaurant!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
      
      trackUserEngagement('restaurant', restaurantId, 'gallery_image_share', {
        imageId: image.id
      })
    } catch (err) {
      console.error('Error sharing image:', err)
    }
  }

  // Handle image upload
  const handleImageUpload = (files) => {
    // In real app, would upload files to server
    console.log('Uploading images:', files)
    setUploadModalOpen(false)
    
    trackUserEngagement('restaurant', restaurantId, 'gallery_upload', {
      fileCount: files.length
    })
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading gallery...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Photo Gallery
          </h2>
          <p className="text-gray-600">
            {filteredImages.length} photo{filteredImages.length !== 1 ? 's' : ''}
          </p>
        </div>

        {showUpload && isAuthenticated && (
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            📷 Upload Photos
          </Button>
        )}
      </div>

      {/* Category Filters */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, category]) => (
            <Button
              key={key}
              variant={activeCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(key)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square"
              onClick={() => handleImageClick(image, index)}
            >
              <img
                src={image.thumbnail}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-sm font-medium truncate">{image.caption}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span>❤️ {image.likes}</span>
                    <span>{categories[image.category]?.icon}</span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" size="sm">
                  {categories[image.category]?.icon}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share photos of this restaurant!
          </p>
          {showUpload && isAuthenticated && (
            <Button onClick={() => setUploadModalOpen(true)}>
              📷 Upload Photos
            </Button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {categories[selectedImage.category]?.icon} {categories[selectedImage.category]?.name}
                </Badge>
                <span className="text-sm">{formatDate(selectedImage.uploadDate)}</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center mb-4 relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />

              {/* Navigation Arrows */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Image Details */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedImage.caption}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>Uploaded by {selectedImage.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatDate(selectedImage.uploadDate)}</span>
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedImage.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => handleImageLike(selectedImage.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    ❤️ {selectedImage.likes}
                  </button>
                  
                  <button
                    onClick={() => handleImageShare(selectedImage)}
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upload Photos
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-gray-600 mb-4">
                  Drag and drop photos here, or click to select
                </p>
                <Button variant="outline">
                  Choose Photos
                </Button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="food">Food</option>
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="menu">Menu</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleImageUpload([])}>
                  Upload
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
