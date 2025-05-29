# AI Agent Guide for Bellyfed Infrastructure

## Important Rules and Patterns

### 1. SQS Queue Creation Rules

#### Main Application Queues (SQS Stack ONLY)

- Location: `lib/sqs-stack.ts`
- Naming Pattern: `bellyfed-{queue-purpose}-queue-{environment}`
- DO NOT create DLQs here
- Current Queues:
    ```typescript
    - bellyfed-import-queue-${environment}
    - bellyfed-write-queue-${environment}
    - bellyfed-analytics-queue-${environment}
    - bellyfed-auth-event-queue-${environment}
    - bellyfed-query-queue-${environment}
    - bellyfed-user-signup-queue-${environment}
    ```

#### Lambda Function Queues (LambdaWithRetry ONLY)

- Location: `lib/constructs/lambda/lambda-with-retry.ts`
- Naming Patterns:
    - DLQ: `${functionName}-dlq`
    - Retry Queue: `${functionName}-retry`
- Features:
    - Automatic CloudWatch alarms
    - IAM permissions setup
    - DLQ retention: 14 days
    - Retry queue retention: 7 days
    - Max retries: 3 (configurable)

#### Standalone Queues (SqsCreator ONLY)

- Location: `lib/utils/resource-creators/sqs-creator.ts`
- Use Case: Non-Lambda related queues
- Features:
    - Optional DLQ configuration
    - Standard encryption
    - Consistent naming
    - Graceful handling of existing queues

### 2. Resource Naming Conventions

#### Queue Names

```typescript
// Main Application Queues
bellyfed-{purpose}-queue-{environment}  // e.g., bellyfed-import-queue-staging

// Lambda Function Queues
{function-name}-dlq                     // e.g., menu-query-dlq
{function-name}-retry                   // e.g., menu-query-retry

// Standalone Queues
bellyfed-{custom-purpose}-{environment} // e.g., bellyfed-notification-staging
```

#### Event Bus Names

```typescript
bellyfed - analyticseventbus - { environment };
bellyfed - domain - user - { environment };
bellyfed - domain - auth - { environment };
bellyfed - infra - system - { environment };
bellyfed - analytics - { environment };
```

#### SSM Parameter Names

```typescript
/bellyfed/{environment}/sqs/{queue-name}-arn
/bellyfed/{environment}/eventbridge/{bus-name}-arn
/bellyfed/{environment}/lambda/{function-name}      // Lambda function ARNs
```

### 3. Lambda Function Naming and SSM Parameters

#### Lambda Function Names

- Pattern: `{environment}-{function-purpose}`
- Examples:
    ```typescript
    staging - menu - query;
    staging - write - processor;
    staging - establishment - writer;
    ```

#### Lambda ARN Storage

- Location: `lib/lambda-stack.ts`
- SSM Parameter Pattern: `/bellyfed/{environment}/lambda/{function-name}`
- Created automatically during stack deployment
- Used by API Gateway for Lambda integration
- Example:

    ```typescript
    // SSM Parameter
    /bellyfed/staging/lambda/staging-menu-query

    // Value (Lambda ARN)
    arn:aws:lambda:region:account:function:staging-menu-query
    ```

#### API Gateway Integration

- Location: `lib/api-gateway-stack.ts`
- Retrieves Lambda ARNs from SSM parameters
- Example:
    ```typescript
    const menuQueryLambdaArn = ssm.StringParameter.valueForStringParameter(
        this,
        `/bellyfed/${environment}/lambda/${environment}-menu-query`
    );
    ```

### 4. Code Organization Rules

#### Lambda Functions

- Location: `functions/` directory
- Structure Options:

    ```
    Option 1 (Simple):
    functions/
      ├── function-name/
          ├── index.ts
          ├── package.json
          └── tsconfig.json

    Option 2 (Complex):
    functions/
      ├── function-name/
          ├── src/
          │   └── index.ts
          ├── package.json
          └── tsconfig.json
    ```

### 5. Deployment Rules

#### Stack Deployment Order

1. SQS Stack
2. EventBridge Stack
3. Monitoring Stack

#### Environment Variables

- Always include:
    ```bash
    ENVIRONMENT={environment}
    --context environment={environment}
    ```

### 6. Error Handling Guidelines

1. Lambda Functions:

    - Always use LambdaWithRetry for error handling
    - Configure DLQ and retry mechanisms
    - Set up CloudWatch alarms

2. SQS Queues:
    - Main queues: No direct DLQ configuration
    - Lambda queues: Use LambdaWithRetry's DLQ
    - Standalone queues: Configure DLQ through SqsCreator

### 7. Security Rules

1. IAM Permissions:

    - Use least privilege principle
    - Grant specific queue permissions only
    - Use resource-based policies when possible

2. Queue Configuration:
    - Always enable encryption
    - Set appropriate retention periods
    - Configure visibility timeouts based on processing time

### 8. Monitoring Setup

1. CloudWatch Alarms:

    - Required for all DLQs
    - Monitor message visibility
    - Track error rates

2. Metrics to Monitor:
    - ApproximateNumberOfMessagesVisible
    - NumberOfMessagesSent
    - NumberOfMessagesReceived
    - NumberOfMessagesDeleted

## Action Checklist

Before making any changes:

- [ ] Identify the correct pattern for queue creation
- [ ] Verify naming conventions match standards
- [ ] Check for existing resources to avoid conflicts
- [ ] Ensure proper error handling is configured
- [ ] Verify monitoring is set up correctly
- [ ] Validate IAM permissions are correct
- [ ] Update documentation if making structural changes

## Common Pitfalls to Avoid

1. DO NOT:

    - Create DLQs in the SQS stack
    - Mix queue creation patterns
    - Skip error handling configuration
    - Use non-standard naming conventions
    - Forget to update SSM parameters
    - Skip CloudWatch alarm setup

2. ALWAYS:
    - Use the appropriate construct for queue creation
    - Follow the established naming patterns
    - Configure proper monitoring
    - Update documentation
    - Test deployments in order
    - Verify IAM permissions

## Reference Documentation

- AWS CDK Documentation: [https://docs.aws.amazon.com/cdk/]
- SQS Best Practices: [https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-best-practices.html]
- Lambda Best Practices: [https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html]
