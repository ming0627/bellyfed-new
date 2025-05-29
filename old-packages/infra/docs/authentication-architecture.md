# Bellyfed Authentication Architecture

This document provides a comprehensive overview of the authentication architecture used in the Bellyfed application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Authentication Flows](#authentication-flows)
4. [Lambda Functions](#lambda-functions)
5. [Error Handling](#error-handling)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Overview

The Bellyfed authentication system uses AWS Cognito for user management and authentication, with custom Lambda functions to enhance the user experience and track authentication events. The system handles user registration, login, password reset, and email verification processes.

## Architecture Components

### Frontend

- NextJS application hosted on CloudFront/Lambda Edge
- Communicates with Cognito for authentication operations
- Provides user interfaces for sign-up, login, password reset, etc.

### AWS Cognito

- **User Pool**: Stores user accounts and handles authentication
- **User Pool Client**: Connects the frontend to the user pool
- **Identity Pool**: Provides temporary AWS credentials for authenticated users

### Lambda Functions

- **Custom Message Lambda**: Customizes email templates for verification, password reset, etc.
- **Post Confirmation Lambda**: Processes events after user confirmation

### Notification Services

- **Amazon SES**: Sends emails to users
- **SQS Queues**: Track authentication events
- **EventBridge**: Processes user-related events
- **DLQ (Dead Letter Queue)**: Captures failed message processing

## Architecture Diagram

```
┌─────────────────────┐     ┌─────────────────────────────────────────────────────────────────┐
│                     │     │                    AWS Cloud (ap-southeast-1)                    │
│  User               │     │                                                                  │
│  ┌───────────────┐  │     │  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐│
│  │ Web Browser   │  │     │  │ CloudFront    │      │ Lambda Edge   │      │ S3 Bucket     ││
│  │               │──┼─────┼─▶│ Distribution  │─────▶│ (Frontend)    │─────▶│ (Static Files)││
│  └───────────────┘  │     │  └───────────────┘      └───────────────┘      └───────────────┘│
│                     │     │           │                                                      │
└─────────────────────┘     │           │                                                      │
                            │           ▼                                                      │
                            │  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐│
                            │  │ Amazon        │      │ Cognito       │      │ Cognito       ││
                            │  │ Cognito       │◀────▶│ User Pool     │◀────▶│ Identity Pool ││
                            │  │ Authentication │      │ Client        │      │               ││
                            │  └───────────────┘      └───────────────┘      └───────────────┘│
                            │           │                                                      │
                            │           │                                                      │
                            │           ▼                                                      │
                            │  ┌─────────────────────────────────────────────────────────────┐ │
                            │  │                     Lambda Triggers                          │ │
                            │  │                                                              │ │
                            │  │  ┌───────────────┐                    ┌───────────────┐     │ │
                            │  │  │ Custom Message│                    │ Post          │     │ │
                            │  │  │ Lambda        │                    │ Confirmation  │     │ │
                            │  │  │ (Email        │                    │ Lambda        │     │ │
                            │  │  │ Templates)    │                    │               │     │ │
                            │  │  └───────────────┘                    └───────────────┘     │ │
                            │  │          │                                    │             │ │
                            │  └──────────┼────────────────────────────────────┼────────────┘ │
                            │             │                                    │               │
                            │             ▼                                    ▼               │
                            │  ┌───────────────┐                      ┌───────────────┐       │
                            │  │ Amazon SES    │                      │ EventBridge   │       │
                            │  │ (Email        │                      │ (User Events) │       │
                            │  │ Delivery)     │                      │               │       │
                            │  └───────────────┘                      └───────────────┘       │
                            │             │                                                    │
                            │             │                                                    │
                            │             ▼                                                    │
                            │  ┌───────────────┐      ┌───────────────┐                       │
                            │  │ SQS Queue     │      │ DLQ           │                       │
                            │  │ (Auth Events) │─────▶│ (Failed       │                       │
                            │  │               │      │ Messages)      │                       │
                            │  └───────────────┘      └───────────────┘                       │
                            │                                                                  │
                            └─────────────────────────────────────────────────────────────────┘
```

## Authentication Flows

### 1. Sign-Up Flow

```
User → Frontend → Cognito User Pool → Custom Message Lambda → SES → User Email
                                    → Post Confirmation Lambda → EventBridge
                                                              → SQS Queue
```

1. User enters registration details on the frontend
2. Frontend sends sign-up request to Cognito
3. Cognito creates a new unconfirmed user
4. Cognito triggers Custom Message Lambda for verification email
5. Custom Message Lambda customizes the email template
6. SES sends the verification email to the user
7. User clicks verification link or enters code
8. Cognito confirms the user
9. Cognito triggers Post Confirmation Lambda
10. Post Confirmation Lambda publishes event to EventBridge
11. Authentication event is sent to SQS Queue for tracking

### 2. Password Reset Flow

```
User → Frontend → Cognito User Pool → Custom Message Lambda → SES → User Email
                                                           → SQS Queue
```

1. User requests password reset on the frontend
2. Frontend sends forgot password request to Cognito
3. Cognito triggers Custom Message Lambda for reset email
4. Custom Message Lambda customizes the email template
5. SES sends the password reset email to the user
6. Authentication event is sent to SQS Queue for tracking
7. User clicks reset link or enters code and new password
8. Cognito updates the user's password

### 3. Resend Verification Code Flow

```
User → Frontend → Cognito User Pool → Custom Message Lambda → SES → User Email
                                                           → SQS Queue
```

1. User requests a new verification code
2. Frontend sends resend code request to Cognito
3. Cognito triggers Custom Message Lambda
4. Custom Message Lambda customizes the email template
5. SES sends the new verification code email
6. Authentication event is sent to SQS Queue for tracking

### 4. Login Flow

```
User → Frontend → Cognito User Pool → Cognito Identity Pool → Temporary AWS Credentials
```

1. User enters login credentials on the frontend
2. Frontend sends authentication request to Cognito
3. Cognito validates the credentials
4. Upon successful authentication, Cognito issues tokens
5. Frontend uses tokens to get temporary AWS credentials from Cognito Identity Pool
6. User can now access AWS resources based on their permissions

## Lambda Functions

### Custom Message Lambda

The Custom Message Lambda function is triggered by Cognito when it needs to send emails for:

- User verification during sign-up
- Password reset requests
- Email attribute verification
- Resending verification codes

#### Implementation Details

- **Runtime**: Node.js 20.x
- **Handler**: `index.handler`
- **Location**: `/functions/cognito-custom-message/`
- **Environment Variables**:
    - `REGION`: AWS region (ap-southeast-1)
    - `ENVIRONMENT`: Deployment environment (dev, test, prod)
    - `AUTH_QUEUE_URL`: SQS queue URL for authentication events
    - `DLQ_URL`: Dead letter queue URL
    - `VERIFICATION_URL_BASE`: Base URL for verification links
    - `RESET_PASSWORD_URL_BASE`: Base URL for password reset links
    - `ENABLE_CUSTOM_MESSAGE_LOGGING`: Enable/disable logging

#### Email Templates

The function provides custom HTML email templates for:

1. **User Verification** - Sent when a new user signs up
2. **Password Reset** - Sent when a user requests a password reset
3. **Attribute Verification** - Sent when a user changes their email address
4. **Resend Verification Code** - Sent when a user requests a new verification code

For more details, see [Cognito Custom Message Documentation](./cognito-custom-message.md).

### Post Confirmation Lambda

The Post Confirmation Lambda function is triggered after a user is confirmed in Cognito:

- **Runtime**: Node.js 20.x
- **Handler**: `index.handler`
- **Location**: `/functions/cognito-post-confirmation/`
- **Environment Variables**:
    - `USER_EVENT_BUS`: EventBridge event bus for user events
    - `ENVIRONMENT`: Deployment environment (dev, test, prod)

This function publishes user registration events to EventBridge for further processing.

## Error Handling

### SQS Message Retry Logic

The Custom Message Lambda includes retry logic for SQS message sending:

```
Custom Message Lambda → Retry Logic → SQS Queue
                      → (If failed) → DLQ
```

1. If SQS message sending fails, retry with exponential backoff
2. After maximum retries, send to Dead Letter Queue (DLQ)
3. Failed messages in DLQ can be monitored and processed manually

### Configuration

- **MAX_RETRIES**: 3 attempts
- **BASE_DELAY_MS**: 100ms (with exponential backoff)

## Deployment

The authentication infrastructure is deployed using AWS CDK:

```bash
# Deploy the Cognito stack for a specific environment
cdk deploy --context environment=dev BellyfedCognitoStack-dev
```

### Lambda Function Deployment

Before deploying the Cognito stack, ensure the Lambda functions are properly built:

```bash
# Build the Custom Message Lambda
cd functions/cognito-custom-message
npm install
npx tsc
```

For more details, see [Cognito Custom Message Deployment](./cognito-custom-message.md#deployment).

## Troubleshooting

### Common Issues

#### "Cannot use import statement outside a module" Error

This error occurs when the Lambda function is using ES modules syntax (`import` statements) but is being executed in a CommonJS environment.

**Solution**: Ensure the TypeScript configuration is set to output CommonJS modules:

```json
// tsconfig.json
{
    "compilerOptions": {
        "module": "CommonJS"
        // other options...
    }
}
```

#### Email Delivery Issues

If emails are not being delivered:

1. Check that the SES identity is verified
2. Ensure the Cognito user pool has the correct SES configuration
3. Verify the Lambda function has the necessary permissions to send to SQS

#### Testing Lambda Functions

To test the Custom Message Lambda function:

```bash
# Create a test payload
echo '{"triggerSource":"CustomMessage_ResendCode","request":{"userAttributes":{"email":"test@example.com","given_name":"Test","family_name":"User"},"codeParameter":"123456"},"response":{"emailSubject":"","emailMessage":""},"userName":"testuser"}' | base64 | tr -d '\n' > payload.txt

# Invoke the Lambda function
aws lambda invoke --function-name BellyfedCognitoStack-dev-CognitoCustomMessagedevF8-piIlibonDZfc --payload file://payload.txt response.json

# Check the response
cat response.json
```
