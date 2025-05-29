import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Authentication debug endpoint - helps diagnose authentication issues
 * This is a secure endpoint that returns only safe information about the authentication state
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): void {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract cookie info from request
  const cookieHeader = req.headers.cookie || '';

  // Check for auth-related cookies (don't return their values, just status)
  const hasAccessToken = cookieHeader.includes('access_token=');
  const hasIdToken = cookieHeader.includes('id_token=');
  const hasRefreshToken = cookieHeader.includes('refresh_token=');

  // Get cookie names only for debugging
  const cookieNames = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter(Boolean);

  // Return safe debug information
  res.status(200).json({
    authState: {
      hasAccessToken,
      hasIdToken,
      hasRefreshToken,
    },
    cookieNames,
    requestHeaders: {
      host: req.headers.host,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
    },
  });
}
