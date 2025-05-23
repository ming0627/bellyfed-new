/**
 * Image compression utilities
 *
 * This module provides functions for compressing images before upload
 */

/**
 * Compress an image file to reduce size before upload
 *
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 1024)
 * @param quality - Compression quality (0-1, default: 0.8)
 * @returns Promise that resolves to the compressed file
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 1024,
  quality: number = 0.8
): Promise<File> {
  // If file is already smaller than max size, return it as is
  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  // Create a new promise that resolves with the compressed file
  return new Promise((resolve, reject) => {
    try {
      // Create a FileReader to read the file
      const reader = new FileReader();
      reader.readAsDataURL(file);

      // When the file is loaded, compress it
      reader.onload = (event) => {
        // Create an image element
        const img = new Image();
        img.src = event.target?.result as string;

        // When the image is loaded, compress it
        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          // Set maximum dimensions
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed image data
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Convert data URL to Blob
          const parts = dataUrl.split(',');
          if (parts.length < 2) {
            reject(new Error('Invalid data URL'));
            return;
          }

          const part1 = parts[1];
          if (!part1) {
            reject(new Error('Invalid data URL format'));
            return;
          }

          const byteString = atob(part1);

          const part0 = parts[0];
          if (!part0) {
            reject(new Error('Invalid data URL format'));
            return;
          }

          const mimeString = part0.split(':')[1]?.split(';')[0] || 'image/jpeg';
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);

          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });

          // Create a new File from the Blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // If the compressed file is still too large, compress again with lower quality
          if (compressedFile.size > maxSizeKB * 1024 && quality > 0.3) {
            compressImage(file, maxSizeKB, quality - 0.1)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(compressedFile);
          }
        };

        // Handle image load error
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      // Handle file read error
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get a data URL from a file
 *
 * @param file - The file to convert
 * @returns Promise that resolves to the data URL
 */
export function getDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate an image file
 *
 * @param file - The file to validate
 * @returns Object with validation result and error message if any
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}
