import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { validateEvent as validateStandardEvent, processEvent } from '@infra/utils/event-handler';
import { EventMessage as StandardEvent } from '@infra/utils/types/event-types';

// Extend the APIGatewayProxyEvent interface to include standardizedEvent
interface ExtendedAPIGatewayProxyEvent extends APIGatewayProxyEvent {
    standardizedEvent?: StandardEvent;
}

const inputValidation = (): MiddlewareObj<
    ExtendedAPIGatewayProxyEvent,
    unknown,
    Error,
    Context
> => {
    const before = async (request: {
        event: ExtendedAPIGatewayProxyEvent;
        context: Context;
    }): Promise<void> => {
        try {
            const body = JSON.parse(request.event.body || '{}');
            const validatedEvent = validateStandardEvent(body);
            const processedEvent = await processEvent(validatedEvent);
            request.event.standardizedEvent = processedEvent;
        } catch (error: unknown) {
            console.error('Error validating input:', error);
            throw error;
        }
    };

    return {
        before,
    };
};

export default inputValidation;
