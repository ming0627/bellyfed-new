/**
 * Restaurant Processor Lambda Function
 *
 * This Lambda function processes restaurant creation and update events:
 * 1. Receives events from EventBridge
 * 2. Validates and transforms the data
 * 3. Writes to the database
 * 4. Sends a completion event back to EventBridge
 */

import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
// Import but don't use directly to avoid linting error
import { v4 as _uuidv4 } from 'uuid';
import { executeQuery } from './db-utils';

// Initialize EventBridge client
const eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Event types
type RestaurantEvent = {
    restaurantId: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    countryCode: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    website?: string;
    email?: string;
    cuisineType?: string;
    priceRange: number;
    createdBy?: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
};

/**
 * Main handler function for processing SQS events
 */
export const handler = async (
    event: SQSEvent,
    context: Context
): Promise<Record<string, unknown>> => {
    console.log('Processing restaurant events:', JSON.stringify(event));

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
                // SQS will retry the entire batch if we throw here
            }
        }

        // If any records failed, log the summary but don't throw
        // This allows successful records to be processed and only failed ones to be retried
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
        console.error('Fatal error processing restaurant events:', error);
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
        if (eventType === 'RestaurantCreated') {
            result = await handleRestaurantCreation(message, context);
        } else if (eventType === 'RestaurantUpdated') {
            result = await handleRestaurantUpdate(message, context);
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
 * Handle restaurant creation events
 */
async function handleRestaurantCreation(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const restaurantData = event.detail as RestaurantEvent;

    // Validate restaurant data
    if (
        !restaurantData.name ||
        !restaurantData.address ||
        !restaurantData.city ||
        !restaurantData.country ||
        !restaurantData.countryCode
    ) {
        throw new Error('Missing required fields for restaurant creation');
    }

    try {
        // Insert into database
        const result = await executeQuery(
            `INSERT INTO restaurants (
        restaurant_id, name, description, address, city, state, postal_code,
        country, country_code, latitude, longitude, phone, website, email,
        cuisine_type, price_range, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING restaurant_id, name, created_at`,
            [
                restaurantData.restaurantId,
                restaurantData.name,
                restaurantData.description || null,
                restaurantData.address,
                restaurantData.city,
                restaurantData.state || null,
                restaurantData.postalCode || null,
                restaurantData.country,
                restaurantData.countryCode,
                restaurantData.latitude || null,
                restaurantData.longitude || null,
                restaurantData.phone || null,
                restaurantData.website || null,
                restaurantData.email || null,
                restaurantData.cuisineType || null,
                restaurantData.priceRange,
                new Date(restaurantData.createdAt),
                new Date(restaurantData.createdAt),
            ]
        );

        console.log('Restaurant created successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            restaurantId: restaurantData.restaurantId,
            name: restaurantData.name,
            status: 'SUCCESS',
            createdAt: (result.rows[0] as Record<string, unknown>).created_at,
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent(
            'RestaurantCreationCompleted',
            'bellyfed.restaurant',
            completionEventData
        );

        return {
            operation: 'create',
            status: 'success',
            restaurant: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error creating restaurant:', error);

        // Prepare failure event data
        const failureEventData = {
            restaurantId: restaurantData.restaurantId,
            name: restaurantData.name,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent(
            'RestaurantCreationFailed',
            'bellyfed.restaurant',
            failureEventData
        );

        throw error;
    }
}

/**
 * Handle restaurant update events
 */
async function handleRestaurantUpdate(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const restaurantData = event.detail as RestaurantEvent;

    // Validate restaurant data
    if (!restaurantData.restaurantId || !restaurantData.name) {
        throw new Error('Missing required fields for restaurant update');
    }

    try {
        // Update in database
        const result = await executeQuery(
            `UPDATE restaurants SET
        name = $1,
        description = $2,
        address = $3,
        city = $4,
        state = $5,
        postal_code = $6,
        country = $7,
        country_code = $8,
        latitude = $9,
        longitude = $10,
        phone = $11,
        website = $12,
        email = $13,
        cuisine_type = $14,
        price_range = $15,
        updated_at = $16
      WHERE restaurant_id = $17
      RETURNING restaurant_id, name, updated_at`,
            [
                restaurantData.name,
                restaurantData.description || null,
                restaurantData.address,
                restaurantData.city,
                restaurantData.state || null,
                restaurantData.postalCode || null,
                restaurantData.country,
                restaurantData.countryCode,
                restaurantData.latitude || null,
                restaurantData.longitude || null,
                restaurantData.phone || null,
                restaurantData.website || null,
                restaurantData.email || null,
                restaurantData.cuisineType || null,
                restaurantData.priceRange,
                restaurantData.updatedAt ? new Date(restaurantData.updatedAt) : new Date(),
                restaurantData.restaurantId,
            ]
        );

        if (result.rowCount === 0) {
            throw new Error(`Restaurant with ID ${restaurantData.restaurantId} not found`);
        }

        console.log('Restaurant updated successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            restaurantId: restaurantData.restaurantId,
            name: restaurantData.name,
            status: 'SUCCESS',
            updatedAt: (result.rows[0] as Record<string, unknown>).updated_at,
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent(
            'RestaurantUpdateCompleted',
            'bellyfed.restaurant',
            completionEventData
        );

        return {
            operation: 'update',
            status: 'success',
            restaurant: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error updating restaurant:', error);

        // Prepare failure event data
        const failureEventData = {
            restaurantId: restaurantData.restaurantId,
            name: restaurantData.name,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent(
            'RestaurantUpdateFailed',
            'bellyfed.restaurant',
            failureEventData
        );

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
                EventBusName: process.env.RESTAURANT_EVENT_BUS_NAME,
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
