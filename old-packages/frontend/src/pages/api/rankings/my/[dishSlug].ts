import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '@/utils/types';

// Define interfaces for user dish rankings
interface UserDishRanking {
  ranking_id: string;
  user_id: string;
  dish_id: string;
  restaurant_id: string;
  dish_type: string;
  rank: number | null;
  taste_status: string | null;
  notes: string;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

interface DishDetails {
  dish_id: string;
  name: string;
  description: string;
  restaurant_id: string;
  restaurant_name: string;
  category: string;
  image_url: string;
  is_vegetarian: boolean;
  spicy_level: number;
  price: number;
  country_code: string;
}

interface RankingStats {
  total_rankings: number;
  average_rank: number;
  ranks: Record<string, number>;
  taste_statuses: Record<string, number>;
}

interface UserDishRankingResponse {
  userRanking: UserDishRanking | null;
  dishDetails: DishDetails;
  rankingStats: RankingStats;
}

/**
 * API endpoint to handle user rankings for a specific dish
 * This endpoint returns a user's ranking for a specific dish
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id;
  const dishSlug = req.query.dishSlug as string;
  const dishId = req.query.dishId as string;

  if (!dishSlug && !dishId) {
    res.status(400).json({ error: 'Dish slug or ID is required' });
    return;
  }

  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Get dish ID from slug if not provided
        let targetDishId = dishId;

        if (!targetDishId) {
          const dishQuery = `
            SELECT dish_id FROM dishes WHERE slug = $1
          `;
          const dishResult = await client.query(dishQuery, [dishSlug]);

          if (dishResult.rows.length === 0) {
            res.status(404).json({ error: 'Dish not found' });
            return;
          }

          targetDishId = (dishResult.rows[0] as any).dish_id;
        }

        // Query to get user ranking for the dish
        const rankingQuery = `
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
            dr.updated_at
          FROM dish_rankings dr
          WHERE dr.user_id = $1 AND dr.dish_id = $2
        `;

        const rankingResult = await client.query(rankingQuery, [
          userId,
          targetDishId,
        ]);

        // Query to get dish details
        const dishQuery = `
          SELECT
            d.dish_id,
            d.name,
            d.description,
            d.category,
            d.image_url,
            d.is_vegetarian,
            d.spicy_level,
            d.price,
            d.country_code,
            r.restaurant_id,
            r.name as restaurant_name
          FROM dishes d
          LEFT JOIN restaurants r ON d.restaurant_id = r.restaurant_id
          WHERE d.dish_id = $1
        `;

        const dishResult = await client.query(dishQuery, [targetDishId]);

        if (dishResult.rows.length === 0) {
          res.status(404).json({ error: 'Dish not found' });
          return;
        }

        // Query to get ranking statistics
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

        const statsResult = await client.query(statsQuery, [targetDishId]);

        const dishDetails = dishResult.rows[0] as any;
        const stats = statsResult.rows[0] as any;

        const response: UserDishRankingResponse = {
          userRanking:
            rankingResult.rows.length > 0 ? rankingResult.rows[0] : null,
          dishDetails: {
            dish_id: dishDetails.dish_id,
            name: dishDetails.name,
            description: dishDetails.description || '',
            restaurant_id: dishDetails.restaurant_id,
            restaurant_name: dishDetails.restaurant_name,
            category: dishDetails.category,
            image_url: dishDetails.image_url || '',
            is_vegetarian: dishDetails.is_vegetarian || false,
            spicy_level: dishDetails.spicy_level || 0,
            price: dishDetails.price || 0,
            country_code: dishDetails.country_code || 'my',
          },
          rankingStats: {
            total_rankings: parseInt(stats.total_rankings) || 0,
            average_rank: parseFloat(stats.average_rank) || 0,
            ranks: {
              '1': parseInt(stats.rank_1_count) || 0,
              '2': parseInt(stats.rank_2_count) || 0,
              '3': parseInt(stats.rank_3_count) || 0,
              '4': parseInt(stats.rank_4_count) || 0,
              '5': parseInt(stats.rank_5_count) || 0,
            },
            taste_statuses: {
              ACCEPTABLE: parseInt(stats.acceptable_count) || 0,
              SECOND_CHANCE: parseInt(stats.second_chance_count) || 0,
              DISSATISFIED: parseInt(stats.dissatisfied_count) || 0,
            },
          },
        };

        res.status(200).json(response);
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user dish ranking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res
        .status(500)
        .json({ error: 'Internal server error', details: errorMessage });
      return;
    }
  } else if (req.method === 'POST') {
    try {
      const {
        dishId: bodyDishId,
        restaurantId,
        restaurantName,
        dishType,
        rank,
        tasteStatus,
        notes,
        photoUrls,
      } = req.body;

      if (!bodyDishId || !restaurantId) {
        res
          .status(400)
          .json({ error: 'Dish ID and restaurant ID are required' });
        return;
      }

      // Validate that either rank or tasteStatus is provided, but not both
      if (
        (rank !== null && tasteStatus !== null) ||
        (rank === null && tasteStatus === null)
      ) {
        res.status(400).json({
          error:
            'A ranking must have either a rank or a taste status, but not both',
        });
        return;
      }

      // Validate rank range
      if (rank !== null && (rank < 1 || rank > 5)) {
        res.status(400).json({
          error: 'Rank must be between 1 and 5',
        });
        return;
      }

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Begin transaction
        await client.query('BEGIN');

        // Check if dish exists
        const dishQuery = `
          SELECT * FROM dishes WHERE dish_id = $1
        `;
        const dishResult = await client.query(dishQuery, [bodyDishId]);

        if (dishResult.rows.length === 0) {
          // If dish doesn't exist, create it
          const createDishQuery = `
            INSERT INTO dishes (dish_id, name, slug, category)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
          await client.query(createDishQuery, [
            bodyDishId,
            dishSlug.toString().replace(/-/g, ' '),
            dishSlug.toString(),
            dishType || 'Other',
          ]);
        }

        // Check if restaurant exists
        const restaurantQuery = `
          SELECT * FROM restaurants WHERE restaurant_id = $1
        `;
        const restaurantResult = await client.query(restaurantQuery, [
          restaurantId,
        ]);

        if (restaurantResult.rows.length === 0) {
          // If restaurant doesn't exist, create it
          const createRestaurantQuery = `
            INSERT INTO restaurants (restaurant_id, name)
            VALUES ($1, $2)
            RETURNING *
          `;
          await client.query(createRestaurantQuery, [
            restaurantId,
            restaurantName || 'Unknown Restaurant',
          ]);
        }

        // Check if ranking already exists
        const rankingCheckQuery = `
          SELECT * FROM dish_rankings
          WHERE user_id = $1 AND dish_id = $2
        `;
        const rankingCheckResult = await client.query(rankingCheckQuery, [
          userId,
          bodyDishId,
        ]);

        if (rankingCheckResult.rows.length > 0) {
          await client.query('ROLLBACK');
          res
            .status(400)
            .json({ error: 'Ranking already exists for this dish' });
          return;
        }

        // Create new ranking
        const rankingId = uuidv4();
        const insertQuery = `
          INSERT INTO dish_rankings (
            ranking_id, user_id, dish_id, restaurant_id, dish_type,
            rank, taste_status, notes, photo_urls, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING *
        `;

        const result = await client.query(insertQuery, [
          rankingId,
          userId,
          bodyDishId,
          restaurantId,
          dishType || 'Other',
          rank,
          tasteStatus,
          notes || '',
          photoUrls || [],
        ]);

        // Commit transaction
        await client.query('COMMIT');

        const newRanking = result.rows[0] as any;

        res.status(201).json({
          success: true,
          message: 'Ranking created successfully',
          userRanking: {
            ranking_id: newRanking.ranking_id,
            user_id: newRanking.user_id,
            dish_id: newRanking.dish_id,
            restaurant_id: newRanking.restaurant_id,
            dish_type: newRanking.dish_type,
            rank: newRanking.rank,
            taste_status: newRanking.taste_status,
            notes: newRanking.notes,
            photo_urls: newRanking.photo_urls || [],
            created_at: newRanking.created_at,
            updated_at: newRanking.updated_at,
          },
        });
        return;
      } catch (error: unknown) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error creating ranking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res
        .status(500)
        .json({ error: 'Internal server error', details: errorMessage });
      return;
    }
  } else if (req.method === 'PUT') {
    try {
      const { rank, tasteStatus, notes, photoUrls } = req.body;

      // Validate that either rank or tasteStatus is provided, but not both
      if (
        (rank !== null && tasteStatus !== null) ||
        (rank === null && tasteStatus === null)
      ) {
        res.status(400).json({
          error:
            'A ranking must have either a rank or a taste status, but not both',
        });
        return;
      }

      // Validate rank range
      if (rank !== null && (rank < 1 || rank > 5)) {
        res.status(400).json({
          error: 'Rank must be between 1 and 5',
        });
        return;
      }

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

        const targetDishId = (dishResult.rows[0] as any).dish_id;

        // Check if ranking exists
        const rankingCheckQuery = `
          SELECT * FROM dish_rankings
          WHERE user_id = $1 AND dish_id = $2
        `;
        const rankingCheckResult = await client.query(rankingCheckQuery, [
          userId,
          targetDishId,
        ]);

        if (rankingCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'Ranking not found' });
          return;
        }

        // Update ranking
        const updateQuery = `
          UPDATE dish_rankings
          SET
            rank = COALESCE($1, rank),
            taste_status = COALESCE($2, taste_status),
            notes = COALESCE($3, notes),
            photo_urls = COALESCE($4, photo_urls),
            updated_at = NOW()
          WHERE user_id = $5 AND dish_id = $6
          RETURNING *
        `;

        const result = await client.query(updateQuery, [
          rank,
          tasteStatus,
          notes,
          photoUrls,
          userId,
          targetDishId,
        ]);

        const updatedRanking = result.rows[0] as any;

        res.status(200).json({
          success: true,
          message: 'Ranking updated successfully',
          userRanking: {
            ranking_id: updatedRanking.ranking_id,
            user_id: updatedRanking.user_id,
            dish_id: updatedRanking.dish_id,
            restaurant_id: updatedRanking.restaurant_id,
            dish_type: updatedRanking.dish_type,
            rank: updatedRanking.rank,
            taste_status: updatedRanking.taste_status,
            notes: updatedRanking.notes,
            photo_urls: updatedRanking.photo_urls || [],
            created_at: updatedRanking.created_at,
            updated_at: updatedRanking.updated_at,
          },
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error updating ranking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res
        .status(500)
        .json({ error: 'Internal server error', details: errorMessage });
      return;
    }
  } else if (req.method === 'DELETE') {
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

        const targetDishId = (dishResult.rows[0] as any).dish_id;

        // Delete ranking
        const deleteQuery = `
          DELETE FROM dish_rankings
          WHERE user_id = $1 AND dish_id = $2
          RETURNING *
        `;

        const result = await client.query(deleteQuery, [userId, targetDishId]);

        if (result.rowCount === 0) {
          res.status(404).json({ error: 'Ranking not found' });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Ranking deleted successfully',
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error deleting user dish ranking:', error);
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
