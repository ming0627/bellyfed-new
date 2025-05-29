import { Context } from 'aws-lambda';
import { MiddlewareObj } from '@middy/core';

interface Internal {
    startTime?: number;
}

const tracingMiddleware = (): MiddlewareObj<unknown, unknown, Error, Context> => {
    return {
        before: async (request) => {
            request.internal = request.internal || {};
            (request.internal as Internal).startTime = Date.now();
        },
        after: async (request) => {
            const traceId = request.context?.awsRequestId ?? '';
            // Initialize response as an object if it doesn't exist
            if (!request.response) {
                request.response = {};
            }

            // Initialize headers as an object if it doesn't exist
            const currentHeaders =
                ((request.response as Record<string, unknown>).headers as Record<string, string>) ||
                {};

            request.response = {
                ...(request.response as Record<string, unknown>),
                headers: {
                    ...currentHeaders,
                    'X-Trace-Id': traceId,
                },
            };
        },
        onError: async (request) => {
            if (request.error instanceof Error) {
                const traceId = request.context?.awsRequestId ?? '';
                request.error.message = `[${traceId}] ${request.error.message}`;
            }
        },
    };
};

export default tracingMiddleware;
