/**
 * API Route: Get Photo by Reference
 * 
 * This API route retrieves photos by their reference ID.
 * It supports different sizes and formats.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { photoUploadService } from '../../../services/photoUploadService.js';

/**
 * Handler for photo by reference API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    const { reference } = req.query;
    const { 
      size = 'original',
      format = 'auto',
      quality = 80,
      redirect = true
    } = req.query;

    // Validate photo reference
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({
        error: 'Invalid photo reference',
        message: 'Photo reference is required and must be a string'
      });
    }

    // Validate size parameter
    const validSizes = ['thumbnail', 'small', 'medium', 'large', 'original'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        error: 'Invalid size parameter',
        message: `Size must be one of: ${validSizes.join(', ')}`
      });
    }

    // Validate format parameter
    const validFormats = ['auto', 'jpeg', 'png', 'webp'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid format parameter',
        message: `Format must be one of: ${validFormats.join(', ')}`
      });
    }

    // Validate quality parameter
    const qualityNum = parseInt(quality, 10);
    if (isNaN(qualityNum) || qualityNum < 1 || qualityNum > 100) {
      return res.status(400).json({
        error: 'Invalid quality parameter',
        message: 'Quality must be a number between 1 and 100'
      });
    }

    // Get photo information
    const photo = await photoUploadService.getPhotoByReference(reference, {
      size,
      format,
      quality: qualityNum
    });

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The specified photo reference does not exist'
      });
    }

    // Handle redirect vs JSON response
    if (redirect === 'true' && photo.url) {
      // Redirect to the actual photo URL
      res.redirect(302, photo.url);
    } else {
      // Return photo information as JSON
      res.status(200).json({
        success: true,
        data: {
          reference: photo.reference,
          url: photo.url,
          size: photo.size,
          format: photo.format,
          width: photo.width,
          height: photo.height,
          fileSize: photo.fileSize,
          contentType: photo.contentType,
          metadata: photo.metadata || {},
          createdAt: photo.createdAt,
          updatedAt: photo.updatedAt
        }
      });
    }

  } catch (error) {
    console.error('Error fetching photo:', error);
    
    // Handle specific error types
    if (error.message === 'Photo not found') {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'The specified photo reference does not exist'
      });
    }

    if (error.message === 'Photo expired') {
      return res.status(410).json({
        error: 'Photo expired',
        message: 'The specified photo has expired and is no longer available'
      });
    }

    if (error.message === 'Access denied') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this photo'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch photo'
    });
  }
}
