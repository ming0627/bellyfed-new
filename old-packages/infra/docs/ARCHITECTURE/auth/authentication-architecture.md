# Authentication and API Integration

This document outlines the authentication flow and API integration in the Bellyfed application.

## Overview

The application uses AWS Cognito for user authentication and API Gateway for secure API access. The authentication flow is managed through Lambda@Edge functions with CloudFront and direct Cognito integration on the frontend.

## Architecture

### Authentication Flow

1. **Initial Setup**

    - User authentication is handled by AWS Cognito User Pool
    - Frontend uses direct Cognito integration with custom hooks
    - API Gateway validates both Cognito tokens and API keys
    - CloudFront with Lambda@Edge functions handle authentication at the edge

2. **Frontend Components**
    - `AuthContext` (`src/contexts/AuthContext.tsx`): Central authentication state management
    - `PageLayout` (`src/components/layout/PageLayout.tsx`): Handles authentication UI
    - `_app.tsx` (`src/pages/_app.tsx`): Configures authentication providers and protected routes

### API Integration

1. **API Gateway Configuration**

    - Created and managed via CDK in `ApiGatewayStack`
    - Uses dual authentication:
        - Cognito JWT tokens for user authentication
        - API keys for API access control
    - CORS enabled with appropriate headers

2. **Security Measures**
    - API requests require both:
        - Valid Cognito JWT token in `Authorization` header
        - API key in `x-api-key` header
    - Token refresh handled by custom token management utilities
    - Protected routes prevent unauthorized access
    - Lambda@Edge functions validate authentication before request reaches origin

## Implementation Details

### Frontend Authentication

```typescript
// Example of protected API call
const fetchData = async () => {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    const response = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
    });
};
```

### Lambda@Edge Authentication

```typescript
// Viewer Request Lambda@Edge
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;

    // Authentication logic
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.length) {
            return generateRedirectResponse('/signin');
        }

        // Validate token with Cognito
        const token = authHeader[0].value.replace('Bearer ', '');
        const isValid = await validateCognitoToken(token);

        if (!isValid) {
            return generateRedirectResponse('/signin');
        }

        return request;
    } catch (error) {
        return generateRedirectResponse('/signin');
    }
};
```

### Environment Configuration

Required environment variables in `.env`:

```shell
NEXT_PUBLIC_API_URL=https://your-api-gateway-url
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
const publicPages = ['/signin', '/signup', '/forgot-password'];
const shouldProtectRoute = !publicPages.includes(router.pathname);

// Wrap components that require authentication
{shouldProtectRoute ? (
  <ProtectedRoute>
    <Component {...pageProps} />
  </ProtectedRoute>
) : (
  <Component {...pageProps} />
)}
```

## Error Handling

1. **Authentication Errors**

    - Token expiration
    - Invalid credentials
    - Unauthorized access attempts

2. **API Errors**
    - Network failures
    - Invalid API keys
    - Rate limiting
    - Server errors

## Best Practices

1. **Security**

    - Never expose API keys in client-side code
    - Always use HTTPS for API calls
    - Implement proper token refresh mechanisms
    - Validate tokens on both client and server

2. **Performance**

    - Cache authentication state
    - Implement proper loading states
    - Handle token refresh efficiently
    - Utilize Lambda@Edge for edge authentication

3. **User Experience**
    - Clear error messages
    - Smooth sign-in/out transitions
    - Proper loading indicators

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**

    - Check Cognito User Pool configuration
    - Verify API Gateway authorizer settings
    - Ensure environment variables are set correctly
    - Check CloudFront and Lambda@Edge logs

2. **API Access Issues**
    - Verify API key is valid
    - Check CORS configuration
    - Confirm API Gateway deployment stage

## Related Documentation

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Lambda@Edge Documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
