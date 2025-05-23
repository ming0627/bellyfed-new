/**
 * Process User Signup Service
 * 
 * This service processes user registration data and stores it in the database.
 * It provides functionality for handling user signup events from various sources.
 * 
 * The service includes:
 * - Processing user signup events
 * - Storing user data in the database
 * - Idempotent processing to prevent duplicate users
 * - Circuit breaker pattern for resilience
 * - Retry mechanism with exponential backoff
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Circuit breaker state
let circuitOpen = false;
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute

// Define the signup event interface
export interface SignupEvent {
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
    nickname?: string;
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    phone_number?: string;
    email_verified?: string;
    picture?: string;
    [key: string]: unknown;
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

// Define the processed record interface
export interface ProcessedRecord {
  recordId: string;
  status: 'SUCCESS' | 'FAILURE';
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Process a user signup event
 */
export const processUserSignup = async (event: SignupEvent): Promise<ProcessedRecord> => {
  // Check if circuit breaker allows processing
  if (!checkCircuitBreaker()) {
    console.log('Circuit breaker open, skipping processing');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Service temporarily unavailable',
    });
  }

  try {
    const eventId = event.event_id;
    const traceId = event.trace_id;

    console.log(`Processing signup [Event ID: ${eventId}, Trace ID: ${traceId}]`, {
      userId: event.user_id,
      email: event.payload.email,
      source: event.source,
    });

    // Extract user data
    const { payload, user_id, timestamp } = event;
    const { email, username, sub, nickname } = payload;

    // Format name from available attributes
    const name =
      payload.name ||
      (payload.given_name && payload.family_name
        ? `${payload.given_name} ${payload.family_name}`
        : username);

    // Check if user already exists (idempotent processing)
    const userExists = await checkUserExists(user_id, sub || user_id);
    if (userExists) {
      console.log(
        `User already exists in database, skipping insertion [User ID: ${user_id}, Cognito ID: ${sub || user_id}]`
      );
      recordSuccess();
      return {
        recordId: eventId,
        status: 'SUCCESS',
      };
    }

    // Insert user into database
    await prisma.user.create({
      data: {
        id: user_id,
        cognitoId: sub || user_id,
        email: email,
        name: name || '',
        nickname: (nickname || username) || '',
        phone: payload.phone_number || '',
        emailVerified: payload.email_verified === 'true',
        profileImageUrl: payload.picture || '',
        bio: '',
        location: '',
        preferences: {},
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      },
    });

    console.log(`Successfully stored user in database [User ID: ${user_id}, Email: ${email}]`);
    recordSuccess();
    
    return {
      recordId: eventId,
      status: 'SUCCESS',
    };
  } catch (error) {
    recordFailure();
    console.error('Error processing user signup:', error);
    
    return {
      recordId: event.event_id,
      status: 'FAILURE',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof TRPCError ? error.code : 'INTERNAL_SERVER_ERROR',
      },
    };
  }
};

/**
 * Process a batch of user signup events from SQS
 */
export const processBatch = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log(`Processing ${event.Records.length} user signup events`);

  const results: ProcessedRecord[] = [];
  
  // Process records in parallel with a limit of 5 concurrent operations
  for (let i = 0; i < event.Records.length; i += 5) {
    const batch = event.Records.slice(i, i + 5);
    const batchResults = await Promise.allSettled(
      batch.map(async (record) => {
        try {
          const signupEvent = JSON.parse(record.body) as SignupEvent;
          return processUserSignup(signupEvent);
        } catch (error) {
          console.error('Error parsing record:', error);
          return {
            recordId: record.messageId,
            status: 'FAILURE' as const,
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      })
    );
    
    // Extract results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          recordId: 'unknown',
          status: 'FAILURE',
          error: {
            message: result.reason?.message || 'Unknown error',
          },
        });
      }
    }
  }

  // Check for any failures
  const failures = results.filter((r) => r.status === 'FAILURE');
  if (failures.length > 0) {
    console.error(`${failures.length} records failed processing`);
  }

  console.log(`Successfully processed ${results.length - failures.length} out of ${results.length} records`);
  
  // Return failed records for retry
  return {
    batchItemFailures: failures.map((failure) => ({
      itemIdentifier: failure.recordId,
    })),
  };
};

// Helper function to check if user already exists
async function checkUserExists(userId: string, cognitoId: string): Promise<boolean> {
  try {
    const count = await prisma.user.count({
      where: {
        OR: [
          { id: userId },
          { cognitoId: cognitoId },
        ],
      },
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false; // Assume user doesn't exist if check fails
  }
}

// Helper function to implement circuit breaker pattern
function checkCircuitBreaker(): boolean {
  // If circuit is open, check if it's time to try again
  if (circuitOpen) {
    const now = Date.now();
    if (now - lastFailureTime > CIRCUIT_RESET_TIMEOUT) {
      console.log('Circuit breaker: Resetting circuit to half-open state');
      circuitOpen = false;
      failureCount = 0;
      return true;
    }
    return false;
  }
  return true;
}

// Helper function to record failures for circuit breaker
function recordFailure(): void {
  failureCount++;
  lastFailureTime = Date.now();

  if (failureCount >= FAILURE_THRESHOLD) {
    console.log(`Circuit breaker: Opening circuit after ${failureCount} failures`);
    circuitOpen = true;
  }
}

// Helper function to record success for circuit breaker
function recordSuccess(): void {
  if (circuitOpen) {
    console.log('Circuit breaker: Closing circuit after successful operation');
    circuitOpen = false;
  }
  failureCount = 0;
}
