import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    GetCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get table name from environment variable
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || '';
const CACHE_TABLE = process.env.CACHE_TABLE || '';

/**
 * Lambda handler for analytics service
 *
 * This function handles various analytics operations:
 * - Track page views
 * - Track user engagement
 * - Get analytics data
 * - Get trending content
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Validate table names
        if (!ANALYTICS_TABLE) {
            throw new Error('ANALYTICS_TABLE environment variable is not set');
        }

        // Get the HTTP method and path
        const httpMethod = event.httpMethod;
        const path = event.path;

        // Parse path to determine operation
        const pathSegments = path.split('/').filter((segment) => segment.length > 0);
        const operation = pathSegments[pathSegments.length - 1];

        // Handle different operations based on HTTP method and path
        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');

            switch (operation) {
                case 'track-view':
                    return await handleTrackView(body);
                case 'track-engagement':
                    return await handleTrackEngagement(body);
                case 'cache-data':
                    return await handleCacheData(body);
                default:
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Invalid operation' }),
                    };
            }
        } else if (httpMethod === 'GET') {
            const queryParams = event.queryStringParameters || {};

            switch (operation) {
                case 'get-analytics':
                    if (!queryParams.entityType || !queryParams.entityId) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'entityType and entityId are required' }),
                        };
                    }
                    return await handleGetAnalytics({
                        entityType: queryParams.entityType,
                        entityId: queryParams.entityId,
                        period: queryParams.period,
                    });
                case 'get-trending':
                    if (!queryParams.entityType) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'entityType is required' }),
                        };
                    }
                    return await handleGetTrending({
                        entityType: queryParams.entityType,
                        limit: queryParams.limit,
                        period: queryParams.period,
                    });
                case 'get-cached-data':
                    if (!queryParams.key) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'key is required' }),
                        };
                    }
                    return await handleGetCachedData({
                        key: queryParams.key,
                    });
                default:
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Invalid operation' }),
                    };
            }
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' }),
            };
        }
    } catch (error: unknown) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

/**
 * Handle tracking page views
 */
interface TrackViewRequest {
    entityType: string;
    entityId: string;
    userId?: string;
    deviceType?: string;
}

async function handleTrackView(body: TrackViewRequest): Promise<APIGatewayProxyResult> {
    const { entityType, entityId, userId, deviceType } = body;

    if (!entityType || !entityId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'entityType and entityId are required' }),
        };
    }

    try {
        // Increment view count
        const viewCountResult = await incrementViewCount(entityType, entityId);

        // Track unique viewer if userId is provided
        if (userId) {
            await trackUniqueViewer(entityType, entityId, userId);
        }

        // Track device type if provided
        if (deviceType) {
            await incrementDeviceTypeCount(entityType, entityId, deviceType);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'View tracked successfully',
                viewCount: viewCountResult,
            }),
        };
    } catch (error: unknown) {
        console.error('Error tracking view:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to track view' }),
        };
    }
}

/**
 * Handle tracking user engagement
 */
interface TrackEngagementRequest {
    entityType: string;
    entityId: string;
    userId?: string;
    engagementType: string;
    metadata?: Record<string, unknown>;
}

async function handleTrackEngagement(body: TrackEngagementRequest): Promise<APIGatewayProxyResult> {
    const { entityType, entityId, userId, engagementType, metadata } = body;

    if (!entityType || !entityId || !engagementType) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'entityType, entityId, and engagementType are required',
            }),
        };
    }

    try {
        // Create engagement record
        const timestamp = new Date().toISOString();
        const engagementId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

        const command = new PutCommand({
            TableName: ANALYTICS_TABLE,
            Item: {
                pk: `${entityType}#${entityId}`,
                sk: `ENGAGEMENT#${engagementId}`,
                userId: userId || 'anonymous',
                engagementType,
                metadata: metadata || {},
                timestamp,
                ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days TTL
            },
        });

        await docClient.send(command);

        // Also increment engagement count
        const updateCommand = new UpdateCommand({
            TableName: ANALYTICS_TABLE,
            Key: {
                pk: `${entityType}#${entityId}`,
                sk: `ENGAGEMENT_COUNT#${engagementType}`,
            },
            UpdateExpression: 'ADD #count :inc SET #lastUpdated = :now',
            ExpressionAttributeNames: {
                '#count': 'count',
                '#lastUpdated': 'lastUpdated',
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':now': timestamp,
            },
            ReturnValues: 'UPDATED_NEW',
        });

        const updateResult = await docClient.send(updateCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Engagement tracked successfully',
                engagementId,
                count: updateResult.Attributes?.count || 1,
            }),
        };
    } catch (error: unknown) {
        console.error('Error tracking engagement:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to track engagement' }),
        };
    }
}

