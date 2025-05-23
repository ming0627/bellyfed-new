/**
 * Gallery Tab Component
 * 
 * Displays user's photo gallery with food photos, restaurant visits, and memories.
 * Supports photo upload, organization, and sharing features.
 * 
 * Features:
 * - Photo grid layout
 * - Photo upload and management
 * - Photo categorization (dishes, restaurants, events)
 * - Lightbox view
 * - Photo sharing and tagging
 * - Search and filtering
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'

const GalleryTab = ({
  userId = null,
  showUpload = true,
  showFilters = true,
  showCategories = true,
  photosPerPage = 20,
  className = ''
}) => {
  // State
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Determine if this is the current user's gallery
  const isOwnGallery = !userId || userId === user?.id

  // Photo categories
  const categories = {
    all: { name: 'All Photos', icon: '📷' },
    dishes: { name: 'Dishes', icon: '🍽️' },
    restaurants: { name: 'Restaurants', icon: '🏪' },
    events: { name: 'Events', icon: '🎉' },
    reviews: { name: 'Reviews', icon: '📝' }
  }

  // Load photos
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock photo data (in real app, would fetch from API)
        const mockPhotos = [
          {
            id: 'photo_1',
            url: '/images/gallery/nasi-lemak-1.jpg',
            thumbnail: '/images/gallery/thumbs/nasi-lemak-1.jpg',
            caption: 'Amazing nasi lemak at Wanjo!',
            category: 'dishes',
            restaurant: {
              id: 'rest_1',
              name: 'Nasi Lemak Wanjo'
            },
            dish: {
              id: 'dish_1',
              name: 'Nasi Lemak'
            },
            uploadDate: '2024-01-15T10:30:00Z',
            likes: 24,
            comments: 8,
            tags: ['nasi-lemak', 'malaysian', 'spicy'],
            location: 'Kampung Baru, KL'
          },
          {
            id: 'photo_2',
            url: '/images/gallery/char-kway-teow-1.jpg',
            thumbnail: '/images/gallery/thumbs/char-kway-teow-1.jpg',
            caption: 'Perfect wok hei in this char kway teow',
            category: 'dishes',
            restaurant: {
              id: 'rest_2',
              name: 'Penang Road Famous Teochew Chendul'
            },
            dish: {
              id: 'dish_2',
              name: 'Char Kway Teow'
            },
            uploadDate: '2024-01-14T15:20:00Z',
            likes: 45,
            comments: 12,
            tags: ['char-kway-teow', 'penang', 'wok-hei'],
            location: 'Penang Road, Penang'
          },
          {
            id: 'photo_3',
            url: '/images/gallery/restaurant-interior-1.jpg',
            thumbnail: '/images/gallery/thumbs/restaurant-interior-1.jpg',
            caption: 'Beautiful ambiance at Din Tai Fung',
            category: 'restaurants',
            restaurant: {
              id: 'rest_3',
              name: 'Din Tai Fung'
            },
            uploadDate: '2024-01-13T19:45:00Z',
            likes: 32,
            comments: 6,
            tags: ['ambiance', 'interior', 'chinese'],
            location: 'Pavilion KL'
          },
          {
            id: 'photo_4',
            url: '/images/gallery/food-festival-1.jpg',
            thumbnail: '/images/gallery/thumbs/food-festival-1.jpg',
            caption: 'Great time at the Malaysian Food Festival!',
            category: 'events',
            uploadDate: '2024-01-12T14:30:00Z',
            likes: 67,
            comments: 18,
            tags: ['festival', 'malaysian', 'event'],
            location: 'KLCC Convention Centre'
          }
        ]

        // Filter by category
        let filteredPhotos = mockPhotos
        if (activeCategory !== 'all') {
          filteredPhotos = mockPhotos.filter(photo => photo.category === activeCategory)
        }

        // Simulate pagination
        const startIndex = (page - 1) * photosPerPage
        const endIndex = startIndex + photosPerPage
        const pagePhotos = filteredPhotos.slice(startIndex, endIndex)

        if (page === 1) {
          setPhotos(pagePhotos)
        } else {
          setPhotos(prev => [...prev, ...pagePhotos])
        }

        setHasMore(endIndex < filteredPhotos.length)

        // Track gallery view
        trackUserEngagement('gallery', 'view', activeCategory, {
          userId: userId || user?.id,
          isOwnGallery,
          photoCount: pagePhotos.length
        })
      } catch (err) {
        console.error('Error loading photos:', err)
        setError(err.message || 'Failed to load photos')
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [activeCategory, page, userId, user?.id, isOwnGallery, photosPerPage, trackUserEngagement])

  // Handle photo click
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo)
    trackUserEngagement('photo', photo.id, 'view', {
      category: photo.category,
      source: 'gallery'
    })
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setPage(1)
    trackUserEngagement('gallery', 'filter', category)
  }

  // Handle photo upload
  const handlePhotoUpload = (files) => {
    // In real app, would upload files to server
    console.log('Uploading photos:', files)
    setUploadModalOpen(false)
    
    trackUserEngagement('gallery', 'upload', 'photos', {
      fileCount: files.length
    })
  }

  // Load more photos
  const loadMorePhotos = () => {
    setPage(prev => prev + 1)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading && page === 1) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading gallery...</span>
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
          <h2 className="text-xl font-bold text-gray-900">
            {isOwnGallery ? 'My Gallery' : 'Photo Gallery'}
          </h2>
          <p className="text-gray-600">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isOwnGallery && showUpload && (
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

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square"
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={photo.thumbnail}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-sm font-medium truncate">{photo.caption}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span>❤️ {photo.likes}</span>
                    <span>💬 {photo.comments}</span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" size="sm">
                  {categories[photo.category]?.icon}
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
            {isOwnGallery 
              ? 'Start building your food gallery by uploading photos!'
              : 'This user hasn\'t shared any photos yet.'
            }
          </p>
          {isOwnGallery && (
            <Button onClick={() => setUploadModalOpen(true)}>
              📷 Upload Your First Photo
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {hasMore && photos.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMorePhotos}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More Photos'
            )}
          </Button>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {categories[selectedPhoto.category]?.icon} {categories[selectedPhoto.category]?.name}
                </Badge>
                <span className="text-sm">{formatDate(selectedPhoto.uploadDate)}</span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {selectedPhoto.caption}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {selectedPhoto.restaurant && (
                  <div>
                    <span className="text-gray-600">Restaurant:</span>
                    <span className="ml-2 font-medium">{selectedPhoto.restaurant.name}</span>
                  </div>
                )}
                
                {selectedPhoto.dish && (
                  <div>
                    <span className="text-gray-600">Dish:</span>
                    <span className="ml-2 font-medium">{selectedPhoto.dish.name}</span>
                  </div>
                )}
                
                {selectedPhoto.location && (
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2">{selectedPhoto.location}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="ml-2">{formatDate(selectedPhoto.uploadDate)}</span>
                </div>
              </div>

              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <span className="flex items-center gap-1 text-gray-600">
                  ❤️ {selectedPhoto.likes} likes
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  💬 {selectedPhoto.comments} comments
                </span>
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

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handlePhotoUpload([])}>
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

export default GalleryTab
