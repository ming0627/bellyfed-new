# GitHub Actions Guide

This document provides a comprehensive guide to GitHub Actions in the Bellyfed project. It consolidates information from multiple sources into a single, clear reference.

## Overview

GitHub Actions are used for:

1. **Code Quality Checks**: Linting and type checking for PRs
2. **Docker Image Building**: Building and pushing Docker images to ECR
3. **ECS Deployment**: Updating ECS services with new Docker images

## Simplified Workflow Strategy

We've simplified the GitHub Actions workflows to focus on essential tasks and reduce PR merge time:

### bellyfed Repository

1. **PR Checks** (`.github/workflows/pr-checks.yml`)

   - Runs on pull requests to develop, staging, or main
   - Performs linting and type checking only

2. **Deploy to ECS** (`.github/workflows/deploy-to-ecs.yml`)
   - Builds and pushes Docker image to ECR
   - Updates ECS service with new image
   - Uses service name pattern: `bellyfed-${environment}`

## AWS Authentication

GitHub Actions use OIDC (OpenID Connect) for secure, temporary AWS credentials:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ secrets.AWS_REGION }}
    mask-aws-account-id: true
```

### Required Secrets

- `AWS_ROLE_ARN`: ARN of the IAM role to assume
- `AWS_REGION`: AWS region (ap-southeast-1)
- `AWS_ACCOUNT_ID`: AWS account ID (optional, for masking)

## Deployment Architecture

The Bellyfed project uses a hybrid deployment architecture:

1. **Frontend Application**:
   - Built as a Docker image and pushed to ECR
   - Served from CloudFront/S3 (static assets)
   - Server-side rendering via ECS Fargate

## Environment Mapping

Branches are mapped to environments as follows:

- `develop` → `dev` environment
- `staging` → `staging` environment
- `main` → `prod` environment

## Best Practices

1. **Local Testing First**

   - Run linting and type checking locally before pushing
   - Use pre-commit hooks to automate local checks

2. **Small, Focused PRs**

   - Keep PRs small and focused on a single issue
   - This reduces review time and merge conflicts

3. **Branch Management**

   - Create feature branches from the latest `develop`
   - Regularly update feature branches with changes from `develop`
   - Use descriptive branch names with prefixes (e.g., `feature/`, `fix/`)

4. **Workflow Optimization**
   - Minimize the number of steps in GitHub Actions
   - Set up notifications for workflow failures

## Troubleshooting

### Common Issues

1. **Workflow Failures**

   - Check the GitHub Actions logs for error messages
   - Verify that all required secrets are configured correctly
   - Ensure your branch is up-to-date with the base branch

2. **Deployment Failures**
   - Check the ECS console for service events
   - Verify that the IAM role has the necessary permissions
   - Check the ECR console for image repository issues

### Manual Intervention

If GitHub Actions fail, you can:

1. **Manually Build and Push Docker Image**

   ```bash
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
   docker build -t <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/bellyfed-frontend:dev-manual .
   docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/bellyfed-frontend:dev-manual
   ```

2. **Manually Update ECS Service**
   ```bash
   aws ecs update-service --cluster bellyfed-dev --service bellyfed-dev --force-new-deployment
   ```

## IAM Permissions

The GitHub Actions IAM role requires permissions for:

1. **ECR**: Pushing Docker images
2. **ECS**: Updating services and task definitions
3. **CloudWatch**: Logging and monitoring

## Conclusion

By simplifying our GitHub Actions workflows, we've created a more efficient and reliable CI/CD process. This approach:

1. Reduces PR merge time
2. Improves deployment reliability
3. Provides a clearer separation of concerns
4. Allows for more flexible deployment strategies
