/**
 * API Route: Admin User Management
 * 
 * This API route allows administrators to manage user accounts.
 * It supports viewing, updating, and deactivating user accounts.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { userProfileService } from '../../../../services/userProfileService.js';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for admin user management API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetUser(req, res);
    case 'PUT':
      return handleUpdateUser(req, res);
    case 'DELETE':
      return handleDeactivateUser(req, res);
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET, PUT, and DELETE requests are supported'
      });
  }
}

/**
 * Handle GET request to retrieve user details
 */
async function handleGetUser(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to manage users'
      });
    }

    const { id } = req.query;

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Get user details with admin-level information
    const user = await userProfileService.getUserProfile(id, {
      includeStats: true,
      includeActivity: true,
      includePrivateInfo: true,
      adminView: true
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error retrieving user for admin:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user details'
    });
  }
}

/**
 * Handle PUT request to update user details
 */
async function handleUpdateUser(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to manage users'
      });
    }

    const { id } = req.query;
    const {
      name,
      email,
      isActive,
      isVerified,
      role,
      permissions,
      notes
    } = req.body;

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Validate at least one field is provided for update
    if (!name && !email && isActive === undefined && isVerified === undefined && 
        !role && !permissions && !notes) {
      return res.status(400).json({
        error: 'No update data provided',
        message: 'At least one field must be provided for update'
      });
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1)) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be a non-empty string'
      });
    }

    // Validate email if provided
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Email must be a valid email address'
      });
    }

    // Validate boolean fields
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid isActive field',
        message: 'isActive must be a boolean'
      });
    }

    if (isVerified !== undefined && typeof isVerified !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid isVerified field',
        message: 'isVerified must be a boolean'
      });
    }

    // Validate role if provided
    if (role !== undefined) {
      const validRoles = ['user', 'moderator', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: `Role must be one of: ${validRoles.join(', ')}`
        });
      }
    }

    // Validate permissions if provided
    if (permissions !== undefined && typeof permissions !== 'object') {
      return res.status(400).json({
        error: 'Invalid permissions',
        message: 'Permissions must be an object'
      });
    }

    // Validate notes if provided
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000)) {
      return res.status(400).json({
        error: 'Invalid notes',
        message: 'Notes must be a string with maximum 1000 characters'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (role !== undefined) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (notes !== undefined) updateData.adminNotes = notes;

    // Add admin metadata
    updateData.lastModifiedBy = session.user.id;
    updateData.lastModifiedAt = new Date();

    // Update user
    const updatedUser = await userProfileService.updateUserProfile(id, updateData, {
      adminUpdate: true
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle specific error types
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    if (error.message === 'Email already exists') {
      return res.status(409).json({
        error: 'Email conflict',
        message: 'Email address is already in use'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user'
    });
  }
}

/**
 * Handle DELETE request to deactivate user
 */
async function handleDeactivateUser(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to deactivate users'
      });
    }

    const { id } = req.query;
    const { reason } = req.body;

    // Validate user ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID is required and must be a string'
      });
    }

    // Prevent self-deactivation
    if (id === session.user.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot deactivate your own account'
      });
    }

    // Validate reason if provided
    if (reason && (typeof reason !== 'string' || reason.length > 500)) {
      return res.status(400).json({
        error: 'Invalid reason',
        message: 'Reason must be a string with maximum 500 characters'
      });
    }

    // Deactivate user
    await userProfileService.deactivateUser(id, {
      reason: reason || 'Deactivated by admin',
      deactivatedBy: session.user.id,
      deactivatedAt: new Date()
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    
    // Handle specific error types
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    if (error.message === 'User already deactivated') {
      return res.status(409).json({
        error: 'User already deactivated',
        message: 'The user is already deactivated'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to deactivate user'
    });
  }
}
