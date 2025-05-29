import { MiddlewareObj } from '@middy/core';
import { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

export interface ExtendedContext extends Context {
    traceId?: string;
}

export const tracing = (): MiddlewareObj<unknown, unknown, Error, ExtendedContext> => {
    return {
        before: async (request) => {
            const { event, context } = request;
            if (context) {
                context.traceId = uuidv4();
                console.log('Request:', {
                    requestId: context.awsRequestId,
                    event,
                });
            }
        },
        after: async (request) => {
            const { response, context } = request;
            if (context) {
                console.log('Response:', {
                    requestId: context.awsRequestId,
                    response,
                });
            }
        },
        onError: async (request) => {
            const { error, context } = request;
            if (context && error) {
                console.error('Error:', {
                    requestId: context.awsRequestId,
                    error: error.message,
                    stack: error.stack,
                });
            }
        },
    };
};
