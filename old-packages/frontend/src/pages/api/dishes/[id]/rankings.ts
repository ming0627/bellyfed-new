import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
// uuidv4 is imported for potential future use in generating IDs

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

// Define types for dish rankings
// Define interfaces for dish rankings

interface DishRankingItem {
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
  user_name?: string;
}

interface DishRankingStats {
  totalRankings: number;
  averageRank: number;
  ranks: Record<string, number>;
  tasteStatuses: Record<string, number>;
  topRankings: DishRankingItem[];
  tasteStatusRankings: DishRankingItem[];
}

// Mock data for development
const mockDishRankings: Record<string, DishRankingStats> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;
  const dishId = Array.isArray(id) ? id[0] : id;

  if (!dishId) {
    return res.status(400).json({ error: 'Dish ID is required' });
  }

  // Handle GET request - return dish rankings
  if (req.method === 'GET') {
    try {
      // Try to get rankings from the database
      const client = await pool.connect();
      try {
        // Get dish details
        const dishQuery = 'SELECT * FROM dishes WHERE dish_id = $1';
        const dishResult = await client.query(dishQuery, [dishId]);

        let dish = null;
        if (dishResult.rows.length > 0) {
          dish = dishResult.rows[0] as any;
        }

        // Get ranking statistics
        const statsQuery = `
          SELECT
            COUNT(ranking_id) AS total_rankings,
            AVG(rank) AS average_rank,
            SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) AS rank_1,
            SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) AS rank_2,
            SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) AS rank_3,
            SUM(CASE WHEN rank = 4 THEN 1 ELSE 0 END) AS rank_4,
            SUM(CASE WHEN rank = 5 THEN 1 ELSE 0 END) AS rank_5,
            SUM(CASE WHEN taste_status = 'ACCEPTABLE' THEN 1 ELSE 0 END) AS acceptable,
            SUM(CASE WHEN taste_status = 'SECOND_CHANCE' THEN 1 ELSE 0 END) AS second_chance,
            SUM(CASE WHEN taste_status = 'DISSATISFIED' THEN 1 ELSE 0 END) AS dissatisfied
          FROM dish_rankings
          WHERE dish_id = $1
        `;
        const statsResult = await client.query(statsQuery, [dishId]);
        const stats = statsResult.rows[0] as any;

        // Get top rankings
        const topRankingsQuery = `
          SELECT dr.*, u.name as user_name
          FROM dish_rankings dr
          JOIN users u ON dr.user_id = u.user_id
          WHERE dr.dish_id = $1 AND dr.rank IS NOT NULL
          ORDER BY dr.rank ASC
          LIMIT 10
        `;
        const topRankingsResult = await client.query(topRankingsQuery, [
          dishId,
        ]);
        const topRankings = topRankingsResult.rows;

        // Get taste status rankings
        const tasteStatusRankingsQuery = `
          SELECT dr.*, u.name as user_name
          FROM dish_rankings dr
          JOIN users u ON dr.user_id = u.user_id
          WHERE dr.dish_id = $1 AND dr.taste_status IS NOT NULL
          ORDER BY dr.created_at DESC
          LIMIT 10
        `;
        const tasteStatusRankingsResult = await client.query(
          tasteStatusRankingsQuery,
          [dishId],
        );
        const tasteStatusRankings = tasteStatusRankingsResult.rows;

        return res.status(200).json({
          dishId,
          dish,
          totalRankings: parseInt(stats.total_rankings) || 0,
          averageRank: parseFloat(stats.average_rank) || 0,
          ranks: {
            '1': parseInt(stats.rank_1) || 0,
            '2': parseInt(stats.rank_2) || 0,
            '3': parseInt(stats.rank_3) || 0,
            '4': parseInt(stats.rank_4) || 0,
            '5': parseInt(stats.rank_5) || 0,
          },
          tasteStatuses: {
            ACCEPTABLE: parseInt(stats.acceptable) || 0,
            SECOND_CHANCE: parseInt(stats.second_chance) || 0,
            DISSATISFIED: parseInt(stats.dissatisfied) || 0,
          },
          topRankings,
          tasteStatusRankings,
        });
      } catch (error: unknown) {
        // Handle error or rethrow
        console.error('Error in rankings query:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching dish rankings:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        // Initialize mock data if it doesn't exist
        if (!mockDishRankings[dishId]) {
          mockDishRankings[dishId] = {
            totalRankings: 0,
            averageRank: 0,
            ranks: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
            tasteStatuses: { ACCEPTABLE: 0, SECOND_CHANCE: 0, DISSATISFIED: 0 },
            topRankings: [],
            tasteStatusRankings: [],
          };
        }

        return res.status(200).json({
          dishId,
          dish: {
            dish_id: dishId,
            name: 'Mock Dish',
            description: 'This is a mock dish for development',
            dish_type: 'Unknown',
            restaurant_id: 'mock-restaurant-id',
          },
          ...mockDishRankings[dishId],
        });
      }

      return res.status(500).json({
        error: 'Failed to fetch dish rankings',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
  return;
}
