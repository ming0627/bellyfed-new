import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle user followers
 * GET: Get the current user's followers
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // We'll use a hardcoded user ID for now
  // const userId = req.user?.id || 'user-123';

  // Handle GET request - get user followers
  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Query to get user followers
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
          JOIN users u ON uf.follower_id = u.user_id
          WHERE uf.followed_id = $1
          ORDER BY uf.created_at DESC
        `;

        const result = await client.query(query, ['user-123']);

        const followers = result.rows.map((row: Record<string, unknown>) => ({
          id: row.user_id as string,
          name: row.name as string,
          email: row.email as string,
          bio: (row.bio as string) || '',
          location: (row.location as string) || '',
          avatarUrl: (row.avatar_url as string) || '',
          followedAt: row.followed_at as string,
        }));

        res.status(200).json({ followers });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user followers:', error);
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
