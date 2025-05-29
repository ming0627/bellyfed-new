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
    // ✅ Good - Stable logical ID incorporating function name
    createSqsQueue(this, `${props.functionName}DLQ`, {...});

    // ❌ Bad - Generic logical ID
    createSqsQueue(this, 'DeadLetterQueue', {...});
    ```

3. **Other Resources**:
    - Always use a combination of meaningful, static values for logical IDs
    - Include the resource type in the logical ID
    - Include the environment or stage if relevant
    - Never include timestamps or random values

## Physical Names

Physical names (like queue names, function names) can include dynamic values as they're used for identification:

```typescript
// ✅ Good - Dynamic physical name
queueName: `${environment}-${functionName}-DLQ`;

// ✅ Good - Dynamic function name
functionName: `${environment}-${config.name}`;
```

## Common Mistakes to Avoid

1. **Using Date.now() or Random Values**:

    - Never use in logical IDs
    - Only use in physical names if absolutely necessary

2. **Generic Resource Names**:

    - Avoid generic names like 'Queue' or 'DLQ'
    - Always include context (e.g., function name, purpose)

3. **Inconsistent Naming Patterns**:
    - Use consistent naming patterns across similar resources
    - Follow the pattern: `[ResourceType][Purpose][Environment]`

## CDK Best Practices

1. **Resource Creators**:

    - Use the `BaseResourceCreator` class for consistent resource creation
    - Always implement `getResourceName()` to return a stable identifier
    - Use the environment and context from `StackContext`

2. **Stack Organization**:

    - Group related resources in constructs
    - Use meaningful construct IDs that reflect the resource hierarchy

3. **Testing**:
    - Write tests to verify logical ID stability
    - Include assertions for resource naming patterns
