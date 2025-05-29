import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ProfileImageCropper from '../profile/ProfileImageCropper.js';

/**
 * Cropper Modal Component
 * 
 * A modal wrapper for the ProfileImageCropper component that provides
 * a full-screen overlay for image cropping functionality. Includes
 * backdrop click handling and keyboard navigation.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {string} props.imageUrl - URL of the image to crop
 * @param {Function} props.onCrop - Callback when cropping is complete
 * @param {number} props.cropSize - Size of the crop area in pixels
 * @param {string} props.title - Modal title
 */
export default function CropperModal({
  isOpen,
  onClose,
  imageUrl,
  onCrop,
  cropSize = 200,
  title = 'Crop Image'
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  /**
   * Handle escape key press
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle crop completion
   */
  const handleCrop = (croppedBlob) => {
    onCrop(croppedBlob);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl transform transition-all"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {imageUrl ? (
                <ProfileImageCropper
                  imageUrl={imageUrl}
                  onCrop={handleCrop}
                  onCancel={onClose}
                  cropSize={cropSize}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No image provided for cropping</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing cropper modal state
 * 
 * @returns {Object} Modal state and controls
 */
export function useCropperModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [onCropCallback, setOnCropCallback] = React.useState(null);

  const openModal = React.useCallback((url, onCrop) => {
    setImageUrl(url);
    setOnCropCallback(() => onCrop);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setImageUrl(null);
    setOnCropCallback(null);
  }, []);

  const handleCrop = React.useCallback((croppedBlob) => {
    if (onCropCallback) {
      onCropCallback(croppedBlob);
    }
    closeModal();
  }, [onCropCallback, closeModal]);

  return {
    isOpen,
    imageUrl,
    openModal,
    closeModal,
    handleCrop
  };
}

/**
 * Portal component for rendering modal outside of component tree
 * This helps with z-index and positioning issues
 */
export function CropperModalPortal({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // In a real implementation, you might use ReactDOM.createPortal
  // For now, we'll render directly
  return children;
}
