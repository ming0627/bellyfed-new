/**
 * User Account Processor Service
 * 
 * This service processes user account events:
 * - User registration
 * - User profile update
 * - User deletion
 * 
 * The service uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const prisma = new PrismaClient();
const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Define event types
export interface UserEvent {
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

// Define SQS record interface
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

// Define SQS event interface
export interface SQSEvent {
  Records: SQSRecord[];
}

/**
 * Process a batch of user account events from SQS
 */
export const processBatch = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log('Processing user account events:', JSON.stringify(event));

  const results: any[] = [];
  const errors: any[] = [];

  // Process each record in the SQS batch
  for (const record of event.Records) {
    try {
      const result = await processRecord(record);
      results.push({ messageId: record.messageId, result });
    } catch (recordError) {
      console.error(`Error processing record ${record.messageId}:`, recordError);
      errors.push({
        messageId: record.messageId,
        error: recordError instanceof Error ? recordError.message : 'Unknown error',
        stackTrace: recordError instanceof Error ? recordError.stack : undefined,
      });
    }
  }

  // If any records failed, log the summary
  if (errors.length > 0) {
    console.warn(
      `Processed ${results.length} records successfully, ${errors.length} records failed.`
    );
    console.warn('Failed records:', JSON.stringify(errors));
  }

  // Return failed records for retry
  return {
    batchItemFailures: errors.map((failure) => ({
      itemIdentifier: failure.messageId,
    })),
  };
};

/**
 * Process a single SQS record
 */
async function processRecord(record: SQSRecord): Promise<Record<string, unknown>> {
  console.log('Processing record:', record.messageId);

  try {
    // Parse the message body
    const message = JSON.parse(record.body);
    const eventType = message.detail_type || message.detailType;

    let result;

    // Route to the appropriate handler based on event type
    if (eventType === 'UserRegistered') {
      result = await handleUserRegistration(message);
    } else if (eventType === 'UserUpdated') {
      result = await handleUserUpdate(message);
    } else if (eventType === 'UserDeleted') {
      result = await handleUserDeletion(message);
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
export const handleUserRegistration = async (event: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const userData = event.detail as UserEvent;

  // Validate user data
  if (!userData.userId || !userData.email) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing required fields for user registration',
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userData.userId,
      },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `User with ID ${userData.userId} already exists`,
      });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: userData.userId,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || null,
        nickname: userData.username || null,
        phone: userData.phoneNumber || null,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      },
    });

    console.log('User registered successfully:', user);

    // Prepare completion event data
    const completionEventData = {
      userId: user.id,
      email: user.email,
      status: 'SUCCESS',
      createdAt: user.createdAt.toISOString(),
      requestId: uuidv4(),
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
      user,
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
      requestId: uuidv4(),
    };

    // Send failure event to EventBridge
    await sendCompletionEvent('UserRegistrationFailed', 'bellyfed.user', failureEventData);

    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handle user update events
 */
export const handleUserUpdate = async (event: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const userData = event.detail as UserEvent;

  // Validate user data
  if (!userData.userId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing required fields for user update',
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userData.userId,
      },
    });

    if (!existingUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User with ID ${userData.userId} not found`,
      });
    }

    // Update user in database
    const user = await prisma.user.update({
      where: {
        id: userData.userId,
      },
      data: {
        email: userData.email || undefined,
        name: userData.firstName || userData.lastName
          ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          : undefined,
        nickname: userData.username || undefined,
        phone: userData.phoneNumber || undefined,
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      },
    });

    console.log('User updated successfully:', user);

    // Prepare completion event data
    const completionEventData = {
      userId: user.id,
      email: user.email,
      status: 'SUCCESS',
      updatedAt: user.updatedAt.toISOString(),
      requestId: uuidv4(),
    };

    // Send completion event to EventBridge
    await sendCompletionEvent('UserUpdateCompleted', 'bellyfed.user', completionEventData);

    return {
      operation: 'update',
      status: 'success',
      user,
      completionEvent: completionEventData,
    };
  } catch (error: unknown) {
    console.error('Error updating user:', error);

    // Prepare failure event data
    const failureEventData = {
      userId: userData.userId,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: uuidv4(),
    };

    // Send failure event to EventBridge
    await sendCompletionEvent('UserUpdateFailed', 'bellyfed.user', failureEventData);

    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Handle user deletion events
 */
export const handleUserDeletion = async (event: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const userData = event.detail as UserEvent;

  // Validate user data
  if (!userData.userId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing required fields for user deletion',
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userData.userId,
      },
    });

    if (!existingUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User with ID ${userData.userId} not found`,
      });
    }

    // Delete user from database
    const user = await prisma.user.delete({
      where: {
        id: userData.userId,
      },
    });

    console.log('User deleted successfully:', user);

    // Prepare completion event data
    const completionEventData = {
      userId: user.id,
      email: user.email,
      status: 'SUCCESS',
      deletedAt: new Date().toISOString(),
      requestId: uuidv4(),
    };

    // Send completion event to EventBridge
    await sendCompletionEvent('UserDeletionCompleted', 'bellyfed.user', completionEventData);

    return {
      operation: 'delete',
      status: 'success',
      user,
      completionEvent: completionEventData,
    };
  } catch (error: unknown) {
    console.error('Error deleting user:', error);

    // Prepare failure event data
    const failureEventData = {
      userId: userData.userId,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: uuidv4(),
    };

    // Send failure event to EventBridge
    await sendCompletionEvent('UserDeletionFailed', 'bellyfed.user', failureEventData);

    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

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
        EventBusName: process.env.USER_ACCOUNT_EVENT_BUS_NAME || 'default',
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
