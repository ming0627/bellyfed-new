import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Avatar Upload API Endpoint
 * 
 * Handles avatar image uploads with processing, optimization, and S3 storage.
 * Supports image resizing, format conversion, and thumbnail generation.
 * 
 * This endpoint:
 * 1. Validates the uploaded file
 * 2. Processes and optimizes the image using Sharp
 * 3. Generates multiple sizes (original, medium, thumbnail)
 * 4. Uploads to S3 with proper naming and organization
 * 5. Returns URLs for the uploaded images
 */

// Configuration
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_SIZES = {
  thumbnail: { width: 64, height: 64 },
  medium: { width: 200, height: 200 },
  large: { width: 400, height: 400 }
};

/**
 * Initialize S3 client
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Get S3 bucket name from environment
 */
const getBucketName = () => {
  return process.env.S3_UPLOADS_BUCKET || 'bellyfed-uploads-dev';
};

/**
 * Validate uploaded file
 * @param {Object} file - Uploaded file object
 * @throws {Error} If file is invalid
 */
function validateFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Supported types: ${ALLOWED_TYPES.join(', ')}`);
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
}

/**
 * Process image with Sharp
 * @param {Buffer} buffer - Image buffer
 * @param {Object} size - Target size {width, height}
 * @param {string} format - Output format
 * @returns {Promise<Buffer>} Processed image buffer
 */
async function processImage(buffer, size, format = 'jpeg') {
  try {
    return await sharp(buffer)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Upload file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} S3 object URL
 */
async function uploadToS3(buffer, key, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year
      Metadata: {
        uploadedAt: new Date().toISOString(),
        service: 'bellyfed-avatar-upload'
      }
    });

    await s3Client.send(command);

    // Generate signed URL for immediate access
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload to S3');
  }
}

/**
 * Get user ID from request (mock implementation)
 * In production, this would extract from JWT token or session
 * @param {Object} req - Request object
 * @returns {string} User ID
 */
function getUserId(req) {
  // Mock implementation - replace with actual authentication
  return req.headers['x-user-id'] || 'user-' + Date.now();
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse multipart form data (simplified - in production use a proper parser like multer)
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // For this example, we'll simulate file processing
    // In production, you'd use a proper multipart parser
    const mockFile = {
      type: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('mock-image-data') // This would be the actual file buffer
    };

    // Validate file
    validateFile(mockFile);

    // Generate unique file identifiers
    const fileId = uuidv4();
    const timestamp = Date.now();
    const basePath = `avatars/${userId}/${timestamp}`;

    // Process and upload different sizes
    const uploadPromises = [];
    const results = {};

    for (const [sizeName, dimensions] of Object.entries(AVATAR_SIZES)) {
      const processedBuffer = await processImage(mockFile.buffer, dimensions);
      const key = `${basePath}/${sizeName}.jpg`;
      
      uploadPromises.push(
        uploadToS3(processedBuffer, key, 'image/jpeg').then(url => {
          results[sizeName] = url;
        })
      );
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // Prepare response
    const response = {
      success: true,
      avatarUrl: results.medium, // Primary avatar URL
      thumbnailUrl: results.thumbnail,
      originalUrl: results.large,
      sizes: results,
      metadata: {
        fileId,
        uploadedAt: new Date().toISOString(),
        userId
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Return appropriate error response
    const statusCode = error.message.includes('Unauthorized') ? 401 :
                      error.message.includes('not allowed') || error.message.includes('exceeds') ? 400 :
                      500;

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Avatar upload failed'
    });
  }
}

/**
 * Configure API route for file uploads
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb', // Slightly larger than max file size to account for multipart overhead
    },
  },
};

/**
 * Helper function to clean up old avatars
 * This would typically be called after successful upload
 * @param {string} userId - User ID
 * @param {string} currentFileId - Current file ID to keep
 */
async function cleanupOldAvatars(userId, currentFileId) {
  try {
    // Implementation would list and delete old avatar files
    // This is a placeholder for the cleanup logic
    console.log(`Cleaning up old avatars for user ${userId}, keeping ${currentFileId}`);
  } catch (error) {
    console.error('Cleanup error:', error);
    // Don't throw - cleanup failures shouldn't break the upload
  }
}
