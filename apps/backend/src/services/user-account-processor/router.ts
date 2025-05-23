/**
 * User Account Processor Router
 * 
 * This file defines the tRPC router for user account processor operations.
 * It exposes endpoints for processing user account events.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processBatch,
  handleUserRegistration,
  handleUserUpdate,
  handleUserDeletion,
  type UserEvent,
  type SQSEvent,
} from './index.js';

// Define Zod schema for user event
const userEventSchema = z.object({
  userId: z.string(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Define Zod schema for SQS message attributes
const sqsMessageAttributesSchema = z.record(z.object({
  dataType: z.string(),
  stringValue: z.string().optional(),
  binaryValue: z.string().optional(),
}));

// Define Zod schema for SQS record
const sqsRecordSchema = z.object({
  messageId: z.string(),
  receiptHandle: z.string(),
  body: z.string(),
  attributes: z.record(z.string()),
  messageAttributes: sqsMessageAttributesSchema,
  md5OfBody: z.string(),
  eventSource: z.string(),
  eventSourceARN: z.string(),
  awsRegion: z.string(),
});

// Define Zod schema for SQS event
const sqsEventSchema = z.object({
  Records: z.array(sqsRecordSchema),
});

export const userAccountProcessorRouter = router({
  // Process a batch of user account events
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processBatch(input as SQSEvent);
    }),

  // Handle user registration
  handleUserRegistration: protectedProcedure
    .input(
      z.object({
        detail: userEventSchema,
        detail_type: z.literal('UserRegistered'),
      })
    )
    .mutation(async ({ input }) => {
      return handleUserRegistration(input);
    }),

  // Handle user update
  handleUserUpdate: protectedProcedure
    .input(
      z.object({
        detail: userEventSchema,
        detail_type: z.literal('UserUpdated'),
      })
    )
    .mutation(async ({ input }) => {
      return handleUserUpdate(input);
    }),

  // Handle user deletion
  handleUserDeletion: protectedProcedure
    .input(
      z.object({
        detail: userEventSchema,
        detail_type: z.literal('UserDeleted'),
      })
    )
    .mutation(async ({ input }) => {
      return handleUserDeletion(input);
    }),

  // Process a user event
  processUserEvent: protectedProcedure
    .input(
      z.object({
        eventType: z.enum(['UserRegistered', 'UserUpdated', 'UserDeleted']),
        userData: userEventSchema,
      })
    )
    .mutation(async ({ input }) => {
      const event = {
        detail: input.userData,
        detail_type: input.eventType,
      };

      if (input.eventType === 'UserRegistered') {
        return handleUserRegistration(event);
      } else if (input.eventType === 'UserUpdated') {
        return handleUserUpdate(event);
      } else if (input.eventType === 'UserDeleted') {
        return handleUserDeletion(event);
      }

      throw new Error(`Unsupported event type: ${input.eventType}`);
    }),

  // Get user processing status
  getUserProcessingStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      
      // Get the latest event for this user
      const latestEvent = await ctx.prisma.analyticsEvent.findFirst({
        where: {
          type: 'user_account_processor',
          properties: {
            path: ['userId'],
            equals: userId,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      
      if (!latestEvent) {
        return {
          userId,
          status: 'UNKNOWN',
          lastUpdated: null,
        };
      }
      
      return {
        userId,
        status: latestEvent.status,
        action: latestEvent.action,
        lastUpdated: latestEvent.timestamp,
        details: latestEvent.properties,
      };
    }),
});
