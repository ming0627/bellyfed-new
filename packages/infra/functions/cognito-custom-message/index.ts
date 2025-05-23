/**
 * Cognito Custom Message Lambda Trigger
 *
 * This Lambda function is triggered when Cognito needs to send a custom message to a user.
 * It customizes the email templates for various Cognito events like sign-up, forgot password, etc.
 * It also sends event data to an SQS queue for further processing.
 */

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
// We'll use a custom error class instead of importing from the utils layer
class ApplicationError extends Error {
  statusCode: number;
  errorType: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

/**
 * Custom Message Trigger Event interface for TypeScript
 */
interface CustomMessageTriggerEvent {
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

// Configuration
const isLoggingEnabled = process.env.ENABLE_CUSTOM_MESSAGE_LOGGING === 'true';
const sqsClient = new SQSClient({ region: process.env.REGION });
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 100;

/**
 * Logger function that respects the logging configuration
 */
const log = (message: string, data?: unknown) => {
  if (isLoggingEnabled) {
    console.log(message, data ? JSON.stringify(data, null, 2) : '');
  }
};

/**
 * Sleep function for retry mechanism
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Event payload interface
 */
interface EventPayload {
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

/**
 * Send message to SQS with retry mechanism
 */
async function sendMessageWithRetry(
  messageBody: string,
  queueUrl: string,
  attempt: number = 1
): Promise<void> {
  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: 'CognitoCustomMessage',
        },
        timestamp: {
          DataType: 'String',
          StringValue: new Date().toISOString(),
        },
      },
    });

    await sqsClient.send(command);
    log('Message sent to SQS successfully');
  } catch (error: unknown) {
    if (attempt >= MAX_RETRIES) {
      console.error(`Failed after ${MAX_RETRIES} attempts:`, error);
      await sendToDLQ(messageBody);
      return;
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) * (0.5 + Math.random());
    log(`Retry attempt ${attempt} after ${delay}ms`);
    await sleep(delay);
    await sendMessageWithRetry(messageBody, queueUrl, attempt + 1);
  }
}

/**
 * Send message to Dead Letter Queue
 */
async function sendToDLQ(messageBody: string): Promise<void> {
  try {
    const dlqUrl = process.env.DLQ_URL;
    if (!dlqUrl) {
      throw new ApplicationError('DLQ_URL environment variable is not defined', 500);
    }

    const command = new SendMessageCommand({
      QueueUrl: dlqUrl,
      MessageBody: messageBody,
      MessageAttributes: {
        errorTimestamp: {
          DataType: 'String',
          StringValue: new Date().toISOString(),
        },
        originalQueue: {
          DataType: 'String',
          StringValue: process.env.AUTH_QUEUE_URL || 'unknown',
        },
      },
    });

    await sqsClient.send(command);
    log('Message sent to DLQ successfully');
  } catch (dlqError) {
    console.error('Failed to send message to DLQ:', dlqError);
    throw dlqError;
  }
}

/**
 * Main Lambda handler
 */
export const handler = async (
  event: CustomMessageTriggerEvent
): Promise<CustomMessageTriggerEvent> => {
  log('Custom message trigger received', event);

  try {
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
    }

    const queueUrl = process.env.AUTH_QUEUE_URL;
    if (!queueUrl) {
      throw new ApplicationError('AUTH_QUEUE_URL environment variable is not defined', 500);
    }
    await sendMessageWithRetry(JSON.stringify(eventPayload), queueUrl);

    return event;
  } catch (error: unknown) {
    console.error('Error in custom message handler:', error);
    return event;
  }
};

/**
 * Handle user verification email
 */
async function handleUserVerification(
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> {
  const verificationUrlBase = process.env.VERIFICATION_URL_BASE;
  if (!verificationUrlBase) {
    throw new ApplicationError('VERIFICATION_URL_BASE environment variable is not defined', 500);
  }

  const verificationLink = new URL('/verify', verificationUrlBase);
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
}

/**
 * Handle forgot password email
 */
async function handleForgotPassword(
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> {
  const resetPasswordUrlBase = process.env.RESET_PASSWORD_URL_BASE;
  if (!resetPasswordUrlBase) {
    throw new ApplicationError('RESET_PASSWORD_URL_BASE environment variable is not defined', 500);
  }

  const resetLink = new URL('/reset-password', resetPasswordUrlBase);
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
}

/**
 * Handle attribute verification email
 */
async function handleAttributeVerification(
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> {
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
}

/**
 * Handle resend code email
 */
async function handleResendCode(
  event: CustomMessageTriggerEvent,
  eventPayload: EventPayload
): Promise<void> {
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
}