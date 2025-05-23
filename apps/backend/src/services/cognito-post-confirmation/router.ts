/**
 * Cognito Post Confirmation Router
 * 
 * This file defines the tRPC router for Cognito post-confirmation operations.
 * It exposes endpoints for processing post-confirmation events.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../../trpc.js';
import { processPostConfirmation, type PostConfirmationTriggerEvent } from './index.js';

// Define Zod schema for user attributes
const userAttributesSchema = z.object({
  sub: z.string(),
  email: z.string(),
  email_verified: z.string(),
}).catchall(z.string());

// Define Zod schema for post-confirmation trigger event
const postConfirmationTriggerEventSchema = z.object({
  version: z.string(),
  region: z.string(),
  userPoolId: z.string(),
  userName: z.string(),
  callerContext: z.object({
    awsSdkVersion: z.string(),
    clientId: z.string(),
  }),
  triggerSource: z.string(),
  request: z.object({
    userAttributes: userAttributesSchema,
  }),
  response: z.record(z.unknown()),
});

export const cognitoPostConfirmationRouter = router({
  // Process post-confirmation
  processPostConfirmation: publicProcedure
    .input(postConfirmationTriggerEventSchema)
    .mutation(async ({ input, ctx }) => {
      const requestId = ctx.user?.id || undefined;
      return processPostConfirmation(input as PostConfirmationTriggerEvent, requestId);
    }),
});
