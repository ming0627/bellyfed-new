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

// Mock data for development
const mockUserVotes = {
  votes: [
    {
      dishId: 'dish1',
      restaurantId: 'restaurant1',
      rating: 5,
      timestamp: new Date().toISOString(),
    },
    {
      dishId: 'dish2',
      restaurantId: 'restaurant2',
      rating: 4,
      timestamp: new Date().toISOString(),
    },
    {
      dishId: 'dish3',
      restaurantId: 'restaurant3',
      rating: 5,
      timestamp: new Date().toISOString(),
    },
  ],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;
  // Using hardcoded user ID for now
  // const userId = Array.isArray(id) ? id[0] : id;

  // Always using hardcoded user ID for development
  if (!id) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  // Handle GET request - return user votes
  if (req.method === 'GET') {
    try {
      // Query to get user votes
      const query = `
        SELECT
          dr.dish_id AS "dishId",
          dr.restaurant_id AS "restaurantId",
          dr.rank AS rating,
          dr.updated_at AS timestamp,
          d.name AS "dishName",
          r.name AS "restaurantName"
        FROM dish_rankings dr
        JOIN dishes d ON dr.dish_id = d.dish_id
        JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
        WHERE dr.user_id = $1
        ORDER BY dr.updated_at DESC
      `;

      const result = await pool.query(query, ['user-123']);

      // If no results or in development mode, return mock data
      if (result.rows.length === 0 || process.env.NODE_ENV === 'development') {
        res.status(200).json(mockUserVotes);
        return;
      }

      res.status(200).json({
        votes: result.rows,
      });
      return;
    } catch (error: unknown) {
      console.error('Error fetching user votes:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        res.status(200).json(mockUserVotes);
        return;
      }

      res.status(500).json({ error: 'Failed to fetch user votes' });
      return;
    }
  }

  // Handle unsupported methods
  res.status(405).json({ error: 'Method not allowed' });
  return;
}
