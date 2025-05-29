# Deployment Coordinator Guide

This document explains how to use the Deployment Coordinator to ensure seamless deployments across all environments.

## Overview

The Deployment Coordinator is a system designed to coordinate the deployment of various components in the Bellyfed infrastructure, particularly focusing on the proper sequencing of ECR repositories, Docker images, and ECS services.

## Key Components

1. **Deployment Coordinator Stack** (`lib/deployment-coordinator-stack.ts`):

    - Creates and manages ECR repositories
    - Stores deployment configuration in SSM parameters
    - Ensures dependencies are properly managed

2. **ECS Fargate Stack** (`lib/ecs-fargate-stack.ts`):

    - Supports fallback images when ECR repositories are empty
    - Includes health checks for containers
    - Properly handles dependencies on ECR repositories

3. **CICD Stack** (`lib/cicd-stack.ts`):

    - Coordinates the deployment process
    - Ensures ECR repositories exist before deploying ECS services
    - Manages permissions for all required AWS services

4. **Deployment Scripts**:
    - `scripts/deploy-environment.sh`: Comprehensive script for deploying to new environments
    - `scripts/fix-ecs-service.sh`: Script for fixing ECS services with missing images

## Deployment Process

### Option 1: Using the Deployment Script

The `deploy-environment.sh` script handles the complete deployment process for a new environment:

```bash
# Deploy to a new environment with default options
./scripts/deploy-environment.sh qa

# Deploy with bootstrap and fallback image
./scripts/deploy-environment.sh qa --bootstrap --use-fallback-image

# Deploy with image building and pushing
./scripts/deploy-environment.sh qa --push-image

# Deploy only the CICD stack
./scripts/deploy-environment.sh qa --deploy-cicd-only
```

### Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

1. **Bootstrap the environment** (if needed):

    ```bash
    npx cdk bootstrap aws://<account-id>/<region> --context environment=<env>
    ```

2. **Create the ECR repository**:

    ```bash
    aws ecr create-repository --repository-name bellyfed-<env> --region <region>
    ```

3. **Deploy the Deployment Coordinator Stack**:

    ```bash
    npx cdk deploy BellyfedDeploymentCoordinatorStack-<env> --context environment=<env> --require-approval never
    ```

4. **Build and push a Docker image** (optional):

    ```bash
    # Build the image
    docker build -t bellyfed-<env>:latest .

    # Log in to ECR
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

    # Tag and push the image
    docker tag bellyfed-<env>:latest <account-id>.dkr.ecr.<region>.amazonaws.com/bellyfed-<env>:latest
    docker push <account-id>.dkr.ecr.<region>.amazonaws.com/bellyfed-<env>:latest
    ```

5. **Deploy all stacks**:

    ```bash
    # If you pushed an image
    npx cdk deploy --all --context environment=<env> --require-approval never

    # If you didn't push an image, use the fallback image
    npx cdk deploy --all --context environment=<env> --context use-fallback-image=true --require-approval never
    ```

### Option 3: Using the CICD Pipeline

The CICD pipeline is configured to handle the deployment process automatically:

1. Push changes to the appropriate branch (e.g., `develop` for dev, `master` for prod)
2. The CICD pipeline will:
    - Create the ECR repository if it doesn't exist
    - Deploy the Deployment Coordinator Stack
    - Deploy all other stacks with the fallback image option

## Troubleshooting

### Issue: ECS Service Fails to Start

If the ECS service fails to start with a `CannotPullContainerError`, it means the Docker image doesn't exist in the ECR repository. Fix it with:

```bash
./scripts/fix-ecs-service.sh <env>
```

### Issue: Deployment Fails Due to Parameter Conflicts

If the deployment fails due to parameter conflicts, check if the parameters already exist in another stack:

```bash
aws ssm get-parameter --name /bellyfed/<env>/deployment/deploy-infra-stack --region <region>
```

If the parameter exists, you can either:

- Delete the conflicting stack
- Modify the parameter name in the Deployment Coordinator Stack

## Best Practices

1. **Always deploy the Deployment Coordinator Stack first**
2. **Use the fallback image option when deploying to new environments**
3. **Build and push Docker images before deploying ECS services in production**
4. **Use the deployment script for consistent deployments across environments**
5. **Check the ECS service status after deployment to ensure it's running properly**
6. **Ensure fast rollback settings are applied to all ECS services**

## Fast Rollback Configuration

All ECS services are configured with fast rollback settings to ensure rollback times are limited to 5 minutes maximum:

- **Deployment Circuit Breaker**: Automatically detects deployment failures and initiates rollbacks
- **Rollback Enabled**: Automatically rolls back to the previous stable deployment when failures are detected
- **Reduced Health Check Grace Period**: 60 seconds (down from 120 seconds)
- **Optimized Deployment Configuration**:
    - `maximumPercent: 200`: Allows up to 200% of tasks during deployment for faster transitions
    - `minimumHealthyPercent: 100`: Ensures no downtime during deployments
    - `deploymentCircuitBreaker: { enable: true, rollback: true }`: Enables automatic rollbacks

These settings ensure that any failed deployment will be detected and rolled back within 5 minutes, minimizing the impact of deployment issues.

## Environment-Specific Considerations

### Development Environment

- Use the fallback image option for quick iterations
- Deploy frequently to test changes

### QA/Staging Environment

- Build and push Docker images before deployment
- Test the deployment process end-to-end

### Production Environment

- Always build and push Docker images before deployment
- Use the approval stage in the CICD pipeline
- Verify all resources are created correctly before proceeding
