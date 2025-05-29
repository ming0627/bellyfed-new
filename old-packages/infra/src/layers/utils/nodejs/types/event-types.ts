// Base event interface
export interface BaseEvent {
    type: string;
    timestamp: string;
    metadata: {
        source: string;
        userId?: string;
        traceId?: string;
    };
}

// Event message extending base event
export interface EventMessage extends BaseEvent {
    action?: string;
    data: Record<string, unknown>;
}

// Analytics specific metadata
export interface AnalyticsMetadata {
    source: string;
    duration?: number;
    status: 'SUCCESS' | 'FAILURE';
    errorType?: string;
    eventCategory: 'USER_ACTION' | 'SYSTEM_EVENT' | 'AUTH_EVENT' | 'QUERY';
    properties: Record<string, unknown>;
    userId?: string;
    traceId?: string;
}

// Analytics event detail extending base event
export interface AnalyticsEventDetail extends BaseEvent {
    type: string;
    timestamp: string;
    action: string;
    metadata: AnalyticsMetadata;
}

// Event bus type definition
export interface EventBusType {
    publish: (_event: EventMessage) => Promise<void>;
    subscribe: (_eventType: string, _handler: (_event: EventMessage) => Promise<void>) => void;
}
