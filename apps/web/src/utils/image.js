/**
 * Image Utility
 *
 * This module provides utility functions for working with images,
 * including generating URLs for images stored in S3 buckets.
 */

/**
 * Image configuration interface
 * Represents the configuration for an image stored in an S3 bucket
 */
export const ImageConfig = {
  bucket: '',
  region: '',
  key: ''
}

/**
 * Default image URL to use when an image is not available
 */
export const DEFAULT_IMAGE = 'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png'

/**
 * Get the URL for an image stored in an S3 bucket
 * @param {object} image Image configuration or undefined
 * @param {string} defaultImageUrl Optional default image URL to use when image is not available
 * @returns {string} URL for the image or the default image URL
 */
export const getImageUrl = (image, defaultImageUrl = DEFAULT_IMAGE) => {
  if (!image) {
    return defaultImageUrl
  }

  try {
    // Validate image configuration
    if (!image.bucket || !image.region || !image.key) {
      console.warn('Invalid image configuration:', image)
      return defaultImageUrl
    }

    return `https://${image.bucket}.s3.${image.region}.amazonaws.com/${image.key}`
  } catch (error) {
    console.error('Error generating image URL:', error)
    return defaultImageUrl
  }
}

/**
 * Get the URL for an image stored in an S3 bucket with a specific size
 * @param {object} image Image configuration or undefined
 * @param {string} size Size of the image (small, medium, large)
 * @param {string} defaultImageUrl Optional default image URL to use when image is not available
 * @returns {string} URL for the image with the specified size or the default image URL
 */
export const getImageUrlWithSize = (image, size, defaultImageUrl = DEFAULT_IMAGE) => {
  if (!image) {
    return defaultImageUrl
  }

  try {
    // Validate image configuration
    if (!image.bucket || !image.region || !image.key) {
      console.warn('Invalid image configuration:', image)
      return defaultImageUrl
    }

    // Validate size parameter
    const validSizes = ['small', 'medium', 'large']
    if (!validSizes.includes(size)) {
      console.warn('Invalid size parameter:', size)
      return getImageUrl(image, defaultImageUrl)
    }

    // Get the base URL
    const baseUrl = `https://${image.bucket}.s3.${image.region}.amazonaws.com`
    
    // Get the key without the file extension
    const keyParts = image.key.split('.')
    const extension = keyParts.pop() || ''
    const keyWithoutExtension = keyParts.join('.')
    
    // Add the size suffix to the key
    const keyWithSize = `${keyWithoutExtension}-${size}.${extension}`
    
    return `${baseUrl}/${keyWithSize}`
  } catch (error) {
    console.error('Error generating image URL with size:', error)
    return defaultImageUrl
  }
}

/**
 * Get the URL for an image with CloudFront CDN
 * @param {object} image Image configuration or undefined
 * @param {string} cdnDomain CloudFront domain
 * @param {string} defaultImageUrl Optional default image URL to use when image is not available
 * @returns {string} URL for the image via CloudFront or the default image URL
 */
export const getImageUrlWithCDN = (image, cdnDomain, defaultImageUrl = DEFAULT_IMAGE) => {
  if (!image || !cdnDomain) {
    return defaultImageUrl
  }

  try {
    // Validate image configuration
    if (!image.key) {
      console.warn('Invalid image configuration:', image)
      return defaultImageUrl
    }

    return `https://${cdnDomain}/${image.key}`
  } catch (error) {
    console.error('Error generating CDN image URL:', error)
    return defaultImageUrl
  }
}

/**
 * Get the dimensions of an image
 * @param {string} url Image URL
 * @returns {Promise<object>} Promise that resolves to an object with width and height properties
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('getImageDimensions can only be called in the browser'))
      return
    }

    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL provided'))
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }
    img.src = url
  })
}

/**
 * Convert an image URL to base64
 * @param {string} url Image URL
 * @returns {Promise<string>} Promise that resolves to base64 string
 */
