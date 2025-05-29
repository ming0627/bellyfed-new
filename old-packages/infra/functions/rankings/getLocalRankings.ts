import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery, getDishIdFromSlug } from './dbUtils';
import { ApplicationError, handleError } from './index';

export const getLocalRankings = async (
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

        const { country = 'my' } = event.queryStringParameters || {};

        try {
            // Get dish ID from slug
            const dishId = await getDishIdFromSlug(dishSlug);

            // Get dish details
            const dishDetailsSql = `
        SELECT 
          d.dish_id,
          d.name,
          d.description,
          d.category,
          d.image_url,
          d.is_vegetarian,
          d.spicy_level,
          d.price,
          d.country_code
        FROM dishes d
        WHERE d.dish_id = :param1
      `;

            const dishDetailsResult = await executeQuery(dishDetailsSql, [dishId]);

            if (!dishDetailsResult.records || dishDetailsResult.records.length === 0) {
                throw new ApplicationError('Dish details not found', 404);
            }

            const dishDetails = dishDetailsResult.records[0];

            // Get local rankings
            const rankingsSql = `
        SELECT 
          dr.ranking_id,
          dr.user_id,
          dr.dish_id,
          dr.restaurant_id,
          dr.dish_type,
          dr.rank,
          dr.taste_status,
          dr.notes,
          dr.photo_urls,
          dr.created_at,
          dr.updated_at,
          u.name as user_name,
          u.avatar_url as user_avatar,
          r.name as restaurant_name
        FROM dish_rankings dr
        JOIN users u ON dr.user_id = u.user_id
        JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
        WHERE dr.dish_id = :param1 AND u.country_code = :param2
        ORDER BY dr.rank ASC, dr.updated_at DESC
        LIMIT 50
      `;

            const rankingsResult = await executeQuery(rankingsSql, [dishId, country]);

            // Get ranking statistics
            const statsSql = `
        SELECT 
          COUNT(*) as total_rankings,
          AVG(rank) as average_rank,
          COUNT(*) FILTER (WHERE rank = 1) as rank_1_count,
          COUNT(*) FILTER (WHERE rank = 2) as rank_2_count,
          COUNT(*) FILTER (WHERE rank = 3) as rank_3_count,
          COUNT(*) FILTER (WHERE rank = 4) as rank_4_count,
          COUNT(*) FILTER (WHERE rank = 5) as rank_5_count,
          COUNT(*) FILTER (WHERE taste_status = 'ACCEPTABLE') as acceptable_count,
          COUNT(*) FILTER (WHERE taste_status = 'SECOND_CHANCE') as second_chance_count,
          COUNT(*) FILTER (WHERE taste_status = 'DISSATISFIED') as dissatisfied_count
        FROM dish_rankings dr
        JOIN users u ON dr.user_id = u.user_id
        WHERE dr.dish_id = :param1 AND u.country_code = :param2
      `;

            const statsResult = await executeQuery(statsSql, [dishId, country]);
            const stats = statsResult.records[0];

            // Get top restaurants for this dish in this country
            const restaurantsSql = `
        SELECT 
          r.restaurant_id,
          r.name,
          COUNT(*) as ranking_count,
          AVG(dr.rank) as average_rank
        FROM dish_rankings dr
        JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
        JOIN users u ON dr.user_id = u.user_id
        WHERE dr.dish_id = :param1 AND u.country_code = :param2
        GROUP BY r.restaurant_id, r.name
        ORDER BY average_rank ASC, ranking_count DESC
        LIMIT 5
      `;

            const restaurantsResult = await executeQuery(restaurantsSql, [dishId, country]);

            const rankings = rankingsResult.records.map((record: unknown) => ({
                id: record[0].stringValue,
                userId: record[1].stringValue,
                userName: record[11].stringValue,
                userAvatar: record[12]?.stringValue || '',
                dishId: record[2].stringValue,
                restaurantId: record[3].stringValue,
                restaurantName: record[13].stringValue,
                dishType: record[4]?.stringValue || '',
                rank: record[5]?.longValue ? parseInt(record[5].longValue) : null,
                tasteStatus: record[6]?.stringValue || null,
                notes: record[7]?.stringValue || '',
                photoUrls: record[8]?.stringValue ? JSON.parse(record[8].stringValue) : [],
                createdAt: record[9].stringValue,
                updatedAt: record[10].stringValue,
            }));

            const topRestaurants = restaurantsResult.records.map((record: unknown) => ({
                id: record[0].stringValue,
                name: record[1].stringValue,
                rankingCount: parseInt(record[2].longValue),
                averageRank: parseFloat(record[3].doubleValue),
            }));

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    dishId: dishDetails[0].stringValue,
                    dishName: dishDetails[1].stringValue,
                    dishDescription: dishDetails[2]?.stringValue || '',
                    dishCategory: dishDetails[3]?.stringValue || '',
                    countryCode: country,
                    rankings,
                    stats: {
                        totalRankings: parseInt(stats[0].longValue) || 0,
                        averageRank: parseFloat(stats[1]?.doubleValue) || 0,
                        rankCounts: {
                            '1': parseInt(stats[2].longValue) || 0,
                            '2': parseInt(stats[3].longValue) || 0,
                            '3': parseInt(stats[4].longValue) || 0,
                            '4': parseInt(stats[5].longValue) || 0,
                            '5': parseInt(stats[6].longValue) || 0,
                        },
                        tasteStatusCounts: {
                            ACCEPTABLE: parseInt(stats[7].longValue) || 0,
                            SECOND_CHANCE: parseInt(stats[8].longValue) || 0,
                            DISSATISFIED: parseInt(stats[9].longValue) || 0,
                        },
                    },
                    topRestaurants,
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
