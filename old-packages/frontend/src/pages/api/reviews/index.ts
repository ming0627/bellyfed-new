import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { v4 as uuidv4 } from 'uuid';
import { createReviewEvent } from '@/utils/events';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle reviews
 * GET: Get reviews (with optional filters)
 * POST: Create a new review
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id || 'user-123'; // Fallback to mock user ID if user is undefined

  // Handle GET request - get reviews
  if (req.method === 'GET') {
    try {
      const { restaurantId, limit = '10', offset = '0' } = req.query;

      // Get a client from the pool
      const client = await pool.connect();

      try {
        let query = `
          SELECT
            r.review_id,
            r.restaurant_id,
            r.user_id,
            r.rating,
            r.text,
            r.visit_status,
            r.created_at,
            r.updated_at,
            u.name as user_name,
            u.avatar_url as user_avatar,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.review_id) as likes_count
          FROM reviews r
          JOIN users u ON r.user_id = u.user_id
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Add restaurant filter if provided
        if (restaurantId) {
          query += ` WHERE r.restaurant_id = $${paramIndex}`;
          queryParams.push(restaurantId);
          paramIndex++;
        }

        // Add sorting and pagination
        query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(parseInt(limit as string), parseInt(offset as string));

        const result = await client.query(query, queryParams);

        const reviews = result.rows.map((row: Record<string, unknown>) => ({
          id: row.review_id as string,
          restaurantId: row.restaurant_id as string,
          userId: row.user_id as string,
          userName: row.user_name as string,
          userAvatar: row.user_avatar as string,
          rating: row.rating as number,
          text: row.text as string,
          visitStatus: row.visit_status as string,
          likesCount: parseInt(row.likes_count as string),
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }));

        res.status(200).json({ reviews });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
  // Handle POST request - create a new review
  else if (req.method === 'POST') {
    try {
      const { restaurantId, rating, text, visitStatus } = req.body;

      if (!restaurantId) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }

      if (rating === undefined || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Check if restaurant exists
        const restaurantCheckQuery = `
          SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1
        `;
        const restaurantCheckResult = await client.query(restaurantCheckQuery, [
          restaurantId,
        ]);

        if (restaurantCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'Restaurant not found' });
          return;
        }

        // Check if user already reviewed this restaurant
        const reviewCheckQuery = `
          SELECT review_id FROM reviews
          WHERE user_id = $1 AND restaurant_id = $2
        `;
        const reviewCheckResult = await client.query(reviewCheckQuery, [
          userId,
          restaurantId,
        ]);

        if (reviewCheckResult.rows.length > 0) {
          res
            .status(400)
            .json({ error: 'You have already reviewed this restaurant' });
          return;
        }

        // Generate a new review ID
        const reviewId = uuidv4();

        // Prepare review data for the event
        const reviewData = {
          reviewId,
          restaurantId,
          userId,
          rating,
          text: text || '',
          visitStatus: visitStatus || 'VISITED',
          createdBy: userId,
          createdAt: new Date().toISOString(),
        };

        // Send the event to SQS
        console.log('Sending review creation event to SQS');
        await createReviewEvent(reviewData);
        console.log('Review creation event sent successfully');

        // Return an acknowledgment response
        res.status(202).json({
          message: 'Review creation request accepted',
          reviewId,
          restaurantId,
          status: 'PROCESSING',
          estimatedCompletionTime: '30 seconds',
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error creating review:', error);

      // Check for SQS-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'Unable to process review creation request at this time',
          details: errorMessage,
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to create review',
        message: errorMessage,
      });
      return;
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
}

// Protect this API route with server-side authentication
export default withApiAuth(handler);
