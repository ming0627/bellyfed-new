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

// Define interfaces for user rankings
interface UserRankingItem {
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
  dish_name: string;
  restaurant_name: string;
}

interface UserRankingStats {
  totalRankings: number;
  rankCounts: Record<string, number>;
  tasteStatusCounts: Record<string, number>;
  rankings: UserRankingItem[];
  topRankings: UserRankingItem[];
}

// Mock data for development
const mockUserRankings: Record<string, UserRankingStats> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  // Handle GET request - return user rankings
  if (req.method === 'GET') {
    try {
      // Try to get rankings from the database
      const client = await pool.connect();
      try {
        // Get user details
        const userQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userResult = await client.query(userQuery, ['user-123']);

        let user = null;
        if (userResult.rows.length > 0) {
          user = userResult.rows[0] as any;
          // Remove sensitive information
          delete user.password;
          delete user.cognito_id;
        }

        // Get user rankings
        const rankingsQuery = `
          SELECT dr.*, d.name as dish_name, r.name as restaurant_name
          FROM dish_rankings dr
          JOIN dishes d ON dr.dish_id = d.dish_id
          JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
          WHERE dr.user_id = $1
          ORDER BY dr.updated_at DESC
        `;
        const rankingsResult = await client.query(rankingsQuery, ['user-123']);
        const rankings = rankingsResult.rows;

        // Get ranking statistics
        const statsQuery = `
          SELECT
            COUNT(ranking_id) AS total_rankings,
            SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) AS rank_1_count,
            SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) AS rank_2_count,
            SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) AS rank_3_count,
            SUM(CASE WHEN rank = 4 THEN 1 ELSE 0 END) AS rank_4_count,
            SUM(CASE WHEN rank = 5 THEN 1 ELSE 0 END) AS rank_5_count,
            SUM(CASE WHEN taste_status = 'ACCEPTABLE' THEN 1 ELSE 0 END) AS acceptable_count,
            SUM(CASE WHEN taste_status = 'SECOND_CHANCE' THEN 1 ELSE 0 END) AS second_chance_count,
            SUM(CASE WHEN taste_status = 'DISSATISFIED' THEN 1 ELSE 0 END) AS dissatisfied_count
          FROM dish_rankings
          WHERE user_id = $1
        `;
        const statsResult = await client.query(statsQuery, ['user-123']);
        const stats = statsResult.rows[0] as any;

        // Get top rankings
        const topRankingsQuery = `
          SELECT dr.*, d.name as dish_name, r.name as restaurant_name
          FROM dish_rankings dr
          JOIN dishes d ON dr.dish_id = d.dish_id
          JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
          WHERE dr.user_id = $1 AND dr.rank = 1
          ORDER BY dr.updated_at DESC
        `;
        const topRankingsResult = await client.query(topRankingsQuery, [
          'user-123',
        ]);
        const topRankings = topRankingsResult.rows;

        res.status(200).json({
          userId,
          user,
          totalRankings: parseInt(stats.total_rankings) || 0,
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
          rankings,
          topRankings,
        });
        return;
      } catch (error: unknown) {
        // Handle error or rethrow
        console.error('Error in user rankings query:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user rankings:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        // Initialize mock data if it doesn't exist
        if (!mockUserRankings['user-123']) {
          mockUserRankings['user-123'] = {
            totalRankings: 3,
            rankCounts: { '1': 1, '2': 1, '3': 1, '4': 0, '5': 0 },
            tasteStatusCounts: {
              ACCEPTABLE: 0,
              SECOND_CHANCE: 0,
              DISSATISFIED: 0,
            },
            rankings: [
              {
                ranking_id: 'mock-ranking-1',
                user_id: userId,
                dish_id: 'mock-dish-1',
                restaurant_id: 'mock-restaurant-1',
                dish_type: 'Malaysian',
                rank: 1,
                taste_status: null,
                notes: 'This is the best Nasi Lemak I have ever had!',
                photo_urls: ['/images/placeholder-dish.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                dish_name: 'Nasi Lemak Special',
                restaurant_name: 'Village Park Restaurant',
              },
              {
                ranking_id: 'mock-ranking-2',
                user_id: userId,
                dish_id: 'mock-dish-2',
                restaurant_id: 'mock-restaurant-2',
                dish_type: 'Japanese',
                rank: 2,
                taste_status: null,
                notes: 'Excellent sushi, fresh and well-prepared.',
                photo_urls: ['/images/placeholder-dish.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                dish_name: 'Salmon Sushi',
                restaurant_name: 'Sakura Japanese Dining',
              },
              {
                ranking_id: 'mock-ranking-3',
                user_id: userId,
                dish_id: 'mock-dish-3',
                restaurant_id: 'mock-restaurant-3',
                dish_type: 'Italian',
                rank: 3,
                taste_status: null,
                notes: 'Good pasta, but not exceptional.',
                photo_urls: ['/images/placeholder-dish.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                dish_name: 'Spaghetti Carbonara',
                restaurant_name: 'Bella Italia',
              },
            ],
            topRankings: [
              {
                ranking_id: 'mock-ranking-1',
                user_id: userId,
                dish_id: 'mock-dish-1',
                restaurant_id: 'mock-restaurant-1',
                dish_type: 'Malaysian',
                rank: 1,
                taste_status: null,
                notes: 'This is the best Nasi Lemak I have ever had!',
                photo_urls: ['/images/placeholder-dish.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                dish_name: 'Nasi Lemak Special',
                restaurant_name: 'Village Park Restaurant',
              },
            ],
          };
        }

        res.status(200).json({
          userId,
          user: {
            user_id: userId,
            name: 'Test User',
            email: 'user@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...mockUserRankings['user-123'],
        });
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: 'Failed to fetch user rankings',
        details: errorMessage,
      });
      return;
    }
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
  return;
}
