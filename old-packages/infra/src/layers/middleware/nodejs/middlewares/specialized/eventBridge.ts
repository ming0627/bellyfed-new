import { MiddlewareObj } from '@middy/core';
import { EventBridgeEvent } from 'aws-lambda';
import { ApplicationError } from '@layers/utils/errors';

export const eventBridgeErrorHandler = (): MiddlewareObj<EventBridgeEvent<string, unknown>> => ({
    onError: async (request) => {
        const { error, context, event } = request;

        if (!error) {
            return;
        }

        console.error('EventBridge Error:', {
            error,
            eventSource: event.source,
            eventType: event['detail-type'],
            traceId: context?.awsRequestId,
        });

        if (error instanceof ApplicationError) {
            // For business logic errors, we might want to handle them differently
            // For example, sending to a DLQ or retry queue
            throw error;
        }

        // For system errors, we might want to retry
        throw error;
    },
});
