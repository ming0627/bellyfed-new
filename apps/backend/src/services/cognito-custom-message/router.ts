/**
 * Cognito Custom Message Router
 * 
 * This file defines the tRPC router for Cognito custom message operations.
 * It exposes endpoints for processing custom messages for various user flows.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import { processCustomMessage, type CustomMessageTriggerEvent } from './index.js';

// Define Zod schema for user attributes
const userAttributesSchema = z.object({
  sub: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  preferred_username: z.string().optional(),
  name: z.string().optional(),
  phone_number: z.string().optional(),
  phone_number_verified: z.string().optional(),
  address: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  locale: z.string().optional(),
  picture: z.string().optional(),
  profile: z.string().optional(),
  website: z.string().optional(),
  zoneinfo: z.string().optional(),
  updated_at: z.string().optional(),
  custom: z.record(z.string()).optional(),
}).catchall(z.string());

// Define Zod schema for custom message trigger event
const customMessageTriggerEventSchema = z.object({
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
    codeParameter: z.string(),
    linkParameter: z.string(),
    usernameParameter: z.string(),
  }),
  response: z.object({
    smsMessage: z.string(),
    emailMessage: z.string(),
    emailSubject: z.string(),
  }),
});

export const cognitoCustomMessageRouter = router({
  // Process custom message
  processCustomMessage: publicProcedure
    .input(customMessageTriggerEventSchema)
    .mutation(async ({ input }) => {
      return processCustomMessage(input as CustomMessageTriggerEvent);
    }),
  
  // Get custom message templates
  getTemplates: protectedProcedure
    .query(async () => {
      return {
        signUp: {
          subject: "🍜 Welcome to Bellyfed - Let's Get Slurpin'!",
          template: "signup-template",
        },
        forgotPassword: {
          subject: "🔐 Bellyfed Password Reset - Open Sesame!",
          template: "forgot-password-template",
        },
        updateUserAttribute: {
          subject: "✨ Verify Your New Email - Bellyfed",
          template: "attribute-verification-template",
        },
        resendCode: {
          subject: "🎯 Your New Verification Code - Bellyfed",
          template: "resend-code-template",
        },
      };
    }),
});
