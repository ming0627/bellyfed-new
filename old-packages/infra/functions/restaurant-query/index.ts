import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb';
import { GetCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { docClient, sendEvent } from '@infra/utils/aws';
import { ApplicationError, handleError } from '@infra/utils/errors';

const { RESTAURANT_TABLE, ANALYTICS_EVENT_BUS } = process.env;

// Validate environment variables at module initialization
if (!RESTAURANT_TABLE || !ANALYTICS_EVENT_BUS) {
    throw new Error('Required environment variables not set');
}

// Create validated constants
const restaurantTable: string = RESTAURANT_TABLE;
const analyticsEventBus: string = ANALYTICS_EVENT_BUS;

// Validate table name format
if (!restaurantTable.match(/^[a-zA-Z0-9_.-]+$/)) {
    throw new Error('Invalid table name format');
}

// Performance monitoring
function measureTime(startTime: [number, number]): number {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    return seconds * 1000 + nanoseconds / 1000000;
}

export const getRestaurantById = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const startTime = process.hrtime();
    console.log('[getRestaurantById] Starting request:', {
        pathParams: event.pathParameters,
        requestId: context.awsRequestId,
    });

    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            console.log('[getRestaurantById] Missing ID parameter');
            const error = new ApplicationError('Restaurant ID is required', 400);
            return handleError(error, context);
        }

        console.log('[getRestaurantById] Fetching restaurant:', { id });

        const queryStart = process.hrtime();
        const response = await docClient.send(
            new GetCommand({
                TableName: restaurantTable,
                Key: {
                    id,
                    type: 'restaurant', // Add the required sort key
                },
                ConsistentRead: false,
                ReturnConsumedCapacity: 'TOTAL' as ReturnConsumedCapacity,
            })
        );
        const queryDuration = measureTime(queryStart);
        console.log('[getRestaurantById] DynamoDB response:', {
            found: !!response.Item,
            consumedCapacity: response.ConsumedCapacity,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        if (!response.Item) {
            console.log('[getRestaurantById] Restaurant not found:', { id });
            const error = new ApplicationError('Restaurant not found', 404);
            return handleError(error, context);
        }

        // Log analytics event asynchronously
        sendEvent(
            {
                eventType: 'RESTAURANT_GET',
                source: 'restaurant-query',
                requestId: context.awsRequestId,
                detail: {
                    id,
                    queryDuration: measureTime(startTime),
                    timestamp: new Date().toISOString(),
                },
            },
            analyticsEventBus,
            3
        ).catch(console.error);

        const result = {
            ...response.Item,
            _debug: {
                totalDuration: measureTime(startTime),
                consumedCapacity: response.ConsumedCapacity,
            },
        };

        const duration = measureTime(startTime);
        console.log('[getRestaurantById] Request completed:', {
            id,
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'X-Response-Time': `${duration.toFixed(2)}ms`,
            },
            body: JSON.stringify(result),
        };
    } catch (error: unknown) {
        console.error('[getRestaurantById] Error:', error);
        return handleError(error as Error, context);
    }
};

