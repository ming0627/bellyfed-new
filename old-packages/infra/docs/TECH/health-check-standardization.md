# Health Check Standardization

## Overview

This document outlines the standardized approach to health checks in the Bellyfed platform. All health checks have been standardized to use a single endpoint: `/health`.

## Health Check Endpoints

### `/health` Endpoint

The primary health check endpoint is now `/health`. This endpoint:

- Returns a simple JSON response with status and timestamp
- Does not require authentication
- Is used by ECS container health checks and ALB target group health checks
- Is implemented as a Next.js API route

```typescript
// Response format
{
  "status": "healthy",
  "timestamp": "2024-05-01T12:34:56.789Z"
}
```

### Legacy `/api/health` Endpoint

The legacy `/api/health` endpoint has been removed. All health checks now use the standardized `/health` endpoint.

## Health Check Configuration

### ECS Container Health Check

Container health checks in task definitions are configured to check the `/health` endpoint:

```json
"healthCheck": {
  "command": [
    "CMD-SHELL",
    "curl -f http://localhost:3000/health || exit 1"
  ],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 120
}
```

### ALB Target Group Health Check

Target group health checks are configured to check the `/health` endpoint:

```typescript
healthCheck: {
  path: '/health',
  interval: cdk.Duration.seconds(30),
  timeout: cdk.Duration.seconds(10),
  healthyThresholdCount: 2,
  unhealthyThresholdCount: 5,
  healthyHttpCodes: '200-499'
}
```

### Docker Health Check

The Dockerfile includes a health check that checks the `/health` endpoint:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

## Benefits of Standardization

1. **Simplicity**: One endpoint to check and maintain
2. **Consistency**: All health checks use the same path
3. **Reliability**: Reduced chance of misconfiguration
4. **Performance**: Simpler health check with less overhead

## Implementation

The standardization was implemented by:

1. Adding a `/health` endpoint in the Next.js application
2. Updating all infrastructure code to use the `/health` endpoint
3. Removing the legacy `/api/health` endpoint
4. Updating the Dockerfile health check to use the `/health` endpoint

## Troubleshooting

If health checks are failing:

1. Verify that the `/health` endpoint is accessible
2. Check that the container is running and listening on port 3000
3. Verify that the health check configuration is correct
4. Check the ECS task logs for any errors
5. Verify that the target group health check is configured correctly
