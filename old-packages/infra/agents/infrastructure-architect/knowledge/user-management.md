# User Management Infrastructure

Version: v1.0.0
Last Updated: 2024-12-09 02:27:00 +08:00
Status: Active

## Overview

This document details the infrastructure components and patterns for user management in the Oishiiteru platform.

## Infrastructure Components

### DynamoDB Schema

```typescript
const userTable = new dynamodb.Table(this, 'UserTable', {
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
});

// GSIs for efficient queries
userTable.addGlobalSecondaryIndex({
    indexName: 'email-index',
    partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
});
```

### API Gateway Endpoints

- `GET /users/current`: Get current user profile
- `PUT /users/current`: Update current user profile
- `GET /users/search`: Search users
- `GET /users/{id}`: Get user by ID
- `GET /users/current/followers`: Get user's followers
- `GET /users/current/following`: Get user's following
- `POST /users/{id}/follow`: Follow a user
- `DELETE /users/{id}/follow`: Unfollow a user
- `GET /users/current/preferences`: Get user preferences
- `PUT /users/current/preferences`: Update user preferences

### Lambda Functions

Each endpoint is backed by a dedicated Lambda function with proper IAM roles and permissions. Functions use the `fromFunctionAttributes` pattern with `sameEnvironment: true` for proper API Gateway integration.

## Implementation Patterns

### DynamoDB Queries

```typescript
const queryUsers = async (params: QueryParams): Promise<User[]> => {
    const queryParams = {
        TableName: process.env.USER_TABLE_NAME!,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': params.email,
        },
    };

    try {
        const result = await dynamoDB.query(queryParams).promise();
        return result.Items as User[];
    } catch (error) {
        console.error('Error querying users:', error);
        throw new Error('Failed to query users');
    }
};
```

### Error Handling

```typescript
const handleError = (error: any): APIGatewayProxyResult => {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message }),
        };
    }

    if (error.name === 'ConditionalCheckFailedException') {
        return {
            statusCode: 409,
            body: JSON.stringify({ message: 'Resource conflict' }),
        };
    }

    return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
    };
};
```

## Security Considerations

### Authentication

- Cognito User Pool integration
- JWT token validation
- API Gateway authorizers

### Authorization

```typescript
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'UserAuthorizer', {
    cognitoUserPools: [userPool],
});

endpoint.addMethod('GET', integration, {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

### Data Protection

- Encryption at rest using AWS KMS
- SSL/TLS for data in transit
- Secure parameter storage in SSM

## Monitoring and Logging

### CloudWatch Metrics

- API Gateway request/response metrics
- Lambda execution metrics
- DynamoDB throughput metrics

### Logging

- Structured logging format
- Error tracking
- Request tracing with X-Ray

## Cost Optimization

### DynamoDB

- PAY_PER_REQUEST billing mode
- Efficient GSI usage
- TTL for temporary data

### Lambda

- Memory optimization
- Timeout configuration
- Concurrency limits

## Best Practices

1. **Security**

    - Follow least privilege principle
    - Regular security audits
    - Proper secret management

2. **Performance**

    - Index optimization
    - Query efficiency
    - Connection pooling

3. **Reliability**

    - Error handling
    - Retry mechanisms
    - Circuit breakers

4. **Maintainability**
    - Infrastructure as Code
    - Consistent naming
    - Documentation
