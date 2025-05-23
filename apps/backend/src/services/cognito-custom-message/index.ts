/**
 * Cognito Custom Message Service
 *
 * This service handles customizing Cognito messages for various user flows:
 * - User verification
 * - Forgot password
 * - Attribute verification
 * - Resend code
 *
 * It generates custom email templates and sends events to a queue for tracking.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the CustomMessageTriggerEvent interface
export interface CustomMessageTriggerEvent {
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
      [key: string]: string;
    };
    codeParameter: string;
    linkParameter: string;
    usernameParameter: string;
  };
  response: {
    smsMessage: string;
    emailMessage: string;
    emailSubject: string;
  };
}

// Define the EventPayload interface
export interface EventPayload {
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
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    code_parameter?: string;
  };
}

// Environment variables
const VERIFICATION_URL_BASE = process.env.VERIFICATION_URL_BASE || 'https://app.bellyfed.com';
const RESET_PASSWORD_URL_BASE = process.env.RESET_PASSWORD_URL_BASE || 'https://app.bellyfed.com';

// Process custom message
export const processCustomMessage = async (
  event: CustomMessageTriggerEvent
): Promise<CustomMessageTriggerEvent> => {
  try {
    // Create event payload
    const eventPayload: EventPayload = {
      event_id: uuidv4(),
      timestamp: new Date().toISOString(),
      event_type: event.triggerSource,
      source: 'cognito.custom-message',
      version: 'v1.0',
      trace_id: uuidv4(),
      user_id: event.userName || 'unknown',
      status: 'processing',
      payload: {
        email: event.request.userAttributes.email || 'unknown',
        username: event.userName || 'unknown',
        given_name: event.request.userAttributes.given_name,
        family_name: event.request.userAttributes.family_name,
        preferred_username: event.request.userAttributes.preferred_username,
        code_parameter: event.request.codeParameter,
      },
    };

    // Process based on trigger source
    switch (event.triggerSource) {
      case 'CustomMessage_SignUp':
        await handleUserVerification(event, eventPayload);
        break;
      case 'CustomMessage_ForgotPassword':
        await handleForgotPassword(event, eventPayload);
        break;
      case 'CustomMessage_UpdateUserAttribute':
        await handleAttributeVerification(event, eventPayload);
        break;
      case 'CustomMessage_ResendCode':
        await handleResendCode(event, eventPayload);
        break;
      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported trigger source: ${event.triggerSource}`,
        });
    }

    // Store event in database
    await storeEvent(eventPayload);

    return event;
  } catch (error) {
    console.error('Error processing custom message:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process custom message',
    });
  }
};

// Store event in database
const storeEvent = async (eventPayload: EventPayload): Promise<void> => {
  try {
    await prisma.analyticsEvent.create({
      data: {
        id: eventPayload.event_id,
        type: 'cognito_custom_message',
        action: eventPayload.event_type,
        timestamp: new Date(eventPayload.timestamp),
        userId: eventPayload.user_id,
        traceId: eventPayload.trace_id,
        source: eventPayload.source,
        status: 'SUCCESS',
        eventCategory: 'AUTH_EVENT',
        properties: eventPayload as any,
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

// Handle user verification
const handleUserVerification = async (
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> => {
  const verificationLink = new URL('/verify', VERIFICATION_URL_BASE);
  verificationLink.searchParams.append('code', event.request.codeParameter);
  verificationLink.searchParams.append('username', event.userName);

  const givenName = event.request.userAttributes.given_name;
  const familyName = event.request.userAttributes.family_name;
  const preferredUsername = event.request.userAttributes.preferred_username;

  const greeting = givenName
    ? `${givenName}${familyName ? ` ${familyName}` : ''}`
    : preferredUsername || event.userName;

  event.response.emailSubject = "🍜 Welcome to Bellyfed - Let's Get Slurpin'!";
  event.response.emailMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF4B4B; margin: 0;">Welcome to Bellyfed!</h1>
            <p style="color: #666666; font-size: 16px;">Your Journey to Food Paradise Begins</p>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333333;">Hey ${greeting}! 🎉</p>
            <p style="font-size: 16px; color: #333333;">Awesome sauce! You've just joined the coolest food-loving squad in town!</p>
            <p style="font-size: 16px; color: #333333;">Before we dive into the delicious world of nom-noms, let's make sure it's really you.</p>
            <div style="background-color: #ffffff; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #666666; margin: 0;">Your verification code is:</p>
                <h2 style="color: #FF4B4B; margin: 10px 0; letter-spacing: 5px;">${event.request.codeParameter}</h2>
                <p style="font-size: 12px; color: #999999;">This code will expire in 24 hours</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${verificationLink.toString()}" style="background-color: #FF4B4B; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email</a>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666666; font-size: 14px;">Can't wait to see you rating ramen and critiquing curry!</p>
            <p style="color: #666666; font-size: 14px; margin-top: 20px;">Stay hungry (but not for long),<br>The Bellyfed Crew 🍽️</p>
        </div>
    </div>`;

  eventPayload.status = 'verificationEmailSent';
};

// Handle forgot password
const handleForgotPassword = async (
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> => {
  const resetLink = new URL('/reset-password', RESET_PASSWORD_URL_BASE);
  resetLink.searchParams.append('code', event.request.codeParameter);
  resetLink.searchParams.append('username', event.userName);

  const givenName = event.request.userAttributes.given_name;
  const familyName = event.request.userAttributes.family_name;
  const preferredUsername = event.request.userAttributes.preferred_username;

  const greeting = givenName
    ? `${givenName}${familyName ? ` ${familyName}` : ''}`
    : preferredUsername || event.userName;

  event.response.emailSubject = '🔐 Bellyfed Password Reset - Open Sesame!';
  event.response.emailMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF4B4B; margin: 0;">Password Reset</h1>
            <p style="color: #666666; font-size: 16px;">Let's Get You Back to Foodie Paradise!</p>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333333;">Hey ${greeting}, you magical foodie! 🌟</p>
            <p style="font-size: 16px; color: #333333;">Looks like you forgot your secret spell (ahem, password). No biggie! We've all been there after a food coma.</p>
            <div style="background-color: #ffffff; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #666666; margin: 0;">Your password reset code is:</p>
                <h2 style="color: #FF4B4B; margin: 10px 0; letter-spacing: 5px;">${event.request.codeParameter}</h2>
                <p style="font-size: 12px; color: #999999;">This code will expire in 1 hour</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink.toString()}" style="background-color: #FF4B4B; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #666666; background-color: #FFE5E5; padding: 10px; border-radius: 5px; margin-top: 20px;">If you didn't request this reset, please contact us immediately!</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666666; font-size: 14px;">May your plates always be full and your passwords always remembered,<br>The Bellyfed Wizards 🍽️</p>
        </div>
    </div>`;

  eventPayload.status = 'passwordResetEmailSent';
};

// Handle attribute verification
const handleAttributeVerification = async (
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> => {
  const givenName = event.request.userAttributes.given_name;
  const familyName = event.request.userAttributes.family_name;
  const preferredUsername = event.request.userAttributes.preferred_username;

  const greeting = givenName
    ? `${givenName}${familyName ? ` ${familyName}` : ''}`
    : preferredUsername || event.userName;

  event.response.emailSubject = '✨ Verify Your New Email - Bellyfed';
  event.response.emailMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF4B4B; margin: 0;">Email Verification</h1>
            <p style="color: #666666; font-size: 16px;">Just One More Step!</p>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333333;">Hey ${greeting}! 👋</p>
            <p style="font-size: 16px; color: #333333;">We noticed you're updating your email address. Let's make sure it's really you!</p>
            <div style="background-color: #ffffff; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #666666; margin: 0;">Your verification code is:</p>
                <h2 style="color: #FF4B4B; margin: 10px 0; letter-spacing: 5px;">${event.request.codeParameter}</h2>
                <p style="font-size: 12px; color: #999999;">This code will expire in 24 hours</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666666; font-size: 14px;">Happy munching!<br>The Bellyfed Team 🍽️</p>
        </div>
    </div>`;

  eventPayload.status = 'attributeVerificationEmailSent';
};

// Handle resend code
const handleResendCode = async (
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> => {
  const givenName = event.request.userAttributes.given_name;
  const familyName = event.request.userAttributes.family_name;
  const preferredUsername = event.request.userAttributes.preferred_username;

  const greeting = givenName
    ? `${givenName}${familyName ? ` ${familyName}` : ''}`
    : preferredUsername || event.userName;

  event.response.emailSubject = '🎯 Your New Verification Code - Bellyfed';
  event.response.emailMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF4B4B; margin: 0;">New Verification Code</h1>
            <p style="color: #666666; font-size: 16px;">Here's Your Fresh Code!</p>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333333;">Hey ${greeting}! 👋</p>
            <div style="background-color: #ffffff; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #666666; margin: 0;">Your new verification code is:</p>
                <h2 style="color: #FF4B4B; margin: 10px 0; letter-spacing: 5px;">${event.request.codeParameter}</h2>
                <p style="font-size: 12px; color: #999999;">This code will expire in 24 hours</p>
            </div>
            <p style="font-size: 16px; color: #333333;">Can't wait to have you on board! ⏰</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666666; font-size: 14px;">Best regards,<br>The Bellyfed Team 🍽️</p>
        </div>
    </div>`;

  eventPayload.status = 'resendCodeEmailSent';
};
