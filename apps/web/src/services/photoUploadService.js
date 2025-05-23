/**
 * Photo Upload Service
 *
 * This module provides functionality for uploading photos to S3 with
 * image compression, validation, and progress tracking. It handles
 * pre-signed URL generation and direct S3 uploads.
 */

import { validateImageFile, compressImage } from '../utils/imageCompression.js'
import { getEnvironmentName } from '../utils/environment.js'

/**
 * Upload result interface
 */
export const UploadResult = {
  uploadUrl: '',
  photoUrl: '',
  success: false,
  error: null
}

/**
 * Upload progress callback type
 */
export const UploadProgressCallback = (progress) => {}

/**
 * Photo Upload Service class
 */
export class PhotoUploadService {
  constructor() {
    this.environment = getEnvironmentName()
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    this.compressionQuality = 0.8
    this.maxWidth = 1920
    this.maxHeight = 1080
  }

  /**
   * Get a pre-signed URL for uploading a photo
   * @param {string} contentType The content type of the file to upload
   * @returns {Promise<object>} Object with upload URL and photo URL
   */
  async getPhotoUploadUrl(contentType) {
    try {
      if (!contentType || typeof contentType !== 'string') {
        throw new Error('Content type is required and must be a string')
      }

      if (!this.allowedTypes.includes(contentType)) {
        throw new Error(`Content type ${contentType} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`)
      }

      const response = await fetch('/api/upload/ranking-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contentType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.data || !data.data.uploadUrl || !data.data.photoUrl) {
        throw new Error('Invalid response format from upload URL endpoint')
      }

      return {
        uploadUrl: data.data.uploadUrl,
        photoUrl: data.data.photoUrl,
        success: true,
        error: null
      }
    } catch (error) {
      console.error('Error getting photo upload URL:', error)
      return {
        uploadUrl: '',
        photoUrl: '',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Upload a file to S3 using a pre-signed URL
   * @param {string} uploadUrl The pre-signed URL for uploading the file
   * @param {File} file The file to upload
   * @param {Function} onProgress Optional callback for upload progress
   * @returns {Promise<void>} Promise that resolves when upload is complete
   */
  async uploadFileToS3(uploadUrl, file, onProgress = null) {
    return new Promise((resolve, reject) => {
      try {
        if (!uploadUrl || typeof uploadUrl !== 'string') {
          reject(new Error('Upload URL is required and must be a string'))
          return
        }

        if (!file || !(file instanceof File)) {
          reject(new Error('File is required and must be a File object'))
          return
        }

        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest()

        // Set up progress tracking
        if (onProgress && typeof onProgress === 'function') {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              onProgress(progress)
            }
          }
        }

        // Set up completion handler
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
          }
        }

        // Set up error handler
        xhr.onerror = () => {
          reject(new Error('Network error occurred during upload'))
        }

        // Set up timeout handler
        xhr.ontimeout = () => {
          reject(new Error('Upload timed out'))
        }

        // Set up abort handler
        xhr.onabort = () => {
          reject(new Error('Upload was aborted'))
        }

        // Configure request
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.timeout = 60000 // 60 second timeout

        // Send the file
        xhr.send(file)
      } catch (error) {
        reject(new Error(`Error setting up upload: ${error.message}`))
      }
    })
  }

  /**
   * Validate a file for upload
   * @param {File} file The file to validate
   * @returns {object} Validation result
   */
  validateFile(file) {
    try {
      if (!file || !(file instanceof File)) {
        return { valid: false, error: 'File is required and must be a File object' }
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        const maxSizeMB = Math.round(this.maxFileSize / (1024 * 1024))
        return { valid: false, error: `File is too large. Maximum size is ${maxSizeMB}MB` }
      }

      // Check file type
      if (!this.allowedTypes.includes(file.type)) {
        return { valid: false, error: `File type ${file.type} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}` }
      }

      // Check file name
      if (!file.name || file.name.trim() === '') {
        return { valid: false, error: 'File must have a valid name' }
      }

      return { valid: true, error: null }
    } catch (error) {
      return { valid: false, error: `Validation error: ${error.message}` }
    }
  }

  /**
   * Compress an image file
   * @param {File} file The image file to compress
   * @returns {Promise<File>} The compressed file
   */
  async compressFile(file) {
    try {
      // Use the image compression utility
      const compressedFile = await compressImage(
        file,
        Math.floor(this.maxFileSize / 1024), // Convert to KB
        this.compressionQuality
      )

      return compressedFile
    } catch (error) {
      console.warn('Image compression failed, using original file:', error.message)
      return file
    }
  }

  /**
   * Upload a photo with validation, compression, and progress tracking
   * @param {File} file The file to upload
   * @param {Function} onProgress Optional callback for upload progress
   * @returns {Promise<string>} The URL of the uploaded photo
   */
  async uploadPhoto(file, onProgress = null) {
    try {
      // Validate the file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Compress the image
      let fileToUpload = file
      try {
        fileToUpload = await this.compressFile(file)
        console.log(`Image compressed: ${file.size} bytes -> ${fileToUpload.size} bytes`)
      } catch (compressionError) {
        console.warn('Using original file due to compression error:', compressionError.message)
      }

      // Get a pre-signed URL for the upload
      const urlResult = await this.getPhotoUploadUrl(fileToUpload.type)
      if (!urlResult.success) {
        throw new Error(urlResult.error || 'Failed to get upload URL')
      }

      // Upload the file to S3
      await this.uploadFileToS3(urlResult.uploadUrl, fileToUpload, onProgress)

      // Return the photo URL
      return urlResult.photoUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw new Error(`Photo upload failed: ${error.message}`)
    }
  }

  /**
   * Upload multiple photos
   * @param {File[]} files Array of files to upload
   * @param {Function} onProgress Optional callback for overall progress
   * @param {Function} onFileProgress Optional callback for individual file progress
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultiplePhotos(files, onProgress = null, onFileProgress = null) {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Files array is required and must not be empty')
      }

      const results = []
      let completedUploads = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        try {
          const fileProgressCallback = onFileProgress ? 
            (progress) => onFileProgress(i, progress) : null

          const photoUrl = await this.uploadPhoto(file, fileProgressCallback)
          
          results.push({
            index: i,
            file: file.name,
            success: true,
            photoUrl,
            error: null
          })
        } catch (error) {
          results.push({
            index: i,
            file: file.name,
            success: false,
            photoUrl: null,
            error: error.message
          })
        }

        completedUploads++
        
        // Report overall progress
        if (onProgress && typeof onProgress === 'function') {
          const overallProgress = Math.round((completedUploads / files.length) * 100)
          onProgress(overallProgress)
        }
      }

      return results
    } catch (error) {
      console.error('Error uploading multiple photos:', error)
      throw new Error(`Multiple photo upload failed: ${error.message}`)
    }
  }

  /**
   * Get upload service health status
   * @returns {Promise<object>} Service health information
   */
  async getHealthStatus() {
    try {
      // Test the upload URL endpoint
      const testResult = await this.getPhotoUploadUrl('image/jpeg')
      const isHealthy = testResult.success

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        canGenerateUrls: isHealthy,
        maxFileSize: this.maxFileSize,
        allowedTypes: this.allowedTypes,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting photo upload service health status:', error)
      return {
        status: 'unhealthy',
        canGenerateUrls: false,
        error: error.message,
        maxFileSize: this.maxFileSize,
        allowedTypes: this.allowedTypes,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Cancel an ongoing upload (if using XMLHttpRequest)
   * @param {XMLHttpRequest} xhr The XMLHttpRequest to cancel
   */
  cancelUpload(xhr) {
    try {
      if (xhr && typeof xhr.abort === 'function') {
        xhr.abort()
        console.log('Upload cancelled')
      }
    } catch (error) {
      console.error('Error cancelling upload:', error)
    }
  }

  /**
   * Get upload configuration
   * @returns {object} Upload configuration
   */
  getUploadConfig() {
    return {
      maxFileSize: this.maxFileSize,
      maxFileSizeMB: Math.round(this.maxFileSize / (1024 * 1024)),
      allowedTypes: [...this.allowedTypes],
      compressionQuality: this.compressionQuality,
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
      environment: this.environment
    }
  }

  /**
   * Update upload configuration
   * @param {object} config New configuration options
   */
  updateConfig(config) {
    if (config.maxFileSize && typeof config.maxFileSize === 'number') {
      this.maxFileSize = config.maxFileSize
    }
    
    if (config.allowedTypes && Array.isArray(config.allowedTypes)) {
      this.allowedTypes = [...config.allowedTypes]
    }
    
    if (config.compressionQuality && typeof config.compressionQuality === 'number') {
      this.compressionQuality = Math.max(0.1, Math.min(1.0, config.compressionQuality))
    }
    
    if (config.maxWidth && typeof config.maxWidth === 'number') {
      this.maxWidth = config.maxWidth
    }
    
    if (config.maxHeight && typeof config.maxHeight === 'number') {
      this.maxHeight = config.maxHeight
    }
  }
}

// Export a singleton instance
export const photoUploadService = new PhotoUploadService()