export const listRestaurants = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const startTime = process.hrtime();
    console.log('[listRestaurants] Starting request:', {
        queryParams: event.queryStringParameters,
        requestId: context.awsRequestId,
    });

    try {
        const { limit = '12', nextToken } = event.queryStringParameters || {};
        const pageLimit = Math.min(parseInt(limit, 10) || 12, 50);

        console.log('[listRestaurants] Query parameters:', {
            limit: pageLimit,
            hasNextToken: !!nextToken,
        });

        const scanParams: ScanCommandInput = {
            TableName: restaurantTable,
            Limit: pageLimit,
            ReturnConsumedCapacity: 'TOTAL' as ReturnConsumedCapacity,
        };

        if (nextToken) {
            try {
                scanParams.ExclusiveStartKey = JSON.parse(
                    Buffer.from(nextToken, 'base64').toString()
                );
                console.log('[listRestaurants] Using pagination token:', {
                    decodedToken: scanParams.ExclusiveStartKey,
                });
            } catch (error: unknown) {
                console.error('[listRestaurants] Invalid next token:', error);
                throw new ApplicationError('Invalid pagination token', 400);
            }
        }

        const queryStart = process.hrtime();
        const response = await docClient.send(new ScanCommand(scanParams));
        const queryDuration = measureTime(queryStart);

        console.log('[listRestaurants] DynamoDB response:', {
            itemCount: response.Count,
            hasMore: !!response.LastEvaluatedKey,
            consumedCapacity: response.ConsumedCapacity,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        const result = {
            items: response.Items || [],
            count: response.Count || 0,
            nextToken: response.LastEvaluatedKey
                ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
                : undefined,
        };

        const duration = measureTime(startTime);
        console.log('[listRestaurants] Request completed:', {
            itemCount: result.count,
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'X-Response-Time': `${duration.toFixed(2)}ms`,
            },
            body: JSON.stringify(result),
        };
    } catch (error: unknown) {
        console.error('[listRestaurants] Error:', error);
        return handleError(error as Error, context);
    }
};

export const searchRestaurants = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const totalStart = process.hrtime();
    console.log('[searchRestaurants] Starting request:', {
        queryParams: event.queryStringParameters,
        requestId: context.awsRequestId,
    });

    try {
        const {
            query,
            cuisine,
            location,
            minRating,
            maxPrice,
            limit = '10',
            nextToken,
        } = event.queryStringParameters || {};

        // Validate input parameters
        const pageLimit = Math.min(parseInt(limit, 10) || 10, 50); // Max 50 items per page

        if (
            minRating &&
            (isNaN(Number(minRating)) || Number(minRating) < 0 || Number(minRating) > 5)
        ) {
            console.log('[searchRestaurants] Invalid minRating parameter');
            const error = new ApplicationError('minRating must be a number between 0 and 5', 400);
            return handleError(error, context);
        }

        let filterExpression = '';
        const expressionAttributeValues: Record<string, unknown> = {};
        const expressionAttributeNames: Record<string, string> = {};

        const filterStart = process.hrtime();
        if (cuisine) {
            filterExpression += '#cuisine = :cuisine';
            expressionAttributeValues[':cuisine'] = cuisine.toLowerCase();
            expressionAttributeNames['#cuisine'] = 'cuisine';
        }

        if (location) {
            if (filterExpression) filterExpression += ' AND ';
            filterExpression += '#location = :location';
            expressionAttributeValues[':location'] = location.toLowerCase();
            expressionAttributeNames['#location'] = 'location';
        }

        if (minRating) {
            if (filterExpression) filterExpression += ' AND ';
            filterExpression += '#rating >= :minRating';
            expressionAttributeValues[':minRating'] = Number(minRating);
            expressionAttributeNames['#rating'] = 'rating';
        }

        if (maxPrice) {
            if (filterExpression) filterExpression += ' AND ';
            filterExpression += '#price <= :maxPrice';
            expressionAttributeValues[':maxPrice'] = maxPrice;
            expressionAttributeNames['#price'] = 'price';
        }
        const filterDuration = measureTime(filterStart);
        console.log('[searchRestaurants] Filter expression built:', {
            filterExpression,
            duration: `${filterDuration.toFixed(2)}ms`,
        });

        const params: ScanCommandInput = {
            TableName: restaurantTable,
            Limit: pageLimit,
            ConsistentRead: false,
            ReturnConsumedCapacity: 'TOTAL' as ReturnConsumedCapacity,
            ...(nextToken && {
                ExclusiveStartKey: JSON.parse(Buffer.from(nextToken, 'base64').toString()),
            }),
            ...(filterExpression && {
                FilterExpression: filterExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
            }),
        };

        console.log('[searchRestaurants] DynamoDB params:', JSON.stringify(params, null, 2));
        const queryStart = process.hrtime();
        const response = await docClient.send(new ScanCommand(params));
        const queryDuration = measureTime(queryStart);
        console.log('[searchRestaurants] DynamoDB response:', {
            itemCount: response.Count,
            scannedCount: response.ScannedCount,
            consumedCapacity: response.ConsumedCapacity,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        const nextPageToken = response.LastEvaluatedKey
            ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
            : undefined;

        // Log analytics event asynchronously
        sendEvent(
            {
                eventType: 'RESTAURANT_SEARCH',
                source: 'restaurant-query',
                requestId: context.awsRequestId,
                detail: {
                    query,
                    cuisine,
                    location,
                    minRating,
                    maxPrice,
                    resultCount: response.Items?.length || 0,
                    queryDuration: measureTime(totalStart),
                    timestamp: new Date().toISOString(),
                },
            },
            analyticsEventBus,
            3
        ).catch(console.error);

        const result = {
            items: response.Items || [],
            nextToken: nextPageToken,
            count: response.Items?.length || 0,
            _debug: {
                totalDuration: measureTime(totalStart),
                scannedCount: response.ScannedCount,
                consumedCapacity: response.ConsumedCapacity,
            },
        };

        const duration = measureTime(totalStart);
        console.log('[searchRestaurants] Request completed:', {
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'X-Response-Time': `${duration.toFixed(2)}ms`,
            },
            body: JSON.stringify(result),
        };
    } catch (error: unknown) {
        console.error('[searchRestaurants] Error:', error);
        return handleError(error as Error, context);
    }
};

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const startTime = process.hrtime();
    console.log('[HANDLER] Request received:', {
        path: event.path,
        method: event.httpMethod,
        requestId: context.awsRequestId,
        headers: event.headers,
        queryParams: event.queryStringParameters,
        pathParams: event.pathParameters,
    });

    try {
        const path = event.path.toLowerCase().replace(/^\/v1/, ''); // Remove /v1 prefix
        const method = event.httpMethod.toUpperCase();

        console.log('[HANDLER] Processed path:', {
            originalPath: event.path,
            processedPath: path,
            method,
        });

        let result: APIGatewayProxyResult;

        if (path.match(/^\/restaurants\/list\/?$/) && method === 'GET') {
            console.log('[HANDLER] Routing to listRestaurants');
            result = await listRestaurants(event, context);
        } else if (path.match(/^\/restaurants\/[^/]+\/?$/) && method === 'GET') {
            console.log('[HANDLER] Routing to getRestaurantById');
            result = await getRestaurantById(event, context);
        } else if (path.match(/^\/restaurants\/?$/) && method === 'GET') {
            console.log('[HANDLER] Routing to searchRestaurants');
            result = await searchRestaurants(event, context);
        } else {
            console.log('[HANDLER] No matching route found');
            const error = new ApplicationError('Not Found', 404);
            result = handleError(error, context);
        }

        const duration = measureTime(startTime);
        console.log('[HANDLER] Request completed:', {
            statusCode: result.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        return result;
    } catch (error: unknown) {
        console.error('[HANDLER] Unhandled error:', error);
        return handleError(error as Error, context);
    }
};
