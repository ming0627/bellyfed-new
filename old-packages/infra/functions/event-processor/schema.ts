export interface BaseEvent {
    event_id: string;
    timestamp: string;
    event_type: string;
    source: string;
    version: string;
    trace_id: string;
    user_id: string;
    status: string;
    payload?: Record<string, unknown>;
    metadata?: {
        [key: string]: unknown;
    };
}

export interface UserSignupEvent extends BaseEvent {
    event_type: 'CustomMessage_SignUp';
    payload: {
        email: string;
        username: string;
    };
}

// Type guard for UserSignupEvent
export function isUserSignupEvent(event: BaseEvent): event is UserSignupEvent {
    return (
        event.event_type === 'CustomMessage_SignUp' &&
        'payload' in event &&
        typeof (event as UserSignupEvent).payload?.email === 'string' &&
        typeof (event as UserSignupEvent).payload?.username === 'string'
    );
}

// Union type for all possible events
export type EventTypes = UserSignupEvent; // Add more event types here as we create them
