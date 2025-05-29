import middy from '@middy/core';
import { Context, SQSEvent } from 'aws-lambda';
import { dynamoOperations } from '@infra/utils/aws';
import { ApplicationError } from '@infra/utils/errors';

// Environment variables
const TABLE_NAME = process.env.TABLE_NAME;

if (!TABLE_NAME) {
    throw new Error('TABLE_NAME environment variable is required');
}

// After validation, TABLE_NAME is guaranteed to be string
const tableName: string = TABLE_NAME;

interface AnalyticsEvent {
    type: string;
    source: string;
    data: {
        restaurantId: string;
        userId?: string;
        action: string;
        [key: string]: unknown;
    };
    metadata?: {
        timestamp?: string;
        requestId?: string;
        sessionId?: string;
        userAgent?: string;
        [key: string]: unknown;
    };
}

interface ProcessedEvent {
    eventId: string;
    status: 'SUCCESS' | 'FAILURE';
    error?: {
        message: string;
        code?: string;
    };
    timestamp: string;
}

interface AnalyticsRecord extends Record<string, unknown> {
    eventId: string;
    restaurantId: string;
    timestamp: string;
    eventType: string;
    eventSource: string;
    userId: string;
    action: string;
    data: Record<string, unknown>;
    metadata: {
        processedAt: string;
        requestId?: string;
        sessionId?: string;
        userAgent?: string;
        [key: string]: unknown;
    };
    ttl?: number;
}

function validateAnalyticsEvent(event: AnalyticsEvent): void {
    if (!event.type?.trim()) {
        throw new ApplicationError('Event type is required and cannot be empty', 400);
    }
    if (!event.source?.trim()) {
        throw new ApplicationError('Event source is required and cannot be empty', 400);
    }
    if (!event.data) {
        throw new ApplicationError('Event data is required', 400);
    }
    if (!event.data.restaurantId?.trim()) {
        throw new ApplicationError('Restaurant ID is required and cannot be empty', 400);
    }
    if (!event.data.action?.trim()) {
        throw new ApplicationError('Action is required and cannot be empty', 400);
    }
}

function createAnalyticsRecord(
    event: AnalyticsEvent,
    messageId: string,
    timestamp: string
): AnalyticsRecord {
    // Calculate TTL (30 days from now)
    const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    const metadata = {
        ...event.metadata,
        processedAt: new Date().toISOString(),
        requestId: event.metadata?.requestId?.trim() || undefined,
        sessionId: event.metadata?.sessionId?.trim() || undefined,
        userAgent: event.metadata?.userAgent?.trim() || undefined,
    };

    return {
        eventId: messageId,
        restaurantId: event.data.restaurantId.trim(),
        timestamp,
        eventType: event.type.trim(),
        eventSource: event.source.trim(),
        userId: event.data.userId?.trim() || 'anonymous',
        action: event.data.action.trim(),
        data: event.data,
        metadata,
        ttl,
    };
}

async function processAnalyticsEvent(
    event: AnalyticsEvent,
    messageId: string
): Promise<ProcessedEvent> {
    const timestamp = event.metadata?.timestamp?.trim() || new Date().toISOString();

    try {
        // Validate event
        validateAnalyticsEvent(event);

        // Create and store analytics record
        const analyticsRecord = createAnalyticsRecord(event, messageId, timestamp);

        try {
            await dynamoOperations.put(
                tableName,
                analyticsRecord,
                'attribute_not_exists(eventId)' // Ensure no duplicate events
            );
        } catch (dbError) {
            console.error('Failed to store analytics record:', {
                messageId,
                error: dbError,
                record: JSON.stringify(analyticsRecord),
            });
            throw new ApplicationError(
                dbError instanceof Error ? dbError.message : 'Failed to store analytics record',
                500
            );
        }

        return {
            eventId: messageId,
            status: 'SUCCESS',
            timestamp,
        };
    } catch (error: unknown) {
        console.error('Failed to process analytics event:', {
            messageId,
            error,
            event: JSON.stringify(event),
        });

        return {
            eventId: messageId,
            status: 'FAILURE',
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof ApplicationError ? String(error.statusCode) : '500',
            },
            timestamp,
        };
    }
}

export const handler = middy(
    async (
        event: SQSEvent,
        context: Context
    ): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
        console.log('Processing analytics events:', {
            requestId: context.awsRequestId,
            messageCount: event.Records.length,
        });

        const results = await Promise.all(
            event.Records.map(async (record) => {
                try {
                    let analyticsEvent: AnalyticsEvent;
                    try {
                        analyticsEvent = JSON.parse(record.body) as AnalyticsEvent;
                    } catch {
                        throw new ApplicationError('Invalid JSON in message body', 400);
                    }
                    return await processAnalyticsEvent(analyticsEvent, record.messageId);
                } catch (error: unknown) {
                    console.error('Error processing message:', {
                        messageId: record.messageId,
                        error,
                    });
                    return {
                        eventId: record.messageId,
                        status: 'FAILURE' as const,
                        error: {
                            message:
                                error instanceof ApplicationError
                                    ? error.message
                                    : 'Failed to process message',
                            code:
                                error instanceof ApplicationError
                                    ? String(error.statusCode)
                                    : '500',
                        },
                        timestamp: new Date().toISOString(),
                    };
                }
            })
        );

        // Log summary
        const failedEvents = results.filter((result) => result.status === 'FAILURE');
        console.log('Analytics Processing Summary:', {
            total: results.length,
            successful: results.length - failedEvents.length,
            failed: failedEvents.length,
            failedIds: failedEvents.map((event) => event.eventId),
            requestId: context.awsRequestId,
            timestamp: new Date().toISOString(),
        });

        // Return failed messages for retry
        return {
            batchItemFailures: failedEvents.map((result) => ({
                itemIdentifier: result.eventId,
            })),
        };
    }
);
