import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

// Mock data for development
const mockUserData = {
  id: 'user1',
  cognito_id: 'cognito_user1',
  email: 'user@example.com',
  username: 'user@example.com',
  name: 'Test User',
  nickname: 'foodie123',
  phone: '+1234567890',
  email_verified: true,
  location: 'Kuala Lumpur, Malaysia',
  bio: 'Food lover and explorer',
  preferences: {},
  stats: {
    reviews: 12,
    followers: 45,
    following: 67,
    cities: 3,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query;
  const cognitoId = Array.isArray(id) ? id[0] : id;

  if (!cognitoId) {
    return res.status(400).json({ error: 'Cognito ID is required' });
  }

  // Handle GET request - return user data
  if (req.method === 'GET') {
    try {
      // Check if we're in development mode and using mock data
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.USE_AWS_API !== 'true'
      ) {
        // Return mock data
        return res.status(200).json({
          ...mockUserData,
          cognito_id: cognitoId,
        });
      }

      // Connect to PostgreSQL and query user data
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM users WHERE cognito_id = $1',
          [cognitoId],
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const userData = result.rows[0] as any;

        // Add stats if they don't exist
        if (!userData.stats) {
          userData.stats = {
            reviews: 0,
            followers: 0,
            following: 0,
            cities: 0,
          };
        }

        return res.status(200).json(userData);
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching user data:', error);

      // In development mode, return mock data even if there's an error
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          ...mockUserData,
          cognito_id: cognitoId,
        });
      }

      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
