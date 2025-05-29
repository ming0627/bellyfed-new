# AWS Resource Naming Best Practices

## Logical IDs

Logical IDs are used by CloudFormation to track resources across deployments. They must be:

1. **Stable**: Never use dynamic values like timestamps or random numbers in logical IDs
2. **Unique**: Must be unique within a stack
3. **Descriptive**: Should describe the resource's purpose

### Best Practices

1. **Lambda Functions**:

    ```typescript
    // ✅ Good - Stable logical ID
    new LambdaWithRetry(this, `${config.name}Lambda`, {...});

    // ❌ Bad - Dynamic logical ID
    new LambdaWithRetry(this, `${config.name}Lambda${Date.now()}`, {...});
    ```

2. **SQS Queues**:

    ```typescript
    // ✅ Good - Descriptive and stable
    new Queue(this, `${config.name}DLQ`, {...});

    // ❌ Bad - Not descriptive enough
    new Queue(this, 'MyQueue', {...});
    ```

## Physical IDs and Resource Names

Physical IDs are the actual names of AWS resources. They should follow these conventions:

### General Format

`{environment}-{service}-{resource-type}-{purpose}`

Examples:

- `prod-bellyfed-lambda-restaurant-query`
- `staging-bellyfed-dynamodb-reviews`
- `dev-bellyfed-s3-user-uploads`

### Environment Prefixes

- Production: `prod-`
- Staging: `staging-`
- Development: `dev-`
- Test: `test-`

### Service Name

Always use `bellyfed` as the service name for consistency

### Resource Type Abbreviations

- Lambda Functions: `lambda`
- DynamoDB Tables: `dynamodb`
- S3 Buckets: `s3`
- SQS Queues: `sqs`
- SNS Topics: `sns`
- API Gateway: `api`

### Purpose

Should be brief but descriptive:

- `restaurant-query`
- `user-auth`
- `review-processor`

## Examples by Resource Type

### Lambda Functions

```typescript
{
    environment;
}
-bellyfed - lambda - { purpose };
// Example: prod-bellyfed-lambda-restaurant-query
```

### DynamoDB Tables

```typescript
{
    environment;
}
-bellyfed - dynamodb - { purpose };
// Example: prod-bellyfed-dynamodb-reviews
```

### S3 Buckets

```typescript
{
    environment;
}
-bellyfed - s3 - { purpose };
// Example: prod-bellyfed-s3-user-uploads
```

### SQS Queues

```typescript
{
    environment;
}
-bellyfed - sqs - { purpose };
// Example: prod-bellyfed-sqs-review-processing
```

### API Gateway

```typescript
{
    environment;
}
-bellyfed - api - { purpose };
// Example: prod-bellyfed-api-restaurant
```

## Implementation Tips

1. Use constants for environment names
2. Create utility functions for name generation
3. Validate names in your CI/CD pipeline
4. Document any exceptions to these naming conventions
