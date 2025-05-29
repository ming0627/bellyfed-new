# ECS Fargate Cost Optimization

This document outlines the cost optimization measures implemented for the ECS Fargate infrastructure used to host the Bellyfed application.

## Overview

The ECS Fargate infrastructure has been optimized to reduce costs while maintaining functionality. The following changes have been made:

1. Environment-specific resource allocation
2. Reduced container resources in non-production environments
3. Optimized log retention periods
4. Disabled Container Insights in non-production environments
5. Reduced number of running tasks in non-production environments

## Environment-Specific Configurations

### Production Environment

- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB (1 GB)
- Desired Count: 2 tasks
- Container Insights: Enabled
- Log Retention: 30 days

### QA Environment

- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB (1 GB)
- Desired Count: 1 task
- Container Insights: Enabled
- Log Retention: 14 days

### Development and Test Environments

- CPU: 256 (0.25 vCPU)
- Memory: 512 MB (0.5 GB)
- Desired Count: 1 task
- Container Insights: Disabled
- Log Retention: 7 days

### Custom Environments

- CPU: 256 (0.25 vCPU)
- Memory: 512 MB (0.5 GB)
- Desired Count: 1 task
- Container Insights: Disabled
- Log Retention: 7 days

## Implementation Details

The environment-specific configurations are defined in the `lib/config.ts` file and are used by the `EcsFargateStack` to create the appropriate resources for each environment.

### Configuration Interface

```typescript
export interface EnvironmentConfigSettings {
    // ...
    ecs: {
        cpu: number;
        memoryLimitMiB: number;
        desiredCount: number;
        containerInsights: boolean;
        logRetentionDays: number;
    };
    // ...
}
```

### Usage in ECS Fargate Stack

```typescript
// Get environment-specific configuration
const envConfig = EnvironmentConfig.getInstance(props.environment);
const ecsConfig = envConfig.getEcsConfig();

// Create a task definition for the ECS service
const taskDefinition = new ecs.FargateTaskDefinition(this, `${props.environment}-task-definition`, {
    memoryLimitMiB: ecsConfig.memoryLimitMiB,
    cpu: ecsConfig.cpu,
});

// Create an ECS service
this.ecsService = new ecs.FargateService(this, `${props.environment}-service`, {
    // ...
    desiredCount: ecsConfig.desiredCount,
    // ...
});
```

## Cost Savings Estimate

The cost optimization measures are expected to reduce the ECS Fargate costs by approximately:

- Development/Test: ~60% reduction (from 512 CPU/1024 MB to 256 CPU/512 MB, 1 task instead of 2)
- QA: ~50% reduction (from 2 tasks to 1 task)
- Production: No change (maintaining performance and reliability)

## Future Optimizations

Consider implementing the following optimizations in the future:

1. Auto-scaling based on CPU and memory utilization
2. Scheduled scaling for predictable traffic patterns
3. Spot instances for non-critical environments
4. Further optimization of container images to reduce size and startup time

## Monitoring and Adjustment

Monitor the application performance after these changes to ensure that the reduced resources are sufficient. Adjust the configurations as needed based on actual usage patterns and performance metrics.
