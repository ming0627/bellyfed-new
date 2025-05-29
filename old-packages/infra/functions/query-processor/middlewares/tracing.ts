import { MiddlewareObj } from '@middy/core';
import { Context } from 'aws-lambda';

interface ErrorWithStack extends Error {
    stack?: string;
}

const tracing = (): MiddlewareObj<unknown, unknown, Error, Context> => ({
    before: async (request) => {
        const { context } = request;
        console.log('Request started:', {
            functionName: context.functionName,
            requestId: context.awsRequestId,
            remainingTime: context.getRemainingTimeInMillis(),
        });
    },
    after: async (request) => {
        const { context, response } = request;
        console.log('Request completed:', {
            functionName: context.functionName,
            requestId: context.awsRequestId,
            remainingTime: context.getRemainingTimeInMillis(),
            response,
        });
    },
    onError: async (request) => {
        const { context, error } = request;

        if (!error) {
            return;
        }

        const typedError = error as ErrorWithStack;

        console.error('Request failed:', {
            functionName: context.functionName,
            requestId: context.awsRequestId,
            remainingTime: context.getRemainingTimeInMillis(),
            error: {
                name: typedError.name || 'UnknownError',
                message: typedError.message || 'Unknown error occurred',
                stack: typedError.stack,
            },
        });
    },
});

export default tracing;
