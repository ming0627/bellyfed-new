/**
 * API Route: Admin Status Check
 * 
 * This API route checks if the current user has admin privileges
 * and returns admin-specific system information.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for admin status API endpoint
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
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Check if user has admin privileges
    const isAdmin = session.user.isAdmin || false;
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required'
      });
    }

    // Get system information for admin users
    const systemInfo = {
      server: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        status: 'connected', // This would be checked in a real implementation
        connectionPool: {
          active: 5, // Mock data - would be real in implementation
          idle: 10,
          total: 15
        }
      },
      cache: {
        status: 'connected', // This would be checked in a real implementation
        hitRate: 0.85, // Mock data
        memoryUsage: '256MB'
      },
      services: {
        aws: {
          status: 'connected',
          region: process.env.AWS_REGION || 'us-east-1'
        },
        cognito: {
          status: 'connected',
          userPoolId: process.env.COGNITO_USER_POOL_ID || 'masked'
        },
        s3: {
          status: 'connected',
          bucket: process.env.S3_BUCKET_NAME || 'masked'
        }
      },
      features: {
        photoUpload: true,
        emailNotifications: true,
        analytics: true,
        search: true,
        recommendations: true
      }
    };

    // Return admin status and system information
    res.status(200).json({
      success: true,
      data: {
        isAdmin: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role || 'admin'
        },
        permissions: {
          createRestaurants: true,
          manageUsers: true,
          viewAnalytics: true,
          moderateContent: true,
          systemSettings: true
        },
        system: systemInfo,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    
    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check admin status'
    });
  }
}
