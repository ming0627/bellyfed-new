# AWS Resource Naming Conventions

## Overview

This document defines the naming conventions for AWS resources in the Bellyfed infrastructure.

## General Pattern

All resources follow this general naming pattern:

bellyfed-{environment}-{region}-{resource-type}-{purpose}

## General Format

```
bellyfed-{environment}-{region}-{resource-type}-{purpose}
```

- `environment`: dev, staging, prod
- `region`: aws region code (e.g., us-east-1)
- `resource-type`: lambda, dynamodb, s3, etc.
- `purpose`: specific use of the resource

## Resource-Specific Standards

### Lambda Functions

```
bellyfed-{env}-{region}-lambda-{service}-{function}
Example: bellyfed-prod-us-east-1-lambda-auth-verify
```

### DynamoDB Tables

```
bellyfed-{env}-{region}-dynamodb-{entity}
Example: bellyfed-prod-us-east-1-dynamodb-users
```

### S3 Buckets

```
bellyfed-{env}-{region}-s3-{purpose}
Example: bellyfed-prod-us-east-1-s3-user-uploads
```

### API Gateway

```
bellyfed-{env}-{region}-api-{purpose}
Example: bellyfed-prod-us-east-1-api-public
```

### CloudWatch Log Groups

```
/bellyfed/{env}/{service}/{resource}
Example: /bellyfed/prod/auth/lambda-verify
```

## Tagging Standards

All resources must include these tags:

- Environment
- Service
- Owner
- CostCenter
- Project

Example:

```json
{
    "Environment": "prod",
    "Service": "auth",
    "Owner": "platform-team",
    "CostCenter": "platform",
    "Project": "bellyfed"
}
```

## Environment Standards

### Development (dev)

- For development and testing
- Reduced capacity and scaling
- More permissive security

### Staging (staging)

- Mirror of production
- Used for final testing
- Production-like security

### Production (prod)

- Live environment
- Full capacity and scaling
- Strict security controls

## Region Standards

### Primary Region (ap-southeast-1)

- Main application deployment
- Primary database instances
- User-facing services
