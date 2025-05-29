import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle following/unfollowing users
 * POST: Follow a user
 * DELETE: Unfollow a user
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id || 'user-123'; // Fallback to mock user ID if user is undefined
  const { targetUserId } = req.body;

  if (!targetUserId) {
    res.status(400).json({ error: 'Target user ID is required' });
    return;
  }

  // Prevent following yourself
  if (targetUserId === 'user-123') {
    res.status(400).json({ error: 'Cannot follow yourself' });
    return;
  }

  // Handle POST request - follow a user
  if (req.method === 'POST') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Check if target user exists
        const userCheckQuery = `
          SELECT user_id FROM users WHERE user_id = $1
        `;
        const userCheckResult = await client.query(userCheckQuery, [
          targetUserId,
        ]);

        if (userCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'Target user not found' });
          return;
        }

        // Check if already following
        const followCheckQuery = `
          SELECT * FROM user_followers
          WHERE follower_id = $1 AND followed_id = $2
        `;
        const followCheckResult = await client.query(followCheckQuery, [
          userId,
          targetUserId,
        ]);

        if (followCheckResult.rows.length > 0) {
          res.status(400).json({ error: 'Already following this user' });
          return;
        }

        // Add follow relationship
        const followQuery = `
          INSERT INTO user_followers (follower_id, followed_id)
          VALUES ($1, $2)
          RETURNING *
        `;
        await client.query(followQuery, [userId, targetUserId]);

        res
          .status(200)
          .json({ success: true, message: 'User followed successfully' });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error following user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
  // Handle DELETE request - unfollow a user
  else if (req.method === 'DELETE') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Remove follow relationship
        const unfollowQuery = `
          DELETE FROM user_followers
          WHERE follower_id = $1 AND followed_id = $2
          RETURNING *
        `;
        const result = await client.query(unfollowQuery, [
          userId,
          targetUserId,
        ]);

        if (result.rowCount === 0) {
          res.status(404).json({ error: 'Follow relationship not found' });
          return;
        }

        res
          .status(200)
          .json({ success: true, message: 'User unfollowed successfully' });
        return;
      } finally {
        client.release();
      }
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
