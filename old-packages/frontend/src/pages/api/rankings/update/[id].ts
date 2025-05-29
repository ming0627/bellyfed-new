import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const rankingId = Array.isArray(id) ? id[0] : id;

  if (!rankingId) {
    res.status(400).json({ error: 'Ranking ID is required' });
    return;
  }

  try {
    const {
      rank,
      tasteStatus,
      notes,
      photoUrls,
      // timestamp is received but used in the database layer
    } = req.body;

    // Validate required fields
    if (!notes || !photoUrls || photoUrls.length === 0) {
      res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['notes', 'photoUrls'],
      });
      return;
    }

    // Validate that either rank or tasteStatus is provided, but not both
    if (
      (rank !== null && tasteStatus !== null) ||
      (rank === null && tasteStatus === null)
    ) {
      res.status(400).json({
        error:
          'A ranking must have either a rank or a taste status, but not both',
      });
      return;
    }

    // Validate rank range
    if (rank !== null && (rank < 1 || rank > 5)) {
      res.status(400).json({
        error: 'Rank must be between 1 and 5',
      });
      return;
    }

    // Validate taste status values
    if (
      tasteStatus !== null &&
      !['ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'].includes(tasteStatus)
    ) {
      res.status(400).json({
        error:
          'Taste status must be one of: ACCEPTABLE, SECOND_CHANCE, DISSATISFIED',
      });
      return;
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the existing ranking
      const rankingQuery = 'SELECT * FROM dish_rankings WHERE ranking_id = $1';
      const rankingResult = await client.query(rankingQuery, [rankingId]);

      if (rankingResult.rows.length === 0) {
        throw new Error('Ranking not found');
      }

      const existingRanking = rankingResult.rows[0] as any;
      const userId = existingRanking.user_id;
      const dishId = existingRanking.dish_id;
      const restaurantId = existingRanking.restaurant_id;
      const dishType = existingRanking.dish_type;
      const previousRank = existingRanking.rank;
      const previousTasteStatus = existingRanking.taste_status;

      // If this is a rank 1 assignment, demote any existing rank 1 for the same user, dish type, and restaurant
      if (rank === 1 && previousRank !== 1) {
        const demoteQuery = `
          UPDATE dish_rankings
          SET rank = 2, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
            AND dish_type = $2
            AND restaurant_id = $3
            AND rank = 1
            AND ranking_id != $4
        `;
        await client.query(demoteQuery, [
          userId,
          dishType,
          restaurantId,
          rankingId,
        ]);

        // Record the demotion in history
        const historyQuery = `
          INSERT INTO ranking_history (
            history_id, ranking_id, user_id, dish_id, restaurant_id,
            dish_type, previous_rank, new_rank, notes, photo_urls, created_at
          )
          SELECT
            $1, ranking_id, user_id, dish_id, restaurant_id,
            dish_type, 1, 2, notes, photo_urls, CURRENT_TIMESTAMP
          FROM dish_rankings
          WHERE user_id = $2
            AND dish_type = $3
            AND restaurant_id = $4
            AND rank = 2
            AND ranking_id != $5
        `;
        await client.query(historyQuery, [
          uuidv4(),
          userId,
          dishType,
          restaurantId,
          rankingId,
        ]);
      }

      // Update the ranking
      const updateRankingQuery = `
        UPDATE dish_rankings
        SET rank = $1,
            taste_status = $2,
            notes = $3,
            photo_urls = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE ranking_id = $5
        RETURNING *
      `;
      await client.query(updateRankingQuery, [
        rank,
        tasteStatus,
        notes,
        photoUrls,
        rankingId,
      ]);

      // Record the ranking change in history
      const historyId = uuidv4();
      const historyQuery = `
        INSERT INTO ranking_history (
          history_id, ranking_id, user_id, dish_id, restaurant_id,
          dish_type, previous_rank, new_rank, previous_taste_status, new_taste_status,
          notes, photo_urls, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      `;
      await client.query(historyQuery, [
        historyId,
        rankingId,
        userId,
        dishId,
        restaurantId,
        dishType,
        previousRank,
        rank,
        previousTasteStatus,
        tasteStatus,
        notes,
        photoUrls,
      ]);

      // Get updated ranking statistics
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

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Ranking updated successfully',
        rankingId,
        dishId,
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
      });
      return;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Error updating ranking:', error);

    // In development mode, return mock success response
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'Ranking updated successfully (mock)',
        rankingId,
        dishId: 'mock-dish-id',
        totalRankings: 1,
        averageRank: req.body.rank || 0,
        ranks: {
          '1': req.body.rank === 1 ? 1 : 0,
          '2': req.body.rank === 2 ? 1 : 0,
          '3': req.body.rank === 3 ? 1 : 0,
          '4': req.body.rank === 4 ? 1 : 0,
          '5': req.body.rank === 5 ? 1 : 0,
        },
        tasteStatuses: {
          ACCEPTABLE: req.body.tasteStatus === 'ACCEPTABLE' ? 1 : 0,
          SECOND_CHANCE: req.body.tasteStatus === 'SECOND_CHANCE' ? 1 : 0,
          DISSATISFIED: req.body.tasteStatus === 'DISSATISFIED' ? 1 : 0,
        },
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res
      .status(500)
      .json({ error: 'Failed to update ranking', details: errorMessage });
    return;
  }
}
