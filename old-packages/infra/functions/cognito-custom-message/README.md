# Cognito Custom Message Lambda Function

This Lambda function customizes the email messages sent by Amazon Cognito for user verification, password reset, and other authentication flows.

## Important: Module Syntax

⚠️ **This function uses CommonJS module syntax.** Do not use ES module syntax (`import`/`export`) as it will cause runtime errors.

- ✅ Use `require()` for imports
- ✅ Use `exports.handler` for the handler function
- ❌ Do not use `import` statements
- ❌ Do not use `export const handler`

See the [Lambda Module Syntax Guide](../../docs/lambda-module-syntax.md) for more details.

## Function Overview

This Lambda function is triggered by Amazon Cognito when it needs to send emails for:

- User verification during sign-up
- Password reset requests
- Email attribute verification
- Resending verification codes

## Environment Variables

The function requires the following environment variables:

- `REGION`: AWS region (e.g., ap-southeast-1)
- `ENVIRONMENT`: Deployment environment (dev, test, staging, prod)
- `AUTH_QUEUE_URL`: URL of the SQS queue for auth events
- `DLQ_URL`: URL of the dead-letter queue
- `VERIFICATION_URL_BASE`: Base URL for verification links
- `RESET_PASSWORD_URL_BASE`: Base URL for password reset links
- `ENABLE_CUSTOM_MESSAGE_LOGGING`: Set to 'true' to enable detailed logging

## Building and Deploying

1. Install dependencies:

    ```bash
    npm install
    ```

2. Build the function:

    ```bash
    npm run build
    # or
    ./build.sh
    ```

3. Deploy using CDK:
    ```bash
    cd ../../
    cdk deploy --context environment=dev BellyfedCognitoStack-dev
    ```

## Testing

You can test the function locally by creating a test event file and running:

```bash
cd dist
node -e "const { handler } = require('./index'); handler(require('../test-events/signup-event.json'))"
```

## Troubleshooting

If you encounter the error "Cannot use import statement outside a module", it means you're using ES module syntax in a CommonJS environment. Convert all `import` statements to `require()` calls and change `export const handler` to `exports.handler`.
