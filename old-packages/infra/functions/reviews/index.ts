import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const rdsClient = new RDSDataClient({});

// Environment variables
const _environment = process.env.ENVIRONMENT || 'dev';
const dbSecretArn = process.env.DB_SECRET_ARN || '';
const dbClusterArn = process.env.DB_CLUSTER_ARN || '';
const dbName = process.env.DB_NAME || 'bellyfed';

// Error handling class
class ApplicationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApplicationError';
    }
}

// Helper function to handle errors
const handleError = (error: unknown, context: Context): APIGatewayProxyResult => {
    console.error(`[ERROR] ${context.awsRequestId}:`, error);

    if (error instanceof ApplicationError) {
        return {
            statusCode: error.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: error.message }),
        };
    }

    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ message: 'Internal server error' }),
    };
};

// Helper function to execute SQL queries
const executeQuery = async (sql: string, parameters: any[] = []): Promise<any> => {
    try {
        const params = {
            secretArn: dbSecretArn,
            resourceArn: dbClusterArn,
            database: dbName,
            sql,
            parameters: parameters.map((value, index) => ({
                name: `param${index + 1}`,
                value: {
                    stringValue: typeof value === 'string' ? value : JSON.stringify(value),
                },
            })),
        };

        const command = new ExecuteStatementCommand(params);
        const result = await rdsClient.send(command);
        return result;
    } catch (error: unknown) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
};

