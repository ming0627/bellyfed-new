import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { rdsOperations } from '@utils/aws';
import { ApplicationError, handleError, measureTime } from '@utils/helpers';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

// Initialize AWS SDK clients
const eventBridgeClient = new EventBridgeClient({});

// Initialize Powertools
const logger = new Logger({ serviceName: 'rds-restaurant-query' });
const tracer = new Tracer({ serviceName: 'rds-restaurant-query' });
const metrics = new Metrics({ namespace: 'Bellyfed', serviceName: 'rds-restaurant-query' });

// Get environment variables
const resourceArn = process.env.DB_CLUSTER_ARN || '';
const secretArn = process.env.DB_SECRET_ARN || '';
const database = process.env.DB_NAME || '';
const analyticsEventBus = process.env.ANALYTICS_EVENT_BUS || '';

// CORS headers for API responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
};

/**
 * Send analytics event to EventBridge
 */
async function sendEvent(event: unknown, eventBusName: string, retries = 3): Promise<void> {
    if (!eventBusName) {
        logger.warn('Analytics event bus name not provided, skipping analytics');
        return;
    }

    try {
        await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: eventBusName,
                        Source: 'bellyfed.restaurant',
                        DetailType: event.eventType,
                        Detail: JSON.stringify(event.detail || {}),
                    },
                ],
            })
        );
        logger.debug('Analytics event sent successfully', { event });
    } catch (error: unknown) {
        logger.error('Failed to send analytics event', { error, event, retries });
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await sendEvent(event, eventBusName, retries - 1);
        }
    }
}

/**
 * Get restaurant by ID from RDS
 */
async function getRestaurantById(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const startTime = process.hrtime();

    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            logger.info('[getRestaurantById] Missing ID parameter');
            const error = new ApplicationError('Restaurant ID is required', 400);
            return handleError(error, context);
        }

        logger.info('[getRestaurantById] Fetching restaurant:', { id });

        const queryStart = process.hrtime();
        const result = await rdsOperations.executeQuery({
            resourceArn,
            secretArn,
            database,
            sql: `
                SELECT * FROM restaurants
                WHERE restaurant_id = :id
            `,
            parameters: [{ name: 'id', value: { stringValue: id } }],
        });
        const queryDuration = measureTime(queryStart);

        logger.info('[getRestaurantById] RDS query completed', {
            found: result.length > 0,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        if (result.length === 0) {
            logger.info('[getRestaurantById] Restaurant not found:', { id });
            const error = new ApplicationError('Restaurant not found', 404);
            return handleError(error, context);
        }

        // Log analytics event asynchronously
        sendEvent(
            {
                eventType: 'RESTAURANT_GET',
                source: 'rds-restaurant-query',
                requestId: context.awsRequestId,
                detail: {
                    id,
                    queryDuration: measureTime(startTime),
                    timestamp: new Date().toISOString(),
                },
            },
            analyticsEventBus,
            3
        ).catch((error) => logger.error('Failed to send analytics', { error }));

        const duration = measureTime(startTime);
        logger.info('[getRestaurantById] Request completed', {
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        // Add metrics
        metrics.addMetric('RestaurantGetLatency', duration, 'Milliseconds');
        metrics.addMetadata('restaurantId', id);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result[0]),
        };
    } catch (error: unknown) {
        logger.error('[getRestaurantById] Error:', { error });
        return handleError(error as Error, context);
    }
}

/**
 * List restaurants from RDS with optional filtering
 */
