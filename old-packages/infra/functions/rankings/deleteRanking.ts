import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery, getDishIdFromSlug } from './dbUtils';
import { ApplicationError, handleError } from './index';

export const deleteRanking = async (
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

        try {
            // Get dish ID from slug
            const dishId = await getDishIdFromSlug(dishSlug);

            // Delete ranking
            const deleteSql = `
        DELETE FROM dish_rankings
        WHERE user_id = :param1 AND dish_id = :param2
        RETURNING *
      `;

            const result = await executeQuery(deleteSql, [userId, dishId]);

            if (!result.records || result.records.length === 0) {
                throw new ApplicationError('Ranking not found', 404);
            }

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Ranking deleted successfully',
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
