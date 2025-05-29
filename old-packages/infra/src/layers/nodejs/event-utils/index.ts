import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

export interface StandardEvent {
    event_id: string;
    timestamp: string;
    event_type: string;
    source: string;
    version: string;
    trace_id: string;
    correlation_id?: string;
    user_id?: string;
    status: string;
    payload: Record<string, unknown>;
}

export const processEvent = (event: unknown, traceId: string): StandardEvent => {
    if (event.triggerSource) {
        return processCognitoEvent(event, traceId);
    } else if (event.headers && event.httpMethod) {
        return processApiGatewayEvent(event, traceId);
    } else {
        throw new Error('Unsupported event source');
    }
};

const processCognitoEvent = (event: unknown, traceId: string): StandardEvent => {
    const userId = event.userName;
    const eventType = event.triggerSource;
    const source = 'bellyfed.cognito';
    const status = 'triggered';
    const payload = {
        email: event.request.userAttributes.email,
        username: event.userName,
        ...event.request.userAttributes,
    };

    // Customize the email message if needed
    if (event.triggerSource === 'CustomMessage_SignUp') {
        event.response.emailSubject = 'Welcome to Bellyfed!';
        event.response.emailMessage = `Hello ${event.userName}, please confirm your email.`;
    } else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = 'Reset Your Bellyfed Password';
        event.response.emailMessage = `Hello ${event.userName}, you requested a password reset.`;
    }

    const standardizedEvent: StandardEvent = {
        event_id: uuidv4(),
        timestamp: new Date().toISOString(),
        event_type: eventType,
        source,
        version: 'v1.0',
        trace_id: traceId || uuidv4(),
        user_id: userId,
        status,
        payload,
    };

    validateStandardEvent(standardizedEvent);
    return standardizedEvent;
};

const processApiGatewayEvent = (event: unknown, traceId: string): StandardEvent => {
    const body = event.body ? JSON.parse(event.body) : {};
    const eventType = body.eventType || 'APIGatewayEvent';
    const source = 'bellyfed.api';
    const status = body.status || 'received';
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId || 'anonymous';
    const correlationId = event.headers['X-Correlation-Id'] || uuidv4();
    const payload = body.payload || {};

    const standardizedEvent: StandardEvent = {
        event_id: uuidv4(),
        timestamp: new Date().toISOString(),
        event_type: eventType,
        source,
        version: 'v1.0',
        trace_id: traceId || uuidv4(),
        correlation_id: correlationId,
        user_id: userId,
        status,
        payload,
    };

    validateStandardEvent(standardizedEvent);
    return standardizedEvent;
};

export const validateStandardEvent = (event: StandardEvent): void => {
    const requiredFields = [
        'event_id',
        'timestamp',
        'event_type',
        'source',
        'version',
        'trace_id',
        'status',
    ];
    requiredFields.forEach((field) => {
        if (!event[field as keyof StandardEvent]) {
            throw new Error(`Missing required field: ${field}`);
        }
    });
};

export const sendToEventBridge = async (
    event: StandardEvent,
    options: { client: EventBridgeClient; eventBusName: string }
): Promise<void> => {
    const { client, eventBusName } = options;

    const params = {
        Entries: [
            {
                EventBusName: eventBusName,
                Source: 'custom.eventProcessor',
                DetailType: 'ProcessedEvent',
                Detail: JSON.stringify(event),
            },
        ],
    };

    try {
        await client.send(new PutEventsCommand(params));
    } catch (error: unknown) {
        console.error('Error sending event to EventBridge:', error);
        throw error;
    }
};
