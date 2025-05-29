import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to get global rankings for a dish
 * GET: Get global rankings for a dish
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  const { dishSlug } = req.query;

  if (!dishSlug || Array.isArray(dishSlug)) {
    res.status(400).json({ error: 'Invalid dish slug' });
    return;
  }

  // Handle GET request - get global rankings for a dish
  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Get dish ID from slug
        const dishQuery = `
          SELECT dish_id FROM dishes WHERE slug = $1
        `;
        const dishResult = await client.query(dishQuery, [dishSlug]);

        if (dishResult.rows.length === 0) {
          res.status(404).json({ error: 'Dish not found' });
          return;
        }

        const dishId = (dishResult.rows[0] as any).dish_id;

        // Get dish details
        const dishDetailsQuery = `
          SELECT
            d.dish_id,
            d.name,
            d.description,
            d.category,
            d.image_url,
            d.is_vegetarian,
            d.spicy_level,
            d.price,
            d.country_code
          FROM dishes d
          WHERE d.dish_id = $1
        `;

        const dishDetailsResult = await client.query(dishDetailsQuery, [
          dishId,
        ]);

        if (dishDetailsResult.rows.length === 0) {
          res.status(404).json({ error: 'Dish details not found' });
          return;
        }

        const dishDetails = dishDetailsResult.rows[0] as any;

        // Get global rankings
        const rankingsQuery = `
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
            u.name as user_name,
            u.avatar_url as user_avatar,
            u.country_code as user_country_code,
            r.name as restaurant_name
          FROM dish_rankings dr
          JOIN users u ON dr.user_id = u.user_id
          JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
          WHERE dr.dish_id = $1
          ORDER BY dr.rank ASC, dr.updated_at DESC
          LIMIT 50
        `;

        const rankingsResult = await client.query(rankingsQuery, [dishId]);

        // Get ranking statistics
        const statsQuery = `
          SELECT
            COUNT(*) as total_rankings,
            AVG(rank) as average_rank,
            COUNT(*) FILTER (WHERE rank = 1) as rank_1_count,
            COUNT(*) FILTER (WHERE rank = 2) as rank_2_count,
            COUNT(*) FILTER (WHERE rank = 3) as rank_3_count,
            COUNT(*) FILTER (WHERE rank = 4) as rank_4_count,
            COUNT(*) FILTER (WHERE rank = 5) as rank_5_count,
            COUNT(*) FILTER (WHERE taste_status = 'ACCEPTABLE') as acceptable_count,
            COUNT(*) FILTER (WHERE taste_status = 'SECOND_CHANCE') as second_chance_count,
            COUNT(*) FILTER (WHERE taste_status = 'DISSATISFIED') as dissatisfied_count
          FROM dish_rankings
          WHERE dish_id = $1
        `;

        const statsResult = await client.query(statsQuery, [dishId]);
        const stats = statsResult.rows[0] as any;

        // Get top restaurants for this dish globally
        const restaurantsQuery = `
          SELECT
            r.restaurant_id,
            r.name,
            COUNT(*) as ranking_count,
            AVG(dr.rank) as average_rank
          FROM dish_rankings dr
          JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
          WHERE dr.dish_id = $1
          GROUP BY r.restaurant_id, r.name
          ORDER BY average_rank ASC, ranking_count DESC
          LIMIT 5
        `;

        const restaurantsResult = await client.query(restaurantsQuery, [
          dishId,
        ]);

        // Get country distribution
        const countriesQuery = `
          SELECT
            u.country_code,
            COUNT(*) as ranking_count
          FROM dish_rankings dr
          JOIN users u ON dr.user_id = u.user_id
          WHERE dr.dish_id = $1
          GROUP BY u.country_code
          ORDER BY ranking_count DESC
          LIMIT 10
        `;

        const countriesResult = await client.query(countriesQuery, [dishId]);

        const rankings = rankingsResult.rows.map(
          (row: Record<string, unknown>) => ({
            id: row.ranking_id as string,
            userId: row.user_id as string,
            userName: row.user_name as string,
            userAvatar: row.user_avatar as string,
            userCountryCode: row.user_country_code as string,
            dishId: row.dish_id as string,
            restaurantId: row.restaurant_id as string,
            restaurantName: row.restaurant_name as string,
            dishType: row.dish_type as string,
            rank: row.rank as number,
            tasteStatus: row.taste_status as string,
            notes: row.notes as string,
            photoUrls: (row.photo_urls as string[]) || [],
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
          }),
        );

        const topRestaurants = restaurantsResult.rows.map(
          (row: Record<string, unknown>) => ({
            id: row.restaurant_id as string,
            name: row.name as string,
            rankingCount: parseInt(row.ranking_count as string),
            averageRank: parseFloat(row.average_rank as string),
          }),
        );

        const countryDistribution = countriesResult.rows.map(
          (row: Record<string, unknown>) => ({
            countryCode: row.country_code as string,
            rankingCount: parseInt(row.ranking_count as string),
          }),
        );

        res.status(200).json({
          dishId: dishDetails.dish_id,
          dishName: dishDetails.name,
          dishDescription: dishDetails.description || '',
          dishCategory: dishDetails.category,
          rankings,
          stats: {
            totalRankings: parseInt(stats.total_rankings) || 0,
            averageRank: parseFloat(stats.average_rank) || 0,
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
          topRestaurants,
          countryDistribution,
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching global rankings:', error);
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
