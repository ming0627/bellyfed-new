import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { getUserRankings } from './getUserRankings';
import { getUserRanking } from './getUserRanking';
import { createRanking } from './createRanking';
import { updateRanking } from './updateRanking';
import { deleteRanking } from './deleteRanking';
import { getLocalRankings } from './getLocalRankings';
import { getGlobalRankings } from './getGlobalRankings';

// Initialize clients
export const rdsClient = new RDSDataClient({});

// Environment variables
export const environment = process.env.ENVIRONMENT || 'dev';
export const dbSecretArn = process.env.DB_SECRET_ARN || '';
export const dbClusterArn = process.env.DB_CLUSTER_ARN || '';
export const dbName = process.env.DB_NAME || 'bellyfed';

// Error handling class
export class ApplicationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApplicationError';
    }
}

// Helper function to handle errors
export const handleError = (error: unknown, context: Context): APIGatewayProxyResult => {
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
        if (path.match(/\/rankings\/my$/) && method === 'GET') {
            return await getUserRankings(event, context);
        } else if (path.match(/\/rankings\/my\/[a-zA-Z0-9-]+$/) && method === 'GET') {
            return await getUserRanking(event, context);
        } else if (path.match(/\/rankings\/my\/[a-zA-Z0-9-]+$/) && method === 'POST') {
            return await createRanking(event, context);
        } else if (path.match(/\/rankings\/my\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
            return await updateRanking(event, context);
        } else if (path.match(/\/rankings\/my\/[a-zA-Z0-9-]+$/) && method === 'DELETE') {
            return await deleteRanking(event, context);
        } else if (path.match(/\/rankings\/local\/[a-zA-Z0-9-]+$/) && method === 'GET') {
            return await getLocalRankings(event, context);
        } else if (path.match(/\/rankings\/global\/[a-zA-Z0-9-]+$/) && method === 'GET') {
            return await getGlobalRankings(event, context);
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
