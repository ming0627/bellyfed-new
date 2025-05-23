/**
 * Photo Gallery Component
 * 
 * Displays a responsive photo gallery with lightbox functionality,
 * image optimization, and interactive features for restaurants and dishes.
 * 
 * Features:
 * - Responsive grid layout
 * - Lightbox modal with navigation
 * - Image lazy loading and optimization
 * - Zoom and pan functionality
 * - Photo metadata and captions
 * - Social sharing integration
 * - Upload and management capabilities
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const PhotoGallery = ({
  photos = [],
  targetType = 'restaurant', // 'restaurant', 'dish', 'user'
  targetId,
  showUpload = false,
  showCaptions = true,
  showMetadata = false,
  allowZoom = true,
  gridColumns = 'auto', // 'auto', 2, 3, 4, 5
  aspectRatio = 'square', // 'square', 'landscape', 'portrait', 'auto'
  maxPhotos = 50,
  className = ''
}) => {
  // State
  const [galleryPhotos, setGalleryPhotos] = useState(photos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Refs
  const lightboxRef = useRef(null);
  const imageRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Open lightbox
  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setLightboxOpen(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    trackUserEngagement('gallery', 'lightbox', 'open', {
      photoId: photo.id,
      targetType,
      targetId,
      index
    });
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedPhoto(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    
    // Restore body scroll
    document.body.style.overflow = 'unset';

    trackUserEngagement('gallery', 'lightbox', 'close', {
      photoId: selectedPhoto?.id,
      viewDuration: Date.now() - lightboxOpenTime
    });
  };

  // Navigate photos
  const navigatePhoto = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % galleryPhotos.length
      : (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    
    setCurrentIndex(newIndex);
    setSelectedPhoto(galleryPhotos[newIndex]);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });

    trackUserEngagement('gallery', 'navigate', direction, {
      fromIndex: currentIndex,
      toIndex: newIndex,
      photoId: galleryPhotos[newIndex]?.id
    });
  };

  // Handle zoom
  const handleZoom = (delta, clientX, clientY) => {
    if (!allowZoom) return;

    const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    
    if (newZoomLevel !== zoomLevel) {
      // Calculate zoom center point
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = (clientX - rect.left) / rect.width;
        const centerY = (clientY - rect.top) / rect.height;
        
        // Adjust pan position to zoom towards cursor
        const zoomRatio = newZoomLevel / zoomLevel;
        setPanPosition(prev => ({
          x: prev.x * zoomRatio + (centerX - 0.5) * (zoomRatio - 1) * rect.width,
          y: prev.y * zoomRatio + (centerY - 0.5) * (zoomRatio - 1) * rect.height
        }));
      }
      
      setZoomLevel(newZoomLevel);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (files) => {
    if (!isAuthenticated) {
      alert('Please sign in to upload photos');
      return;
    }

    if (!files || files.length === 0) return;
    
    const remainingSlots = maxPhotos - galleryPhotos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image.`);
        }

        // In a real app, this would upload to a cloud service
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Date.now() + Math.random(),
              url: e.target.result,
              thumbnailUrl: e.target.result,
              title: file.name.replace(/\.[^/.]+$/, ''),
              caption: '',
              uploadedBy: user.id,
              uploadedAt: new Date().toISOString(),
              metadata: {
                size: file.size,
                type: file.type,
                name: file.name
              }
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      
      setGalleryPhotos(prev => [...prev, ...uploadedPhotos]);

      trackUserEngagement('gallery', 'upload', 'success', {
        photoCount: uploadedPhotos.length,
        targetType,
        targetId
      });
    } catch (err) {
      console.error('Error uploading photos:', err);
      alert(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const deletePhoto = async (photoId) => {
    if (!isAuthenticated) return;

    try {
      await analyticsService.deletePhoto({
        photoId,
        userId: user.id,
        targetType,
        targetId
      });

      setGalleryPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      if (selectedPhoto?.id === photoId) {
        closeLightbox();
      }

      trackUserEngagement('gallery', 'delete', 'success', {
        photoId,
        targetType,
        targetId
      });
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo');
    }
  };

  // Get grid classes
  const getGridClasses = () => {
    if (gridColumns === 'auto') {
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
    return `grid-cols-${Math.min(gridColumns, 2)} md:grid-cols-${Math.min(gridColumns, 3)} lg:grid-cols-${gridColumns}`;
  };

  // Get aspect ratio classes
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'landscape':
        return 'aspect-[4/3]';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'square':
        return 'aspect-square';
      default:
        return 'aspect-square';
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigatePhoto('prev');
          break;
        case 'ArrowRight':
          navigatePhoto('next');
          break;
        case '+':
        case '=':
          handleZoom(0.2, window.innerWidth / 2, window.innerHeight / 2);
          break;
        case '-':
          handleZoom(-0.2, window.innerWidth / 2, window.innerHeight / 2);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex, zoomLevel]);

  // Update photos when prop changes
  useEffect(() => {
    setGalleryPhotos(photos);
  }, [photos]);

  const lightboxOpenTime = useRef(Date.now());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Upload Section */}
      {showUpload && isAuthenticated && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Add Photos</h3>
              <p className="text-sm text-gray-600">
                Share your photos with the community
              </p>
            </div>
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files)}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className={`
                  inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer
                  hover:bg-orange-600 transition-colors
                  ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📷</span>
                    <span>Add Photos</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {galleryPhotos.length}/{maxPhotos} photos • Max 10MB per image
          </p>
        </Card>
      )}

      {/* Photo Grid */}
      {galleryPhotos.length > 0 ? (
        <div className={`grid gap-4 ${getGridClasses()}`}>
          {galleryPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
              onClick={() => openLightbox(photo, index)}
            >
              <div className={getAspectRatioClasses()}>
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-2xl">🔍</span>
                </div>
              </div>

              {/* Caption */}
              {showCaptions && photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Delete button for own photos */}
              {isAuthenticated && user?.id === photo.uploadedBy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-lg font-medium mb-2">No Photos Yet</p>
            <p className="text-sm">
              {showUpload && isAuthenticated 
                ? "Be the first to share a photo!"
                : "Photos will appear here when available."
              }
            </p>
          </div>
        </Card>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && selectedPhoto && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              ×
            </button>

            {/* Navigation Buttons */}
            {galleryPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  →
                </button>
              </>
            )}

            {/* Image */}
            <div 
              className="relative max-w-full max-h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                ref={imageRef}
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Photo'}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                  cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -0.2 : 0.2;
                  handleZoom(delta, e.clientX, e.clientY);
                }}
                onClick={(e) => {
                  if (zoomLevel === 1) {
                    handleZoom(0.5, e.clientX, e.clientY);
                  }
                }}
              />
            </div>

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {selectedPhoto.title && (
                    <h3 className="font-medium mb-1">{selectedPhoto.title}</h3>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-sm text-gray-300 mb-2">{selectedPhoto.caption}</p>
                  )}
                  {showMetadata && selectedPhoto.metadata && (
                    <div className="text-xs text-gray-400">
                      <span>Uploaded {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
                      {selectedPhoto.metadata.size && (
                        <span> • {Math.round(selectedPhoto.metadata.size / 1024)}KB</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-300">
                  {currentIndex + 1} / {galleryPhotos.length}
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            {allowZoom && (
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoom(0.2, window.innerWidth / 2, window.innerHeight / 2);
                  }}
                  className="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoom(-0.2, window.innerWidth / 2, window.innerHeight / 2);
                  }}
                  className="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  −
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors text-xs"
                >
                  1:1
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
