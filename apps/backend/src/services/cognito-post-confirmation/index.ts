/**
 * Cognito Post-Confirmation Service
 *
 * This service is triggered after a user successfully confirms their registration
 * in Cognito. It standardizes the user data and stores it in the database.
 *
 * It also publishes an event for further processing.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the PostConfirmationTriggerEvent interface
export interface PostConfirmationTriggerEvent {
  version: string;
  region: string;
  userPoolId: string;
  userName: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  triggerSource: string;
  request: {
    userAttributes: {
      sub: string;
      email: string;
      email_verified: string;
      [key: string]: string;
    };
  };
  response: Record<string, unknown>;
}

// Define the UserRegisteredEvent interface
export interface UserRegisteredEvent {
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

// Process post-confirmation event
export const processPostConfirmation = async (
  event: PostConfirmationTriggerEvent,
  requestId: string = uuidv4()
): Promise<PostConfirmationTriggerEvent> => {
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
      trace_id: requestId,
      user_id: userAttributes.sub || userName,
      status: 'confirmed',
      payload: {
        username: userName,
        ...userAttributes,
      },
    };

    // Store the user in the database
    await storeUser(userRegisteredEvent);

    // Store the event in the database
    await storeEvent(userRegisteredEvent);

    return event;
  } catch (error) {
    console.error('Error processing Cognito post-confirmation:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process post-confirmation',
    });
  }
};

// Store user in database
const storeUser = async (event: UserRegisteredEvent): Promise<void> => {
  try {
    const { user_id, payload } = event;
    const { email, username, given_name, family_name, preferred_username } = payload;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: user_id },
        data: {
          email: email as string,
          name: preferred_username as string || given_name as string || username as string,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          id: user_id,
          email: email as string,
          name: preferred_username as string || given_name as string || username as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error storing user:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to store user',
    });
  }
};

// Store event in database
const storeEvent = async (event: UserRegisteredEvent): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: event.event_id,
        type: 'user_registered',
        action: 'registration_confirmed',
        timestamp: new Date(event.timestamp),
        userId: event.user_id,
        traceId: event.trace_id,
        source: event.source,
        status: 'SUCCESS',
        eventCategory: 'AUTH_EVENT',
        properties: event as any,
      },
    });
  } catch (error) {
    console.error('Error storing event:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to store event',
    });
  }
};