/**
 * Handle caching data
 */
interface CacheDataRequest {
    key: string;
    value: unknown;
    ttl?: number;
}

async function handleCacheData(body: CacheDataRequest): Promise<APIGatewayProxyResult> {
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'key and value are required' }),
        };
    }

    try {
        // Split key into partition key and sort key
        const [pk, sk = 'DATA'] = key.split('#');

        const command = new PutCommand({
            TableName: CACHE_TABLE,
            Item: {
                pk,
                sk,
                value,
                lastUpdated: new Date().toISOString(),
                ttl: ttl ? Math.floor(Date.now() / 1000) + ttl : undefined,
            },
        });

        await docClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data cached successfully',
                key,
            }),
        };
    } catch (error: unknown) {
        console.error('Error caching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to cache data' }),
        };
    }
}

/**
 * Handle getting analytics data
 */
interface GetAnalyticsParams {
    entityType: string;
    entityId: string;
    period?: string;
}

async function handleGetAnalytics(queryParams: GetAnalyticsParams): Promise<APIGatewayProxyResult> {
    const { entityType, entityId, period } = queryParams;

    if (!entityType || !entityId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'entityType and entityId are required' }),
        };
    }

    try {
        // Get view count
        const viewData = await getEntityViews(entityType, entityId);

        // Get engagement data
        const engagementData = await getEntityEngagement(entityType, entityId);

        // Get time series data if period is specified
        let timeSeriesData = {};
        if (period) {
            timeSeriesData = await getTimeSeriesData(entityType, entityId, period);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                entityType,
                entityId,
                viewData,
                engagementData,
                timeSeriesData,
            }),
        };
    } catch (error: unknown) {
        console.error('Error getting analytics:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get analytics' }),
        };
    }
}

/**
 * Handle getting trending content
 */
interface GetTrendingParams {
    entityType: string;
    limit?: string;
    period?: string;
}

async function handleGetTrending(queryParams: GetTrendingParams): Promise<APIGatewayProxyResult> {
    const { entityType, limit = '10', period } = queryParams;

    if (!entityType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'entityType is required' }),
        };
    }

    try {
        const limitNum = parseInt(limit, 10);

        // Get trending entities based on view count
        const trendingEntities = await getTrendingEntities(entityType, limitNum, period);

        return {
            statusCode: 200,
            body: JSON.stringify({
                entityType,
                trending: trendingEntities,
            }),
        };
    } catch (error: unknown) {
        console.error('Error getting trending content:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get trending content' }),
        };
    }
}

/**
 * Handle getting cached data
 */
interface GetCachedDataParams {
    key: string;
}

async function handleGetCachedData(
    queryParams: GetCachedDataParams
): Promise<APIGatewayProxyResult> {
    const { key } = queryParams;

    if (!key) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'key is required' }),
        };
    }

    try {
        // Split key into partition key and sort key
        const [pk, sk = 'DATA'] = key.split('#');

        const command = new GetCommand({
            TableName: CACHE_TABLE,
            Key: {
                pk,
                sk,
            },
        });

        const response = await docClient.send(command);

        if (!response.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Cached data not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                key,
                value: response.Item.value,
                lastUpdated: response.Item.lastUpdated,
            }),
        };
    } catch (error: unknown) {
        console.error('Error getting cached data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get cached data' }),
        };
    }
}

/**
 * Increment view count for an entity
 */
