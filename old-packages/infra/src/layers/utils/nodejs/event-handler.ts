import { EventMessage, AnalyticsEventDetail, AnalyticsMetadata } from './types/event-types';
import { ApplicationError } from './errors';

export const validateEvent = (event: EventMessage): EventMessage => {
    if (!event.type) {
        throw new ApplicationError('Event type is required', 400);
    }

    if (!event.data) {
        throw new ApplicationError('Event data is required', 400);
    }

    if (!event.metadata?.source) {
        throw new ApplicationError('Event source is required', 400);
    }

    return event;
};

interface AnalyticsEventParams {
    eventType: string;
    eventData: EventMessage;
    metadata: AnalyticsMetadata;
}

export const createAnalyticsEvent = (params: AnalyticsEventParams): AnalyticsEventDetail => {
    return {
        type: params.eventData.type,
        action: params.eventType,
        timestamp: new Date().toISOString(),
        metadata: {
            ...params.metadata,
            source: params.eventData.metadata?.source || 'unknown',
            userId: params.eventData.metadata?.userId,
            traceId: params.eventData.metadata?.traceId,
        },
    };
};

export const processEvent = async (event: EventMessage): Promise<EventMessage> => {
    const validatedEvent = validateEvent(event);

    // Add timestamp if not present
    if (!validatedEvent.timestamp) {
        validatedEvent.timestamp = new Date().toISOString();
    }

    return validatedEvent;
};

export const sendAnalytics = async (event: AnalyticsEventDetail): Promise<void> => {
    // Add analytics sending logic here
    console.log('Sending analytics event:', event);
};
