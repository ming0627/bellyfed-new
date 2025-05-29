# Infrastructure Architect - Cost Optimization Knowledge Base

Version: v1.0.0
Last Updated: 2024-12-07 14:51:26 +08:00
Status: Active

This document contains the Infrastructure Architect agent's knowledge about cost optimization strategies for the Oishiiteru infrastructure.

## Current Cost-Saving Measures

- DynamoDB using PAY_PER_REQUEST billing mode
- Lambda functions optimized for cost:
    - 128MB memory allocation (minimum)
    - 15-second timeouts (except for batch operations)
    - Centralized error handling with retry mechanism (3 retries)
    - Compiled code only in deployment package (/dist)
- CloudWatch log retention set to 1 week

## Optimization Recommendations

### Lambda Functions

1. **Cold Start Optimization**:

    - Consider using Provisioned Concurrency only for API-facing functions in production
    - Use Lambda Power Tuning tool to find optimal memory/cost balance
    - Keep deployment package size under 10MB
    - Using minimal memory (128MB) for optimal cost-performance ratio
    - Only including /dist directory in deployment package

2. **Execution Optimization**:
    - Use X-Ray sampling in production to identify slow dependencies
    - Consider implementing response caching for frequently accessed data
    - Use Lambda Layers for common dependencies
    - Balanced timeout (15s) for reliability while preventing runaway costs
    - Retry mechanism with 3 retries for reliability

### DynamoDB

1. **Current Mode (PAY_PER_REQUEST)**:

    - Ideal for unpredictable workloads
    - Monitor usage patterns via CloudWatch
    - Consider switching to PROVISIONED mode if:
        - Daily traffic becomes predictable
        - Monthly costs exceed $100

2. **Data Lifecycle**:
    - Implement TTL for temporary data
    - Use DynamoDB Streams with filters to reduce processing
    - Consider using DAX if read operations become costly

### API Gateway

1. **Caching Strategy**:

    - Enable caching only in production
    - Start with small cache (0.5GB)
    - Monitor cache hit rates

2. **Request Optimization**:
    - Use request validation to prevent unnecessary Lambda invocations
    - Implement response compression
    - Use API key throttling for different client tiers

### CloudWatch

1. **Log Management**:

    - Current 1-week retention is cost-effective
    - Use log insights sparingly
    - Consider exporting old logs to S3 with lifecycle rules

2. **Metric Optimization**:
    - Use custom metrics judiciously
    - Set appropriate resolution (1 minute in prod, 5 minutes in other environments)
    - Clean up unused dashboards and alarms

## Cost Monitoring Responsibilities

As the Infrastructure Architect agent, I will:

1. **Daily Monitoring**:

    - Review AWS Cost Explorer reports
    - Monitor budget alert thresholds (80% and 90%)
    - Track costs by service and environment tag

2. **Monthly Analysis**:
    - Analyze cost trends
    - Review resource utilization
    - Identify optimization opportunities

## Environment-Specific Guidelines

### Development

- Disable unnecessary CloudWatch logs
- Use minimal API Gateway stages
- Keep DynamoDB capacity at minimum

### Staging/QA

- Implement automatic resource cleanup
- Use smaller instance sizes
- Shorter log retention periods

### Production

- Enable all necessary monitoring
- Implement auto-scaling based on metrics
- Regular backup and disaster recovery testing

## Last Updated

2024-12-07 14:51:26 +08:00