async function incrementViewCount(entityType: string, entityId: string): Promise<number> {
    const pk = `${entityType}#${entityId}`;
    const sk = 'VIEWS';

    const command = new UpdateCommand({
        TableName: ANALYTICS_TABLE,
        Key: { pk, sk },
        UpdateExpression: 'ADD viewCount :inc SET lastUpdated = :now, entityType = :entityType',
        ExpressionAttributeValues: {
            ':inc': 1,
            ':now': new Date().toISOString(),
            ':entityType': entityType,
        },
        ReturnValues: 'UPDATED_NEW',
    });

    const response = await docClient.send(command);
    return response.Attributes?.viewCount || 0;
}

/**
 * Track unique viewer
 */
async function trackUniqueViewer(
    entityType: string,
    entityId: string,
    userId: string
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const pk = `${entityType}#${entityId}`;
    const sk = `VIEWERS#${today}`;

    // Use UpdateCommand with ADD for a SET data type
    const command = new UpdateCommand({
        TableName: ANALYTICS_TABLE,
        Key: { pk, sk },
        UpdateExpression: 'ADD viewers :user SET lastUpdated = :now',
        ExpressionAttributeValues: {
            ':user': marshall({ values: [userId] }).values,
            ':now': new Date().toISOString(),
        },
    });

    await docClient.send(command);

    // Also update the unique viewers count in the main record
    await updateUniqueViewersCount(entityType, entityId);
}

/**
 * Update unique viewers count
 */
async function updateUniqueViewersCount(entityType: string, entityId: string): Promise<void> {
    // Query to get all viewer sets
    const queryCommand = new QueryCommand({
        TableName: ANALYTICS_TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
            ':pk': `${entityType}#${entityId}`,
            ':prefix': 'VIEWERS#',
        },
    });

    const response = await docClient.send(queryCommand);

    // Calculate unique viewers across all days
    const allViewers = new Set();
    response.Items?.forEach((item) => {
        const viewers = item.viewers?.values || [];
        viewers.forEach((viewer: string) => allViewers.add(viewer));
    });

    // Update the main record
    const updateCommand = new UpdateCommand({
        TableName: ANALYTICS_TABLE,
        Key: {
            pk: `${entityType}#${entityId}`,
            sk: 'VIEWS',
        },
        UpdateExpression: 'SET uniqueViewers = :count, lastUpdated = :now',
        ExpressionAttributeValues: {
            ':count': allViewers.size,
            ':now': new Date().toISOString(),
        },
    });

    await docClient.send(updateCommand);
}

/**
 * Increment device type count
 */
async function incrementDeviceTypeCount(
    entityType: string,
    entityId: string,
    deviceType: string
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const pk = `${entityType}#${entityId}`;
    const sk = `DATE#${today}`;

    const command = new UpdateCommand({
        TableName: ANALYTICS_TABLE,
        Key: { pk, sk },
        UpdateExpression: 'ADD #deviceTypes.#device :inc SET lastUpdated = :now',
        ExpressionAttributeNames: {
            '#deviceTypes': 'deviceTypes',
            '#device': deviceType.toLowerCase(),
        },
        ExpressionAttributeValues: {
            ':inc': 1,
            ':now': new Date().toISOString(),
        },
    });

    await docClient.send(command);
}

/**
 * Get entity views
 */
interface EntityViewsData {
    viewCount: number;
    uniqueViewers: number;
    lastUpdated?: string;
    [key: string]: unknown;
}

async function getEntityViews(entityType: string, entityId: string): Promise<EntityViewsData> {
    const command = new GetCommand({
        TableName: ANALYTICS_TABLE,
        Key: {
            pk: `${entityType}#${entityId}`,
            sk: 'VIEWS',
        },
    });

    const response = await docClient.send(command);
    return (
        (response.Item as EntityViewsData) || {
            viewCount: 0,
            uniqueViewers: 0,
            lastUpdated: new Date().toISOString(),
        }
    );
}

/**
 * Get entity engagement
 */
