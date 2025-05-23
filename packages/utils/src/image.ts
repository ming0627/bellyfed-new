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
export interface ImageConfig {
  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * AWS region
   */
  region: string;

  /**
   * S3 object key
   */
  key: string;
}

/**
 * Default image URL to use when an image is not available
 */
export const DEFAULT_IMAGE = 'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png';

/**
 * Get the URL for an image stored in an S3 bucket
 * @param image Image configuration or undefined
 * @param defaultImageUrl Optional default image URL to use when image is not available
 * @returns URL for the image or the default image URL
 */
export const getImageUrl = (
  image: ImageConfig | undefined,
  defaultImageUrl: string = DEFAULT_IMAGE
): string => {
  if (!image) {
    return defaultImageUrl;
  }

  try {
    // Validate image configuration
    if (!image.bucket || !image.region || !image.key) {
      console.warn('Invalid image configuration:', image);
      return defaultImageUrl;
    }

    return `https://${image.bucket}.s3.${image.region}.amazonaws.com/${image.key}`;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return defaultImageUrl;
  }
};

/**
 * Get the URL for an image stored in an S3 bucket with a specific size
 * @param image Image configuration or undefined
 * @param size Size of the image (small, medium, large)
 * @param defaultImageUrl Optional default image URL to use when image is not available
 * @returns URL for the image with the specified size or the default image URL
 */
export const getImageUrlWithSize = (
  image: ImageConfig | undefined,
  size: 'small' | 'medium' | 'large',
  defaultImageUrl: string = DEFAULT_IMAGE
): string => {
  if (!image) {
    return defaultImageUrl;
  }

  try {
    // Validate image configuration
    if (!image.bucket || !image.region || !image.key) {
      console.warn('Invalid image configuration:', image);
      return defaultImageUrl;
    }

    // Get the base URL
    const baseUrl = `https://${image.bucket}.s3.${image.region}.amazonaws.com`;
    
    // Get the key without the file extension
    const keyParts = image.key.split('.');
    const extension = keyParts.pop() || '';
    const keyWithoutExtension = keyParts.join('.');
    
    // Add the size suffix to the key
    const keyWithSize = `${keyWithoutExtension}-${size}.${extension}`;
    
    return `${baseUrl}/${keyWithSize}`;
  } catch (error) {
    console.error('Error generating image URL with size:', error);
    return defaultImageUrl;
  }
};

/**
 * Check if an image URL is valid
 * @param url Image URL to check
 * @returns Promise that resolves to true if the image URL is valid, false otherwise
 */
export const isImageUrlValid = async (url: string): Promise<boolean> => {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false;
  }
};

/**
 * Get the dimensions of an image
 * @param url Image URL
 * @returns Promise that resolves to an object with width and height properties
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('getImageDimensions can only be called in the browser'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
};

/**
 * Convert an image URL to a base64 data URL
 * @param url Image URL
 * @returns Promise that resolves to a base64 data URL
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('imageUrlToBase64 can only be called in the browser');
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};
