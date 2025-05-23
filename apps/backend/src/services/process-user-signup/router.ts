/**
 * Process User Signup Router
 * 
 * This file defines the tRPC router for process user signup operations.
 * It exposes endpoints for processing user signup events.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processUserSignup,
  processBatch,
  type SignupEvent,
  type SQSEvent,
  type ProcessedRecord,
} from './index.js';

// Define Zod schema for signup event payload
const signupEventPayloadSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  nickname: z.string().optional(),
  sub: z.string().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  phone_number: z.string().optional(),
  email_verified: z.string().optional(),
  picture: z.string().optional(),
}).catchall(z.unknown());

// Define Zod schema for signup event
const signupEventSchema = z.object({
  event_id: z.string(),
  timestamp: z.string(),
  event_type: z.string(),
  source: z.string(),
  version: z.string(),
  trace_id: z.string(),
  user_id: z.string(),
  status: z.string(),
  payload: signupEventPayloadSchema,
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

export const processUserSignupRouter = router({
  // Process a single user signup event
  processSignup: protectedProcedure
    .input(signupEventSchema)
    .mutation(async ({ input }) => {
      return processUserSignup(input as SignupEvent);
    }),

  // Process a batch of user signup events
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processBatch(input as SQSEvent);
    }),

  // Get user by ID
  getUserById: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }),

  // Get user by Cognito ID
  getUserByCognitoId: protectedProcedure
    .input(z.object({
      cognitoId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { cognitoId } = input;
      
      const user = await ctx.prisma.user.findUnique({
        where: {
          cognitoId,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }),

  // Get user by email
  getUserByEmail: protectedProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .query(async ({ input, ctx }) => {
      const { email } = input;
      
      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }),
});
