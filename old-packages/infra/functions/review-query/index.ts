import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda';
import { docClient, EventData, sendEvent } from '@infra/utils/aws';
import { ApplicationError, handleError } from '@infra/utils/errors';

const { REVIEW_TABLE, ANALYTICS_EVENT_BUS } = process.env;

if (!REVIEW_TABLE || !ANALYTICS_EVENT_BUS) {
    throw new Error('Required environment variables not set');
}

const reviewTable: string = REVIEW_TABLE;
const analyticsEventBus: string = ANALYTICS_EVENT_BUS;

// Validate table name format
if (!reviewTable.match(/^[a-zA-Z0-9_.-]+$/)) {
    throw new Error('Invalid table name format');
}

interface Review {
    id: string;
    restaurantId: string;
    userId: string;
    rating: number;
    text: string;
    timestamp: string;
    likes?: number;
    replies?: string[];
}

async function getReview(reviewId: string, _context: Context): Promise<Review> {
    // Validate input
    if (!reviewId.match(/^[a-zA-Z0-9_-]+$/)) {
        throw new ApplicationError('Invalid review ID format', 400);
    }

    const params = {
        TableName: reviewTable,
        Key: {
            id: reviewId,
        },
    };

    const result = await docClient.send(new GetCommand(params));

    if (!result.Item) {
        throw new ApplicationError('Review not found', 404);
    }

    await logReviewAnalytics(
        'REVIEW_VIEW',
        {
            reviewId,
            type: 'single',
        },
        _context
    ).catch((error) => {
        console.error('Failed to log analytics:', error);
    });

    return result.Item as Review;
}

async function getRestaurantReviews(restaurantId: string, _context: Context): Promise<Review[]> {
    // Validate input
    if (!restaurantId.match(/^[a-zA-Z0-9_-]+$/)) {
        throw new ApplicationError('Invalid restaurant ID format', 400);
    }

    const params = {
        TableName: reviewTable,
        IndexName: 'restaurantId-index',
        KeyConditionExpression: 'restaurantId = :restaurantId',
        ExpressionAttributeValues: {
            ':restaurantId': restaurantId,
        },
    };

    const result = await docClient.send(new QueryCommand(params));
    const reviews = result.Items || [];

    await logReviewAnalytics(
        'REVIEWS_VIEW',
        {
            restaurantId,
            reviewCount: reviews.length,
            type: 'list',
        },
        _context
    ).catch((error) => {
        console.error('Failed to log analytics:', error);
    });

    return reviews as Review[];
}

async function getUserReviews(userId: string, _context: Context): Promise<Review[]> {
    // Validate input
    if (!userId.match(/^[a-zA-Z0-9_-]+$/)) {
        throw new ApplicationError('Invalid user ID format', 400);
    }

    const params = {
        TableName: reviewTable,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
    };

    const result = await docClient.send(new QueryCommand(params));
    const reviews = result.Items || [];

    await logReviewAnalytics(
        'USER_REVIEWS_VIEW',
        {
            userId,
            reviewCount: reviews.length,
            type: 'list',
        },
        _context
    ).catch((error) => {
        console.error('Failed to log analytics:', error);
    });

    return reviews as Review[];
}

async function logReviewAnalytics(
    eventType: string,
    detail: Record<string, unknown>,
    _context: Context
): Promise<void> {
    const analyticsEvent: EventData = {
        eventType,
        source: 'review-query',
        requestId: _context.awsRequestId,
        detail: {
            ...detail,
            timestamp: new Date().toISOString(),
        },
    };

    await sendEvent(analyticsEvent, analyticsEventBus);
}

export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        // Remove /v1 prefix from path
        event.path = event.path.replace(/^\/v1/, '');

        const { reviewId, restaurantId, userId } = event.pathParameters || {};

        let response;
        if (reviewId) {
            response = await getReview(reviewId, _context);
        } else if (restaurantId) {
            response = await getRestaurantReviews(restaurantId, _context);
        } else if (userId) {
            response = await getUserReviews(userId, _context);
        } else {
            throw new ApplicationError('Missing required parameters', 400);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({
                success: true,
                data: response,
                requestId: _context.awsRequestId,
            }),
        };
    } catch (error: unknown) {
        console.error('Error processing review query:', error);
        return handleError(error as Error, _context);
    }
};
