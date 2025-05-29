import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { executeQuery } from './dbUtils';
import { ApplicationError, handleError } from './index';

export const getUserRankings = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const {
            limit = '10',
            offset = '0',
            sort = 'updated_at',
            order = 'desc',
        } = event.queryStringParameters || {};

        // Query to get user rankings
        const sql = `
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
        d.name as dish_name,
        d.slug as dish_slug,
        r.name as restaurant_name
      FROM dish_rankings dr
      JOIN dishes d ON dr.dish_id = d.dish_id
      JOIN restaurants r ON dr.restaurant_id = r.restaurant_id
      WHERE dr.user_id = :param1
      ORDER BY dr.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT :param2 OFFSET :param3
    `;

        const result = await executeQuery(sql, [userId, limit, offset]);

        const rankings = result.records.map((record: unknown) => ({
            id: record[0].stringValue,
            userId: record[1].stringValue,
            dishId: record[2].stringValue,
            dishName: record[11].stringValue,
            dishSlug: record[12].stringValue,
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

        // Get total count
        const countSql = `
      SELECT COUNT(*) as total FROM dish_rankings WHERE user_id = :param1
    `;
        const countResult = await executeQuery(countSql, [userId]);
        const total = parseInt(countResult.records[0][0].longValue);

        // Get rank statistics
        const statsSql = `
      SELECT 
        COUNT(*) FILTER (WHERE rank = 1) as rank_1_count,
        COUNT(*) FILTER (WHERE rank = 2) as rank_2_count,
        COUNT(*) FILTER (WHERE rank = 3) as rank_3_count,
        COUNT(*) FILTER (WHERE rank = 4) as rank_4_count,
        COUNT(*) FILTER (WHERE rank = 5) as rank_5_count,
        COUNT(*) FILTER (WHERE taste_status = 'ACCEPTABLE') as acceptable_count,
        COUNT(*) FILTER (WHERE taste_status = 'SECOND_CHANCE') as second_chance_count,
        COUNT(*) FILTER (WHERE taste_status = 'DISSATISFIED') as dissatisfied_count
      FROM dish_rankings
      WHERE user_id = :param1
    `;
        const statsResult = await executeQuery(statsSql, [userId]);
        const stats = statsResult.records[0];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({
                rankings,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                },
                stats: {
                    rankCounts: {
                        '1': parseInt(stats[0].longValue) || 0,
                        '2': parseInt(stats[1].longValue) || 0,
                        '3': parseInt(stats[2].longValue) || 0,
                        '4': parseInt(stats[3].longValue) || 0,
                        '5': parseInt(stats[4].longValue) || 0,
                    },
                    tasteStatusCounts: {
                        ACCEPTABLE: parseInt(stats[5].longValue) || 0,
                        SECOND_CHANCE: parseInt(stats[6].longValue) || 0,
                        DISSATISFIED: parseInt(stats[7].longValue) || 0,
                    },
                },
            }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};
