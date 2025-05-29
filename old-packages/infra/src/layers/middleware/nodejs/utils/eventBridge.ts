import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const eventBridgeClient = new EventBridgeClient({});

export interface StandardEvent {
    event_id?: string;
    timestamp?: string;
    event_type: string;
    source: string;
    version?: string;
    trace_id?: string;
    detail: any;
}

export const sendToEventBridge = async (
    event: StandardEvent,
    eventBusName: string,
    detailType: string
) => {
    const standardEvent = {
        event_id: event.event_id || uuidv4(),
        timestamp: event.timestamp || new Date().toISOString(),
        event_type: event.event_type,
        source: event.source,
        version: event.version || '1.0',
        trace_id: event.trace_id,
        detail: event.detail,
    };

    const command = new PutEventsCommand({
        Entries: [
            {
                EventBusName: eventBusName,
                Source: standardEvent.source,
                DetailType: detailType,
                Detail: JSON.stringify(standardEvent),
            },
        ],
    });

    return eventBridgeClient.send(command);
};
