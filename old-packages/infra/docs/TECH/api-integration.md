# API Integration

This document details how to integrate with the Bellyfed API Gateway.

## API Overview

The Bellyfed API is built using AWS API Gateway and is configured using CDK. It provides secure endpoints for accessing application data with dual authentication using Cognito tokens and API keys, delivering both high security and flexibility.

## Overview

The Bellyfed API is built using AWS API Gateway and is configured using CDK. It provides secure endpoints for accessing application data with dual authentication using Cognito tokens and API keys, delivered through CloudFront with Lambda@Edge functions.

## API Gateway Stack

The API Gateway is defined in `ApiGatewayStack` with the following features:

- Regional endpoint
- CloudWatch logging
- CORS configuration
- Rate limiting
- API key authentication

### Stack Configuration

```typescript
// API Gateway configuration in CDK
const api = new apigateway.RestApi(this, `${props.environment}-eventbridge-api`, {
    restApiName: `${props.environment}-bellyfed-eventbridge-api`,
    defaultCorsPreflightOptions: {
        allowOrigins: this.getAllowedOrigins(props.environment),
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type', 'X-Api-Key', 'Authorization'],
        allowCredentials: true,
    },
    // ... other configuration
});
```

## CDK CloudFront Configuration

The CloudFront distribution is defined in `CloudFrontStack` with the following features:

```typescript
// CloudFront configuration in CDK
const distribution = new cloudfront.Distribution(this, `${props.environment}-cloudfront`, {
    defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
            {
                functionVersion: authFunction.currentVersion,
                eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            },
        ],
        // ... other configuration
    },
    // API path pattern behavior
    additionalBehaviors: {
        '/api/*': {
            origin: new origins.HttpOrigin(
                `${props.apiId}.execute-api.${props.region}.amazonaws.com`
            ),
            allowedMethods: cloudfront.AllowedMethods.ALL,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
            // ... other configuration
        },
    },
    // ... other configuration
});
```

## Route53 Configuration

The Route53 configuration is defined using CDK:

```typescript
// Route53 configuration in CDK
const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    domainName: props.domainName,
});

new route53.ARecord(this, 'ApiDnsRecord', {
    zone: hostedZone,
    recordName: props.siteDomainName,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
});
```

## Authentication

### Dual Authentication System

1. **Cognito Authentication**

    - Used for user identity verification
    - JWT tokens included in `Authorization` header
    - Managed through custom Cognito integration on the frontend

2. **API Key Authentication**
    - Used for API access control
    - Included in `x-api-key` header
    - Managed through API Gateway

## Making API Calls

### Frontend Implementation

Example of making an authenticated API call:

```typescript
const fetchEstablishment = async (id: string) => {
    // Get Cognito token
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    // Make API call
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/establishments/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
    });

    return response.json();
};
```

### Error Handling

Implement proper error handling for API calls:

```typescript
try {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'API request failed');
    }
    return response.json();
} catch (error) {
    console.error('API Error:', error);
    throw error;
}
```

## Available Endpoints

### Establishments

1. **Get Establishment**
    - Path: `/establishments/{id}`
    - Method: GET
    - Authentication: Required
    - Response: Establishment details

```typescript
interface Establishment {
    id: string;
    name: string;
    address: string;
    type: EstablishmentType;
    // ... other fields
}
```

## Rate Limiting

The API implements rate limiting with the following constraints:

```typescript
throttle: {
  rateLimit: 10,   // requests per second
  burstLimit: 20,  // concurrent requests
},
quota: {
  limit: 10000,    // requests per day
  period: Period.DAY,
}
```

## CORS Configuration

CORS is configured to allow:

- Specific origins based on environment
- Standard HTTP methods (GET, POST)
- Required headers for authentication
- Credentials for authenticated requests

## Monitoring and Logging

### CloudWatch Integration

- API Gateway logs sent to CloudWatch
- CloudFront logs sent to CloudWatch
- Lambda@Edge logs sent to CloudWatch
- Log retention: 1 week
- Error level logging enabled
- Access logs in JSON format

### Metrics

Available CloudWatch metrics:

- Request count
- Latency
- Error rates
- Cache hits/misses
- Origin errors

## Security Best Practices

1. **Token Management**

    - Implement proper token refresh
    - Handle token expiration gracefully
    - Secure token storage

2. **API Key Protection**

    - Store API keys securely
    - Rotate keys regularly
    - Monitor key usage

3. **Edge Security**

    - Validate requests at Lambda@Edge
    - Apply WAF rules at the edge
    - Implement geo-restrictions if needed

4. **Error Handling**
    - Never expose sensitive information in errors
    - Implement retry logic for transient failures
    - Log errors appropriately

## Development Setup

1. **Environment Configuration**

    ```shell
    NEXT_PUBLIC_API_URL=https://api-url
    NEXT_PUBLIC_API_KEY=your-api-key
    NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
    NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
    ```

2. **Required Dependencies**
    ```json
    {
        "@aws-sdk/client-cognito-identity-provider": "latest",
        "@tanstack/react-query": "latest"
    }
    ```

## Troubleshooting

Common issues and solutions:

1. **CORS Errors**

    - Verify origin is allowed in API Gateway
    - Check required headers are included
    - Confirm preflight handling

2. **Authentication Failures**

    - Validate token format
    - Check API key validity
    - Verify Cognito configuration

3. **Lambda@Edge Errors**

    - Check CloudFront logs
    - Verify Lambda@Edge function permissions
    - Check function syntax and timeout settings

4. **Rate Limiting**
    - Monitor usage patterns
    - Implement client-side throttling
    - Cache responses when appropriate
