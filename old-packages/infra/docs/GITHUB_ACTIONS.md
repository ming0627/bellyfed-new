# GitHub Actions Guide

This document provides a comprehensive guide to GitHub Actions in the Bellyfed project. It consolidates information from multiple sources into a single, clear reference.

## Overview

GitHub Actions are used for:

1. **Code Quality Checks**: Linting and type checking for PRs
2. **Infrastructure Deployment**: Deploying CDK stacks for infrastructure
3. **Triggering AWS CodePipeline**: Starting deployment pipelines

## Simplified Workflow Strategy

We've simplified the GitHub Actions workflows to focus on essential tasks and reduce PR merge time:

### bellyfed-infra Repository

1. **PR Checks** (`.github/workflows/pr-checks.yml`)

    - Runs on pull requests to develop, staging, or main
    - Performs linting and type checking only
    - No AWS authentication or CDK synthesis

2. **Deploy CICD** (`.github/workflows/deploy-cicd.yml`)
    - Runs on pushes to develop, staging, or main that modify CICD files
    - Deploys the CICD infrastructure using CDK
    - Triggers AWS CodePipeline for application deployment

### bellyfed Repository

1. **PR Checks** (`.github/workflows/pr-checks.yml`)
    - Runs on pull requests to develop, staging, or main
    - Performs linting only
    - Optional build step (commented out by default)

> **Note**: Deployment is now handled by AWS CodePipeline instead of GitHub Actions.

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

    - Built and deployed via AWS CodePipeline
    - Served from CloudFront/S3 (static assets)
    - Server-side rendering via ECS Fargate

2. **Backend Infrastructure**:
    - Deployed via CDK through GitHub Actions
    - Managed by CloudFormation stacks

## Environment Mapping

Branches are mapped to environments as follows:

- `develop` → `dev` environment
- `staging` → `staging` environment
- `main` → `prod` environment
- Feature branches can be mapped to custom environments

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
    - Use AWS CodePipeline for complex deployment processes
    - Set up notifications for pipeline failures

## Troubleshooting

### Common Issues

1. **Workflow Failures**

    - Check the GitHub Actions logs for error messages
    - Verify that all required secrets are configured correctly
    - Ensure your branch is up-to-date with the base branch

2. **Deployment Failures**
    - Check the CloudFormation console for stack events
    - Verify that the IAM role has the necessary permissions
    - Check the CodePipeline console for pipeline execution status

### Manual Intervention

If GitHub Actions fail, you can:

1. **Manually Deploy Infrastructure**

    ```bash
    npx cdk deploy --context environment=dev "BellyfedCicdStack-dev" --require-approval never
    ```

2. **Manually Trigger CodePipeline**
    - Go to the AWS CodePipeline console
    - Find the pipeline for your environment
    - Click "Release change" to manually trigger the pipeline

## IAM Permissions

The GitHub Actions IAM role requires permissions for:

1. **CloudFormation**: Managing CDK stacks
2. **S3**: Accessing CDK assets
3. **CodePipeline**: Starting pipeline executions
4. **IAM**: Managing service roles
5. **SSM**: Managing parameters
6. **KMS**: Encrypting/decrypting secrets

See `docs/github-actions-iam.md` for the detailed IAM policy.

## Conclusion

By simplifying our GitHub Actions workflows and leveraging AWS CodePipeline, we've created a more efficient and reliable CI/CD process. This approach:

1. Reduces PR merge time
2. Improves deployment reliability
3. Provides a clearer separation of concerns
4. Allows for more flexible deployment strategies

For detailed information about frontend deployment, see `docs/FRONTEND_DEPLOYMENT.md`.
