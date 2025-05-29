import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery, getDishIdFromSlug } from './dbUtils';
import { ApplicationError, handleError } from './index';

export const updateRanking = async (
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
        const { rank, tasteStatus, notes, photoUrls } = body;

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
            // Get dish ID from slug
            const dishId = await getDishIdFromSlug(dishSlug);

            // Check if ranking exists
            const rankingCheckSql = `
        SELECT * FROM dish_rankings 
        WHERE user_id = :param1 AND dish_id = :param2
      `;
            const rankingCheckResult = await executeQuery(rankingCheckSql, [userId, dishId]);

            if (!rankingCheckResult.records || rankingCheckResult.records.length === 0) {
                throw new ApplicationError('Ranking not found', 404);
            }

            // Update ranking
            const updateSql = `
        UPDATE dish_rankings
        SET 
          rank = COALESCE(:param1, rank),
          taste_status = COALESCE(:param2, taste_status),
          notes = COALESCE(:param3, notes),
          photo_urls = COALESCE(:param4, photo_urls),
          updated_at = NOW()
        WHERE user_id = :param5 AND dish_id = :param6
        RETURNING *
      `;

            const result = await executeQuery(updateSql, [
                rank,
                tasteStatus,
                notes,
                photoUrls ? JSON.stringify(photoUrls) : null,
                userId,
                dishId,
            ]);

            const record = result.records[0];
            const updatedRanking = {
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
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Ranking updated successfully',
                    userRanking: updatedRanking,
                }),
            };
        } catch (error: unknown) {
            if (error.message === 'Dish not found') {
                throw new ApplicationError('Dish not found', 404);
            }
            throw error;
        }
    } catch (error: unknown) {
        return handleError(error, context);
    }
};
