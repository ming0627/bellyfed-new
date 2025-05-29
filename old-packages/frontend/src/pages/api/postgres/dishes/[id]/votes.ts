import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

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

  // Handle GET request - return dish votes
  if (req.method === 'GET') {
    try {
      // Query to get dish vote statistics
      const query = `
        SELECT 
          d.dish_id,
          d.name AS dish_name,
          COUNT(dr.ranking_id) AS total_votes,
          AVG(dr.rank) AS average_rating,
          SUM(CASE WHEN dr.rank = 1 THEN 1 ELSE 0 END) AS rating_1,
          SUM(CASE WHEN dr.rank = 2 THEN 1 ELSE 0 END) AS rating_2,
          SUM(CASE WHEN dr.rank = 3 THEN 1 ELSE 0 END) AS rating_3,
          SUM(CASE WHEN dr.rank = 4 THEN 1 ELSE 0 END) AS rating_4,
          SUM(CASE WHEN dr.rank = 5 THEN 1 ELSE 0 END) AS rating_5
        FROM dishes d
        LEFT JOIN dish_rankings dr ON d.dish_id = dr.dish_id
        WHERE d.dish_id = $1
        GROUP BY d.dish_id, d.name
      `;

      const result = await pool.query(query, [dishId]);

      if (result.rows.length === 0) {
        // Dish exists but has no votes
        return res.status(200).json({
          dishId,
          totalVotes: 0,
          averageRating: 0,
          ratings: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        });
      }

      const dishData = result.rows[0] as any;

      return res.status(200).json({
        dishId,
        dishName: dishData.dish_name,
        totalVotes: parseInt(dishData.total_votes) || 0,
        averageRating: parseFloat(dishData.average_rating) || 0,
        ratings: {
          '1': parseInt(dishData.rating_1) || 0,
          '2': parseInt(dishData.rating_2) || 0,
          '3': parseInt(dishData.rating_3) || 0,
          '4': parseInt(dishData.rating_4) || 0,
          '5': parseInt(dishData.rating_5) || 0,
        },
      });
    } catch (error: unknown) {
      console.error('Error fetching dish votes:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          dishId,
          totalVotes: 0,
          averageRating: 0,
          ratings: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        });
      }

      return res.status(500).json({ error: 'Failed to fetch dish votes' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
