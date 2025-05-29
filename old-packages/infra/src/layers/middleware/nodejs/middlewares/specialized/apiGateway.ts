import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApplicationError } from '@layers/utils/errors';

export const apiGatewayErrorHandler = (): MiddlewareObj<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
> => ({
    onError: async (request) => {
        const { error, context } = request;

        if (!error) {
            throw new Error('No error object provided');
        }

        console.error('API Gateway Error:', error);

        const statusCode = error instanceof ApplicationError ? error.statusCode : 500;
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';

        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'X-Trace-Id': context?.awsRequestId || '',
            },
            body: JSON.stringify({
                error: errorMessage,
                traceId: context?.awsRequestId,
            }),
        };
    },
});
