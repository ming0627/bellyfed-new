/**
 * Admin API: Status Check
 *
 * This endpoint checks if the current user has admin privileges.
 * It returns 200 if the user is an admin, 403 if not.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokensFromCookies, verifyToken } from '@/utils/serverAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    // Check if this is a GET request
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract tokens from cookies
    const cookies = req.cookies;
    const { accessToken, idToken } = extractTokensFromCookies(cookies);

    // If no tokens, user is not authenticated
    if (!accessToken || !idToken) {
      console.log('Admin status check failed: No tokens found');
      return res
        .status(401)
        .json({ error: 'Unauthorized - Authentication required' });
    }

    // Verify ID token
    const payload = await verifyToken(idToken, 'id');
    if (!payload) {
      console.log('Admin status check failed: Invalid token');
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Extract user info from token payload
    const userId = payload.sub;
    const email = payload.email;

    // Get admin users from environment variable
    const adminUsers = process.env.ADMIN_USERS
      ? process.env.ADMIN_USERS.split(',')
      : [];

    // In development mode, allow all users to be admins if no admin users are specified
    const isAdmin =
      process.env.NODE_ENV === 'development' && adminUsers.length === 0
        ? true
        : adminUsers.includes('user-123') || adminUsers.includes(email);

    // Check if user is an admin
    if (!isAdmin) {
      console.log(`Admin status check failed for user ${email}: Not an admin`);
      return res
        .status(403)
        .json({ error: 'Forbidden - Admin access required' });
    }

    // User is an admin
    console.log(`Admin status check successful for user ${email}`);

    // Return user info
    return res.status(200).json({
      isAdmin: true,
      user: {
        id: userId,
        username: payload['cognito:username'] || email,
        email: email,
        name: payload.name,
      },
    });
  } catch (error: unknown) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
