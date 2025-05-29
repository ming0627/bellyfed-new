import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

type CognitoTriggerEvent = {
    triggerSource?: string;
    [key: string]: unknown;
};

type SupportedEvent = APIGatewayProxyEvent | CognitoTriggerEvent | Record<string, unknown>;

const errorHandler = (): MiddlewareObj => {
    return {
        onError: async (request) => {
            const { error, event } = request;

            console.error('Error in event-processor Lambda:', error);

            const typedEvent = event as SupportedEvent;

            // Handle errors based on the event source
            if ('triggerSource' in typedEvent && typedEvent.triggerSource) {
                // For Cognito triggers, rethrow the error to fail the authentication flow
                throw error;
            } else if (
                'headers' in typedEvent &&
                'httpMethod' in typedEvent &&
                typedEvent.headers &&
                typedEvent.httpMethod
            ) {
                // For API Gateway, return a 500 error response
                request.response = {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Internal server error' }),
                };
            } else {
                // For other sources, rethrow the error
                throw error;
            }
        },
    };
};

export default errorHandler;
