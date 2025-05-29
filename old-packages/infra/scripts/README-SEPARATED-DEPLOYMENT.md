# Separated Infrastructure and Application Deployment

This document explains the new approach to ECS deployments that separates infrastructure from application deployment, resulting in much faster deployments.

## Overview

The traditional CloudFormation approach to ECS deployments has several drawbacks:

1. **Slow Deployments**: CloudFormation waits for the ECS service to stabilize, which can take 5-15 minutes
2. **Tight Coupling**: Infrastructure and application are tightly coupled, so application changes require infrastructure updates
3. **Limited Flexibility**: It's difficult to make quick changes to environment variables or other application settings

The new approach separates infrastructure from application deployment:

1. **Infrastructure**: Managed by CloudFormation (VPC, security groups, load balancer, ECS cluster, etc.)
2. **Application**: Managed outside of CloudFormation using AWS CLI commands (task definition, container image, environment variables)

## How It Works

### Infrastructure Deployment (One-Time Setup)

The `EcsFargateStack` now:

1. Creates all the infrastructure resources (VPC, security groups, load balancer, ECS cluster, etc.)
2. Creates IAM roles for the ECS tasks
3. Creates an initial task definition with a specific family name
4. Stores important values in SSM Parameter Store for external scripts to use

This is a one-time setup that only needs to be updated when infrastructure changes are required.

### Application Deployment (Frequent Updates)

The `update-ecs-task-definition.sh` script:

1. Retrieves parameters from SSM Parameter Store
2. Gets the current task definition
3. Updates the container image and/or environment variables
4. Registers a new task definition revision
5. Updates the ECS service to use the new task definition

This approach allows for fast application deployments without waiting for CloudFormation.

## Usage

### Initial Infrastructure Deployment

```bash
# Deploy the infrastructure (one-time setup)
npm run cdk:deploy
```

### Application Deployment

```bash
# Update the task definition and deploy a new version
npm run update:ecs-task:dev latest

# Or specify a specific image tag
npm run update:ecs-task:dev 1.2.3
```

The script will prompt you to:

1. Add/update a specific environment variable
2. Update all environment variables from a file
3. Just update the image without changing environment variables

## Benefits

1. **Fast Deployments**: Application updates take seconds instead of minutes
2. **Decoupled Infrastructure**: Infrastructure changes don't affect application deployments
3. **Flexible Environment Variables**: Easy to update environment variables without waiting for CloudFormation
4. **Improved Developer Experience**: Quick feedback loop for application changes

## Implementation Details

### SSM Parameters

The following SSM parameters are created for each environment:

- `/bellyfed/{environment}/ecs/task-definition-family`: The task definition family name
- `/bellyfed/{environment}/ecs/execution-role-arn`: The execution role ARN
- `/bellyfed/{environment}/ecs/task-role-arn`: The task role ARN
- `/bellyfed/{environment}/ecs/cluster-name`: The ECS cluster name
- `/bellyfed/{environment}/ecs/service-name`: The ECS service name
- `/bellyfed/{environment}/ecs/repository-uri`: The ECR repository URI

### IAM Roles

Two IAM roles are created for each environment:

1. **Execution Role**: Used by ECS to pull images and write logs
2. **Task Role**: Used by the container to access AWS services

### Task Definition

The task definition is created with a specific family name, which is used by the update script to register new revisions.

## Troubleshooting

If you encounter issues with the update script:

1. Check that the SSM parameters exist and have the correct values
2. Verify that you have the necessary IAM permissions to register task definitions and update services
3. Check the AWS ECS console for any deployment errors

For persistent issues, you may need to fall back to the CloudFormation deployment process.
