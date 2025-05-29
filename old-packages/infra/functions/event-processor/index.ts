import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import middy from '@middy/core';
import { eventBridgeClient } from '@infra/utils/aws';
import { ApplicationError } from '@infra/utils/errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, SQSEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { BaseEvent, EventTypes, isUserSignupEvent, UserSignupEvent } from './schema';

// Declare global variables for TypeScript
declare const process: {
    env: {
        USER_EVENT_BUS: string;
        AUTH_EVENT_BUS: string;
        SYSTEM_EVENT_BUS: string;
        ANALYTICS_EVENT_BUS: string;
        [key: string]: string | undefined;
    };
};

// No need to declare console as it's a global object

// Environment variables
const { USER_EVENT_BUS, AUTH_EVENT_BUS, SYSTEM_EVENT_BUS, ANALYTICS_EVENT_BUS } = process.env;

// Validate required environment variables
const requiredEnvVars = {
    USER_EVENT_BUS,
    AUTH_EVENT_BUS,
    SYSTEM_EVENT_BUS,
    ANALYTICS_EVENT_BUS,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
});

interface ProcessedEvent {
    eventId: string;
    eventType: string;
    status: 'SUCCESS' | 'FAILURE';
    error?: {
        message: string;
        code?: string;
    };
    processingTime: number;
}

function getEventBus(type: string): string {
    console.log('[getEventBus] Processing event type:', type);

    if (!type) {
        console.error('[getEventBus] Event type is missing');
        throw new ApplicationError('Event type is required', 400);
    }

    let busName: string;
    // Authentication and authorization events
    if (type.startsWith('AUTH_') || type.startsWith('LOGIN_') || type.startsWith('SIGNUP_')) {
        busName = AUTH_EVENT_BUS!;
    }
    // User-related events
    else if (type.startsWith('USER_') || type.startsWith('PROFILE_')) {
        busName = USER_EVENT_BUS!;
    }
    // Analytics events
    else if (type.endsWith('_ANALYTICS') || type.startsWith('ANALYTICS_')) {
        busName = ANALYTICS_EVENT_BUS!;
    }
    // Default to system events
    else {
        busName = SYSTEM_EVENT_BUS!;
    }

    console.log('[getEventBus] Selected event bus:', busName, 'for event type:', type);
    return busName;
}

async function sendToEventBus(event: EventTypes): Promise<void> {
    console.log('[sendToEventBus] Processing event:', {
        type: event.event_type,
        source: event.source,
        hasData: !!event.payload,
        hasMetadata: !!event.metadata,
    });

    const busName = getEventBus(event.event_type);
    const eventDetail = {
        ...event.payload,
        metadata: event.metadata || {},
    };

    console.log('[sendToEventBus] Preparing event for EventBridge:', {
        busName,
        source: event.source,
        type: event.event_type,
        detail: eventDetail,
    });

    const command = new PutEventsCommand({
        Entries: [
            {
                EventBusName: busName,
                Source: event.source,
                DetailType: event.event_type,
                Detail: JSON.stringify(eventDetail),
            },
        ],
    });

    try {
        const result = await eventBridgeClient.send(command);
        console.log('[sendToEventBus] Successfully sent event to EventBridge:', {
            type: event.event_type,
            result,
        });
    } catch (error: unknown) {
        console.error('[sendToEventBus] Failed to send event to EventBridge:', {
            type: event.event_type,
            error:
                error instanceof Error
                    ? {
                          message: error.message,
                          stack: error.stack,
                      }
                    : error,
        });
        throw error;
    }
}

async function processUserSignupEvent(event: UserSignupEvent): Promise<void> {
    // Handle user signup specific logic here
    console.log('[processUserSignupEvent] Processing user signup:', {
        email: event.payload.email,
        username: event.payload.username,
    });

    // For now, just send to EventBridge
    await sendToEventBus(event);
}

async function processEvent(event: BaseEvent): Promise<ProcessedEvent> {
    const startTime = Date.now();
    const eventId = `${event.event_type}-${startTime}`;

    console.log('[processEvent] Starting event processing:', {
        eventId,
        type: event.event_type,
        source: event.source,
    });

    try {
        // Route to specific event handler based on event type
        if (isUserSignupEvent(event)) {
            await processUserSignupEvent(event);
        } else {
            throw new Error(`Unsupported event type: ${event.event_type}`);
        }

        const processingTime = Date.now() - startTime;
        console.log('[processEvent] Successfully processed event:', {
            eventId,
            type: event.event_type,
            processingTime,
        });

        return {
            eventId,
            eventType: event.event_type,
            status: 'SUCCESS',
            processingTime,
        };
    } catch (error: unknown) {
        const processingTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = error instanceof ApplicationError ? error.code : undefined;

        console.error('[processEvent] Failed to process event:', {
            eventId,
            type: event.event_type,
            error:
                error instanceof Error
                    ? {
                          message: error.message,
                          stack: error.stack,
                          code: errorCode,
                      }
                    : error,
            processingTime,
        });

        return {
            eventId,
            eventType: event.event_type,
            status: 'FAILURE',
            error: {
                message: errorMessage,
                code: errorCode,
            },
            processingTime,
        };
    }
}

export const handler = middy(
    async (
        event: SQSEvent | APIGatewayProxyEvent,
        context: Context
    ): Promise<APIGatewayProxyResult | ProcessedEvent[]> => {
        console.log('[handler] Received event:', {
            eventType: 'SQSEvent' in event ? 'SQS' : 'APIGateway',
            requestId: context.awsRequestId,
            event: JSON.stringify(event),
        });

        try {
            if ('Records' in event) {
                return await Promise.all(
                    event.Records.map(async (record) => {
                        const rawMessage = JSON.parse(record.body) as BaseEvent;
                        return processEvent(rawMessage);
                    })
                );
            }

            // This is an APIGatewayProxyEvent
            const apiGatewayEvent = event as APIGatewayProxyEvent;
            const body = JSON.parse(apiGatewayEvent.body || '{}');
            const message: BaseEvent = {
                event_id: body.event_id || uuidv4(),
                timestamp: body.timestamp || new Date().toISOString(),
                event_type: body.type,
                source: 'api-gateway',
                version: body.version || 'v1.0',
                trace_id: body.trace_id || apiGatewayEvent.requestContext?.requestId || uuidv4(),
                user_id: body.user_id || 'unknown',
                status: body.status || 'processing',
                metadata: {
                    requestId: apiGatewayEvent.requestContext?.requestId || uuidv4(),
                    userAgent: apiGatewayEvent.headers?.['User-Agent'] || 'unknown',
                },
            };

            await processEvent(message);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Event processed successfully',
                    traceId: apiGatewayEvent.requestContext?.requestId || uuidv4(),
                }),
            };
        } catch (error: unknown) {
            console.error('Error processing events:', error);
            throw error;
        }
    }
);
