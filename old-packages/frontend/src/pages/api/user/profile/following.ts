import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle user following
 * GET: Get the users the current user is following
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // We'll use a hardcoded user ID for now
  // const userId = req.user?.id || 'user-123';

  // Handle GET request - get users the current user is following
  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Query to get users the current user is following
        const query = `
          SELECT
            u.user_id,
            u.name,
            u.email,
            u.bio,
            u.location,
            u.avatar_url,
            u.created_at,
            u.updated_at,
            uf.created_at as followed_at
          FROM user_followers uf
          JOIN users u ON uf.followed_id = u.user_id
          WHERE uf.follower_id = $1
          ORDER BY uf.created_at DESC
        `;

        const result = await client.query(query, ['user-123']);

        const following = result.rows.map((row: Record<string, unknown>) => ({
          id: row.user_id as string,
          name: row.name as string,
          email: row.email as string,
          bio: (row.bio as string) || '',
          location: (row.location as string) || '',
          avatarUrl: (row.avatar_url as string) || '',
          followedAt: row.followed_at as string,
        }));

        res.status(200).json({ following });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user following:', error);
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