// Get reviews
const getReviews = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const { restaurantId, limit = '10', offset = '0' } = event.queryStringParameters || {};

        let sql = `
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

        // Add restaurant filter if provided
        if (restaurantId) {
            sql += ` WHERE r.restaurant_id = :param1`;
            queryParams.push(restaurantId);
        }

        // Add sorting and pagination
        sql += ` ORDER BY r.created_at DESC LIMIT :param${queryParams.length + 1} OFFSET :param${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await executeQuery(sql, queryParams);

        const reviews = result.records.map((record: unknown) => ({
            id: record[0].stringValue,
            restaurantId: record[1].stringValue,
            userId: record[2].stringValue,
            userName: record[8].stringValue,
            userAvatar: record[9]?.stringValue || '',
            rating: parseInt(record[3].longValue),
            text: record[4]?.stringValue || '',
            visitStatus: record[5]?.stringValue || '',
            likesCount: parseInt(record[10].longValue) || 0,
            createdAt: record[6].stringValue,
            updatedAt: record[7].stringValue,
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ reviews }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Create a new review
const createReview = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const body = JSON.parse(event.body || '{}');
        const { restaurantId, rating, text, visitStatus } = body;

        if (!restaurantId) {
            throw new ApplicationError('Restaurant ID is required', 400);
        }

        if (rating === undefined || rating < 1 || rating > 5) {
            throw new ApplicationError('Rating must be between 1 and 5', 400);
        }

        // Check if restaurant exists
        const restaurantCheckSql = `
      SELECT restaurant_id FROM restaurants WHERE restaurant_id = :param1
    `;
        const restaurantCheckResult = await executeQuery(restaurantCheckSql, [restaurantId]);

        if (!restaurantCheckResult.records || restaurantCheckResult.records.length === 0) {
            throw new ApplicationError('Restaurant not found', 404);
        }

        // Check if user already reviewed this restaurant
        const reviewCheckSql = `
      SELECT review_id FROM reviews 
      WHERE user_id = :param1 AND restaurant_id = :param2
    `;
        const reviewCheckResult = await executeQuery(reviewCheckSql, [userId, restaurantId]);

        if (reviewCheckResult.records && reviewCheckResult.records.length > 0) {
            throw new ApplicationError('You have already reviewed this restaurant', 400);
        }

        // Create new review
        const reviewId = uuidv4();
        const insertSql = `
      INSERT INTO reviews (
        review_id, restaurant_id, user_id, rating, text, visit_status, created_at, updated_at
      )
      VALUES (:param1, :param2, :param3, :param4, :param5, :param6, NOW(), NOW())
      RETURNING *
    `;

        const result = await executeQuery(insertSql, [
            reviewId,
            restaurantId,
            userId,
            rating,
            text || '',
            visitStatus || 'VISITED',
        ]);

        const record = result.records[0];
        const newReview = {
            id: record[0].stringValue,
            restaurantId: record[1].stringValue,
            userId: record[2].stringValue,
            rating: parseInt(record[3].longValue),
            text: record[4]?.stringValue || '',
            visitStatus: record[5]?.stringValue || '',
            createdAt: record[6].stringValue,
            updatedAt: record[7].stringValue,
        };

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(newReview),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Get a specific review
const getReview = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const reviewId = event.pathParameters?.id;
        if (!reviewId) {
            throw new ApplicationError('Review ID is required', 400);
        }

        const sql = `
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
      WHERE r.review_id = :param1
    `;

        const result = await executeQuery(sql, [reviewId]);

        if (!result.records || result.records.length === 0) {
            throw new ApplicationError('Review not found', 404);
        }

        const record = result.records[0];
        const review = {
            id: record[0].stringValue,
            restaurantId: record[1].stringValue,
            userId: record[2].stringValue,
            userName: record[8].stringValue,
            userAvatar: record[9]?.stringValue || '',
            rating: parseInt(record[3].longValue),
            text: record[4]?.stringValue || '',
            visitStatus: record[5]?.stringValue || '',
            likesCount: parseInt(record[10].longValue) || 0,
            createdAt: record[6].stringValue,
            updatedAt: record[7].stringValue,
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(review),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Update a specific review
const updateReview = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const reviewId = event.pathParameters?.id;
        if (!reviewId) {
            throw new ApplicationError('Review ID is required', 400);
        }

        const body = JSON.parse(event.body || '{}');
        const { rating, text, visitStatus } = body;

        // Check if review exists and belongs to the user
        const reviewCheckSql = `
      SELECT * FROM reviews WHERE review_id = :param1
    `;
        const reviewCheckResult = await executeQuery(reviewCheckSql, [reviewId]);

        if (!reviewCheckResult.records || reviewCheckResult.records.length === 0) {
            throw new ApplicationError('Review not found', 404);
        }

        const review = reviewCheckResult.records[0];

        // Check if the review belongs to the user
        if (review[2].stringValue !== userId) {
            throw new ApplicationError('You can only update your own reviews', 403);
        }

        // Update review
        const updateSql = `
      UPDATE reviews
      SET 
        rating = COALESCE(:param1, rating),
        text = COALESCE(:param2, text),
        visit_status = COALESCE(:param3, visit_status),
        updated_at = NOW()
      WHERE review_id = :param4
      RETURNING *
    `;

        const result = await executeQuery(updateSql, [rating, text, visitStatus, reviewId]);

        const record = result.records[0];
        const updatedReview = {
            id: record[0].stringValue,
            restaurantId: record[1].stringValue,
            userId: record[2].stringValue,
            rating: parseInt(record[3].longValue),
            text: record[4]?.stringValue || '',
            visitStatus: record[5]?.stringValue || '',
            createdAt: record[6].stringValue,
            updatedAt: record[7].stringValue,
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(updatedReview),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Delete a specific review
const deleteReview = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const reviewId = event.pathParameters?.id;
        if (!reviewId) {
            throw new ApplicationError('Review ID is required', 400);
        }

        // Check if review exists and belongs to the user
        const reviewCheckSql = `
      SELECT * FROM reviews WHERE review_id = :param1
    `;
        const reviewCheckResult = await executeQuery(reviewCheckSql, [reviewId]);

        if (!reviewCheckResult.records || reviewCheckResult.records.length === 0) {
            throw new ApplicationError('Review not found', 404);
        }

        const review = reviewCheckResult.records[0];

        // Check if the review belongs to the user
        if (review[2].stringValue !== userId) {
            throw new ApplicationError('You can only delete your own reviews', 403);
        }

        // Delete review
        const deleteSql = `
      DELETE FROM reviews
      WHERE review_id = :param1
      RETURNING *
    `;

        await executeQuery(deleteSql, [reviewId]);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ success: true, message: 'Review deleted successfully' }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Get reviews by a specific user
const getUserReviews = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const targetUserId = event.pathParameters?.userId;
        if (!targetUserId) {
            throw new ApplicationError('User ID is required', 400);
        }

        const { limit = '10', offset = '0' } = event.queryStringParameters || {};

        // Check if user exists
        const userCheckSql = `
      SELECT user_id FROM users WHERE user_id = :param1
    `;
        const userCheckResult = await executeQuery(userCheckSql, [targetUserId]);

        if (!userCheckResult.records || userCheckResult.records.length === 0) {
            throw new ApplicationError('User not found', 404);
        }

        // Get reviews by user
        const sql = `
      SELECT 
        r.review_id,
        r.restaurant_id,
        r.user_id,
        r.rating,
        r.text,
        r.visit_status,
        r.created_at,
        r.updated_at,
        rest.name as restaurant_name,
        rest.address as restaurant_address,
        rest.cuisine_type as restaurant_cuisine,
        (SELECT COUNT(*) FROM review_likes WHERE review_id = r.review_id) as likes_count
      FROM reviews r
      JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
      WHERE r.user_id = :param1
      ORDER BY r.created_at DESC
      LIMIT :param2 OFFSET :param3
    `;

        const result = await executeQuery(sql, [targetUserId, limit, offset]);

        const reviews = result.records.map((record: unknown) => ({
            id: record[0].stringValue,
            restaurantId: record[1].stringValue,
            restaurantName: record[8].stringValue,
            restaurantAddress: record[9]?.stringValue || '',
            restaurantCuisine: record[10]?.stringValue || '',
            userId: record[2].stringValue,
            rating: parseInt(record[3].longValue),
            text: record[4]?.stringValue || '',
            visitStatus: record[5]?.stringValue || '',
            likesCount: parseInt(record[11].longValue) || 0,
            createdAt: record[6].stringValue,
            updatedAt: record[7].stringValue,
        }));

        // Get total count
        const countSql = `
      SELECT COUNT(*) as total FROM reviews WHERE user_id = :param1
    `;
        const countResult = await executeQuery(countSql, [targetUserId]);
        const total = parseInt(countResult.records[0][0].longValue);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({
                reviews,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                },
            }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Main handler
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event)}`);

    try {
        const path = event.path;
        const method = event.httpMethod;

        // Route to the appropriate handler based on the path and method
        if (path.match(/\/reviews$/) && method === 'GET') {
            return await getReviews(event, context);
        } else if (path.match(/\/reviews$/) && method === 'POST') {
            return await createReview(event, context);
        } else if (path.match(/\/reviews\/[a-zA-Z0-9-]+$/) && method === 'GET') {
            return await getReview(event, context);
        } else if (path.match(/\/reviews\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
            return await updateReview(event, context);
        } else if (path.match(/\/reviews\/[a-zA-Z0-9-]+$/) && method === 'DELETE') {
            return await deleteReview(event, context);
        } else if (path.match(/\/users\/[a-zA-Z0-9-]+\/reviews$/) && method === 'GET') {
            return await getUserReviews(event, context);
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Not found' }),
            };
        }
    } catch (error: unknown) {
        return handleError(error, context);
    }
};
