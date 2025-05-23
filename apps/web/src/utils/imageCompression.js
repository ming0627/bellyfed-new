/**
 * Image compression utilities
 *
 * This module provides functions for compressing images before upload
 */

/**
 * Image compression options
 */
export const CompressionOptions = {
  maxSizeKB: 1024,
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'image/jpeg'
}

/**
 * Compress an image file to reduce size before upload
 *
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum size in KB (default: 1024)
 * @param {number} quality - Compression quality (0-1, default: 0.8)
 * @returns {Promise<File>} Promise that resolves to the compressed file
 */
export async function compressImage(file, maxSizeKB = 1024, quality = 0.8) {
  // Validate input
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  // Check if browser environment
  if (typeof window === 'undefined') {
    throw new Error('Image compression can only be performed in the browser')
  }

  // If file is already smaller than max size, return it as is
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a file reader to read the image
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const img = new Image()
        
        img.onload = () => {
          try {
            // Create a canvas element
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
              reject(new Error('Could not get canvas context'))
              return
            }

            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = calculateDimensions(img.width, img.height)

            // Set canvas dimensions
            canvas.width = width
            canvas.height = height

            // Draw the image on the canvas with new dimensions
            ctx.drawImage(img, 0, 0, width, height)

            // Convert canvas to blob with compression
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))
                  return
                }

                // Create a new file from the compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now()
                })

                // Check if compression was successful
                if (compressedFile.size <= maxSizeKB * 1024) {
                  resolve(compressedFile)
                } else {
                  // If still too large, try with lower quality
                  const lowerQuality = Math.max(0.1, quality - 0.1)
                  if (lowerQuality < quality) {
                    compressImage(file, maxSizeKB, lowerQuality)
                      .then(resolve)
                      .catch(reject)
                  } else {
                    // If we can't compress further, return the compressed version anyway
                    resolve(compressedFile)
                  }
                }
              },
              'image/jpeg',
              quality
            )
          } catch (error) {
            reject(new Error(`Error processing image: ${error.message}`))
          }
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        // Set the image source to the file data
        img.src = event.target?.result
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      // Read the file as data URL
      reader.readAsDataURL(file)
    } catch (error) {
      reject(new Error(`Error compressing image: ${error.message}`))
    }
  })
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 * @param {number} originalWidth Original image width
 * @param {number} originalHeight Original image height
 * @param {number} maxWidth Maximum width (default: 1920)
 * @param {number} maxHeight Maximum height (default: 1080)
 * @returns {object} Object with width and height properties
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth = 1920, maxHeight = 1080) {
  let width = originalWidth
  let height = originalHeight

  // Calculate scaling factor
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const scalingFactor = Math.min(widthRatio, heightRatio, 1) // Don't upscale

  width = Math.round(width * scalingFactor)
  height = Math.round(height * scalingFactor)

  return { width, height }
}

/**
 * Validate an image file
 *
 * @param {File} file - The file to validate
 * @returns {object} Object with validation result and error message if any
 */
export function validateImageFile(file) {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Check if it's actually a File object
  if (!(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' }
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10MB.'
    }
  }

  // Check if file has a name
  if (!file.name || file.name.trim() === '') {
    return {
      valid: false,
      error: 'File must have a valid name.'
    }
  }

  return { valid: true }
}

/**
 * Get image file information
 * @param {File} file - The image file
 * @returns {Promise<object>} Promise that resolves to image information
 */
export async function getImageInfo(file) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  if (typeof window === 'undefined') {
    throw new Error('Image info can only be retrieved in the browser')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          lastModified: file.lastModified
        })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Resize an image to specific dimensions
 * @param {File} file - The image file to resize
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Promise that resolves to the resized file
 */
export async function resizeImage(file, targetWidth, targetHeight, quality = 0.8) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  if (typeof window === 'undefined') {
    throw new Error('Image resizing can only be performed in the browser')
  }

  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error('Target dimensions must be positive numbers')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Set canvas dimensions to target size
          canvas.width = targetWidth
          canvas.height = targetHeight

          // Draw the image with new dimensions
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to resize image'))
                return
              }

              const resizedFile = new File([blob], file.name, {
                type: blob.type,
                lastModified: Date.now()
              })

              resolve(resizedFile)
            },
            file.type,
            quality
          )
        } catch (error) {
          reject(new Error(`Error resizing image: ${error.message}`))
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convert image to different format
 * @param {File} file - The image file to convert
 * @param {string} targetFormat - Target format (image/jpeg, image/png, image/webp)
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Promise that resolves to the converted file
 */
export async function convertImageFormat(file, targetFormat, quality = 0.8) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  if (typeof window === 'undefined') {
    throw new Error('Image conversion can only be performed in the browser')
  }

  const validFormats = ['image/jpeg', 'image/png', 'image/webp']
  if (!validFormats.includes(targetFormat)) {
    throw new Error('Invalid target format')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Set canvas dimensions to original image size
          canvas.width = img.width
          canvas.height = img.height

          // Draw the image
          ctx.drawImage(img, 0, 0)

          // Convert to target format
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image'))
                return
              }

              // Create new filename with appropriate extension
              const extension = targetFormat.split('/')[1]
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
              const newName = `${nameWithoutExt}.${extension}`

              const convertedFile = new File([blob], newName, {
                type: targetFormat,
                lastModified: Date.now()
              })

              resolve(convertedFile)
            },
            targetFormat,
            quality
          )
        } catch (error) {
          reject(new Error(`Error converting image: ${error.message}`))
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Create a thumbnail from an image file
 * @param {File} file - The image file
 * @param {number} size - Thumbnail size (width and height)
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Promise that resolves to the thumbnail file
 */
export async function createThumbnail(file, size = 150, quality = 0.8) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  const info = await getImageInfo(file)
  
  // Calculate dimensions to maintain aspect ratio
  const { width, height } = calculateDimensions(info.width, info.height, size, size)
  
  return resizeImage(file, width, height, quality)
}
