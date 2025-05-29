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
const mockUserData = {
  id: 'user1',
  cognito_id: 'cognito_user1',
  email: 'user@example.com',
  name: 'Test User',
  phone: '+1234567890',
  email_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

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

  // Handle GET request - return user data
  if (req.method === 'GET') {
    try {
      // Query to get user data
      const query = 'SELECT * FROM users WHERE user_id = $1';
      const result = await pool.query(query, ['user-123']);

      // If no results or in development mode, return mock data
      if (result.rows.length === 0 || process.env.NODE_ENV === 'development') {
        res.status(200).json({
          ...mockUserData,
          id: 'user-123',
        });
        return;
      }

      res.status(200).json(result.rows[0]);
      return;
    } catch (error: unknown) {
      console.error('Error fetching user data:', error);

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        res.status(200).json({
          ...mockUserData,
          id: 'user-123',
        });
        return;
      }

      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }
  }

  // Handle PUT request - update user data
  if (req.method === 'PUT') {
    try {
      const userData = req.body;

      // Check if user exists
      const checkQuery = 'SELECT * FROM users WHERE user_id = $1';
      const checkResult = await pool.query(checkQuery, ['user-123']);

      if (checkResult.rows.length === 0) {
        // User doesn't exist, create a new user
        const insertQuery = `
          INSERT INTO users (user_id, cognito_id, email, name, phone, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;

        const insertResult = await pool.query(insertQuery, [
          userId,
          userData.cognito_id || userId,
          userData.email || 'user@example.com',
          userData.name || 'New User',
          userData.phone || null,
          userData.email_verified || false,
        ]);

        res.status(201).json(insertResult.rows[0]);
        return;
      } else {
        // User exists, update user data
        const updateQuery = `
          UPDATE users
          SET
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            email_verified = COALESCE($4, email_verified),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $5
          RETURNING *
        `;

        const updateResult = await pool.query(updateQuery, [
          userData.name,
          userData.email,
          userData.phone,
          userData.email_verified,
          'user-123',
        ]);

        res.status(200).json(updateResult.rows[0]);
        return;
      }
    } catch (error: unknown) {
      console.error('Error updating user data:', error);

      // In development mode, return mock success response
      if (process.env.NODE_ENV === 'development') {
        res.status(200).json({
          ...mockUserData,
          ...req.body,
          id: userId,
          updated_at: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({ error: 'Failed to update user data' });
      return;
    }
  }

  // Handle unsupported methods
  res.status(405).json({ error: 'Method not allowed' });
  return;
}
