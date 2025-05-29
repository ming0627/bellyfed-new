/**
 * Cognito Post-Confirmation Lambda Trigger
 *
 * This Lambda function is triggered after a user successfully confirms their registration
 * in Cognito. It standardizes the user data and publishes an event to EventBridge for
 * further processing and storage in PostgreSQL.
 */

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// Initialize AWS clients
const eventBridgeClient = new EventBridgeClient({});

// Environment variables
const USER_EVENT_BUS = process.env.USER_EVENT_BUS || '';

// Define event type
interface UserRegisteredEvent {
    event_id: string;
    timestamp: string;
    event_type: string;
    source: string;
    version: string;
    trace_id: string;
    user_id: string;
    status: string;
    payload: {
        email: string;
        username: string;
        sub: string;
        [key: string]: string | boolean | number | undefined;
    };
}

/**
 * Lambda handler for Cognito Post-Confirmation event
 */
export const handler = async (
    event: PostConfirmationTriggerEvent,
    context: { awsRequestId: string }
): Promise<PostConfirmationTriggerEvent> => {
    console.log('Post-Confirmation event received:', JSON.stringify(event, null, 2));

    try {
        // Extract user data from event
        const { userName, request } = event;
        const { userAttributes } = request;

        // Create a standardized event
        const userRegisteredEvent: UserRegisteredEvent = {
            event_id: uuidv4(),
            timestamp: new Date().toISOString(),
            event_type: 'user.registered',
            source: 'bellyfed.cognito',
            version: '1.0',
            trace_id: context.awsRequestId || uuidv4(),
            user_id: userAttributes.sub || userName,
            status: 'confirmed',
            payload: {
                email: userAttributes.email,
                username: userName,
                sub: userAttributes.sub,
                ...userAttributes,
            },
        };

        // Publish event to EventBridge
        const putEventsResult = await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: USER_EVENT_BUS,
                        Source: 'bellyfed.cognito',
                        DetailType: 'UserRegistered',
                        Detail: JSON.stringify(userRegisteredEvent),
                    },
                ],
            })
        );

        console.log('Event published to EventBridge:', putEventsResult);

        // Return the event object to Cognito
        return event;
    } catch (error: unknown) {
        console.error('Error processing Cognito post-confirmation:', error);

        // Still return the original event to Cognito to avoid blocking the user confirmation
        // But log the error for investigation
        return event;
    }
};
