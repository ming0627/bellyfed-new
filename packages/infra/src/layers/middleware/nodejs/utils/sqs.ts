/**
 * SQS utilities for AWS Lambda functions
 * This module provides utilities for sending messages to SQS
 */

import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  DeleteMessageBatchRequestEntry,
  ChangeMessageVisibilityCommand,
  GetQueueAttributesCommand
} from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create an SQS client
 * @returns SQS client
 */
export const createSQSClient = (): SQSClient => {
  return new SQSClient({});
};

/**
 * Send a message to an SQS queue
 * @param queueUrl SQS queue URL
 * @param message Message to send
 * @param messageGroupId Message group ID for FIFO queues
 * @param messageDeduplicationId Message deduplication ID for FIFO queues
 * @param delaySeconds Delay in seconds before the message becomes available for processing
 * @param client Optional SQS client (creates a new client if not provided)
 * @returns Result of the SendMessage operation
 */
export const sendToSQS = async (
  queueUrl: string,
  message: unknown,
  options?: {
    messageGroupId?: string;
    messageDeduplicationId?: string;
    delaySeconds?: number;
    messageAttributes?: Record<string, any>;
  },
  client?: SQSClient
): Promise<any> => {
  // Use provided client or create a new one
  const sqsClient = client || createSQSClient();

  // Create the SendMessage command
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: typeof message === 'string' ? message : JSON.stringify(message),
    ...(options?.messageGroupId && { MessageGroupId: options.messageGroupId }),
    ...(options?.messageDeduplicationId && { MessageDeduplicationId: options.messageDeduplicationId }),
    ...(options?.delaySeconds !== undefined && { DelaySeconds: options.delaySeconds }),
    ...(options?.messageAttributes && { MessageAttributes: options.messageAttributes }),
  });

  try {
    // Send the message
    return await sqsClient.send(command);
  } catch (error) {
    console.error('Error sending message to SQS:', error);
    throw error;
  }
};

/**
 * Send multiple messages to an SQS queue
 * @param queueUrl SQS queue URL
 * @param messages Array of messages to send
 * @param isFifo Whether the queue is a FIFO queue
 * @param client Optional SQS client (creates a new client if not provided)
 * @returns Result of the SendMessageBatch operation
 */
export const sendBatchToSQS = async (
  queueUrl: string,
  messages: Array<{
    id?: string;
    body: unknown;
    messageGroupId?: string;
    messageDeduplicationId?: string;
    delaySeconds?: number;
    messageAttributes?: Record<string, any>;
  }>,
  isFifo: boolean = false,
  client?: SQSClient
): Promise<any> => {
  // Use provided client or create a new one
  const sqsClient = client || createSQSClient();

  // Create batch entries
  const entries: SendMessageBatchRequestEntry[] = messages.map((message, index) => {
    const id = message.id || `msg-${index}-${uuidv4()}`;

    return {
      Id: id,
      MessageBody: typeof message.body === 'string' ? message.body : JSON.stringify(message.body),
      ...(message.messageGroupId && { MessageGroupId: message.messageGroupId }),
      ...(message.messageDeduplicationId && {
        MessageDeduplicationId: message.messageDeduplicationId
      }),
      ...(isFifo && !message.messageDeduplicationId && {
        MessageDeduplicationId: `${id}-${Date.now()}`
      }),
      ...(message.delaySeconds !== undefined && { DelaySeconds: message.delaySeconds }),
      ...(message.messageAttributes && { MessageAttributes: message.messageAttributes }),
    };
  });

  // Split entries into chunks of 10 (SQS batch limit)
  const chunks: SendMessageBatchRequestEntry[][] = [];
  for (let i = 0; i < entries.length; i += 10) {
    chunks.push(entries.slice(i, i + 10));
  }

  try {
    // Send each chunk
    const results = await Promise.all(
      chunks.map(chunk =>
        sqsClient.send(
          new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: chunk,
          })
        )
      )
    );

    // Check for failed entries
    const failedEntries = results.flatMap(result => result.Failed || []);
    if (failedEntries.length > 0) {
      console.warn('Some messages failed to send to SQS:', failedEntries);
    }

    return results;
  } catch (error) {
    console.error('Error sending batch messages to SQS:', error);
    throw error;
  }
};

/**
 * Receive messages from an SQS queue
 * @param queueUrl SQS queue URL
 * @param maxMessages Maximum number of messages to receive (1-10)
 * @param visibilityTimeout Visibility timeout in seconds
 * @param waitTimeSeconds Wait time in seconds for long polling
 * @param client Optional SQS client (creates a new client if not provided)
 * @returns Result of the ReceiveMessage operation
 */
export const receiveFromSQS = async (
  queueUrl: string,
  options?: {
    maxMessages?: number;
    visibilityTimeout?: number;
    waitTimeSeconds?: number;
    messageAttributeNames?: string[];
  },
  client?: SQSClient
): Promise<any> => {
  // Use provided client or create a new one
  const sqsClient = client || createSQSClient();

  // Create the ReceiveMessage command
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: options?.maxMessages || 1,
    VisibilityTimeout: options?.visibilityTimeout,
    WaitTimeSeconds: options?.waitTimeSeconds || 0,
    // We're only using MessageAttributeNames to avoid type issues with AttributeNames
    MessageAttributeNames: options?.messageAttributeNames || ['All'],
  });

  try {
    // Receive messages
    return await sqsClient.send(command);
  } catch (error) {
    console.error('Error receiving messages from SQS:', error);
    throw error;
  }
};
