import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle user profile operations
 * GET: Get the current user's profile
 * PUT: Update the current user's profile
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id || 'user-123'; // Fallback to mock user ID if user is undefined

  // Handle GET request - get user profile
  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Query to get user profile
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
            (SELECT COUNT(*) FROM dish_rankings WHERE user_id = $1) as total_rankings,
            (SELECT COUNT(*) FROM user_followers WHERE followed_id = $1) as followers_count,
            (SELECT COUNT(*) FROM user_followers WHERE follower_id = $1) as following_count
          FROM users u
          WHERE u.user_id = $1
        `;

        const result = await client.query(query, ['user-123']);

        // If user not found, return 404
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = result.rows[0] as any;

        res.status(200).json({
          id: userProfile.user_id,
          name: userProfile.name,
          email: userProfile.email,
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          avatarUrl: userProfile.avatar_url || '',
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
          stats: {
            totalRankings: parseInt(userProfile.total_rankings) || 0,
            followers: parseInt(userProfile.followers_count) || 0,
            following: parseInt(userProfile.following_count) || 0,
          },
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
  // Handle PUT request - update user profile
  else if (req.method === 'PUT') {
    try {
      const { name, bio, location, avatarUrl } = req.body;

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Query to update user profile
        const query = `
          UPDATE users
          SET
            name = COALESCE($2, name),
            bio = COALESCE($3, bio),
            location = COALESCE($4, location),
            avatar_url = COALESCE($5, avatar_url),
            updated_at = NOW()
          WHERE user_id = $1
          RETURNING *
        `;

        const result = await client.query(query, [
          userId,
          name,
          bio,
          location,
          avatarUrl,
        ]);

        // If user not found, return 404
        if (result.rows.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        const updatedProfile = result.rows[0] as any;

        res.status(200).json({
          id: updatedProfile.user_id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          bio: updatedProfile.bio || '',
          location: updatedProfile.location || '',
          avatarUrl: updatedProfile.avatar_url || '',
          createdAt: updatedProfile.created_at,
          updatedAt: updatedProfile.updated_at,
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);
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
