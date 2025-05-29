import React from 'react';
import AvatarUpload from '../components/profile/AvatarUpload.js';

/**
 * Test page for Avatar Upload functionality
 * 
 * This page allows testing the avatar upload component in isolation
 * to verify that the file upload implementation works correctly.
 */
export default function TestAvatarUpload() {
  const handleAvatarChange = (avatarResponse) => {
    console.log('Avatar changed:', avatarResponse);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Avatar Upload Test
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              This page tests the avatar upload functionality. You can:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Upload a new avatar image</li>
              <li>Preview the uploaded image</li>
              <li>Delete the current avatar</li>
              <li>See upload progress and error handling</li>
            </ul>
          </div>

          <AvatarUpload
            currentAvatarUrl={null}
            onAvatarChange={handleAvatarChange}
            uploadOptions={{
              maxSizeBytes: 2 * 1024 * 1024, // 2MB
              generateThumbnail: true
            }}
          />

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Implementation Notes
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Uses react-dropzone for drag-and-drop functionality</li>
              <li>• Integrates with AWS S3 for file storage</li>
              <li>• Supports image processing with Sharp</li>
              <li>• Includes file validation and error handling</li>
              <li>• Generates multiple image sizes (thumbnail, medium, large)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Static generation for Next.js 15 compatibility
 */
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // 1 hour
  };
}
