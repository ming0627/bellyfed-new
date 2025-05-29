import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery } from './dbUtils';
import { ApplicationError, handleError } from './index';
import { v4 as uuidv4 } from 'uuid';

export const createRanking = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const dishSlug = event.pathParameters?.dishSlug;
        if (!dishSlug) {
            throw new ApplicationError('Dish slug is required', 400);
        }

        const body = JSON.parse(event.body || '{}');
        const {
            dishId: bodyDishId,
            restaurantId,
            restaurantName,
            dishType,
            rank,
            tasteStatus,
            notes,
            photoUrls,
        } = body;

        if (!bodyDishId || !restaurantId) {
            throw new ApplicationError('Dish ID and restaurant ID are required', 400);
        }

        // Validate that either rank or tasteStatus is provided, but not both
        if ((rank !== null && tasteStatus !== null) || (rank === null && tasteStatus === null)) {
            throw new ApplicationError(
                'A ranking must have either a rank or a taste status, but not both',
                400
            );
        }

        // Validate rank range
        if (rank !== null && (rank < 1 || rank > 5)) {
            throw new ApplicationError('Rank must be between 1 and 5', 400);
        }

        try {
            // Begin transaction
            await executeQuery('BEGIN');

            // Check if dish exists
            const dishCheckSql = `
        SELECT * FROM dishes WHERE dish_id = :param1
      `;
            const dishCheckResult = await executeQuery(dishCheckSql, [bodyDishId]);

            if (!dishCheckResult.records || dishCheckResult.records.length === 0) {
                // If dish doesn't exist, create it
                const createDishSql = `
          INSERT INTO dishes (dish_id, name, slug, category)
          VALUES (:param1, :param2, :param3, :param4)
          RETURNING *
        `;
                await executeQuery(createDishSql, [
                    bodyDishId,
                    dishSlug.replace(/-/g, ' '),
                    dishSlug,
                    dishType || 'Other',
                ]);
            }

            // Check if restaurant exists
            const restaurantCheckSql = `
        SELECT * FROM restaurants WHERE restaurant_id = :param1
      `;
            const restaurantCheckResult = await executeQuery(restaurantCheckSql, [restaurantId]);

            if (!restaurantCheckResult.records || restaurantCheckResult.records.length === 0) {
                // If restaurant doesn't exist, create it
                const createRestaurantSql = `
          INSERT INTO restaurants (restaurant_id, name)
          VALUES (:param1, :param2)
          RETURNING *
        `;
                await executeQuery(createRestaurantSql, [
                    restaurantId,
                    restaurantName || 'Unknown Restaurant',
                ]);
            }

            // Check if ranking already exists
            const rankingCheckSql = `
        SELECT * FROM dish_rankings 
        WHERE user_id = :param1 AND dish_id = :param2
      `;
            const rankingCheckResult = await executeQuery(rankingCheckSql, [userId, bodyDishId]);

            if (rankingCheckResult.records && rankingCheckResult.records.length > 0) {
                await executeQuery('ROLLBACK');
                throw new ApplicationError('Ranking already exists for this dish', 400);
            }

            // Create new ranking
            const rankingId = uuidv4();
            const insertSql = `
        INSERT INTO dish_rankings (
          ranking_id, user_id, dish_id, restaurant_id, dish_type, 
          rank, taste_status, notes, photo_urls, created_at, updated_at
        )
        VALUES (:param1, :param2, :param3, :param4, :param5, :param6, :param7, :param8, :param9, NOW(), NOW())
        RETURNING *
      `;

            const result = await executeQuery(insertSql, [
                rankingId,
                userId,
                bodyDishId,
                restaurantId,
                dishType || 'Other',
                rank,
                tasteStatus,
                notes || '',
                JSON.stringify(photoUrls || []),
            ]);

            // Commit transaction
            await executeQuery('COMMIT');

            const record = result.records[0];
            const newRanking = {
                ranking_id: record[0].stringValue,
                user_id: record[1].stringValue,
                dish_id: record[2].stringValue,
                restaurant_id: record[3].stringValue,
                dish_type: record[4]?.stringValue || '',
                rank: record[5]?.longValue ? parseInt(record[5].longValue) : null,
                taste_status: record[6]?.stringValue || null,
                notes: record[7]?.stringValue || '',
                photo_urls: record[8]?.stringValue ? JSON.parse(record[8].stringValue) : [],
                created_at: record[9].stringValue,
                updated_at: record[10].stringValue,
            };

            return {
                statusCode: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Ranking created successfully',
                    userRanking: newRanking,
                }),
            };
        } catch (error: unknown) {
            // Rollback transaction on error
            await executeQuery('ROLLBACK');
            throw error;
        }
    } catch (error: unknown) {
        return handleError(error, context);
    }
};
