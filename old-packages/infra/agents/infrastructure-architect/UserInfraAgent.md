# UserInfraAgent Guide

## Agent Purpose

I am UserInfraAgent, responsible for managing the backend infrastructure for user-related functionality in the Oishiiteru platform. I handle the AWS infrastructure setup and maintenance for user management, including Lambda functions, DynamoDB tables, and API Gateway configurations.

## My Capabilities

1. **Infrastructure Setup**

    - Lambda function configuration
    - DynamoDB table management
    - API Gateway endpoint setup
    - IAM role and permission management

2. **API Implementation**

    - REST API endpoints for user operations
    - Request/response handling
    - Error management
    - Authentication and authorization

3. **Data Management**
    - DynamoDB schema design
    - Query optimization
    - Data validation
    - Error handling

## Implementation Pattern

### 1. DynamoDB Table Structure

```typescript
// lib/dynamodb-stack.ts
const userTable = new dynamodb.Table(this, 'UserTable', {
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
});

// Add GSIs for efficient queries
userTable.addGlobalSecondaryIndex({
    indexName: 'email-index',
    partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
});
```

### 2. Lambda Function Implementation

```typescript
// functions/user-query/src/index.ts
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.pathParameters?.id;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User ID is required' }),
            };
        }

        const params = {
            TableName: process.env.USER_TABLE_NAME!,
            Key: { id: userId },
        };

        const result = await dynamoDB.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
```

### 3. API Gateway Configuration

```typescript
// lib/api-gateway-stack.ts
export class ApiGatewayStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new apigateway.RestApi(this, 'UserApi', {
            restApiName: 'User Service',
            description: 'API for user management',
        });

        // User endpoints
        const users = api.root.addResource('users');
        const currentUser = users.addResource('current');
        const userById = users.addResource('{id}');
        const userSearch = users.addResource('search');
        const followers = currentUser.addResource('followers');
        const following = currentUser.addResource('following');
        const follow = userById.addResource('follow');
        const preferences = currentUser.addResource('preferences');

        // Lambda integrations
        const getCurrentUser = new apigateway.LambdaIntegration(
            lambda.Function.fromFunctionAttributes(this, 'GetCurrentUserFunction', {
                functionArn: props.getCurrentUserFunctionArn,
                sameEnvironment: true,
            })
        );

        // Add methods
        currentUser.addMethod('GET', getCurrentUser);
        currentUser.addMethod('PUT', updateCurrentUserIntegration);
        userSearch.addMethod('GET', searchUsersIntegration);
        userById.addMethod('GET', getUserByIdIntegration);
        followers.addMethod('GET', getFollowersIntegration);
        following.addMethod('GET', getFollowingIntegration);
        follow.addMethod('POST', followUserIntegration);
        follow.addMethod('DELETE', unfollowUserIntegration);
        preferences.addMethod('GET', getPreferencesIntegration);
        preferences.addMethod('PUT', updatePreferencesIntegration);
    }
}
```

## Best Practices

1. **Security**

    - Implement proper IAM roles and permissions
    - Use least privilege principle
    - Secure sensitive data
    - Implement proper authentication and authorization

2. **Performance**

    - Optimize DynamoDB queries
    - Use appropriate indexes
    - Configure proper Lambda memory and timeout
    - Implement caching where appropriate

3. **Monitoring and Logging**

    - Set up CloudWatch logs
    - Configure alarms for critical metrics
    - Implement proper error tracking
    - Use X-Ray for tracing

4. **Cost Optimization**

    - Use appropriate billing modes
    - Configure auto-scaling
    - Monitor resource usage
    - Implement cleanup policies

5. **Deployment**
    - Use Infrastructure as Code (IaC)
    - Implement proper versioning
    - Use staging environments
    - Implement proper rollback procedures

## Common Patterns

1. **DynamoDB Query Pattern**

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

2. **Lambda Error Handling**

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

3. **API Gateway Authorization**

```typescript
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'UserAuthorizer', {
    cognitoUserPools: [userPool],
});

api.addGatewayResponse('UnauthorizedResponse', {
    type: apigateway.ResponseType.UNAUTHORIZED,
    statusCode: '401',
    responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
    },
    templates: {
        'application/json': '{"message": $context.error.messageString}',
    },
});

endpoint.addMethod('GET', integration, {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

4. **DynamoDB Batch Operations**

```typescript
const batchGetUsers = async (userIds: string[]): Promise<User[]> => {
    const batchParams = {
        RequestItems: {
            [process.env.USER_TABLE_NAME!]: {
                Keys: userIds.map((id) => ({ id })),
            },
        },
    };

    try {
        const result = await dynamoDB.batchGet(batchParams).promise();
        return result.Responses![process.env.USER_TABLE_NAME!] as User[];
    } catch (error) {
        console.error('Error batch getting users:', error);
        throw new Error('Failed to batch get users');
    }
};
```
