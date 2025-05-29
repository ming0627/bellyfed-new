# Photo Upload Integration

This document outlines the implementation details for integrating photo uploads with AWS S3 for the rankings feature.

## Overview

The rankings feature allows users to attach photos to their dish rankings. These photos are stored in AWS S3, a scalable object storage service. The implementation uses pre-signed URLs to enable secure direct uploads from the client to S3.

## Architecture

The photo upload process follows these steps:

1. Frontend requests a pre-signed URL from the backend
2. Backend generates a pre-signed URL and returns it to the frontend
3. Frontend uploads the photo directly to S3 using the pre-signed URL
4. Frontend saves the photo URL in the ranking

This approach has several advantages:

- Reduces server load by allowing direct uploads to S3
- Improves upload speed by eliminating the need to proxy through the server
- Enhances security by using temporary, scoped pre-signed URLs

## AWS S3 Setup

### Bucket Configuration

Create an S3 bucket with the following configuration:

```bash
aws s3api create-bucket \
  --bucket bellyfed-uploads \
  --region us-east-1
```

### CORS Configuration

Configure CORS to allow uploads from the frontend:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": [
        "https://bellyfed.com",
        "https://www.bellyfed.com",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply the CORS configuration:

```bash
aws s3api put-bucket-cors \
  --bucket bellyfed-uploads \
  --cors-configuration file://cors-config.json
```

### Bucket Policy

