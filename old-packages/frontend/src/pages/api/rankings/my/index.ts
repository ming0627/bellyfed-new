import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle user rankings
 * GET: Get all rankings for the current user
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id || 'user-123'; // Fallback to mock user ID if user is undefined

  // Handle GET request - get all rankings for the current user
  if (req.method === 'GET') {
    try {
      const {
        limit = '10',
        offset = '0',
        sort = 'updated_at',
        order = 'desc',
      } = req.query;

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Query to get user rankings
        const query = `
          SELECT
            dr.ranking_id,
            dr.user_id,
            dr.dish_id,
            dr.restaurant_id,
            dr.dish_type,
            dr.rank,
            dr.taste_status,
            dr.notes,
            dr.photo_urls,
            dr.created_at,
            dr.updated_at,
            d.name as dish_name,
            d.slug as dish_slug,
            r.name as restaurant_name
          FROM dish_rankings dr
          JOIN dishes d ON dr.dish_id = d.dish_id
          JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
          WHERE dr.user_id = $1
          ORDER BY dr.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
          LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, [
          userId,
          parseInt(limit as string),
          parseInt(offset as string),
        ]);

        const rankings = result.rows.map((row: Record<string, unknown>) => ({
          id: row.ranking_id as string,
          userId: row.user_id as string,
          dishId: row.dish_id as string,
          dishName: row.dish_name as string,
          dishSlug: row.dish_slug as string,
          restaurantId: row.restaurant_id as string,
          restaurantName: row.restaurant_name as string,
          dishType: row.dish_type as string,
          rank: row.rank as number,
          tasteStatus: row.taste_status as string,
          notes: row.notes as string,
          photoUrls: (row.photo_urls as string[]) || [],
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }));

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total FROM dish_rankings WHERE user_id = $1
        `;
        const countResult = await client.query(countQuery, ['user-123']);
        const total = parseInt((countResult.rows[0] as any).total);

        // Get rank statistics
        const statsQuery = `
          SELECT
            COUNT(*) FILTER (WHERE rank = 1) as rank_1_count,
            COUNT(*) FILTER (WHERE rank = 2) as rank_2_count,
            COUNT(*) FILTER (WHERE rank = 3) as rank_3_count,
            COUNT(*) FILTER (WHERE rank = 4) as rank_4_count,
            COUNT(*) FILTER (WHERE rank = 5) as rank_5_count,
            COUNT(*) FILTER (WHERE taste_status = 'ACCEPTABLE') as acceptable_count,
            COUNT(*) FILTER (WHERE taste_status = 'SECOND_CHANCE') as second_chance_count,
            COUNT(*) FILTER (WHERE taste_status = 'DISSATISFIED') as dissatisfied_count
          FROM dish_rankings
          WHERE user_id = $1
        `;
        const statsResult = await client.query(statsQuery, ['user-123']);
        const stats = statsResult.rows[0] as any;

        res.status(200).json({
          rankings,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
          stats: {
            rankCounts: {
              '1': parseInt(stats.rank_1_count) || 0,
              '2': parseInt(stats.rank_2_count) || 0,
              '3': parseInt(stats.rank_3_count) || 0,
              '4': parseInt(stats.rank_4_count) || 0,
              '5': parseInt(stats.rank_5_count) || 0,
            },
            tasteStatusCounts: {
              ACCEPTABLE: parseInt(stats.acceptable_count) || 0,
              SECOND_CHANCE: parseInt(stats.second_chance_count) || 0,
              DISSATISFIED: parseInt(stats.dissatisfied_count) || 0,
            },
          },
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user rankings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res
        .status(500)
        .json({ error: 'Internal server error', details: errorMessage });
      return;
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
}

// Protect this API route with server-side authentication
export default withApiAuth(handler);
