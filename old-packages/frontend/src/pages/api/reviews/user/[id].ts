import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to get reviews by a specific user
 * GET: Get reviews by a specific user
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const targetUserId = id;

  // Handle GET request - get reviews by a specific user
  if (req.method === 'GET') {
    try {
      const { limit = '10', offset = '0' } = req.query;

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Check if user exists
        const userCheckQuery = `
          SELECT user_id FROM users WHERE user_id = $1
        `;
        const userCheckResult = await client.query(userCheckQuery, [
          targetUserId,
        ]);

        if (userCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        // Get reviews by user
        const query = `
          SELECT
            r.review_id,
            r.restaurant_id,
            r.user_id,
            r.rating,
            r.text,
            r.visit_status,
            r.created_at,
            r.updated_at,
            rest.name as restaurant_name,
            rest.address as restaurant_address,
            rest.cuisine_type as restaurant_cuisine,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.review_id) as likes_count
          FROM reviews r
          JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
          WHERE r.user_id = $1
          ORDER BY r.created_at DESC
          LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, [
          targetUserId,
          parseInt(limit as string),
          parseInt(offset as string),
        ]);

        const reviews = result.rows.map((row: Record<string, unknown>) => ({
          id: row.review_id as string,
          restaurantId: row.restaurant_id as string,
          restaurantName: row.restaurant_name as string,
          restaurantAddress: row.restaurant_address as string,
          restaurantCuisine: row.restaurant_cuisine as string,
          userId: row.user_id as string,
          rating: row.rating as number,
          text: row.text as string,
          visitStatus: row.visit_status as string,
          likesCount: parseInt(row.likes_count as string),
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }));

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total FROM reviews WHERE user_id = $1
        `;
        const countResult = await client.query(countQuery, [targetUserId]);
        const total = parseInt((countResult.rows[0] as any).total);

        res.status(200).json({
          reviews,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user reviews:', error);
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
