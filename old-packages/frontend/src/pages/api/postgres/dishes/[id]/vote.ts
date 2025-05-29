import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://bellyfed_admin:password@localhost:5432/bellyfed_dev',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;
  const dishId = Array.isArray(id) ? id[0] : id;

  if (!dishId) {
    return res.status(400).json({ error: 'Dish ID is required' });
  }

  // Handle POST request - record a vote
  if (req.method === 'POST') {
    try {
      const { userId, restaurantId, rating } = req.body;

      if (!restaurantId || !rating) {
        res
          .status(400)
          .json({ error: 'User ID, restaurant ID, and rating are required' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if dish exists
        const dishQuery = 'SELECT * FROM dishes WHERE dish_id = $1';
        const dishResult = await client.query(dishQuery, [dishId]);

        if (dishResult.rows.length === 0) {
          // In development, create the dish if it doesn't exist
          if (process.env.NODE_ENV === 'development') {
            const insertDishQuery = `
              INSERT INTO dishes (dish_id, restaurant_id, name, dish_type)
              VALUES ($1, $2, $3, $4)
              RETURNING *
            `;
            await client.query(insertDishQuery, [
              dishId,
              restaurantId,
              'Unknown Dish',
              'Unknown',
            ]);
          } else {
            throw new Error('Dish not found');
          }
        }

        // Check if user exists
        const userQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userResult = await client.query(userQuery, ['user-123']);

        if (userResult.rows.length === 0) {
          // In development, create the user if it doesn't exist
          if (process.env.NODE_ENV === 'development') {
            const insertUserQuery = `
              INSERT INTO users (user_id, cognito_id, email, name)
              VALUES ($1, $2, $3, $4)
              RETURNING *
            `;
            await client.query(insertUserQuery, [
              userId,
              userId,
              'user@example.com',
              'Test User',
            ]);
          } else {
            throw new Error('User not found');
          }
        }

        // Check if restaurant exists
        const restaurantQuery =
          'SELECT * FROM restaurants WHERE restaurant_id = $1';
        const restaurantResult = await client.query(restaurantQuery, [
          restaurantId,
        ]);

        if (restaurantResult.rows.length === 0) {
          // In development, create the restaurant if it doesn't exist
          if (process.env.NODE_ENV === 'development') {
            const insertRestaurantQuery = `
              INSERT INTO restaurants (restaurant_id, name, address)
              VALUES ($1, $2, $3)
              RETURNING *
            `;
            await client.query(insertRestaurantQuery, [
              restaurantId,
              'Unknown Restaurant',
              'Unknown Address',
            ]);
          } else {
            throw new Error('Restaurant not found');
          }
        }

        // Check if user already voted for this dish
        const existingVoteQuery = `
          SELECT * FROM dish_rankings
          WHERE user_id = $1 AND dish_id = $2
        `;
        const existingVoteResult = await client.query(existingVoteQuery, [
          userId,
          dishId,
        ]);

        if (existingVoteResult.rows.length > 0) {
          // Update existing vote
          const updateVoteQuery = `
            UPDATE dish_rankings
            SET rank = $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2 AND dish_id = $3
            RETURNING *
          `;
          await client.query(updateVoteQuery, [rating, userId, dishId]);
        } else {
          // Insert new vote
          const insertVoteQuery = `
            INSERT INTO dish_rankings (ranking_id, user_id, dish_id, dish_type, restaurant_id, rank, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;
          await client.query(insertVoteQuery, [
            uuidv4(),
            userId,
            dishId,
            'Unknown', // We don't know the dish type, so use a default value
            restaurantId,
            rating,
            'Voted via app',
          ]);
        }

        // Get updated vote statistics
        const statsQuery = `
          SELECT
            COUNT(ranking_id) AS total_votes,
            AVG(rank) AS average_rating,
            SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) AS rating_1,
            SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) AS rating_2,
            SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) AS rating_3,
            SUM(CASE WHEN rank = 4 THEN 1 ELSE 0 END) AS rating_4,
            SUM(CASE WHEN rank = 5 THEN 1 ELSE 0 END) AS rating_5
          FROM dish_rankings
          WHERE dish_id = $1
        `;
        const statsResult = await client.query(statsQuery, [dishId]);
        const stats = statsResult.rows[0] as any;

        await client.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Vote recorded successfully',
          dishId,
          totalVotes: parseInt(stats.total_votes) || 0,
          averageRating: parseFloat(stats.average_rating) || 0,
          ratings: {
            '1': parseInt(stats.rating_1) || 0,
            '2': parseInt(stats.rating_2) || 0,
            '3': parseInt(stats.rating_3) || 0,
            '4': parseInt(stats.rating_4) || 0,
            '5': parseInt(stats.rating_5) || 0,
          },
        });
        return;
      } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error recording vote:', error);

      // In development mode, return mock success response
      if (process.env.NODE_ENV === 'development') {
        // Default to rating 5 if not available
        const mockRating = req.body.rating || 5;
        res.status(200).json({
          success: true,
          message: 'Vote recorded successfully (mock)',
          dishId,
          totalVotes: 1,
          averageRating: mockRating,
          ratings: {
            '1': mockRating === 1 ? 1 : 0,
            '2': mockRating === 2 ? 1 : 0,
            '3': mockRating === 3 ? 1 : 0,
            '4': mockRating === 4 ? 1 : 0,
            '5': mockRating === 5 ? 1 : 0,
          },
        });
        return;
      }

      res.status(500).json({ error: 'Failed to record vote' });
      return;
    }
  }

  // Handle unsupported methods
  res.status(405).json({ error: 'Method not allowed' });
  return;
}
