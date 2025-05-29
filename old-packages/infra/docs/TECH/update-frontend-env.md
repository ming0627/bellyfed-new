# Updating Frontend Environment Variables for Cognito v4

## Overview

This document provides instructions for updating the frontend environment variables to use the new Cognito v4 resources.

## New Cognito IDs

The new Cognito IDs for the dev environment are:

- **User Pool ID**: `ap-southeast-1_FdNDJKUHW`
- **User Pool Client ID**: `75omsfj6bkgld5drb4h181so92`

## Updating Environment Variables

### 1. Update `.env.local` File

Update the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_FdNDJKUHW
NEXT_PUBLIC_USER_POOL_CLIENT_ID=75omsfj6bkgld5drb4h181so92
```

### 2. Update ECS Environment Variables

If you're using ECS Fargate to host the frontend, update the environment variables in the ECS task definition:

```bash
# Get the current task definition
aws ecs describe-task-definition --task-definition bellyfed-dev --query taskDefinition > task-def.json

# Edit the task-def.json file to update the environment variables
# Then register the new task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Update the service to use the new task definition
aws ecs update-service --cluster bellyfed-dev-cluster --service bellyfed-dev --task-definition bellyfed-dev
```

### 3. Update CI/CD Pipeline

If you're using a CI/CD pipeline to deploy the frontend, update the environment variables in the pipeline configuration.

## Verifying the Changes

To verify that the frontend is using the new Cognito resources:

1. Open the frontend application in a browser
2. Open the browser's developer tools
3. Check the console logs for the Cognito Client ID being used
4. Try to sign in with an existing user account

## Troubleshooting

If you encounter issues with authentication after updating the environment variables:

1. Check that the environment variables are correctly set
2. Verify that the Cognito User Pool and User Pool Client are correctly configured
3. Check the browser console for any errors related to Cognito
4. Try clearing the browser's local storage and cookies

## Rollback Plan

If you need to roll back to the previous Cognito resources:

1. Update the environment variables to use the previous Cognito IDs
2. Redeploy the frontend application
