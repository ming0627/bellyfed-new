/**
 * API Route: Image Resize Utility
 * 
 * This API route provides image resizing and optimization services.
 * It supports various formats and quality settings.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for image resize utility API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to use image resize services'
      });
    }

    const { 
      imageUrl,
      imageData,
      width,
      height,
      quality = 80,
      format = 'auto',
      fit = 'cover',
      background = 'transparent'
    } = req.body;

    // Validate input parameters
    if (!imageUrl && !imageData) {
      return res.status(400).json({
        error: 'Missing image source',
        message: 'Either imageUrl or imageData is required'
      });
    }

    if (imageUrl && imageData) {
      return res.status(400).json({
        error: 'Conflicting parameters',
        message: 'Provide either imageUrl OR imageData, not both'
      });
    }

    // Validate dimensions
    if (!width && !height) {
      return res.status(400).json({
        error: 'Missing dimensions',
        message: 'At least width or height must be specified'
      });
    }

    const widthNum = width ? parseInt(width, 10) : null;
    const heightNum = height ? parseInt(height, 10) : null;

    if (widthNum && (isNaN(widthNum) || widthNum < 1 || widthNum > 4000)) {
      return res.status(400).json({
        error: 'Invalid width parameter',
        message: 'Width must be between 1 and 4000 pixels'
      });
    }

    if (heightNum && (isNaN(heightNum) || heightNum < 1 || heightNum > 4000)) {
      return res.status(400).json({
        error: 'Invalid height parameter',
        message: 'Height must be between 1 and 4000 pixels'
      });
    }

    // Validate quality parameter
    const qualityNum = parseInt(quality, 10);
    if (isNaN(qualityNum) || qualityNum < 1 || qualityNum > 100) {
      return res.status(400).json({
        error: 'Invalid quality parameter',
        message: 'Quality must be between 1 and 100'
      });
    }

    // Validate format parameter
    const validFormats = ['auto', 'jpeg', 'png', 'webp', 'avif'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid format parameter',
        message: `Format must be one of: ${validFormats.join(', ')}`
      });
    }

    // Validate fit parameter
    const validFitOptions = ['cover', 'contain', 'fill', 'inside', 'outside'];
    if (!validFitOptions.includes(fit)) {
      return res.status(400).json({
        error: 'Invalid fit parameter',
        message: `Fit must be one of: ${validFitOptions.join(', ')}`
      });
    }

    // Validate image URL if provided
    if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid image URL',
          message: 'Image URL must be a valid HTTP/HTTPS URL'
        });
      }
    }

    // Validate image data if provided
    if (imageData) {
      if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
        return res.status(400).json({
          error: 'Invalid image data',
          message: 'Image data must be a valid base64 data URL'
        });
      }
    }

    // Process image resize
    const resizedImage = await processImageResize({
      imageUrl,
      imageData,
      width: widthNum,
      height: heightNum,
      quality: qualityNum,
      format,
      fit,
      background
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        resizedImage: resizedImage.data,
        metadata: {
          originalSize: resizedImage.originalSize,
          newSize: resizedImage.newSize,
          format: resizedImage.format,
          quality: qualityNum,
          compressionRatio: resizedImage.compressionRatio
        }
      },
      meta: {
        operation: 'image_resize',
        dimensions: {
          width: widthNum,
          height: heightNum
        },
        settings: {
          quality: qualityNum,
          format,
          fit,
          background
        },
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing image resize:', error);
    
    // Handle specific error types
    if (error.message.includes('unsupported format')) {
      return res.status(400).json({
        error: 'Unsupported format',
        message: 'The image format is not supported'
      });
    }

    if (error.message.includes('file too large')) {
      return res.status(413).json({
        error: 'File too large',
        message: 'Image file is too large to process'
      });
    }

    if (error.message.includes('network')) {
      return res.status(502).json({
        error: 'Network error',
        message: 'Failed to fetch image from URL'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process image resize'
    });
  }
}

/**
 * Process image resize operation
 */
async function processImageResize(options) {
  const { imageUrl, imageData, width, height, quality, format, fit, background } = options;
  
  // Mock implementation - in a real app, this would use a library like Sharp or similar
  // For demonstration purposes, we'll return mock data
  
  let inputBuffer;
  let originalSize;

  if (imageUrl) {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from URL');
    }
    inputBuffer = await response.arrayBuffer();
    originalSize = inputBuffer.byteLength;
  } else {
    // Decode base64 image data
    const base64Data = imageData.split(',')[1];
    inputBuffer = Buffer.from(base64Data, 'base64');
    originalSize = inputBuffer.byteLength;
  }

  // Validate file size (10MB limit)
  if (originalSize > 10 * 1024 * 1024) {
    throw new Error('Image file too large');
  }

  // Mock resize operation
  // In a real implementation, you would use Sharp, Canvas, or similar library
  const mockResizedBuffer = Buffer.from('mock-resized-image-data');
  const newSize = mockResizedBuffer.byteLength;
  
  // Calculate compression ratio
  const compressionRatio = ((originalSize - newSize) / originalSize * 100).toFixed(2);

  // Determine output format
  let outputFormat = format;
  if (format === 'auto') {
    // Auto-detect best format based on browser support
    outputFormat = 'webp'; // Default to WebP for better compression
  }

  // Convert to base64 for response
  const base64Output = `data:image/${outputFormat};base64,${mockResizedBuffer.toString('base64')}`;

  return {
    data: base64Output,
    originalSize,
    newSize,
    format: outputFormat,
    compressionRatio: parseFloat(compressionRatio)
  };
}
