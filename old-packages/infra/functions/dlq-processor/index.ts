import { PublishCommand } from '@aws-sdk/client-sns';
import middy from '@middy/core';
import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { snsClient } from '@infra/utils/aws';
import { ApplicationError } from '@infra/utils/errors';

// Environment variables
const { SNS_TOPIC_ARN } = process.env;

if (!SNS_TOPIC_ARN) {
    throw new Error('SNS_TOPIC_ARN environment variable is required');
}

interface DLQMessage {
    source: string;
    type: string;
    data: Record<string, unknown>;
    error?: {
        message: string;
        code?: string;
        stack?: string;
    };
    metadata?: {
        retryCount?: number;
        originalMessageId?: string;
        timestamp?: string;
    };
}

interface ProcessedMessage {
    messageId: string;
    status: 'SUCCESS' | 'FAILURE';
    error?: {
        message: string;
        code?: string;
    };
    timestamp: string;
}

async function sendSNSNotification(message: DLQMessage): Promise<void> {
    try {
        const command = new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify(message),
            MessageAttributes: {
                source: {
                    DataType: 'String',
                    StringValue: message.source,
                },
                type: {
                    DataType: 'String',
                    StringValue: message.type,
                },
                timestamp: {
                    DataType: 'String',
                    StringValue: new Date().toISOString(),
                },
            },
        });

        await snsClient.send(command);
        console.log(`SNS notification sent for message: ${JSON.stringify(message)}`);
    } catch (error: unknown) {
        console.error('Failed to send SNS notification:', error);
        throw new ApplicationError('Failed to send SNS notification', 500);
    }
}

async function processRecord(record: SQSRecord): Promise<ProcessedMessage> {
    const timestamp = new Date().toISOString();

    try {
        // Parse and validate the message
        let message: DLQMessage;
        try {
            const body = JSON.parse(record.body);
            message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body;
        } catch {
            throw new ApplicationError('Invalid message format', 400);
        }

        // Validate required fields
        if (!message.source || !message.type) {
            throw new ApplicationError('Missing required fields in message', 400);
        }

        // Add metadata
        message.metadata = {
            ...message.metadata,
            retryCount: (message.metadata?.retryCount || 0) + 1,
            originalMessageId: record.messageId,
            timestamp,
        };

        // Send notification
        await sendSNSNotification(message);

        return {
            messageId: record.messageId,
            status: 'SUCCESS',
            timestamp,
        };
    } catch (error: unknown) {
        console.error(`Error processing message ${record.messageId}:`, error);

        return {
            messageId: record.messageId,
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
        console.log('Processing DLQ messages:', {
            requestId: context.awsRequestId,
            messageCount: event.Records.length,
        });

        const results = await Promise.all(event.Records.map((record) => processRecord(record)));

        // Log summary
        const failedMessages = results.filter((result) => result.status === 'FAILURE');
        console.log('DLQ Processing Summary:', {
            total: results.length,
            successful: results.length - failedMessages.length,
            failed: failedMessages.length,
            requestId: context.awsRequestId,
        });

        // Return failed messages for retry
        return {
            batchItemFailures: failedMessages.map((result) => ({
                itemIdentifier: result.messageId,
            })),
        };
    }
);
