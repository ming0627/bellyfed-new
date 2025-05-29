import { MiddlewareObj } from '@middy/core';
import { _Context, SQSEvent } from 'aws-lambda';
import { ApplicationError } from '@layers/utils/errors';

export const sqsErrorHandler = (): MiddlewareObj<SQSEvent> => ({
    onError: async (request) => {
        const { error, context, event } = request;

        if (!error) {
            return;
        }

        console.error('SQS Processing Error:', {
            error:
                error instanceof Error
                    ? {
                          message: error.message,
                          name: error.name,
                          stack: error.stack,
                      }
                    : error,
            messageIds: event.Records.map((record) => record.messageId),
            traceId: context?.awsRequestId,
        });

        if (error instanceof ApplicationError) {
            // For business logic errors, we might want to handle them differently
            // For example, dead letter queue might be configured at the SQS level
            throw error;
        }

        // For system errors, let SQS retry based on the queue settings
        throw error;
    },
});
