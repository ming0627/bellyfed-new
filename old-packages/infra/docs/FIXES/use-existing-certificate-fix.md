# Decoupled Certificate Management Fix

This document describes the fix implemented to address the certificate stack rollback issue by decoupling the CloudFormation exports from the certificate creation.

## Certificate Stack Issue

### Problem

The certificate stack was failing with the error:

```
BellyfedCertificateStack-dev | 0/2 | 2:33:00 PM | ROLLBACK_IN_PROGRESS | AWS::CloudFormation::Stack | BellyfedCertificateStack-dev No export named dev-wildcard-certificate-arn found. Rollback requested by user.
```

This occurred because the certificate stack was trying to import a certificate ARN from CloudFormation exports that didn't exist yet. The stack was designed to first check if a certificate already exists (by looking for an export), and if not, create a new one. However, this approach fails on the first deployment because the export doesn't exist yet.

### Solution

The solution decouples the CloudFormation exports from the certificate creation by:

1. Modifying `lib/certificate-parameters-stack.ts` to:

    - Always use the hardcoded certificate ARN
    - Create all the CloudFormation exports needed by other stacks
    - Deploy this stack first, before any other stacks

2. Modifying `lib/certificate-stack.ts` to:
    - Use the hardcoded certificate ARN directly
    - Remove the CloudFormation exports (now handled by the parameters stack)

#### Certificate Parameters Stack Changes

```typescript
// Always use the hardcoded certificate ARN for the existing certificate
// This decouples the CloudFormation exports from the certificate creation
const certificateArn =
    'arn:aws:acm:ap-southeast-1:590184067494:certificate/bff2c8db-03a5-45a6-890e-b6dd7cecad7a';

// Export the wildcard certificate ARN
new cdk.CfnOutput(this, 'WildcardCertificateArnOutput', {
    value: certificateArn,
    description: 'Wildcard Certificate ARN',
    exportName: `${props.environment}-wildcard-certificate-arn`,
});

// Export the API certificate ARN (using the same certificate)
new cdk.CfnOutput(this, 'ApiCertificateArnOutput', {
    value: certificateArn,
    description: 'API Certificate ARN',
    exportName: `${props.environment}-api-certificate-arn`,
});
```

#### Certificate Stack Changes

```typescript
// Always use the hardcoded ARN to avoid any dependency issues
// This ensures the certificate stack doesn't depend on the parameters stack
console.log('Using hardcoded certificate ARN to avoid dependency issues.');
wildcardCertificate = acm.Certificate.fromCertificateArn(
    this,
    'ImportedWildcardCertificate',
    'arn:aws:acm:ap-southeast-1:590184067494:certificate/bff2c8db-03a5-45a6-890e-b6dd7cecad7a'
);

// Output certificate ARNs without exports
// The exports are now handled by the parameters stack
new cdk.CfnOutput(this, 'WildcardCertificateArnOutput', {
    value: wildcardCertificate.certificateArn,
    description: 'Wildcard Certificate ARN',
});
```

This approach:

1. Completely eliminates the circular dependency
2. Uses the existing certificate instead of creating a new one
3. Ensures all required CloudFormation exports are available before other stacks are deployed

## ECS Task Definition CPU/Memory Validation Issue

The ECS task definition CPU/memory validation fix from the previous branch has been retained in this branch as well. This ensures that:

1. CPU values are always specified as numeric strings (e.g., '256', '512', '1024', '2048')
2. Memory values are validated to ensure they are valid combinations with the specified CPU values

## Valid CPU and Memory Combinations for AWS Fargate

| CPU Value       | Memory Value Range                   |
| --------------- | ------------------------------------ |
| 256 (0.25 vCPU) | 512MB, 1GB, 2GB                      |
| 512 (0.5 vCPU)  | 1GB, 2GB, 3GB, 4GB                   |
| 1024 (1 vCPU)   | 2GB, 3GB, 4GB, 5GB, 6GB, 7GB, 8GB    |
| 2048 (2 vCPU)   | 4GB through 16GB in 1GB increments   |
| 4096 (4 vCPU)   | 8GB through 30GB in 1GB increments   |
| 8192 (8 vCPU)   | 16GB through 60GB in 4GB increments  |
| 16384 (16 vCPU) | 32GB through 120GB in 8GB increments |

## Deployment Instructions

1. Check out the `fix/use-existing-certificate` branch
2. Deploy the certificate parameters stack first:
    ```bash
    npx cdk deploy BellyfedCertificateParametersStack-dev --context environment=dev
    ```
3. Deploy the certificate stack next:
    ```bash
    npx cdk deploy BellyfedCertificateStack-dev --context environment=dev
    ```
4. Deploy the rest of the stacks:
    ```bash
    npx cdk deploy --all --context environment=dev
    ```

Alternatively, you can use the provided script to deploy the certificate stacks in the correct order:

```bash
./scripts/deploy-certificate-stacks.sh dev
```

## Future Improvements

1. Consider using SSM parameters instead of CloudFormation exports for sharing certificate ARNs between stacks
2. Add more robust validation for CPU and memory values in the configuration files
3. Create a helper function to validate CPU/memory combinations at compile time
4. Implement a more flexible approach to certificate management that can handle both existing and new certificates
