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
const mockTopDishes = [
  {
    id: 'dish1',
    name: 'Nasi Lemak Special',
    restaurantId: 'restaurant1',
    restaurantName: 'Village Park Restaurant',
    totalVotes: 1250,
    averageRating: 4.8,
  },
  {
    id: 'dish2',
    name: 'Char Kuey Teow',
    restaurantId: 'restaurant2',
    restaurantName: 'Penang Famous',
    totalVotes: 980,
    averageRating: 4.7,
  },
  {
    id: 'dish3',
    name: 'Laksa',
    restaurantId: 'restaurant3',
    restaurantName: 'Janggut Laksa',
    totalVotes: 1400,
    averageRating: 4.9,
  },
  {
    id: 'dish4',
    name: 'Roti Canai',
    restaurantId: 'restaurant4',
    restaurantName: 'Raju Restaurant',
    totalVotes: 850,
    averageRating: 4.6,
  },
  {
    id: 'dish5',
    name: 'Satay',
    restaurantId: 'restaurant5',
    restaurantName: 'Satay Station',
    totalVotes: 1100,
    averageRating: 4.5,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Handle GET request - return top dishes
  if (req.method === 'GET') {
    try {
      const { limit = '10', category } = req.query;
      const limitNum = parseInt(limit as string, 10);

      // Query to get top dishes
      let query = `
        SELECT
          d.dish_id AS id,
          d.name,
          d.restaurant_id AS "restaurantId",
          r.name AS "restaurantName",
          COUNT(dr.ranking_id) AS "totalVotes",
          AVG(dr.rank) AS "averageRating",
          d.dish_type AS category
        FROM dishes d
        JOIN restaurants r ON d.restaurant_id = r.restaurant_id
        JOIN dish_rankings dr ON d.dish_id = dr.dish_id
      `;

      const queryParams = [];

      // Add category filter if provided
      if (category && typeof category === 'string') {
        query += ' WHERE d.dish_type = $1';
        queryParams.push(category);
      }

      // Group by and order by
      query += `
        GROUP BY d.dish_id, d.name, d.restaurant_id, r.name, d.dish_type
        ORDER BY "averageRating" DESC, "totalVotes" DESC
        LIMIT $${queryParams.length + 1}
      `;
      queryParams.push(limitNum);

      const result = await pool.query(query, queryParams);

      // If no results or in development mode, return mock data
      if (result.rows.length === 0 || process.env.NODE_ENV === 'development') {
        // Filter mock data by category if provided
        let filteredDishes = [...mockTopDishes];
        if (category && typeof category === 'string') {
          filteredDishes = mockTopDishes.filter((dish) =>
            dish.id.includes(category),
          );
        }

        // Limit the results
        const limitedDishes = filteredDishes.slice(0, limitNum);

        return res.status(200).json({
          dishes: limitedDishes,
          total: filteredDishes.length,
        });
      }

      return res.status(200).json({
        dishes: result.rows,
        total: result.rows.length,
      });
    } catch (error: unknown) {
      console.error('Error fetching top dishes:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          dishes: mockTopDishes.slice(
            0,
            parseInt(req.query.limit as string, 10) || 10,
          ),
          total: mockTopDishes.length,
        });
      }

      return res.status(500).json({ error: 'Failed to fetch top dishes' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
