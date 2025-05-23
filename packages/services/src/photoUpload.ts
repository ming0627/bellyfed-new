/**
 * Service for uploading photos to S3
 */

import { compressImage, validateImageFile } from '@bellyfed/utils';

/**
 * Gets a pre-signed URL for uploading a photo
 *
 * @param contentType The content type of the file to upload
 * @returns A Promise that resolves to an object with the upload URL and photo URL
 */
export async function getPhotoUploadUrl(contentType: string): Promise<{
  uploadUrl: string;
  photoUrl: string;
}> {
  try {
    const response = await fetch('/api/upload/ranking-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const data = await response.json();
    return {
      uploadUrl: data.data.uploadUrl,
      photoUrl: data.data.photoUrl,
    };
  } catch (error: unknown) {
    console.error('Error getting photo upload URL:', error);
    throw error;
  }
}

/**
 * Uploads a file to S3 using a pre-signed URL
 *
 * @param uploadUrl The pre-signed URL for uploading the file
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns A Promise that resolves when the upload is complete
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a new XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();

    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    // Set up completion handler
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    // Set up error handler
    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };

    // Open and send the request
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Uploads a photo for a ranking
 *
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns A Promise that resolves to the URL of the uploaded photo
 */
export async function uploadPhoto(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    // Validate the file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress the image
    const compressedFile = await compressImage(file);

    // Get a pre-signed URL for the upload
    const { uploadUrl, photoUrl } = await getPhotoUploadUrl(
      compressedFile.type,
    );

    // Upload the file to S3
    await uploadFileToS3(uploadUrl, compressedFile, onProgress);

    // Return the photo URL
    return photoUrl;
  } catch (error: unknown) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}
