import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ApplicationError } from '../errors';

type SupportedEvent = APIGatewayProxyEvent | Record<string, unknown>;

const errorHandler = (): MiddlewareObj => ({
    onError: async (request) => {
        const { error, event } = request;

        if (!error) {
            throw new Error('No error object provided');
        }

        console.error('Error in query-processor Lambda:', error);

        const typedEvent = event as SupportedEvent;
        const statusCode = error instanceof ApplicationError ? error.statusCode : 500;
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';

        if (
            'headers' in typedEvent &&
            'httpMethod' in typedEvent &&
            typedEvent.headers &&
            typedEvent.httpMethod
        ) {
            // For API Gateway, return a 500 error response
            request.response = {
                statusCode,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: errorMessage,
                }),
            };
        } else {
            // For other sources, rethrow the error
            throw error;
        }
    },
});

export default errorHandler;
