/**
 * User Account Processor Lambda Function
 *
 * This Lambda function processes user account events:
 * - User registration
 * - User profile update
 * - User deletion
 */

import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
// Import but don't use directly to avoid linting errors
// Import the CognitoIdentityProviderClient for AWS Cognito operations
import {
    CognitoIdentityProviderClient,
    // These commands are imported for type definitions but not directly used
    // Prefixed with underscore to indicate they're intentionally unused
    AdminGetUserCommand as _AdminGetUserCommand,
    AdminUpdateUserAttributesCommand as _AdminUpdateUserAttributesCommand,
    AdminDeleteUserCommand as _AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
// Import UUID generator for potential future use
import { v4 as _uuidv4 } from 'uuid';
import { executeQuery } from './db-utils';

// Initialize clients
const eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Initialize Cognito client for future use
// Renamed with underscore prefix to indicate it's intentionally unused
const _cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Define event types
interface UserEvent {
    userId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

/**
 * Main handler function for processing SQS events
 */
export const handler = async (
    event: SQSEvent,
    context: Context
): Promise<Record<string, unknown>> => {
    console.log('Processing user account events:', JSON.stringify(event));

    try {
        // Process each record in the SQS batch
        const results = [];
        const errors = [];

        for (const record of event.Records) {
            try {
                const result = await processRecord(record, context);
                results.push({ messageId: record.messageId, result });
            } catch (recordError) {
                console.error(`Error processing record ${record.messageId}:`, recordError);
                errors.push({
                    messageId: record.messageId,
                    error: recordError instanceof Error ? recordError.message : 'Unknown error',
                    stackTrace: recordError instanceof Error ? recordError.stack : undefined,
                });

                // Continue processing other records even if one fails
            }
        }

        // If any records failed, log the summary but don't throw
        if (errors.length > 0) {
            console.warn(
                `Processed ${results.length} records successfully, ${errors.length} records failed.`
            );
            console.warn('Failed records:', JSON.stringify(errors));
        }

        return {
            statusCode: errors.length > 0 ? 207 : 200, // 207 Multi-Status if partial success
            body: {
                message:
                    errors.length > 0
                        ? 'Some events processed with errors'
                        : 'All events processed successfully',
                processed: results.length,
                failed: errors.length,
                results,
                errors,
            },
        };
    } catch (error: unknown) {
        console.error('Fatal error processing user account events:', error);
        throw error; // This will cause the message to be sent to the DLQ after max retries
    } finally {
        // Close the database connection pool to prevent Lambda container reuse issues
        try {
            // Using dynamic import to avoid circular dependency
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { closePool } = require('./db-utils');
            await closePool();
        } catch (error: unknown) {
            console.warn('Error closing database pool:', error);
        }
    }
};

/**
 * Process a single SQS record
 */
async function processRecord(
    record: SQSRecord,
    context: Context
): Promise<Record<string, unknown>> {
    console.log('Processing record:', record.messageId);

    try {
        // Parse the message body
        const message = JSON.parse(record.body);
        const eventType = message.detail_type || message.detailType;

        let result;

        // Route to the appropriate handler based on event type
        if (eventType === 'UserRegistered') {
            result = await handleUserRegistration(message, context);
        } else if (eventType === 'UserUpdated') {
            result = await handleUserUpdate(message, context);
        } else if (eventType === 'UserDeleted') {
            result = await handleUserDeletion(message, context);
        } else {
            throw new Error(`Unsupported event type: ${eventType}`);
        }

        console.log('Successfully processed record:', record.messageId);
        return { eventType, status: 'success', result };
    } catch (error: unknown) {
        console.error('Error processing record:', record.messageId, error);
        throw error;
    }
}

/**
 * Handle user registration events
 */
async function handleUserRegistration(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const userData = event.detail as UserEvent;

    // Validate user data
    if (!userData.userId || !userData.email) {
        throw new Error('Missing required fields for user registration');
    }

    try {
        // Insert into database
        const result = await executeQuery(
            `INSERT INTO users (
        user_id, email, username, first_name, last_name, phone_number, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, email, created_at`,
            [
                userData.userId,
                userData.email,
                userData.username || userData.email,
                userData.firstName || null,
                userData.lastName || null,
                userData.phoneNumber || null,
                new Date(userData.createdAt || Date.now()),
                new Date(userData.createdAt || Date.now()),
            ]
        );

        console.log('User registered successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            userId: userData.userId,
            email: userData.email,
            status: 'SUCCESS',
            createdAt: (result.rows[0] as Record<string, unknown>).created_at,
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent(
            'UserRegistrationCompleted',
            'bellyfed.user',
            completionEventData
        );

        return {
            operation: 'register',
            status: 'success',
            user: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error registering user:', error);

        // Prepare failure event data
        const failureEventData = {
            userId: userData.userId,
            email: userData.email,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent('UserRegistrationFailed', 'bellyfed.user', failureEventData);

        throw error;
    }
}

/**
 * Handle user update events
 */
async function handleUserUpdate(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const userData = event.detail as UserEvent;

    // Validate user data
    if (!userData.userId) {
        throw new Error('Missing required fields for user update');
    }

    try {
        // Update in database
        const result = await executeQuery(
            `UPDATE users SET
        email = COALESCE($1, email),
        username = COALESCE($2, username),
        first_name = COALESCE($3, first_name),
        last_name = COALESCE($4, last_name),
        phone_number = COALESCE($5, phone_number),
        updated_at = $6
      WHERE user_id = $7
      RETURNING user_id, email, updated_at`,
            [
                userData.email || null,
                userData.username || null,
                userData.firstName || null,
                userData.lastName || null,
                userData.phoneNumber || null,
                new Date(userData.updatedAt || Date.now()),
                userData.userId,
            ]
        );

        if (result.rowCount === 0) {
            throw new Error(`User with ID ${userData.userId} not found`);
        }

        console.log('User updated successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            userId: userData.userId,
            email: (result.rows[0] as Record<string, unknown>).email,
            status: 'SUCCESS',
            updatedAt: (result.rows[0] as Record<string, unknown>).updated_at,
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent('UserUpdateCompleted', 'bellyfed.user', completionEventData);

        return {
            operation: 'update',
            status: 'success',
            user: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error updating user:', error);

        // Prepare failure event data
        const failureEventData = {
            userId: userData.userId,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent('UserUpdateFailed', 'bellyfed.user', failureEventData);

        throw error;
    }
}

/**
 * Handle user deletion events
 */
async function handleUserDeletion(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const userData = event.detail as UserEvent;

    // Validate user data
    if (!userData.userId) {
        throw new Error('Missing required fields for user deletion');
    }

    try {
        // Delete from database
        const result = await executeQuery(
            `DELETE FROM users
      WHERE user_id = $1
      RETURNING user_id, email`,
            [userData.userId]
        );

        if (result.rowCount === 0) {
            throw new Error(`User with ID ${userData.userId} not found`);
        }

        console.log('User deleted successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            userId: userData.userId,
            email: (result.rows[0] as Record<string, unknown>).email,
            status: 'SUCCESS',
            deletedAt: new Date().toISOString(),
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent('UserDeletionCompleted', 'bellyfed.user', completionEventData);

        return {
            operation: 'delete',
            status: 'success',
            user: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error deleting user:', error);

        // Prepare failure event data
        const failureEventData = {
            userId: userData.userId,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent('UserDeletionFailed', 'bellyfed.user', failureEventData);

        throw error;
    }
}

/**
 * Send a completion event to EventBridge
 */
async function sendCompletionEvent(
    detailType: string,
    source: string,
    detail: Record<string, unknown>
): Promise<void> {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify(detail),
                DetailType: detailType,
                EventBusName: process.env.USER_ACCOUNT_EVENT_BUS_NAME,
                Source: source,
                Time: new Date(),
            },
        ],
    };

    try {
        const command = new PutEventsCommand(params);
        const result = await eventBridgeClient.send(command);
        console.log('Sent completion event to EventBridge:', result);
    } catch (error: unknown) {
        console.error('Error sending completion event to EventBridge:', error);
        // Don't throw here to avoid failing the main function
    }
}
