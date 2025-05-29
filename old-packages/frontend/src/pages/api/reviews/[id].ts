import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import { pool } from '@/utils/postgres';
import { updateReviewEvent, deleteReviewEvent } from '@/utils/events';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to handle operations on a specific review
 * GET: Get a specific review
 * PUT: Update a specific review
 * DELETE: Delete a specific review
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  const userId = req.user?.id || 'user-123'; // Fallback to mock user ID if user is undefined
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid review ID' });
    return;
  }

  const reviewId = id;

  // Handle GET request - get a specific review
  if (req.method === 'GET') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        const query = `
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
          WHERE r.review_id = $1
        `;

        const result = await client.query(query, [reviewId]);

        if (result.rows.length === 0) {
          res.status(404).json({ error: 'Review not found' });
          return;
        }

        const review = result.rows[0] as any;

        res.status(200).json({
          id: review.review_id,
          restaurantId: review.restaurant_id,
          userId: review.user_id,
          userName: review.user_name,
          userAvatar: review.user_avatar,
          rating: review.rating,
          text: review.text,
          visitStatus: review.visit_status,
          likesCount: parseInt(review.likes_count),
          createdAt: review.created_at,
          updatedAt: review.updated_at,
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error fetching review:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
  // Handle PUT request - update a specific review
  else if (req.method === 'PUT') {
    try {
      const { rating, text, visitStatus } = req.body;

      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Check if review exists and belongs to the user
        const reviewCheckQuery = `
          SELECT * FROM reviews WHERE review_id = $1
        `;
        const reviewCheckResult = await client.query(reviewCheckQuery, [
          reviewId,
        ]);

        if (reviewCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'Review not found' });
          return;
        }

        const review = reviewCheckResult.rows[0] as any;

        // Check if the review belongs to the user
        if (review.user_id !== 'user-123') {
          res
            .status(403)
            .json({ error: 'You can only update your own reviews' });
          return;
        }

        // Prepare review data for the event
        const reviewData = {
          reviewId,
          restaurantId: review.restaurant_id,
          userId,
          rating: rating || review.rating,
          text: text || review.text,
          visitStatus: visitStatus || review.visit_status,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        };

        // Send the event to SQS
        console.log('Sending review update event to SQS');
        await updateReviewEvent(reviewData);
        console.log('Review update event sent successfully');

        // Return an acknowledgment response
        res.status(202).json({
          message: 'Review update request accepted',
          reviewId,
          restaurantId: review.restaurant_id,
          status: 'PROCESSING',
          estimatedCompletionTime: '30 seconds',
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error updating review:', error);

      // Check for SQS-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'Unable to process review update request at this time',
          details: errorMessage,
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to update review',
        message: errorMessage,
      });
      return;
    }
  }
  // Handle DELETE request - delete a specific review
  else if (req.method === 'DELETE') {
    try {
      // Get a client from the pool
      const client = await pool.connect();

      try {
        // Check if review exists and belongs to the user
        const reviewCheckQuery = `
          SELECT * FROM reviews WHERE review_id = $1
        `;
        const reviewCheckResult = await client.query(reviewCheckQuery, [
          reviewId,
        ]);

        if (reviewCheckResult.rows.length === 0) {
          res.status(404).json({ error: 'Review not found' });
          return;
        }

        const review = reviewCheckResult.rows[0] as any;

        // Check if the review belongs to the user
        if (review.user_id !== 'user-123') {
          res
            .status(403)
            .json({ error: 'You can only delete your own reviews' });
          return;
        }

        // Send the event to SQS
        console.log('Sending review deletion event to SQS');
        await deleteReviewEvent(reviewId);
        console.log('Review deletion event sent successfully');

        // Return an acknowledgment response
        res.status(202).json({
          message: 'Review deletion request accepted',
          reviewId,
          restaurantId: review.restaurant_id,
          status: 'PROCESSING',
          estimatedCompletionTime: '30 seconds',
        });
        return;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      console.error('Error deleting review:', error);

      // Check for SQS-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'Unable to process review deletion request at this time',
          details: errorMessage,
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to delete review',
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