export const imageToBase64 = async (url) => {
  if (typeof window === 'undefined') {
    throw new Error('imageToBase64 can only be called in the browser')
  }

  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided')
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert image to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting image to base64:', error)
    throw error
  }
}

/**
 * Check if an image URL is valid and accessible
 * @param {string} url Image URL
 * @returns {Promise<boolean>} Promise that resolves to true if image is valid
 */
export const isValidImageUrl = (url) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (!url || typeof url !== 'string') {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * Get optimized image URL based on device pixel ratio and viewport
 * @param {object} image Image configuration
 * @param {object} options Optimization options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (image, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  } = options

  if (!image) {
    return DEFAULT_IMAGE
  }

  try {
    // Calculate actual dimensions based on device pixel ratio
    const actualWidth = Math.round(width * devicePixelRatio)
    const actualHeight = Math.round(height * devicePixelRatio)

    // For now, return the basic URL - in production this would integrate with image optimization service
    const baseUrl = getImageUrl(image)
    
    // Add query parameters for optimization (if supported by your image service)
    const params = new URLSearchParams({
      w: actualWidth.toString(),
      h: actualHeight.toString(),
      q: quality.toString(),
      f: format
    })

    return `${baseUrl}?${params.toString()}`
  } catch (error) {
    console.error('Error generating optimized image URL:', error)
    return getImageUrl(image)
  }
}

/**
 * Generate responsive image srcSet
 * @param {object} image Image configuration
 * @param {number[]} widths Array of widths for responsive images
 * @returns {string} srcSet string for responsive images
 */
export const generateResponsiveSrcSet = (image, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!image) {
    return ''
  }

  try {
    const srcSetEntries = widths.map(width => {
      const url = getOptimizedImageUrl(image, { width })
      return `${url} ${width}w`
    })

    return srcSetEntries.join(', ')
  } catch (error) {
    console.error('Error generating responsive srcSet:', error)
    return getImageUrl(image)
  }
}

/**
 * Preload an image
 * @param {string} url Image URL to preload
 * @returns {Promise<void>} Promise that resolves when image is loaded
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL provided'))
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`))
    img.src = url
  })
}

/**
 * Preload multiple images
 * @param {string[]} urls Array of image URLs to preload
 * @returns {Promise<void>} Promise that resolves when all images are loaded
 */
export const preloadImages = async (urls) => {
  if (!Array.isArray(urls)) {
    throw new Error('URLs must be an array')
  }

  try {
    await Promise.all(urls.map(url => preloadImage(url)))
  } catch (error) {
    console.error('Error preloading images:', error)
    throw error
  }
}

/**
 * Get image file extension from URL
 * @param {string} url Image URL
 * @returns {string} File extension (without dot)
 */
export const getImageExtension = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      return ''
    }

    const pathname = new URL(url).pathname
    const extension = pathname.split('.').pop()
    return extension ? extension.toLowerCase() : ''
  } catch (error) {
    console.error('Error getting image extension:', error)
    return ''
  }
}

/**
 * Check if URL is an image based on extension
 * @param {string} url URL to check
 * @returns {boolean} True if URL appears to be an image
 */
export const isImageUrl = (url) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
  const extension = getImageExtension(url)
  return imageExtensions.includes(extension)
}

/**
 * Create a placeholder image URL
 * @param {number} width Image width
 * @param {number} height Image height
 * @param {string} backgroundColor Background color (hex)
 * @param {string} textColor Text color (hex)
 * @param {string} text Text to display
 * @returns {string} Data URL for placeholder image
 */
export const createPlaceholderImage = (width = 300, height = 200, backgroundColor = '#f0f0f0', textColor = '#666', text = 'Image') => {
  if (typeof window === 'undefined') {
    return DEFAULT_IMAGE
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return DEFAULT_IMAGE
    }

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Add text
    ctx.fillStyle = textColor
    ctx.font = `${Math.min(width, height) / 10}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)

    return canvas.toDataURL()
  } catch (error) {
    console.error('Error creating placeholder image:', error)
    return DEFAULT_IMAGE
  }
}