async function getEntityEngagement(
    entityType: string,
    entityId: string
): Promise<Record<string, number>> {
    const queryCommand = new QueryCommand({
        TableName: ANALYTICS_TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
            ':pk': `${entityType}#${entityId}`,
            ':prefix': 'ENGAGEMENT_COUNT#',
        },
    });

    const response = await docClient.send(queryCommand);

    // Transform the results into a more usable format
    const engagementCounts: Record<string, number> = {};
    response.Items?.forEach((item) => {
        const engagementType = item.sk.split('#')[1];
        engagementCounts[engagementType] = item.count || 0;
    });

    return engagementCounts;
}

/**
 * Get time series data
 */
interface DeviceTypes {
    mobile: number;
    desktop: number;
    tablet: number;
    [key: string]: number;
}

interface TimeSeriesEntry {
    views: number;
    deviceTypes: DeviceTypes;
}

type TimeSeriesData = Record<string, TimeSeriesEntry>;

async function getTimeSeriesData(
    entityType: string,
    entityId: string,
    period: string
): Promise<TimeSeriesData> {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
        case 'day':
            startDate.setDate(endDate.getDate() - 1);
            break;
        case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        default:
            startDate.setDate(endDate.getDate() - 7); // Default to week
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Query to get all daily records
    const queryCommand = new QueryCommand({
        TableName: ANALYTICS_TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
            ':pk': `${entityType}#${entityId}`,
            ':prefix': 'DATE#',
        },
    });

    const response = await docClient.send(queryCommand);

    // Transform the results into a time series format
    const timeSeriesData: TimeSeriesData = {};

    // Initialize all dates in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        timeSeriesData[dateStr] = {
            views: 0,
            deviceTypes: {
                mobile: 0,
                desktop: 0,
                tablet: 0,
            },
        };
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in actual data
    response.Items?.forEach((item) => {
        const dateStr = item.sk.split('#')[1];
        if (dateStr >= startDateStr && dateStr <= endDateStr) {
            timeSeriesData[dateStr] = {
                views: item.views || 0,
                deviceTypes: item.deviceTypes || {
                    mobile: 0,
                    desktop: 0,
                    tablet: 0,
                },
            };
        }
    });

    return timeSeriesData;
}

/**
 * Get trending entities
 */
interface TrendingEntity {
    entityId: string;
    entityType?: string;
    viewCount: number;
    uniqueViewers: number;
    lastUpdated?: string;
}

async function getTrendingEntities(
    entityType: string,
    limit: number,
    period?: string
): Promise<TrendingEntity[]> {
    // If period is specified, we need to calculate trending based on recent data
    if (period) {
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'day':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 7); // Default to week
        }

        const startDateStr = startDate.toISOString().split('T')[0];

        // Query to get all entities of the specified type with recent views
        const queryCommand = new QueryCommand({
            TableName: ANALYTICS_TABLE,
            IndexName: 'GSI1',
            KeyConditionExpression: 'entityType = :type',
            FilterExpression: 'lastUpdated >= :startDate',
            ExpressionAttributeValues: {
                ':type': entityType,
                ':startDate': startDateStr,
            },
            Limit: limit,
            ScanIndexForward: false, // Sort in descending order
        });

        const response = await docClient.send(queryCommand);

        // Transform the results
        return (response.Items || []).map((item) => {
            const entityId = item.pk.split('#')[1];
            return {
                entityId,
                viewCount: item.viewCount || 0,
                uniqueViewers: item.uniqueViewers || 0,
                lastUpdated: item.lastUpdated,
            };
        });
    } else {
        // Query to get all entities of the specified type
        const queryCommand = new QueryCommand({
            TableName: ANALYTICS_TABLE,
            IndexName: 'GSI1',
            KeyConditionExpression: 'entityType = :type',
            ExpressionAttributeValues: {
                ':type': entityType,
            },
            Limit: limit,
            ScanIndexForward: false, // Sort in descending order
        });

        const response = await docClient.send(queryCommand);

        // Transform the results
        return (response.Items || []).map((item) => {
            const entityId = item.pk.split('#')[1];
            return {
                entityId,
                viewCount: item.viewCount || 0,
                uniqueViewers: item.uniqueViewers || 0,
                lastUpdated: item.lastUpdated,
            };
        });
    }
}