Configure a bucket policy to restrict access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bellyfed-uploads/*"
    }
  ]
}
```

Apply the bucket policy:

```bash
aws s3api put-bucket-policy \
  --bucket bellyfed-uploads \
  --policy file://bucket-policy.json
```

### IAM User for S3 Access

Create an IAM user with programmatic access and attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::bellyfed-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::bellyfed-uploads"
    }
  ]
}
```

## Backend Implementation

### API Endpoint for Pre-signed URLs

Create an API endpoint to generate pre-signed URLs:

```typescript
// src/pages/api/upload/ranking-photo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/utils/auth';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
    const fileId = uuidv4();
    const fileKey = `rankings/${userId}/${fileId}`;
    const contentType = req.body.contentType || 'image/jpeg';

    // Create the command to put an object in the S3 bucket
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
      Key: fileKey,
      ContentType: contentType,
    });

    // Generate a pre-signed URL for the S3 PutObject operation
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // The URL where the file will be accessible after upload
    const photoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      uploadUrl,
      photoUrl,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
```

### Environment Variables

Set up the following environment variables:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=bellyfed-uploads
```

## Frontend Implementation

### Photo Upload Component

Create a component for handling photo uploads:

```tsx
// src/components/PhotoUpload.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void;
}

export function PhotoUpload({ onPhotoUploaded }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);

    try {
      // Get a pre-signed URL for the upload
      const response = await fetch('/api/upload/ranking-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, photoUrl } = await response.json();

      // Upload the file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }

      // Notify parent component of the new photo URL
      onPhotoUploaded(photoUrl);

      toast({
        title: 'Photo Uploaded',
        description: 'Your photo has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="animate-pulse">Uploading...</div>
      ) : (
        <>
          <Camera className="h-6 w-6 mb-1" />
          <span className="text-xs">Add Photo</span>
        </>
      )}
    </label>
  );
}
```

### Integration with RankingDialog

Update the RankingDialog component to use the PhotoUpload component:

```tsx
// src/components/rankings/RankingDialog.tsx
// ... existing imports
import { PhotoUpload } from '@/components/PhotoUpload';

// ... existing code

// Inside the component
const handlePhotoUploaded = (photoUrl: string) => {
  setPhotoUrls([...photoUrls, photoUrl]);
};

// In the render function
<div className="space-y-2">
  <Label>Photos</Label>
  <div className="grid grid-cols-3 gap-2">
    {photoUrls.map((url, index) => (
      <div
        key={index}
        className="relative h-20 rounded-md overflow-hidden bg-gray-100"
      >
        <img
          src={url}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== index))}
        >
          <span className="sr-only">Remove</span>
          &times;
        </Button>
      </div>
    ))}
    <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
  </div>
</div>;
```

## Image Processing

### Client-Side Image Compression

To improve upload performance, implement client-side image compression:

```tsx
// src/utils/imageCompression.ts
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height in pixels
    useWebWorker: true, // Use web worker for better performance
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
}
```

Update the PhotoUpload component to use image compression:

```tsx
// src/components/PhotoUpload.tsx
import { compressImage } from '@/utils/imageCompression';

// ... existing code

const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  // ... existing code

  try {
    // Compress the image before uploading
    const compressedFile = await compressImage(file);

    // ... rest of the upload code using compressedFile instead of file
  } catch (error) {
    // ... error handling
  }
};
```

### Server-Side Image Processing

For more advanced image processing, consider using AWS Lambda with S3 event triggers:

1. Configure an S3 event notification to trigger a Lambda function when a new object is created
2. The Lambda function processes the image (resize, optimize, create thumbnails)
3. The processed images are saved back to S3

## Security Considerations

### Content Type Validation

Validate the content type on the server side:

```typescript
// src/pages/api/upload/ranking-photo.ts
// ... existing code

// Validate content type
const contentType = req.body.contentType;
const allowedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

if (!allowedContentTypes.includes(contentType)) {
  return res
    .status(400)
    .json({ error: 'Invalid content type. Only images are allowed.' });
}
```

### File Size Limits

Implement file size limits:

```typescript
// src/pages/api/upload/ranking-photo.ts
// ... existing code

// Set a maximum file size (10MB)
const maxSizeBytes = 10 * 1024 * 1024;

// Add a Content-Length condition to the pre-signed URL
const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
  Key: fileKey,
  ContentType: contentType,
  ContentLength: maxSizeBytes, // This will reject uploads larger than maxSizeBytes
});
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// src/pages/api/upload/ranking-photo.ts
// ... existing code

// Simple in-memory rate limiting
const rateLimits: Record<string, { count: number; resetTime: number }> = {};

// Allow 10 uploads per user per hour
const handleRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  if (!rateLimits[userId] || rateLimits[userId].resetTime < now) {
    rateLimits[userId] = { count: 1, resetTime: now + hourInMs };
    return true;
  }

  if (rateLimits[userId].count >= 10) {
    return false; // Rate limit exceeded
  }

  rateLimits[userId].count += 1;
  return true;
};

// In the handler
if (!handleRateLimit(userId)) {
  return res
    .status(429)
    .json({ error: 'Rate limit exceeded. Try again later.' });
}
```

## Error Handling

Implement robust error handling:

```typescript
// src/components/PhotoUpload.tsx
// ... existing code

const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  // ... existing code

  try {
    // ... upload code
  } catch (error) {
    console.error('Error uploading photo:', error);

    // Provide specific error messages based on the error type
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      });
    } else if (error instanceof Error && error.message.includes('Rate limit')) {
      toast({
        title: 'Rate Limit Exceeded',
        description:
          'You have uploaded too many photos. Please try again later.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    }
  }
};
```

## Testing

### Unit Testing

Test the photo upload API endpoint:

```typescript
// __tests__/api/upload/ranking-photo.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/upload/ranking-photo';
import { verifyAuth } from '@/utils/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock dependencies
jest.mock('@/utils/auth');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('Photo Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authentication
    (verifyAuth as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      userId: 'test-user-id',
    });

    // Mock S3 client
    (S3Client as jest.Mock).mockImplementation(() => ({
      // Mock implementation
    }));

    // Mock getSignedUrl
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://mock-presigned-url.com',
    );
  });

  test('returns pre-signed URL for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentType: 'image/jpeg',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      uploadUrl: 'https://mock-presigned-url.com',
      photoUrl: expect.stringContaining('rankings/test-user-id/'),
    });
  });

  test('rejects unauthorized requests', async () => {
    // Mock authentication failure
    (verifyAuth as jest.Mock).mockResolvedValue({
      isAuthenticated: false,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentType: 'image/jpeg',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  test('rejects invalid content types', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        contentType: 'application/javascript',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
```

### Integration Testing

Test the complete photo upload flow:

```typescript
// __tests__/integration/photo-upload.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { compressImage } from '@/utils/imageCompression';
import fetch from 'node-fetch';

// Mock dependencies
jest.mock('@/utils/imageCompression');
jest.mock('node-fetch');

describe('Photo Upload Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock image compression
    (compressImage as jest.Mock).mockImplementation(file => file);

    // Mock fetch for API call
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/upload/ranking-photo') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            uploadUrl: 'https://mock-upload-url.com',
            photoUrl: 'https://mock-photo-url.com/image.jpg',
          }),
        });
      } else if (url === 'https://mock-upload-url.com') {
        return Promise.resolve({
          ok: true,
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  });

  test('uploads a photo and calls onPhotoUploaded', async () => {
    const onPhotoUploaded = jest.fn();

    render(<PhotoUpload onPhotoUploaded={onPhotoUploaded} />);

    // Create a mock file
    const file = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' });

    // Get the file input
    const input = screen.getByLabelText(/add photo/i);

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the upload to complete
    await waitFor(() => {
      expect(onPhotoUploaded).toHaveBeenCalledWith('https://mock-photo-url.com/image.jpg');
    });
  });

  test('handles upload errors', async () => {
    // Mock fetch to simulate an error
    (fetch as jest.Mock).mockRejectedValue(new Error('Upload failed'));

    const onPhotoUploaded = jest.fn();

    render(<PhotoUpload onPhotoUploaded={onPhotoUploaded} />);

    // Create a mock file
    const file = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' });

    // Get the file input
    const input = screen.getByLabelText(/add photo/i);

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the error to be handled
    await waitFor(() => {
      expect(onPhotoUploaded).not.toHaveBeenCalled();
    });
  });
});
```

## Monitoring and Logging

### CloudWatch Metrics

Set up CloudWatch metrics to monitor S3 usage:

- BucketSizeBytes - Track the total size of the bucket
- NumberOfObjects - Track the number of objects in the bucket
- AllRequests - Track the number of requests to the bucket

### Application Logging

Implement detailed logging for photo uploads:

```typescript
// src/pages/api/upload/ranking-photo.ts
// ... existing code

// Log upload requests
console.log(
  `[${new Date().toISOString()}] Photo upload request from user ${userId}`,
);

// Log successful uploads
console.log(
  `[${new Date().toISOString()}] Photo upload successful for user ${userId}: ${fileKey}`,
);

// Log errors
console.error(
  `[${new Date().toISOString()}] Photo upload error for user ${userId}:`,
  error,
);
```

## Cleanup Strategy

Implement a cleanup strategy for orphaned photos:

1. When a ranking is deleted, delete associated photos from S3
2. Run a periodic job to identify and delete orphaned photos (photos not associated with any ranking)
3. Set up S3 lifecycle rules to delete old photos (e.g., photos older than 7 years)

```typescript
// src/services/rankingService.ts
// ... existing code

// Delete a ranking and its photos
export async function deleteRanking(rankingId: string) {
  // Get the photos associated with the ranking
  const photos = await executeQuery(
    'SELECT photo_url FROM ranking_photos WHERE ranking_id = ?',
    [rankingId],
  );

  // Delete the photos from S3
  for (const photo of photos) {
    const photoUrl = photo.photo_url;
    const key = photoUrl.split('.com/')[1]; // Extract the key from the URL

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
          Key: key,
        }),
      );
    } catch (error) {
      console.error(`Error deleting photo from S3: ${key}`, error);
      // Continue with other photos even if one fails
    }
  }

  // Delete the ranking and its photos from the database
  await executeQuery('DELETE FROM user_rankings WHERE id = ?', [rankingId]);

  return true;
}
```
