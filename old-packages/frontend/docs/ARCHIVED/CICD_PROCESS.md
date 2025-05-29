# CI/CD Process for Bellyfed Frontend

This document explains the Continuous Integration and Continuous Deployment (CI/CD) process for the Bellyfed frontend application.

## Overview

The Bellyfed frontend uses a combination of GitHub Actions for CI (Continuous Integration) and AWS CodePipeline for CD (Continuous Deployment):

1. **GitHub Actions**: Runs tests and checks on pull requests to ensure code quality
2. **AWS CodePipeline**: Automatically deploys the application when code is pushed to specific branches

## Local Development Safeguards

### Pre-commit Hooks

We use Husky to run pre-commit hooks that ensure code quality before allowing commits:

- **Linting**: Checks for code style and potential issues
- **Build**: Ensures the application builds successfully

This prevents committing code that would fail in the CI pipeline.

## CI Pipeline (GitHub Actions)

The CI pipeline runs on pull requests to the `main`, `develop`, and `staging` branches.

### Steps:

1. **Checkout code**: Retrieves the latest code from the repository
2. **Setup Node.js**: Installs Node.js and configures npm
3. **Install dependencies**: Runs `npm ci` to install dependencies
4. **Lint**: Checks code quality with ESLint
5. **Build**: Builds the application to ensure it compiles correctly
6. **Test**: Runs unit tests to verify functionality

## CD Pipeline (AWS CodePipeline)

The CD pipeline is managed by AWS CodePipeline and runs automatically when code is pushed to specific branches.

### Environment Mapping:

- `main` branch → Production environment (app.bellyfed.com)
- `staging` branch → Staging environment (app-staging.bellyfed.com)
- `develop` branch → Development environment (app-dev.bellyfed.com)

### Pipeline Stages:

1. **Source**: Pulls the latest code from the GitHub repository
2. **Build**:
   - Installs dependencies
   - Runs linting and tests
   - Builds the Next.js application
3. **Deploy**:
   - Uploads the built files to S3
   - Invalidates the CloudFront cache

## Infrastructure as Code

The entire CI/CD pipeline is defined as code in the `bellyfed-infra` repository:

- `lib/frontend-cicd-stack.ts`: Defines the AWS CodePipeline for frontend deployment
- `lib/frontend-deployment-stack.ts`: Defines the S3 bucket and CloudFront distribution

## Troubleshooting

### Common Issues

#### Build Failures

If the build fails in the CI/CD pipeline, check for:

1. **Missing dependencies**: Ensure all dependencies are properly listed in `package.json`
2. **Environment variables**: Verify that all required environment variables are set in the CodeBuild project
3. **Build errors**: Look at the build logs in AWS CodeBuild for specific error messages

#### Deployment Failures

If deployment fails, check the AWS CodePipeline console for specific error messages.

## Adding New Dependencies

When adding new dependencies to the project:

1. Use `npm install --save` for runtime dependencies
2. Use `npm install --save-dev` for development dependencies
3. Commit the updated `package.json` and `package-lock.json` files
4. Verify that the CI pipeline passes with the new dependencies

## Manual Deployment

If you need to manually trigger a deployment:

1. Go to the AWS CodePipeline console
2. Find the pipeline for your environment (e.g., `dev-frontend-pipeline`)
3. Click "Release change" to start a new pipeline execution
