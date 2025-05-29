# S3 Rankings Bucket Parameter Fix

This document explains the fix for the issue with the S3 rankings bucket ARN parameter.

## Problem

During deployment, the following error was occurring:

```
❌  BellyfedEcsInfraStack-dev failed: ValidationError: Unable to fetch parameters [/bellyfed/dev/s3/rankings-bucket-arn] from parameter store for this account.
```

This error occurs because the ECS infrastructure stack is trying to fetch the S3 rankings bucket ARN parameter from SSM Parameter Store, but the parameter doesn't exist yet. This happens when the rankings bucket stack hasn't been deployed yet, or when the parameter was deleted.

## Solution

The solution has two parts:

1. **Remove fallback mechanisms**: We've removed all fallback mechanisms from the `addRankingsS3Permissions` function in `lib/iam/rankings-iam-policies.ts`. Instead, we now require that the parameter exists before it's needed.

2. **Ensure correct deployment order**: We've added an explicit dependency in `bin/cdk.ts` to ensure that the `RankingsBucketStack` is deployed before the `EcsInfrastructureStack`. This ensures that the parameter is created before it's needed.

This approach is more robust and follows best practices for infrastructure as code, where dependencies should be explicit rather than relying on fallback mechanisms.

## Implementation

### 1. Simplified `addRankingsS3Permissions` Function

We've simplified the `addRankingsS3Permissions` function to remove all fallback mechanisms:

```typescript
export function addRankingsS3Permissions(taskRole: iam.IRole, environment: string): void {
    // Get the S3 bucket ARN from SSM Parameter Store
    // This parameter must be created by the RankingsBucketStack before this function is called
    const bucketArnParam = ssm.StringParameter.valueForStringParameter(
        taskRole.node.scope as any,
        `/bellyfed/${environment}/s3/rankings-bucket-arn`
    );
    console.log(`Retrieved S3 bucket ARN from SSM: ${bucketArnParam}`);

    // Create the policy statement
    const policyStatement = new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
        resources: [bucketArnParam, `${bucketArnParam}/*`],
    });

    // Add permissions to access the S3 bucket
    if (taskRole instanceof iam.Role) {
        taskRole.addToPolicy(policyStatement);
    } else {
        // For imported roles (IRole), we can't modify the policy directly
        console.warn(
            'Cannot add Rankings S3 permissions to imported role. Make sure the role has the necessary permissions.'
        );
    }
}
```

### 2. Added Stack Dependency

We've added an explicit dependency in `bin/cdk.ts` to ensure the `RankingsBucketStack` is deployed before the `EcsInfrastructureStack`:

```typescript
// Create ECS Infrastructure Stack
ecsInfraStack = createStack(
    new EcsInfrastructureStack(app, `BellyfedEcsInfraStack-${environmentContext}`, ecsInfraProps)
);
ecsInfraStack.addDependency(networkStack);
ecsInfraStack.addDependency(certificateParametersStack);
ecsInfraStack.addDependency(certificateStack);
ecsInfraStack.addDependency(rankingsBucketStack); // Ensure rankings bucket is created before ECS infrastructure
```

## Benefits

This fix provides several benefits:

1. **Explicit Dependencies**: The stack dependencies are now explicit, making the deployment order clear
2. **No Fallbacks**: We've removed all fallback mechanisms, ensuring that the infrastructure is deployed as defined
3. **Simplified Code**: The `addRankingsS3Permissions` function is now simpler and easier to understand
4. **Best Practices**: This approach follows infrastructure-as-code best practices by making dependencies explicit

## Deployment

This fix should be deployed as part of the regular deployment process. The CDK will automatically handle the deployment order based on the dependencies.

## Testing

To test this fix:

1. Deploy the stacks using the CDK
2. Verify that the `RankingsBucketStack` is deployed before the `EcsInfrastructureStack`
3. Verify that the parameter is created in SSM Parameter Store
4. Verify that the ECS infrastructure stack can access the parameter

## Related Issues

This fix addresses the following error:

```
❌  BellyfedEcsInfraStack-dev failed: ValidationError: Unable to fetch parameters [/bellyfed/dev/s3/rankings-bucket-arn] from parameter store for this account.
```

## References

- [AWS CDK SSM Parameter Store](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ssm-readme.html)
- [AWS CDK IAM Policies](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-iam-readme.html)
