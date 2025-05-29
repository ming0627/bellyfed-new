import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Initialize DynamoDB clients
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE || 'Restaurants';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
};

async function getRestaurantById(id: string): Promise<APIGatewayProxyResult> {
    console.log(`[getRestaurantById] Starting retrieval for restaurant ID: ${id}`);
    try {
        const command = new GetCommand({
            TableName: RESTAURANTS_TABLE,
            Key: {
                id: id,
            },
        });
        console.log(
            `[getRestaurantById] Executing DynamoDB GetCommand for table: ${RESTAURANTS_TABLE}`
        );

        const result = await docClient.send(command);
        console.log(`[getRestaurantById] DynamoDB query completed. Item found: ${!!result.Item}`);

        if (!result.Item) {
            console.log(`[getRestaurantById] Restaurant with ID ${id} not found`);
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Restaurant not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Item),
        };
    } catch (error: unknown) {
        console.error(`[getRestaurantById] Error retrieving restaurant ID ${id}:`, error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: error instanceof Error ? error.message : 'Internal server error',
            }),
        };
    }
}

async function listRestaurants(
    queryParams: Record<string, string | undefined>
): Promise<APIGatewayProxyResult> {
    console.log('[listRestaurants] Starting restaurant list retrieval with params:', queryParams);
    try {
        const { limit = '50', lastEvaluatedKey, cuisineType, priceRange } = queryParams;

        const filterExpressions: string[] = [];
        const expressionAttributeValues: Record<string, string | number | boolean> = {};

        if (cuisineType) {
            filterExpressions.push('cuisineType = :cuisineType');
            expressionAttributeValues[':cuisineType'] = cuisineType;
        }

        if (priceRange) {
            filterExpressions.push('priceRange = :priceRange');
            expressionAttributeValues[':priceRange'] = priceRange;
        }

        const params: {
            TableName: string;
            Limit: number;
            FilterExpression?: string;
            ExpressionAttributeValues?: Record<string, string | number | boolean>;
            ExclusiveStartKey?: Record<string, unknown>;
        } = {
            TableName: RESTAURANTS_TABLE,
            Limit: parseInt(limit),
        };

        if (filterExpressions.length > 0) {
            params.FilterExpression = filterExpressions.join(' AND ');
            params.ExpressionAttributeValues = expressionAttributeValues;
        }

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
        }

        console.log(
            '[listRestaurants] Executing DynamoDB ScanCommand with params:',
            JSON.stringify(params, null, 2)
        );
        const command = new ScanCommand(params);
        const result = await docClient.send(command);
        console.log(
            `[listRestaurants] Query completed. Items found: ${result.Count}, Scanned: ${result.ScannedCount}`
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                items: result.Items,
                lastEvaluatedKey: result.LastEvaluatedKey,
                count: result.Count,
                scannedCount: result.ScannedCount,
            }),
        };
    } catch (error: unknown) {
        console.error('[listRestaurants] Error listing restaurants:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: error instanceof Error ? error.message : 'Internal server error',
            }),
        };
    }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('[handler] Event received:', JSON.stringify(event, null, 2));
    try {
        // GET /restaurants/{id}
        if (event.resource === '/restaurants/{id}' && event.httpMethod === 'GET') {
            console.log('[handler] Retrieving restaurant by ID');
            const id = event.pathParameters?.id;
            if (!id) {
                console.log('[handler] Restaurant ID is required');
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'Restaurant ID is required' }),
                };
            }
            return await getRestaurantById(id);
        }

        // GET /restaurants/list
        if (event.resource === '/restaurants/list' && event.httpMethod === 'GET') {
            console.log('[handler] Listing restaurants');
            return await listRestaurants(event.queryStringParameters || {});
        }

        console.log('[handler] Unknown resource or method');
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Not found' }),
        };
    } catch (error: unknown) {
        console.error('[handler] Error processing request:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: error instanceof Error ? error.message : 'Internal server error',
            }),
        };
    }
};
