import { NextApiResponse } from 'next';
import { Pool } from 'pg';
import { withApiAuth } from '@/utils/serverAuth';
import { AuthenticatedRequest } from '@/utils/types';

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

// Define interfaces for rankings
interface DishRankingItem {
  dish_id: string;
  dish_name: string;
  restaurant_id: string;
  restaurant_name: string;
  dish_type: string;
  rank: number | null;
  taste_status: string | null;
  average_rank: number;
  total_rankings: number;
  image_url: string;
  country_code: string;
}

interface RankingsResponse {
  topRankedDishes: DishRankingItem[];
  recentlyRankedDishes: DishRankingItem[];
  popularDishes: DishRankingItem[];
  userStats: {
    totalRankings: number;
    uniqueDishes: number;
    topRankedDishes: number;
  };
}

/**
 * API endpoint to handle rankings overview
 * This endpoint returns an overview of rankings data
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get country code from query parameters
  const countryCode = (req.query.country as string) || 'my';

  if (req.method === 'GET') {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll return mock data
      const client = await pool.connect();

      try {
        // In a production environment, these would be actual database queries
        // For now, we'll simulate the response

        // Mock response data
        const mockResponse: RankingsResponse = {
          topRankedDishes: [
            {
              dish_id: 'dish1',
              dish_name: 'Nasi Lemak Special',
              restaurant_id: 'restaurant_jalan_alor',
              restaurant_name: 'Jalan Alor Food Street',
              dish_type: 'Malaysian',
              rank: 1,
              taste_status: null,
              average_rank: 4.8,
              total_rankings: 256,
              image_url:
                'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
              country_code: countryCode,
            },
            {
              dish_id: 'dish2',
              dish_name: 'Char Kway Teow',
              restaurant_id: 'restaurant_penang_road',
              restaurant_name: 'Penang Road Famous',
              dish_type: 'Malaysian',
              rank: 1,
              taste_status: null,
              average_rank: 4.7,
              total_rankings: 198,
              image_url:
                'https://images.unsplash.com/photo-1570275239925-4af0aa93a0dc?q=80&w=1000',
              country_code: countryCode,
            },
          ],
          recentlyRankedDishes: [
            {
              dish_id: 'dish3',
              dish_name: 'Satay Chicken',
              restaurant_id: 'restaurant_satay_club',
              restaurant_name: 'Satay Club',
              dish_type: 'Malaysian',
              rank: 2,
              taste_status: null,
              average_rank: 4.5,
              total_rankings: 178,
              image_url:
                'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=1000',
              country_code: countryCode,
            },
            {
              dish_id: 'dish4',
              dish_name: 'Roti Canai',
              restaurant_id: 'restaurant_mamak_village',
              restaurant_name: 'Mamak Village',
              dish_type: 'Malaysian',
              rank: null,
              taste_status: 'ACCEPTABLE',
              average_rank: 4.3,
              total_rankings: 145,
              image_url:
                'https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?q=80&w=1000',
              country_code: countryCode,
            },
          ],
          popularDishes: [
            {
              dish_id: 'dish5',
              dish_name: 'Laksa',
              restaurant_id: 'restaurant_nyonya_delights',
              restaurant_name: 'Nyonya Delights',
              dish_type: 'Malaysian',
              rank: 3,
              taste_status: null,
              average_rank: 4.6,
              total_rankings: 312,
              image_url:
                'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1000',
              country_code: countryCode,
            },
            {
              dish_id: 'dish6',
              dish_name: 'Hainanese Chicken Rice',
              restaurant_id: 'restaurant_chicken_masters',
              restaurant_name: 'Chicken Masters',
              dish_type: 'Malaysian',
              rank: null,
              taste_status: 'SECOND_CHANCE',
              average_rank: 4.4,
              total_rankings: 287,
              image_url:
                'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000',
              country_code: countryCode,
            },
          ],
          userStats: {
            totalRankings: 12,
            uniqueDishes: 8,
            topRankedDishes: 2,
          },
        };

        res.status(200).json(mockResponse);
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching rankings:', error);
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
