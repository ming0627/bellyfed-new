import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Handle POST request - create a new user
  if (req.method === 'POST') {
    try {
      const { cognito_id, email, name, phone, email_verified } = req.body;

      if (!cognito_id || !email) {
        return res
          .status(400)
          .json({ error: 'Cognito ID and email are required' });
      }

      // Check if we're in development mode and not using AWS API
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.USE_AWS_API !== 'true'
      ) {
        // Return success response with mock data
        return res.status(201).json({
          id: uuidv4(),
          cognito_id,
          email,
          name: name || email.split('@')[0],
          phone: phone || '',
          email_verified: email_verified || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: 'Kuala Lumpur, Malaysia',
          bio: 'Food lover and explorer',
          stats: {
            reviews: 0,
            followers: 0,
            following: 0,
            cities: 0,
          },
        });
      }

      // Connect to PostgreSQL and insert user data
      const client = await pool.connect();
      try {
        // Check if user already exists
        const checkResult = await client.query(
          'SELECT * FROM users WHERE cognito_id = $1 OR email = $2',
          [cognito_id, email],
        );

        if (checkResult.rows.length > 0) {
          return res.status(409).json({ error: 'User already exists' });
        }

        // Generate a unique ID
        const id = uuidv4();
        const now = new Date().toISOString();

        // Insert new user
        const insertResult = await client.query(
          `INSERT INTO users (
            id, 
            cognito_id, 
            email, 
            name, 
            phone, 
            email_verified, 
            created_at, 
            updated_at,
            location,
            bio
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            id,
            cognito_id,
            email,
            name || email.split('@')[0],
            phone || '',
            email_verified || false,
            now,
            now,
            'Kuala Lumpur, Malaysia', // Default location
            'Food lover and explorer', // Default bio
          ],
        );

        const newUser = insertResult.rows[0] as any;

        // Add default stats
        newUser.stats = {
          reviews: 0,
          followers: 0,
          following: 0,
          cities: 0,
        };

        return res.status(201).json(newUser);
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error creating user:', error);

      // In development mode, return success response even if there's an error
      if (process.env.NODE_ENV === 'development') {
        return res.status(201).json({
          id: uuidv4(),
          cognito_id: req.body.cognito_id,
          email: req.body.email,
          name: req.body.name || req.body.email.split('@')[0],
          phone: req.body.phone || '',
          email_verified: req.body.email_verified || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: 'Kuala Lumpur, Malaysia',
          bio: 'Food lover and explorer',
          stats: {
            reviews: 0,
            followers: 0,
            following: 0,
            cities: 0,
          },
        });
      }

      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Handle GET request - list users (for admin purposes)
  if (req.method === 'GET') {
    try {
      // Check if we're in development mode and not using AWS API
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.USE_AWS_API !== 'true'
      ) {
        // Return mock data
        return res.status(200).json({
          users: [
            {
              id: 'user1',
              cognito_id: 'cognito_user1',
              email: 'user1@example.com',
              name: 'Test User 1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'user2',
              cognito_id: 'cognito_user2',
              email: 'user2@example.com',
              name: 'Test User 2',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }

      // Connect to PostgreSQL and query users
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id, cognito_id, email, name, created_at, updated_at FROM users LIMIT 100',
        );

        return res.status(200).json({ users: result.rows });
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching users:', error);

      // In development mode, return mock data even if there's an error
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          users: [
            {
              id: 'user1',
              cognito_id: 'cognito_user1',
              email: 'user1@example.com',
              name: 'Test User 1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'user2',
              cognito_id: 'cognito_user2',
              email: 'user2@example.com',
              name: 'Test User 2',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }

      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
