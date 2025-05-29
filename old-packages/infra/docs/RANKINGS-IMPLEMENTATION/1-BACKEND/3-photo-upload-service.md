# 3. Photo Upload Service Implementation

This document outlines the implementation plan for the photo upload service required for the Rankings feature.

## Overview

The photo upload service will handle uploading photos to S3 and managing the photo metadata in the database. It will use pre-signed URLs to allow direct uploads from the frontend to S3.

## Implementation Tasks

### 1. S3 Integration

- [ ] Create S3 client utility
    - File: `src/lib/s3.ts`
    - Implement connection to S3
    - Add error handling and retries
    - Create helper functions for common operations

### 2. Pre-signed URL Generation

- [ ] Create pre-signed URL generator
    - File: `src/services/photoUploadService.ts`
    - Implement function to generate pre-signed URLs for S3 uploads
    - Add security checks and validation
    - Include content type and size limits

### 3. Photo Upload API Endpoint

- [ ] Create photo upload API endpoint
    - File: `src/pages/api/upload/ranking-photo.ts`
    - Implement endpoint to generate pre-signed URLs
    - Add authentication and authorization
    - Validate request parameters

### 4. Photo Metadata Management

- [ ] Create photo metadata management functions
    - File: `src/services/photoUploadService.ts`
    - Implement functions to store photo metadata in the database
    - Add functions to retrieve and delete photo metadata
    - Ensure proper error handling

## API Endpoint Details

### `POST /api/upload/ranking-photo`

This endpoint generates a pre-signed URL for uploading a photo to S3.

#### Request

```json
{
    "contentType": "image/jpeg"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "uploadUrl": "https://bellyfed-rankings-dev-123456789012.s3.amazonaws.com/rankings/user-id/photo-id?X-Amz-Algorithm=...",
        "photoUrl": "https://bellyfed-rankings-dev-123456789012.s3.amazonaws.com/rankings/user-id/photo-id"
    }
}
```

## Implementation Details

### S3 Client Utility

```typescript
// src/lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

/**
 * Generate a pre-signed URL for uploading a file to S3
 */
export async function generatePresignedUrl(
    userId: string,
    contentType: string
): Promise<{ uploadUrl: string; photoUrl: string }> {
    const fileId = uuidv4();
    const fileKey = `rankings/${userId}/${fileId}`;

    // Create the command to put an object in the S3 bucket
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-rankings-dev',
        Key: fileKey,
        ContentType: contentType,
    });

    // Generate a pre-signed URL for the S3 PutObject operation
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // The URL where the file will be accessible after upload
    const photoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { uploadUrl, photoUrl };
}

/**
 * Delete a file from S3
 */
export async function deleteFile(photoUrl: string): Promise<void> {
    // Extract the key from the URL
    const key = photoUrl.split('.com/')[1];

    // Create the command to delete an object from the S3 bucket
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-rankings-dev',
        Key: key,
    });

    // Delete the object
    await s3Client.send(command);
}
```

### Photo Upload Service

```typescript
// src/services/photoUploadService.ts
import { generatePresignedUrl, deleteFile } from '@/lib/s3';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a pre-signed URL for uploading a photo
 */
export async function getPhotoUploadUrl(
    userId: string,
    contentType: string
): Promise<{ uploadUrl: string; photoUrl: string }> {
    // Validate content type
    const allowedContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedContentTypes.includes(contentType)) {
        throw new Error('Invalid content type. Only images are allowed.');
    }

    // Generate pre-signed URL
    return generatePresignedUrl(userId, contentType);
}

/**
 * Add a photo to a ranking
 */
export async function addPhotoToRanking(
    rankingId: string,
    photoUrl: string
): Promise<{ id: string; rankingId: string; photoUrl: string; createdAt: Date }> {
    const id = uuidv4();
    const createdAt = new Date();

    // Insert photo metadata into the database
    await db.query(
        'INSERT INTO ranking_photos (id, ranking_id, photo_url, created_at) VALUES (?, ?, ?, ?)',
        [id, rankingId, photoUrl, createdAt]
    );

    return { id, rankingId, photoUrl, createdAt };
}

/**
 * Remove a photo from a ranking
 */
export async function removePhotoFromRanking(photoId: string): Promise<void> {
    // Get the photo URL from the database
    const [photo] = await db.query('SELECT photo_url FROM ranking_photos WHERE id = ?', [photoId]);

    if (!photo) {
        throw new Error('Photo not found');
    }

    // Delete the photo from S3
    await deleteFile(photo.photo_url);

    // Delete the photo metadata from the database
    await db.query('DELETE FROM ranking_photos WHERE id = ?', [photoId]);
}

/**
 * Get all photos for a ranking
 */
export async function getPhotosForRanking(
    rankingId: string
): Promise<Array<{ id: string; rankingId: string; photoUrl: string; createdAt: Date }>> {
    // Get all photos for the ranking from the database
    const photos = await db.query(
        'SELECT id, ranking_id, photo_url, created_at FROM ranking_photos WHERE ranking_id = ?',
        [rankingId]
    );

    return photos.map((photo) => ({
        id: photo.id,
        rankingId: photo.ranking_id,
        photoUrl: photo.photo_url,
        createdAt: new Date(photo.created_at),
    }));
}
```

### Photo Upload API Endpoint

```typescript
// src/pages/api/upload/ranking-photo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPhotoUploadUrl } from '@/services/photoUploadService';
import { verifyAuth } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = authResult.userId;
        const contentType = req.body.contentType || 'image/jpeg';

        // Generate pre-signed URL
        const { uploadUrl, photoUrl } = await getPhotoUploadUrl(userId, contentType);

        return res.status(200).json({
            success: true,
            data: {
                uploadUrl,
                photoUrl,
            },
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
}
```

## Security Considerations

- [ ] Validate content types to prevent uploading malicious files
- [ ] Set maximum file size limits
- [ ] Implement rate limiting to prevent abuse
- [ ] Use user-specific paths in S3 to prevent unauthorized access
- [ ] Set appropriate CORS configuration on the S3 bucket

## Testing

- [ ] Write unit tests for S3 client utility
- [ ] Test pre-signed URL generation
- [ ] Test photo metadata management functions
- [ ] Test the photo upload API endpoint

## Dependencies

- AWS S3 bucket configured for the application
- AWS SDK for JavaScript v3
- Database services from previous steps
- Authentication middleware

## Estimated Time

- S3 Client Utility: 0.5 day
- Pre-signed URL Generation: 0.5 day
- Photo Upload API Endpoint: 0.5 day
- Photo Metadata Management: 0.5 day
- Testing: 1 day

Total: 3 days
