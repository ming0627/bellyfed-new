import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { getApiUrl } from '@/utils/apiConfig';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to proxy requests to the backend API for unfollowing users
 * DELETE: Unfollow a user
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Handle DELETE request - unfollow a user
  if (req.method === 'DELETE') {
    try {
      const { targetUserId } = req.query;
      const apiUrl = getApiUrl();
      const apiKey = process.env.API_KEY || '';

      // Make request to backend API
      const response = await fetch(
        `${apiUrl}/users/unfollow?targetUserId=${targetUserId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1] || ''}`,
          },
        },
      );

      // Get response data
      const data = await response.json();

      // Return response
      res.status(response.status).json(data);
      return;
    } catch (error: unknown) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
}

// Protect this API route with server-side authentication
export default withApiAuth(handler);
