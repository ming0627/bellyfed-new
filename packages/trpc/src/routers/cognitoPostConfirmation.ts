/**
 * Cognito Post Confirmation Router
 * 
 * This file defines the tRPC router for Cognito post-confirmation operations.
 * It's a wrapper around the backend Cognito post-confirmation service.
 */

import { z } from 'zod';
import { router } from '../trpc.js';
import { publicProcedure } from '../procedures/index.js';

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
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return input;
    }),
});
