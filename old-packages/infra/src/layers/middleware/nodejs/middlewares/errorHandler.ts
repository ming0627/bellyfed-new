import { MiddlewareObj } from '@middy/core';
import { _Context } from 'aws-lambda';
import { ApplicationError } from '@layers/utils/errors';

export const errorHandler = (): MiddlewareObj => {
    return {
        onError: async (request) => {
            const { error, context } = request;

            if (!error) {
                return;
            }

            if (error instanceof ApplicationError) {
                return {
                    statusCode: error.statusCode || 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Trace-Id': context?.awsRequestId || '',
                    },
                    body: JSON.stringify({
                        message: error.message,
                        code: error.code,
                    }),
                };
            }

            // For all other errors, return a 500
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trace-Id': context?.awsRequestId || '',
                },
                body: JSON.stringify({
                    message: 'Internal Server Error',
                    code: 'INTERNAL_SERVER_ERROR',
                }),
            };
        },
    };
};
