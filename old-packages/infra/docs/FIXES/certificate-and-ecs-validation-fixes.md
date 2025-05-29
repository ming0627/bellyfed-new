# Certificate and ECS Validation Fixes

This document describes the fixes implemented to address two critical issues in the Bellyfed infrastructure:

1. Certificate stack rollback due to missing export
2. ECS task definition CPU/memory validation errors

## Certificate Stack Issue

### Problem

The certificate stack was failing with the error:

```
BellyfedCertificateStack-dev | 0/2 | 2:33:00 PM | ROLLBACK_IN_PROGRESS | AWS::CloudFormation::Stack | BellyfedCertificateStack-dev No export named dev-wildcard-certificate-arn found. Rollback requested by user.
```

This occurred because the certificate stack was trying to import a certificate ARN from CloudFormation exports that didn't exist yet. The stack was designed to first check if a certificate already exists (by looking for an export), and if not, create a new one. However, this approach fails on the first deployment because the export doesn't exist yet.

### Solution

Modified `lib/certificate-stack.ts` to always create a new certificate without trying to import first. This avoids the circular dependency where the stack tries to import an export that it's supposed to create.

```typescript
// Create a new certificate without trying to import first
// This avoids the "No export named dev-wildcard-certificate-arn found" error
console.log('Creating a new wildcard certificate.');
const wildcardCertificate = new acm.Certificate(this, `${props.environment}-wildcard-certificate`, {
    domainName: props.domainName,
    subjectAlternativeNames: [`*.${props.domainName}`],
    validation: acm.CertificateValidation.fromDns(hostedZone),
});
```

## ECS Task Definition CPU/Memory Validation Issue

### Problem

The ECS task definition was failing with the error:

```
4157 (ecs): cpu/memory validation for TaskDefinition failed with valid combinations
```

This occurred because the CPU and memory values specified in the task definition were not valid combinations according to AWS Fargate requirements. The error specifically mentioned that the validation failed for 1 vCPU and 2 GB memory, even though they should be valid combinations.

### Solution

Updated both `lib/ecs/ecs-service-stack.ts` and `lib/typesense/typesense-service-stack.ts` to:

1. Ensure CPU values are always specified as numeric strings (e.g., '256', '512', '1024', '2048')
2. Implement a more robust validation function for memory values that enforces valid combinations:

```typescript
memoryMiB: (() => {
    if (props.cpu === 256 && props.memoryLimitMiB < 512) return '512';
    if (props.cpu === 256 && props.memoryLimitMiB < 1024) return '1024';
    if (props.cpu === 256 && props.memoryLimitMiB > 2048) return '2048';
    if (props.cpu === 512 && props.memoryLimitMiB < 1024) return '1024';
    if (props.cpu === 512 && props.memoryLimitMiB > 4096) return '4096';
    if (props.cpu === 1024 && props.memoryLimitMiB < 2048) return '2048';
    if (props.cpu === 1024 && props.memoryLimitMiB > 8192) return '8192';
    if (props.cpu === 2048 && props.memoryLimitMiB < 4096) return '4096';
    if (props.cpu === 2048 && props.memoryLimitMiB > 16384) return '16384';
    return props.memoryLimitMiB.toString();
})(),
```

This ensures that:

- For 0.25 vCPU (256), memory is between 512MB and 2GB
- For 0.5 vCPU (512), memory is between 1GB and 4GB
- For 1 vCPU (1024), memory is between 2GB and 8GB
- For 2 vCPU (2048), memory is between 4GB and 16GB

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

1. Check out the `fix/certificate-and-ecs-validation` branch
2. Deploy the certificate stack first:
    ```bash
    npx cdk deploy BellyfedCertificateStack-dev --context environment=dev
    ```
3. Deploy the rest of the stacks:
    ```bash
    npx cdk deploy --all --context environment=dev
    ```

## Future Improvements

1. Consider using SSM parameters instead of CloudFormation exports for sharing certificate ARNs between stacks
2. Add more robust validation for CPU and memory values in the configuration files
3. Create a helper function to validate CPU/memory combinations at compile time
