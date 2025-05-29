# Infrastructure Monitoring Best Practices

## Overview

Our infrastructure monitoring strategy focuses on providing comprehensive visibility into AWS infrastructure components while maintaining simplicity and actionability of alerts.

## Key Components

### Infrastructure Monitoring Stack

The `InfrastructureMonitoring` construct provides centralized monitoring for:

1. **EventBridge Buses**

    - Automatic monitoring for all event buses
    - Delivery delay monitoring
    - Failed invocations tracking
    - Per-bus alarm configuration
    - Unique alarm names for each bus

2. **SQS Queues**

    - Queue depth monitoring
    - DLQ message tracking
    - Processing delays
    - Age of oldest message

3. **API Gateway**

    - Latency metrics
    - Error rates (4xx, 5xx)
    - Integration timeouts
    - Request counts

4. **Lambda Functions**

    - Error rates
    - Duration metrics
    - Throttling
    - Memory utilization

5. **Import Process**
    - Success/failure rates
    - Progress tracking
    - Duration metrics
    - Data validation errors

## Cross-Stack References

### Parameter Store Strategy

- Event bus information stored in SSM Parameter Store
- Structured parameter naming: `/oishiiteru/${environment}/eventbus/${busId}/{name|arn}`
- Eliminates CloudFormation export dependencies
- Enables flexible cross-stack access

### Stable Resource Identifiers

- Use `cdk.Names.uniqueId()` for stable resource naming
- Implement `@aws-cdk/core:stackRelativeExports` for consistent exports
- Reference external resources using `cdk.Fn.importValue()`
- Generate stable metric namespaces using stack ID
- Use CloudFormation intrinsic functions for region references

## Alerting Strategy

### SNS-Based Notifications

- **Email Alerts**: Critical infrastructure issues sent to alerts@oishiiteru.com
- **Slack Integration**: Real-time operational updates via webhook
- **Customizable Thresholds**: Environment-specific configurations

### Best Practices

1. **Alert Fatigue Prevention**

    - Use appropriate thresholds
    - Implement alert grouping
    - Avoid duplicate notifications
    - Prevent unnecessary deployments with stable identifiers

2. **Actionable Alerts**

    - Clear error descriptions with bus/resource identification
    - Troubleshooting guidance
    - Relevant metrics context

3. **Environment-Specific Monitoring**
    - Production: Stricter thresholds
    - Development: Relaxed monitoring
    - Testing: Minimal alerting

## Dashboard Organization

- Infrastructure health overview
- Service-specific metrics
- Import process tracking
- Alert history and trends
- Stable dashboard naming using unique stack identifiers

## Deployment Best Practices

1. **Token Resolution**

    - Use stable identifiers to prevent unnecessary deployments
    - Avoid direct string interpolation with environment variables
    - Leverage CDK's built-in token handling functions

2. **Cross-Stack References**

    - Use `cdk.Fn.importValue()` for external resource references
    - Implement stack-relative exports for better stability
    - Use SSM parameters for dynamic values

3. **Resource Naming**
    - Generate stable, unique names using CDK utilities
    - Include stack ID in resource names for uniqueness
    - Use consistent naming patterns across environments

## Future Enhancements

1. Machine learning-based anomaly detection
2. Automated remediation actions
3. Enhanced visualization capabilities
4. Cost optimization insights
5. Advanced token resolution strategies

## Last Updated

2024-12-08 23:40:29 +08:00
