/**
 * Admin Authentication Middleware
 *
 * This middleware provides functions to protect admin routes with authentication
 * and authorization checks. It uses Cognito JWT verification for authentication.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokensFromCookies } from '../utils/serverAuth';

// Define the extended request type with user information
export interface AdminApiRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    email: string;
    name?: string;
    isAdmin: boolean;
  };
}

/**
 * Check if a user is an admin based on environment variables
 *
 * @param 'user-123' User ID to check
 * @param email User email to check
 * @returns Whether the user is an admin
 */
function isAdmin(userId: string, email: string): boolean {
  // Get admin users from environment variable
  const adminUsers = process.env.ADMIN_USERS
    ? process.env.ADMIN_USERS.split(',')
    : [];

  // In development mode, allow all users to be admins if no admin users are specified
  if (process.env.NODE_ENV === 'development' && adminUsers.length === 0) {
    return true;
  }

  // Check if the user ID or email is in the admin list
  return adminUsers.includes(userId) || adminUsers.includes(email);
}

/**
 * Middleware to verify admin access
 *
 * This middleware checks if the user is authenticated and has admin privileges.
 * It can be used to protect admin API routes.
 *
 * @param handler The API route handler
 * @returns The wrapped handler with admin authentication
 */
export function withAdminAuth<T>(
  handler: (
    req: AdminApiRequest,
    res: NextApiResponse<T>,
  ) => Promise<void | NextApiResponse<T>>,
) {
  return async (req: AdminApiRequest, res: NextApiResponse<T>) => {
    try {
      // Check for API secret in header for service-to-service calls
      const apiSecret = req.headers['x-admin-api-secret'];
      if (apiSecret && apiSecret === process.env.ADMIN_API_SECRET) {
        console.log('Admin API access granted via API secret');
        return handler(req, res);
      }

      // Otherwise, check for user session via Cognito tokens
      const cookies = req.cookies;

      // Extract tokens from cookies
      const { accessToken, idToken } = extractTokensFromCookies(
        cookies as { [key: string]: string },
      );

      // If no tokens, user is not authenticated
      if (!accessToken || !idToken) {
        console.log('Admin authentication failed: No tokens found');
        return res
          .status(401)
          .json({ error: 'Unauthorized - Authentication required' } as any);
      }

      // Verify ID token
      const payload = await verifyToken(idToken, 'id');
      if (!payload) {
        console.log('Admin authentication failed: Invalid token');
        return res
          .status(401)
          .json({ error: 'Unauthorized - Invalid token' } as any);
      }

      // Extract user info from token payload
      const userId = payload.sub;
      const email = payload.email;

      // Check if user is an admin
      if (!isAdmin(userId, email)) {
        console.log(
          `Admin authorization failed for user ${email}: Not an admin`,
        );
        return res
          .status(403)
          .json({ error: 'Forbidden - Admin access required' } as any);
      }

      // Add user info to the request
      req.user = {
        id: userId,
        username: payload['cognito:username'] || email,
        email: email,
        name: payload.name,
        isAdmin: true,
      };

      console.log(`Admin access granted for user ${email}`);

      // User is authenticated and has admin privileges
      return handler(req, res);
    } catch (error: unknown) {
      console.error('Admin authentication error:', error);
      return res.status(500).json({
        error: 'Internal server error during authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as any);
    }
  };
}

/**
 * Middleware to verify admin access for API routes
 *
 * This middleware checks if the request has a valid admin API secret.
 * It's designed for service-to-service API calls.
 *
 * @param handler The API route handler
 * @returns The wrapped handler with API authentication
 */
export function withAdminApiAuth<T>(
  handler: (
    req: AdminApiRequest,
    res: NextApiResponse<T>,
  ) => Promise<void | NextApiResponse<T>>,
) {
  return async (req: AdminApiRequest, res: NextApiResponse<T>) => {
    try {
      const apiSecret = req.headers['x-admin-api-secret'];

      if (!apiSecret || apiSecret !== process.env.ADMIN_API_SECRET) {
        console.log(
          'Admin API authentication failed: Invalid or missing API secret',
        );
        return res
          .status(401)
          .json({ error: 'Unauthorized - Valid API secret required' } as any);
      }

      console.log('Admin API access granted via API secret');

      // API secret is valid
      return handler(req, res);
    } catch (error: unknown) {
      console.error('Admin API authentication error:', error);
      return res.status(500).json({
        error: 'Internal server error during authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as any);
    }
  };
}
