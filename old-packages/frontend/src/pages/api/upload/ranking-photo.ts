import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Set a maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed content types
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real implementation, we would verify authentication here
  // For now, we'll use a mock user ID
  const userId = 'mock-user-id';

  try {
    const contentType = req.body.contentType || 'image/jpeg';

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return res.status(400).json({
        error:
          'Invalid content type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      });
    }

    // Generate a unique file ID
    const fileId = uuidv4();
    const fileKey = `rankings/${userId}/${fileId}`;

    // Create the command to put an object in the S3 bucket
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
      Key: fileKey,
      ContentType: contentType,
      // Add a condition to limit file size
      ContentLength: MAX_FILE_SIZE,
    });

    // Generate a pre-signed URL for the S3 PutObject operation
    // Set a short expiration time to limit the window of opportunity for misuse
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // The URL where the file will be accessible after upload
    const photoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        photoUrl,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
