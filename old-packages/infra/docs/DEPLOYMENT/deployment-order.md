# Deployment Order Guide

This document explains the correct deployment order for the Bellyfed infrastructure to ensure that all dependencies are properly resolved.

## Deployment Sequence

The correct deployment sequence is:

1. **Bootstrap Stack** - Creates foundational resources
2. **Deployment Coordinator Stack** - Creates the ECR repository
3. **Network Stack** - Creates VPC and networking resources
4. **ECS Infrastructure Stack** - Creates ECS cluster, ALB, and other infrastructure
5. **Frontend CICD Stack** - Sets up the pipeline to build and push Docker images to ECR
6. **ECS Service Stack** - Creates the ECS service using the Docker image from ECR

## Why This Order Matters

The ECS Service Stack depends on having a Docker image in the ECR repository. If the Frontend CICD Stack is deployed after the ECS Service Stack, the ECS service will fail to start because there's no image in the repository.

By deploying the Frontend CICD Stack before the ECS Service Stack, we ensure that the ECR repository is populated with an image before the ECS service tries to use it.

## Using the Deployment Script

We've provided a script to deploy the stacks in the correct order:

```bash
./scripts/deploy-ordered.sh -e <environment>
```

This script:

1. Deploys the Bootstrap Stack
2. Deploys the Deployment Coordinator Stack
3. Deploys the Network Stack
4. Deploys the ECS Infrastructure Stack
5. Deploys the Frontend CICD Stack
6. Deploys the ECS Service Stack

## Handling Missing ECR Images

The ECS Service Stack now requires that the ECR repository has an image before it can be deployed. If the ECR repository doesn't have an image, the deployment will fail with an error message indicating that the Frontend CICD stack should be deployed first.

## CICD Pipeline Deployment Order

The CICD pipeline has been updated to deploy the stacks in the correct order:

1. Source
2. BuildAndTest
3. DeployBootstrap
4. DeployInfrastructure
5. DeployData
6. DeployFrontend
7. DeployApplication

This ensures that the Frontend CICD Stack is deployed before the ECS Service Stack.

## Troubleshooting

If you encounter issues with the ECS service not starting because there's no image in the ECR repository:

1. Make sure the Frontend CICD Stack has been deployed first:

    ```bash
    npx cdk deploy BellyfedFrontendCicdStack-<env> --context environment=<env>
    ```

2. Verify that the ECR repository has an image:

    ```bash
    aws ecr describe-images --repository-name bellyfed-<env>
    ```

3. Use the deployment script to deploy in the correct order:
    ```bash
    ./scripts/deploy-ordered.sh -e <env>
    ```