async function listRestaurants(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const startTime = process.hrtime();

    try {
        const {
            limit = '12',
            offset = '0',
            city,
            cuisine_type,
        } = event.queryStringParameters || {};
        const pageLimit = Math.min(parseInt(limit, 10) || 12, 50);
        const pageOffset = parseInt(offset, 10) || 0;

        logger.info('[listRestaurants] Query parameters:', {
            limit: pageLimit,
            offset: pageOffset,
            city,
            cuisine_type,
        });

        // Build SQL query with optional filters
        let sql = 'SELECT * FROM restaurants';
        const parameters: any[] = [];
        const conditions: string[] = [];

        if (city) {
            conditions.push('city = :city');
            parameters.push({ name: 'city', value: { stringValue: city } });
        }

        if (cuisine_type) {
            conditions.push(':cuisine_type = ANY(cuisine_type)');
            parameters.push({ name: 'cuisine_type', value: { stringValue: cuisine_type } });
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY name LIMIT :limit OFFSET :offset';
        parameters.push({ name: 'limit', value: { longValue: pageLimit } });
        parameters.push({ name: 'offset', value: { longValue: pageOffset } });

        // Execute query
        const queryStart = process.hrtime();
        const result = await rdsOperations.executeQuery({
            resourceArn,
            secretArn,
            database,
            sql,
            parameters,
        });
        const queryDuration = measureTime(queryStart);

        logger.info('[listRestaurants] RDS query completed', {
            itemCount: result.length,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        // Get total count for pagination
        const countSql =
            'SELECT COUNT(*) as total FROM restaurants' +
            (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');

        const countResult = await rdsOperations.executeQuery({
            resourceArn,
            secretArn,
            database,
            sql: countSql,
            parameters: parameters.filter((p) => p.name !== 'limit' && p.name !== 'offset'),
        });

        const totalCount = parseInt(countResult[0].total);

        // Calculate next offset for pagination
        const nextOffset = pageOffset + pageLimit < totalCount ? pageOffset + pageLimit : null;

        // Log analytics event asynchronously
        sendEvent(
            {
                eventType: 'RESTAURANTS_LISTED',
                source: 'rds-restaurant-query',
                requestId: context.awsRequestId,
                detail: {
                    filters: { city, cuisine_type },
                    count: result.length,
                    totalCount,
                    queryDuration: measureTime(startTime),
                    timestamp: new Date().toISOString(),
                },
            },
            analyticsEventBus,
            3
        ).catch((error) => logger.error('Failed to send analytics', { error }));

        const duration = measureTime(startTime);
        logger.info('[listRestaurants] Request completed', {
            itemCount: result.length,
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        // Add metrics
        metrics.addMetric('RestaurantsListLatency', duration, 'Milliseconds');
        metrics.addMetric('RestaurantsListCount', result.length, 'Count');

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                items: result,
                count: result.length,
                totalCount,
                nextOffset,
            }),
        };
    } catch (error: unknown) {
        logger.error('[listRestaurants] Error:', { error });
        return handleError(error as Error, context);
    }
}

/**
 * Search restaurants from RDS
 */
async function searchRestaurants(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const startTime = process.hrtime();

    try {
        const { q, limit = '12', offset = '0' } = event.queryStringParameters || {};
        const pageLimit = Math.min(parseInt(limit, 10) || 12, 50);
        const pageOffset = parseInt(offset, 10) || 0;

        if (!q) {
            logger.info('[searchRestaurants] Missing search query');
            const error = new ApplicationError('Search query is required', 400);
            return handleError(error, context);
        }

        logger.info('[searchRestaurants] Query parameters:', {
            q,
            limit: pageLimit,
            offset: pageOffset,
        });

        // Build search query
        const searchTerm = `%${q}%`;
        const sql = `
            SELECT * FROM restaurants
            WHERE
                name ILIKE :searchTerm OR
                :searchTerm = ANY(cuisine_type) OR
                address ILIKE :searchTerm OR
                city ILIKE :searchTerm
            ORDER BY name
            LIMIT :limit OFFSET :offset
        `;

        const parameters = [
            { name: 'searchTerm', value: { stringValue: searchTerm } },
            { name: 'limit', value: { longValue: pageLimit } },
            { name: 'offset', value: { longValue: pageOffset } },
        ];

        // Execute query
        const queryStart = process.hrtime();
        const result = await rdsOperations.executeQuery({
            resourceArn,
            secretArn,
            database,
            sql,
            parameters,
        });
        const queryDuration = measureTime(queryStart);

        logger.info('[searchRestaurants] RDS query completed', {
            itemCount: result.length,
            duration: `${queryDuration.toFixed(2)}ms`,
        });

        // Get total count for pagination
        const countSql = `
            SELECT COUNT(*) as total FROM restaurants
            WHERE
                name ILIKE :searchTerm OR
                :searchTerm = ANY(cuisine_type) OR
                address ILIKE :searchTerm OR
                city ILIKE :searchTerm
        `;

        const countResult = await rdsOperations.executeQuery({
            resourceArn,
            secretArn,
            database,
            sql: countSql,
            parameters: [{ name: 'searchTerm', value: { stringValue: searchTerm } }],
        });

        const totalCount = parseInt(countResult[0].total);

        // Calculate next offset for pagination
        const nextOffset = pageOffset + pageLimit < totalCount ? pageOffset + pageLimit : null;

        // Log analytics event asynchronously
        sendEvent(
            {
                eventType: 'RESTAURANTS_SEARCHED',
                source: 'rds-restaurant-query',
                requestId: context.awsRequestId,
                detail: {
                    searchTerm: q,
                    count: result.length,
                    totalCount,
                    queryDuration: measureTime(startTime),
                    timestamp: new Date().toISOString(),
                },
            },
            analyticsEventBus,
            3
        ).catch((error) => logger.error('Failed to send analytics', { error }));

        const duration = measureTime(startTime);
        logger.info('[searchRestaurants] Request completed', {
            itemCount: result.length,
            duration: `${duration.toFixed(2)}ms`,
            requestId: context.awsRequestId,
        });

        // Add metrics
        metrics.addMetric('RestaurantsSearchLatency', duration, 'Milliseconds');
        metrics.addMetric('RestaurantsSearchCount', result.length, 'Count');

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                items: result,
                count: result.length,
                totalCount,
                nextOffset,
            }),
        };
    } catch (error: unknown) {
        logger.error('[searchRestaurants] Error:', { error });
        return handleError(error as Error, context);
    }
}

/**
 * Lambda handler
 */
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    // Initialize Powertools
    logger.addContext(context);
    tracer.captureAWSv3Client(eventBridgeClient);

    // Set up correlation IDs for distributed tracing
    const correlationIds = {
        awsRequestId: context.awsRequestId,
        xRayTraceId: process.env._X_AMZN_TRACE_ID || '',
    };
    logger.appendKeys(correlationIds);

    // Log the incoming event
    logger.info('Received event', { event });

    try {
        // Handle CORS preflight requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                },
                body: '',
            };
        }

        // Route the request based on the path
        const path = event.path;
        const method = event.httpMethod;

        if (method === 'GET') {
            if (path.match(/\/restaurants\/[^/]+$/)) {
                return await getRestaurantById(event, context);
            } else if (path === '/restaurants') {
                if (event.queryStringParameters?.q) {
                    return await searchRestaurants(event, context);
                } else {
                    return await listRestaurants(event, context);
                }
            }
        }

        // If no route matches
        logger.warn('No matching route', { path, method });
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Not Found' }),
        };
    } catch (error: unknown) {
        logger.error('Unhandled error', { error });
        return handleError(error as Error, context);
    } finally {
        // Publish metrics
        metrics.publishStoredMetrics();
    }
};
