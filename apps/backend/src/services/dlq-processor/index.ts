/**
 * Dead Letter Queue (DLQ) Processor Service
 * 
 * This service processes messages from the Dead Letter Queue (DLQ).
 * It handles failed messages from various services, logs them,
 * and sends notifications for monitoring and alerting.
 * 
 * The service provides functionality to:
 * - Process DLQ messages
 * - Send notifications for failed messages
 * - Track processing results
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the DLQ message interface
export interface DLQMessage {
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

// Define the SQS record interface
export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: Record<string, string>;
  messageAttributes: Record<string, {
    dataType: string;
    stringValue?: string;
    binaryValue?: string;
  }>;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

// Define the SQS event interface
export interface SQSEvent {
  Records: SQSRecord[];
}

// Define the processed message interface
export interface ProcessedMessage {
  messageId: string;
  status: 'SUCCESS' | 'FAILURE';
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

// Process DLQ message
export const processDLQMessage = async (
  message: string | DLQMessage,
  messageId: string = uuidv4()
): Promise<ProcessedMessage> => {
  const timestamp = new Date().toISOString();

  try {
    // Parse the message if it's a string
    let dlqMessage: DLQMessage;
    if (typeof message === 'string') {
      try {
        const parsedMessage = JSON.parse(message);
        dlqMessage = typeof parsedMessage.Message === 'string' 
          ? JSON.parse(parsedMessage.Message) 
          : parsedMessage;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid message format',
        });
      }
    } else {
      dlqMessage = message;
    }

    // Validate required fields
    if (!dlqMessage.source || !dlqMessage.type) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required fields in message',
      });
    }

    // Add metadata
    dlqMessage.metadata = {
      ...dlqMessage.metadata,
      retryCount: (dlqMessage.metadata?.retryCount || 0) + 1,
      originalMessageId: messageId,
      timestamp,
    };

    // Store the message in the database
    await storeMessage(dlqMessage, messageId);

    // Send notification
    await sendNotification(dlqMessage);

    return {
      messageId,
      status: 'SUCCESS',
      timestamp,
    };
  } catch (error) {
    console.error(`Error processing message ${messageId}:`, error);

    // Store the error in the database
    await storeError(messageId, error);

    return {
      messageId,
      status: 'FAILURE',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof TRPCError ? error.code : 'INTERNAL_SERVER_ERROR',
      },
      timestamp,
    };
  }
};

// Process batch of DLQ messages
export const processDLQBatch = async (
  event: SQSEvent
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log('Processing DLQ messages:', {
    messageCount: event.Records.length,
  });

  const results = await Promise.all(
    event.Records.map((record) => processDLQMessage(record.body, record.messageId))
  );

  // Log summary
  const failedMessages = results.filter((result) => result.status === 'FAILURE');
  console.log('DLQ Processing Summary:', {
    total: results.length,
    successful: results.length - failedMessages.length,
    failed: failedMessages.length,
  });

  // Return failed messages for retry
  return {
    batchItemFailures: failedMessages.map((result) => ({
      itemIdentifier: result.messageId,
    })),
  };
};

// Store message in database
const storeMessage = async (message: DLQMessage, messageId: string): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'dlq_message',
        action: message.type,
        timestamp: new Date(),
        source: message.source,
        status: 'PROCESSING',
        eventCategory: 'SYSTEM_EVENT',
        properties: {
          messageId,
          message,
        } as any,
      },
    });
  } catch (error) {
    console.error('Error storing message:', error);
    // Don't throw here to avoid failing the whole process
  }
};

// Store error in database
const storeError = async (messageId: string, error: unknown): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'dlq_error',
        action: 'process_failure',
        timestamp: new Date(),
        source: 'dlq-processor',
        status: 'FAILURE',
        eventCategory: 'SYSTEM_EVENT',
        properties: {
          messageId,
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          } : error,
        } as any,
      },
    });
  } catch (dbError) {
    console.error('Error storing error:', dbError);
    // Don't throw here to avoid failing the whole process
  }
};

// Send notification
const sendNotification = async (message: DLQMessage): Promise<void> => {
  try {
    // In a real implementation, this would send an SNS notification
    // For now, we'll just log the message
    console.log('Notification for DLQ message:', {
      source: message.source,
      type: message.type,
      timestamp: message.metadata?.timestamp,
      retryCount: message.metadata?.retryCount,
    });
    
    // Store the notification in the database
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'dlq_notification',
        action: 'notification_sent',
        timestamp: new Date(),
        source: 'dlq-processor',
        status: 'SUCCESS',
        eventCategory: 'SYSTEM_EVENT',
        properties: {
          message,
        } as any,
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to send notification',
    });
  }
};
