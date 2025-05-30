import React, { useState, useCallback } from 'react';
import ImageModule from 'next/image';
import { Camera, Trash2, User, Upload } from 'lucide-react';

// Solution for Next.js 15.x: Extract the actual Image component from default property
const Image = ImageModule.default;
import ImageUploader from '../ui/ImageUploader.js';
import { useUserProfile } from '@bellyfed/hooks';

/**
 * Avatar Upload Component
 *
 * Handles avatar image upload with preview, cropping, and management.
 * Integrates with the user profile service for seamless avatar updates.
 *
 * @param {Object} props - Component props
 * @param {string} props.currentAvatarUrl - Current user avatar URL
 * @param {Function} props.onAvatarChange - Callback when avatar changes
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.uploadOptions - Upload configuration options
 */
export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  className = '',
  uploadOptions = {},
}) {
  const { uploadAvatar, deleteAvatar } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [showUploader, setShowUploader] = useState(false);

  /**
   * Handle avatar upload
   * @param {File[]} files - Selected files
   */
  const handleUpload = useCallback(
    async files => {
      if (files.length === 0) return;

      const file = files[0]; // Only handle single file for avatar
      setIsUploading(true);

      try {
        // Upload avatar using the profile service
        const response = await uploadAvatar(file, {
          maxSizeBytes: 2 * 1024 * 1024, // 2MB
          generateThumbnail: true,
          ...uploadOptions,
        });

        // Update preview
        setPreviewUrl(response.avatarUrl);
        setShowUploader(false);

        // Notify parent component
        if (onAvatarChange) {
          onAvatarChange(response);
        }
      } catch (error) {
        console.error('Avatar upload failed:', error);
        // Error is already handled by the hook with toast notification
      } finally {
        setIsUploading(false);
      }
    },
    [uploadAvatar, uploadOptions, onAvatarChange],
  );

  /**
   * Handle avatar deletion
   */
  const handleDelete = useCallback(async () => {
    if (!previewUrl) return;

    setIsDeleting(true);
    try {
      await deleteAvatar();
      setPreviewUrl(null);

      // Notify parent component
      if (onAvatarChange) {
        onAvatarChange(null);
      }
    } catch (error) {
      console.error('Avatar deletion failed:', error);
      // Error is already handled by the hook with toast notification
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAvatar, previewUrl, onAvatarChange]);

  /**
   * Toggle uploader visibility
   */
  const toggleUploader = useCallback(() => {
    setShowUploader(prev => !prev);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Avatar Preview Section */}
      <div className="flex items-center space-x-4">
        {/* Avatar Display */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-800 border-4 border-white dark:border-gray-800 shadow-lg">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-orange-400" />
              </div>
            )}
          </div>

          {/* Upload Overlay */}
          <button
            onClick={toggleUploader}
            disabled={isUploading || isDeleting}
            className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={toggleUploader}
            disabled={isUploading || isDeleting}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {previewUrl ? 'Change Avatar' : 'Upload Avatar'}
              </>
            )}
          </button>

          {previewUrl && (
            <button
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Avatar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Recommended:</strong> Square image, at least 200x200 pixels
        </p>
        <p>
          <strong>Supported formats:</strong> JPG, PNG, WebP, GIF (max 2MB)
        </p>
      </div>

      {/* Image Uploader */}
      {showUploader && (
        <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Upload New Avatar
            </h4>
            <button
              onClick={toggleUploader}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
            >
              <span className="sr-only">Close uploader</span>×
            </button>
          </div>

          <ImageUploader
            onUpload={handleUpload}
            acceptedTypes={[
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/webp',
              'image/gif',
            ]}
            maxSize={2 * 1024 * 1024} // 2MB
            maxFiles={1}
            multiple={false}
            className="border-orange-300 dark:border-orange-600"
          >
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <Camera className="w-8 h-8 text-orange-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">
                  Drop your avatar image here, or click to select
                </p>
                <p className="text-xs mt-1">JPG, PNG, WebP, GIF up to 2MB</p>
              </div>
            </div>
          </ImageUploader>
        </div>
      )}
    </div>
  );
}
