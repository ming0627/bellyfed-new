import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery, getDishIdFromSlug } from './dbUtils';
import { ApplicationError, handleError } from './index';

export const getUserRanking = async (
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

            // Query to get user ranking for the dish
            const rankingSql = `
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
          dr.updated_at
        FROM dish_rankings dr
        WHERE dr.user_id = :param1 AND dr.dish_id = :param2
      `;

            const rankingResult = await executeQuery(rankingSql, [userId, dishId]);

            // Query to get dish details
            const dishSql = `
        SELECT 
          d.dish_id,
          d.name,
          d.description,
          d.category,
          d.image_url,
          d.is_vegetarian,
          d.spicy_level,
          d.price,
          d.country_code,
          r.restaurant_id,
          r.name as restaurant_name
        FROM dishes d
        LEFT JOIN restaurants r ON d.restaurant_id = r.restaurant_id
        WHERE d.dish_id = :param1
      `;

            const dishResult = await executeQuery(dishSql, [dishId]);

            if (!dishResult.records || dishResult.records.length === 0) {
                throw new ApplicationError('Dish not found', 404);
            }

            // Query to get ranking statistics
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
        FROM dish_rankings
        WHERE dish_id = :param1
      `;

            const statsResult = await executeQuery(statsSql, [dishId]);

            const dishDetails = dishResult.records[0];
            const stats = statsResult.records[0];

            const response = {
                userRanking:
                    rankingResult.records.length > 0
                        ? {
                              ranking_id: rankingResult.records[0][0].stringValue,
                              user_id: rankingResult.records[0][1].stringValue,
                              dish_id: rankingResult.records[0][2].stringValue,
                              restaurant_id: rankingResult.records[0][3].stringValue,
                              dish_type: rankingResult.records[0][4]?.stringValue || '',
                              rank: rankingResult.records[0][5]?.longValue
                                  ? parseInt(rankingResult.records[0][5].longValue)
                                  : null,
                              taste_status: rankingResult.records[0][6]?.stringValue || null,
                              notes: rankingResult.records[0][7]?.stringValue || '',
                              photo_urls: rankingResult.records[0][8]?.stringValue
                                  ? JSON.parse(rankingResult.records[0][8].stringValue)
                                  : [],
                              created_at: rankingResult.records[0][9].stringValue,
                              updated_at: rankingResult.records[0][10].stringValue,
                          }
                        : null,
                dishDetails: {
                    dish_id: dishDetails[0].stringValue,
                    name: dishDetails[1].stringValue,
                    description: dishDetails[2]?.stringValue || '',
                    restaurant_id: dishDetails[9]?.stringValue || '',
                    restaurant_name: dishDetails[10]?.stringValue || '',
                    category: dishDetails[3]?.stringValue || '',
                    image_url: dishDetails[4]?.stringValue || '',
                    is_vegetarian: dishDetails[5]?.booleanValue || false,
                    spicy_level: dishDetails[6]?.longValue ? parseInt(dishDetails[6].longValue) : 0,
                    price: dishDetails[7]?.doubleValue || 0,
                    country_code: dishDetails[8]?.stringValue || 'my',
                },
                rankingStats: {
                    total_rankings: parseInt(stats[0].longValue) || 0,
                    average_rank: parseFloat(stats[1]?.doubleValue) || 0,
                    ranks: {
                        '1': parseInt(stats[2].longValue) || 0,
                        '2': parseInt(stats[3].longValue) || 0,
                        '3': parseInt(stats[4].longValue) || 0,
                        '4': parseInt(stats[5].longValue) || 0,
                        '5': parseInt(stats[6].longValue) || 0,
                    },
                    taste_statuses: {
                        ACCEPTABLE: parseInt(stats[7].longValue) || 0,
                        SECOND_CHANCE: parseInt(stats[8].longValue) || 0,
                        DISSATISFIED: parseInt(stats[9].longValue) || 0,
                    },
                },
            };

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify(response),
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
