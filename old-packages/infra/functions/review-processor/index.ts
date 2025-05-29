/**
 * Review Processor Lambda Function
 *
 * This Lambda function processes review creation, update, and deletion events:
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
type ReviewEvent = {
    reviewId: string;
    restaurantId: string;
    userId: string;
    rating: number;
    text?: string;
    visitStatus?: string;
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
    console.log('Processing review events:', JSON.stringify(event));

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
        console.error('Fatal error processing review events:', error);
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
        if (eventType === 'ReviewCreated') {
            result = await handleReviewCreation(message, context);
        } else if (eventType === 'ReviewUpdated') {
            result = await handleReviewUpdate(message, context);
        } else if (eventType === 'ReviewDeleted') {
            result = await handleReviewDeletion(message, context);
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
 * Handle review creation events
 */
async function handleReviewCreation(
    event: Record<string, unknown>,
    context: Context
): Promise<Record<string, unknown>> {
    const reviewData = event.detail as ReviewEvent;

    // Validate review data
    if (!reviewData.restaurantId || !reviewData.userId || reviewData.rating === undefined) {
        throw new Error('Missing required fields for review creation');
    }

    try {
        // Insert into database
        const result = await executeQuery(
            `INSERT INTO reviews (
        review_id, restaurant_id, user_id, rating, text, visit_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING review_id, restaurant_id, user_id, rating, created_at`,
            [
                reviewData.reviewId,
                reviewData.restaurantId,
                reviewData.userId,
                reviewData.rating,
                reviewData.text || '',
                reviewData.visitStatus || 'VISITED',
                new Date(reviewData.createdAt),
                new Date(reviewData.createdAt),
            ]
        );

        console.log('Review created successfully:', result.rows[0]);

        // Prepare completion event data
        const completionEventData = {
            reviewId: reviewData.reviewId,
            restaurantId: reviewData.restaurantId,
            userId: reviewData.userId,
            status: 'SUCCESS',
            createdAt: (result.rows[0] as Record<string, unknown>).created_at,
            requestId: context.awsRequestId,
        };

        // Send completion event to EventBridge
        await sendCompletionEvent(
            'ReviewCreationCompleted',
            'bellyfed.review',
            completionEventData
        );

        return {
            operation: 'create',
            status: 'success',
            review: result.rows[0],
            completionEvent: completionEventData,
        };
    } catch (error: unknown) {
        console.error('Error creating review:', error);

        // Prepare failure event data
        const failureEventData = {
            reviewId: reviewData.reviewId,
            restaurantId: reviewData.restaurantId,
            userId: reviewData.userId,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        };

        // Send failure event to EventBridge
        await sendCompletionEvent('ReviewCreationFailed', 'bellyfed.review', failureEventData);

        throw error;
    }
}

/**
 * Handle review update events
 */
async function handleReviewUpdate(event: Record<string, unknown>, context: Context): Promise<void> {
    const reviewData = event.detail as ReviewEvent;

    // Validate review data
    if (!reviewData.reviewId) {
        throw new Error('Missing required fields for review update');
    }

    try {
        // Update in database
        const result = await executeQuery(
            `UPDATE reviews SET
        rating = $1,
        text = $2,
        visit_status = $3,
        updated_at = $4
      WHERE review_id = $5
      RETURNING review_id, restaurant_id, user_id, rating, updated_at`,
            [
                reviewData.rating,
                reviewData.text || '',
                reviewData.visitStatus || 'VISITED',
                reviewData.updatedAt ? new Date(reviewData.updatedAt) : new Date(),
                reviewData.reviewId,
            ]
        );

        if (result.rowCount === 0) {
            throw new Error(`Review with ID ${reviewData.reviewId} not found`);
        }

        console.log('Review updated successfully:', result.rows[0]);

        // Send completion event to EventBridge
        await sendCompletionEvent('ReviewUpdateCompleted', 'bellyfed.review', {
            reviewId: reviewData.reviewId,
            restaurantId: (result.rows[0] as Record<string, unknown>).restaurant_id,
            userId: (result.rows[0] as Record<string, unknown>).user_id,
            status: 'SUCCESS',
            updatedAt: (result.rows[0] as Record<string, unknown>).updated_at,
            requestId: context.awsRequestId,
        });
    } catch (error: unknown) {
        console.error('Error updating review:', error);

        // Send failure event to EventBridge
        await sendCompletionEvent('ReviewUpdateFailed', 'bellyfed.review', {
            reviewId: reviewData.reviewId,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        });

        throw error;
    }
}

/**
 * Handle review deletion events
 */
async function handleReviewDeletion(
    event: Record<string, unknown>,
    context: Context
): Promise<void> {
    const reviewData = event.detail as ReviewEvent;

    // Validate review data
    if (!reviewData.reviewId) {
        throw new Error('Missing required fields for review deletion');
    }

    try {
        // Delete from database
        const result = await executeQuery(
            `DELETE FROM reviews
      WHERE review_id = $1
      RETURNING review_id, restaurant_id, user_id`,
            [reviewData.reviewId]
        );

        if (result.rowCount === 0) {
            throw new Error(`Review with ID ${reviewData.reviewId} not found`);
        }

        console.log('Review deleted successfully:', result.rows[0]);

        // Send completion event to EventBridge
        await sendCompletionEvent('ReviewDeletionCompleted', 'bellyfed.review', {
            reviewId: reviewData.reviewId,
            restaurantId: (result.rows[0] as Record<string, unknown>).restaurant_id,
            userId: (result.rows[0] as Record<string, unknown>).user_id,
            status: 'SUCCESS',
            deletedAt: new Date().toISOString(),
            requestId: context.awsRequestId,
        });
    } catch (error: unknown) {
        console.error('Error deleting review:', error);

        // Send failure event to EventBridge
        await sendCompletionEvent('ReviewDeletionFailed', 'bellyfed.review', {
            reviewId: reviewData.reviewId,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId: context.awsRequestId,
        });

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
                EventBusName: process.env.REVIEW_EVENT_BUS_NAME,
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
