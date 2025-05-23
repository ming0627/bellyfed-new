import { withApiAuthRequired } from '@bellyfed/utils';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

/**
 * Generate a pre-signed URL for uploading a photo to S3
 *
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentType } = req.body;

    // Validate content type
    if (!contentType) {
      return res.status(400).json({ error: 'Content type is required' });
    }

    // Only allow image uploads
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image uploads are allowed' });
    }

    // Generate a unique filename
    const fileId = crypto.randomUUID();
    const fileExtension = contentType.split('/')[1] || 'jpg';
    const key = `rankings/${fileId}.${fileExtension}`;

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Create the command to put an object in S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
      Key: key,
      ContentType: contentType,
    });

    // Generate a pre-signed URL for uploading
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Generate the URL for the uploaded photo
    const photoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${
      process.env.AWS_REGION || 'ap-southeast-1'
    }.amazonaws.com/${key}`;

    // Return the upload URL and photo URL
    return res.status(200).json({
      data: {
        uploadUrl,
        photoUrl,
      },
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

export default withApiAuthRequired(handler);
