import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Delete Avatar API Endpoint
 * 
 * Handles avatar deletion from S3 storage and user profile updates.
 * Removes all avatar sizes (thumbnail, medium, large) and cleans up storage.
 * 
 * This endpoint:
 * 1. Authenticates the user
 * 2. Lists all avatar files for the user
 * 3. Deletes all avatar-related files from S3
 * 4. Updates the user profile to remove avatar references
 * 5. Returns the updated user profile
 */

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
 * List all avatar files for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of S3 object keys
 */
async function listUserAvatars(userId) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: getBucketName(),
      Prefix: `avatars/${userId}/`,
    });

    const response = await s3Client.send(command);
    return response.Contents?.map(obj => obj.Key) || [];
  } catch (error) {
    console.error('Error listing user avatars:', error);
    throw new Error('Failed to list avatar files');
  }
}

/**
 * Delete multiple objects from S3
 * @param {Array} keys - Array of S3 object keys to delete
 * @returns {Promise<void>}
 */
async function deleteS3Objects(keys) {
  if (keys.length === 0) return;

  try {
    // Delete objects one by one (for simplicity)
    // In production, you might want to use DeleteObjectsCommand for batch deletion
    const deletePromises = keys.map(key => {
      const command = new DeleteObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      });
      return s3Client.send(command);
    });

    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${keys.length} avatar files`);
  } catch (error) {
    console.error('Error deleting S3 objects:', error);
    throw new Error('Failed to delete avatar files from storage');
  }
}

/**
 * Update user profile to remove avatar references
 * In production, this would update the database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user profile
 */
async function updateUserProfile(userId) {
  try {
    // Mock implementation - in production, update the database
    const updatedProfile = {
      id: userId,
      username: 'user_' + userId.slice(-6),
      email: `user${userId.slice(-6)}@example.com`,
      name: 'User Name',
      bio: 'User bio',
      location: 'User location',
      avatarUrl: null, // Remove avatar URL
      thumbnailUrl: null, // Remove thumbnail URL
      updated_at: new Date().toISOString(),
    };

    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // List all avatar files for the user
    const avatarKeys = await listUserAvatars(userId);
    
    if (avatarKeys.length === 0) {
      // No avatars to delete, but still update profile
      const updatedProfile = await updateUserProfile(userId);
      return res.status(200).json({
        success: true,
        message: 'No avatar files found to delete',
        profile: updatedProfile
      });
    }

    // Delete all avatar files from S3
    await deleteS3Objects(avatarKeys);

    // Update user profile to remove avatar references
    const updatedProfile = await updateUserProfile(userId);

    // Log the deletion for audit purposes
    console.log(`Avatar deletion completed for user ${userId}:`, {
      deletedFiles: avatarKeys.length,
      files: avatarKeys,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${avatarKeys.length} avatar files`,
      profile: updatedProfile,
      deletedFiles: avatarKeys.length
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    
    // Return appropriate error response
    const statusCode = error.message.includes('Unauthorized') ? 401 :
                      error.message.includes('not found') ? 404 :
                      500;

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Avatar deletion failed'
    });
  }
}

/**
 * Helper function to validate user permissions
 * In production, this would check if the user has permission to delete the avatar
 * @param {string} userId - User ID
 * @param {string} targetUserId - Target user ID (for admin operations)
 * @returns {boolean} Whether the user has permission
 */
function hasDeletePermission(userId, targetUserId = null) {
  // For now, users can only delete their own avatars
  return !targetUserId || userId === targetUserId;
}

/**
 * Helper function to create audit log entry
 * In production, this would log to an audit system
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {Object} details - Additional details
 */
function createAuditLog(userId, action, details = {}) {
  const logEntry = {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  };

  console.log('Audit log:', logEntry);
  // In production, save to audit log database/service
}
