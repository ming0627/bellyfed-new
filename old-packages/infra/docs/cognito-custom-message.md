# Cognito Custom Message Lambda Function

This document describes the Cognito Custom Message Lambda function used for customizing email templates in the Bellyfed authentication system.

## Overview

The Cognito Custom Message Lambda function is triggered by Amazon Cognito when it needs to send emails for:

- User verification during sign-up
- Password reset requests
- Email attribute verification
- Resending verification codes

The function customizes the email templates with Bellyfed branding and provides a better user experience than the default Cognito emails.

## Implementation Details

### Technology Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript (compiled to CommonJS)
- **AWS Services**:
    - Amazon Cognito (triggers the Lambda)
    - Amazon SQS (for event tracking)
    - Amazon SES (for sending emails)

### Code Structure

The Lambda function is located in:

```
/functions/cognito-custom-message/
```

Key files:

- `src/index.ts` - Main Lambda handler and email template logic
- `tsconfig.json` - TypeScript configuration (outputs CommonJS modules)
- `package.json` - Dependencies and build scripts
- `build.sh` - Build script for compiling and packaging the Lambda

### Email Templates

The function provides custom HTML email templates for:

1. **User Verification** - Sent when a new user signs up
2. **Password Reset** - Sent when a user requests a password reset
3. **Attribute Verification** - Sent when a user changes their email address
4. **Resend Verification Code** - Sent when a user requests a new verification code

### Event Tracking

The function sends events to an SQS queue for tracking and analytics purposes. Each email send is tracked with:

- Event ID
- Timestamp
- Event type
- User information
- Status

### Error Handling

The function includes retry logic for SQS message sending with exponential backoff. If all retries fail, messages are sent to a Dead Letter Queue (DLQ) for further investigation.

## Deployment

The Lambda function needs to be built before deploying with CDK. Follow these steps:

1. Build the Lambda function:

    ```bash
    cd functions/cognito-custom-message
    chmod +x ./build.sh
    ./build.sh
    ```

2. Deploy using CDK:
    ```bash
    cdk deploy --context environment=dev BellyfedCognitoStack-dev
    ```

The build script will:

1. Compile TypeScript to JavaScript
2. Install production dependencies
3. Package everything for deployment

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

## Maintenance

When updating the Lambda function:

1. Make changes to the TypeScript source code in `src/index.ts`
2. Test locally using the build script: `./build.sh`
3. Deploy using CDK: `cdk deploy --context environment=dev BellyfedCognitoStack-dev`

The CDK deployment process will automatically build and package the Lambda function.
