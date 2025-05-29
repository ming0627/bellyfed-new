# Typesense Deployment Fixes

This document outlines the fixes implemented to resolve deployment issues with the Typesense infrastructure stack and prevent similar issues in the future.

## Issue Description

The deployment of the `BellyfedTypesenseInfraStack-dev` was failing with the following error:

```
BellyfedTypesenseInfraStack-dev failed creation: it is new need to be manually deleted from the AWS console: ROLLBACK_COMPLETE: /bellyfed/dev/vpc/vpc-id already exists in stack arn:aws:cloudformation:ap-southeast-1:590184067494:stack/BellyfedEcsInfraStack-dev/09ba32d0-2667-11f0-b683-02cc2c411b6b
```

This error occurred because both the `BellyfedEcsInfraStack-dev` and `BellyfedTypesenseInfraStack-dev` stacks were trying to create the same SSM parameter (`/bellyfed/dev/vpc/vpc-id`), causing a conflict.

## Implemented Fixes

### 1. Modified the Typesense Infrastructure Stack

Updated the `TypesenseInfrastructureStack` to use a different parameter name for the VPC:

```typescript
// Don't export VPC as it's already exported by the ECS Infrastructure Stack
// Instead, export with a different name to avoid conflicts
resourceExporter.exportVpc(this.vpc, 'typesense-vpc-id');
```

This ensures that the Typesense stack creates a different SSM parameter (`/bellyfed/dev/vpc/typesense-vpc-id`) instead of conflicting with the existing one.

### 2. Enhanced the SSM Resource Exporter

Improved the `SsmResourceExporter` class to handle parameter conflicts more gracefully:

- Added checks to detect if a parameter already exists in the same stack
- Added error handling to create parameters with unique logical IDs if conflicts occur
- Added detailed logging to help diagnose issues

### 3. Updated Stack Dependencies

Enhanced the stack dependencies in `bin/cdk.ts` to ensure proper ordering:

```typescript
// Add explicit dependencies to ensure proper ordering
// The NetworkStack creates the VPC
typesenseInfraStack.addDependency(networkStack);

// The EcsInfrastructureStack exports the VPC to SSM
// This dependency is critical to prevent parameter conflicts
typesenseInfraStack.addDependency(ecsInfraStack);
```

### 4. Fixed Frontend CICD Pipeline

Updated the `FrontendCicdStack` to ensure the pipeline is triggered automatically:

```typescript
// Ensure PollForSourceChanges is set to true for the source action
// This is needed to ensure the pipeline is triggered automatically
const cfnSourceAction = sourceAction.actionProperties.configuration as any;
if (cfnSourceAction) {
    cfnSourceAction.PollForSourceChanges = true;
}
```

## Best Practices to Prevent Similar Issues

1. **Use Unique Parameter Names**: When exporting resources to SSM Parameter Store, use unique names to avoid conflicts between stacks.

2. **Establish Clear Stack Dependencies**: Ensure that stacks are deployed in the correct order by setting explicit dependencies.

3. **Import Existing Parameters**: When a resource is already exported by another stack, import it instead of creating a new parameter.

4. **Add Error Handling**: Implement robust error handling in resource exporters to gracefully handle conflicts.

5. **Use Descriptive Naming**: Use clear, descriptive names for resources and parameters to avoid confusion.

6. **Document Stack Dependencies**: Maintain documentation of stack dependencies to help understand the deployment order.

## Testing the Fixes

After implementing these fixes, the deployment should succeed without conflicts. To verify:

1. Deploy the stacks in the correct order:

    ```bash
    npx cdk deploy BellyfedNetworkStack-dev
    npx cdk deploy BellyfedEcsInfraStack-dev
    npx cdk deploy BellyfedTypesenseInfraStack-dev
    ```

2. Check the SSM Parameter Store to verify that both parameters exist:

    - `/bellyfed/dev/vpc/vpc-id` (created by EcsInfrastructureStack)
    - `/bellyfed/dev/vpc/typesense-vpc-id` (created by TypesenseInfrastructureStack)

3. Verify that the frontend CICD pipeline is triggered automatically when changes are pushed to the repository.

## Conclusion

These fixes address the immediate deployment issue and implement safeguards to prevent similar issues in the future. The changes follow best practices for AWS CDK development and ensure a more robust deployment process.
