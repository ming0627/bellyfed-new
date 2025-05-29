# Bellyfed Infrastructure

This repository contains the AWS CDK infrastructure code for the Bellyfed application.

## Updates

- **SSM-Based Stack Decoupling**: Implemented a new approach to decouple stacks using SSM Parameter Store for cross-stack references instead of direct CloudFormation exports/imports. This improves deployment reliability and allows independent stack deployments. See [SSM-Based Stack Decoupling](docs/ssm-based-decoupling.md) for details.
- **ECS Stack Architecture Simplification**: Refactored the ECS Fargate stack implementation to remove BellyfedStacks enum dependencies and simplified the interface between infrastructure and service stacks for better maintainability.
- **CDK Synth Mock Script Enhancement**: Fixed CDK synth validation in GitHub Actions with robust context handling for hosted zones and VPC lookups. The script now includes better error reporting and provides clear guidance for resolving context-related issues.
- **ECS Fargate Stack Compatibility Fix**: Fixed TypeScript interface compatibility issues in the ECS Fargate stack to correctly pass properties between the infrastructure and service stacks, ensuring proper type safety and parameter passing.
- **ECS Service Stack Type Safety**: Improved type safety in the ECS Service Stack by properly handling potentially undefined properties and removing unused variables, fixing TypeScript compiler warnings.
- **GitHub Actions PR Checks Fix**: Updated the GitHub Actions workflow to properly pass the environment context parameter during CDK synthesis, ensuring consistency with the AWS CodeBuild configuration.
- **SQS Queue Creation Clarification**: Updated documentation to clarify the correct patterns for SQS queue creation:
    - Main application queues are created in the SQS stack
    - Lambda DLQs and retry queues are created by the LambdaWithRetry construct
    - Standalone queues (if needed) are created using the SqsCreator utility
- **EventBridge Stack Enhancements**: Modified EventBridge stack to use unique event bus names prefixed with "bellyfed-" and added proper exports for analytics event buses.
- **Lambda Function Updates**: Reverted Lambda function names and their associated queues to standard naming convention after cleanup of legacy stacks.
- **Write Processor Cleanup**: Removed unused implementation in write-processor Lambda function's src directory, keeping only the SQS-based implementation.
- **Lambda Function Builds**: Simplified Lambda function build process in the CI/CD pipeline using Lerna monorepo capabilities.
- **Pipeline Optimization**: Removed legacy database migration stages that are no longer needed.
- **Lucidity Documentation**: Added overview document for Lucidity product at `docs/lucidity-overview.md`.
- **AI Agent Guide**: Added comprehensive documentation at `docs/ai-agent-guide.md` for AI agents to understand infrastructure patterns and rules.
- **CICD Stack Auto-Deployment**: Added GitHub Actions workflow to automatically deploy CICD stack changes when modifications are made to `lib/cicd-stack.ts` or related files.
- **Branch to Environment Mapping**: Updated CICD workflow to map `staging` branch to QA environment for consistent branch strategy
- **CICD Deployment Sequence**: Enhanced CICD workflow to ensure GitHub Actions completes before triggering AWS CodePipeline

## Table of Contents

- [Overview](#overview)
- [AI Agent Guide](docs/ai-agent-guide.md)
- [CDK Environment Setup](docs/TECH/cdk-environment-setup.md)
- [Frontend Deployment](docs/frontend-deployment.md)
- [SSM-Based Stack Decoupling](docs/ssm-based-decoupling.md)
- [Environment Management](#environment-management)
    - [GitHub Actions Automation](#github-actions-automation)
    - [Requesting a New Environment](#requesting-a-new-environment)
    - [Cleaning Up an Environment](#cleaning-up-an-environment)
    - [Monitoring Environment Status](#monitoring-environment-status)
- [Deployment Options](#deployment-options)
    - [CI/CD Pipeline (Recommended)](#ci-cd-pipeline-recommended)
    - [Local Development Deployment](#local-development-deployment)
- [GitHub Actions for Custom Environments](#github-actions-for-custom-environments)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Reference](#reference)
- [Getting Started with CDK](#getting-started-with-cdk)
    - [Prerequisites](#prerequisites)
    - [Building the Project](#building-the-project)
    - [Synthesizing CDK Stacks](#synthesizing-cdk-stacks)
    - [Deploying Stacks](#deploying-stacks)

## Overview

Bellyfed Infrastructure is a serverless application built using AWS CDK. It leverages Aurora PostgreSQL as its database backend and follows Event-Driven Architecture (EDA) principles. The infrastructure supports dynamic environments based on Git branches, enabling isolated testing and feature development.

### Infrastructure Components

1. **SQS Queue Creation Patterns**:

    - **Main Application Queues** (in SQS Stack):

        - Import Queue (`bellyfed-import-queue-{env}`)
        - Write Queue (`bellyfed-write-queue-{env}`)
        - Analytics Queue (`bellyfed-analytics-queue-{env}`)
        - Auth Event Queue (`bellyfed-auth-event-queue-{env}`)
        - Query Queue (`bellyfed-query-queue-{env}`)
        - User Signup Queue (`bellyfed-user-signup-queue-{env}`)

    - **Lambda Function Queues** (created by LambdaWithRetry):

        - DLQ for each Lambda (`{function-name}-dlq`)
        - Retry Queue for each Lambda (`{function-name}-retry`)
        - Automatically configured with CloudWatch alarms
        - Proper IAM permissions set up

    - **Standalone Queues** (if needed, created by SqsCreator):
        - For non-Lambda related queues that need DLQs
        - Used for application-specific message handling
        - Follows standardized naming and configuration

2. **Lambda Functions**:

    - Functions follow environment-based naming (e.g., `staging-menu-query`)
    - Each function has its own DLQ (e.g., `staging-menu-query-dlq`)
    - Each function has a retry queue (e.g., `staging-menu-query-retry`)
    - DLQs have a 14-day retention period
    - Retry queues have a 7-day retention period and max retry count of 3
    - Function ARNs are stored in SSM Parameter Store using the pattern `/bellyfed/{environment}/lambda/{function-name}`
    - SSM parameters are automatically created during stack deployment
    - API Gateway retrieves Lambda ARNs from SSM parameters for integration

3. **EventBridge Event Buses**:

    - Analytics Event Bus (`bellyfed-analyticseventbus-{env}`)
    - User Domain Event Bus (`bellyfed-domain-user-{env}`)
    - Auth Domain Event Bus (`bellyfed-domain-auth-{env}`)
    - System Event Bus (`bellyfed-infra-system-{env}`)
    - Analytics Domain Bus (`bellyfed-analytics-{env}`)

4. **Monitoring**:
    - CloudWatch alarms for all event buses
    - SNS notifications for alarms
    - Slack integration (optional)
    - Email notifications to alerts@bellyfed.com

## Environment Management

### GitHub Actions Automation

Environment management is fully automated through GitHub Actions. No local deployment is required - simply create issues in GitHub to request environment creation or cleanup.

### Requesting a New Environment

To request a new environment:

1. Go to the **Issues** tab in the repository
2. Click **New issue**
3. Select the **Environment Request** template
4. Fill in the required information
5. Submit the issue

The GitHub Actions workflow will automatically process your request and create the environment.

### Cleaning Up an Environment

To clean up an environment:

1. Go to the **Issues** tab in the repository
2. Click **New issue**
3. Select the **Environment Cleanup** template
4. Fill in the environment name to clean up
5. Submit the issue

### Monitoring Environment Status

You can monitor the progress in the GitHub issue comments or check the GitHub Actions tab for detailed logs.

## Deployment Options

### CI/CD Pipeline (Recommended)

The primary deployment method is through the automated CI/CD pipeline in AWS CodePipeline. The pipeline is triggered automatically when code is pushed to specific branches:

- `master` branch → Production environment (requires approval)
- `qa` branch → QA environment (requires approval)
- `test` branch → Test environment

No manual intervention is required beyond approving production/QA deployments in the AWS Console.

### Local Development Deployment

For local development and testing, use direct CDK commands:

```bash
# Synthesize CloudFormation templates
npm run synth:dev
npm run synth:test
npm run synth:qa
npm run synth:prod

# Deploy to environments (with required context values for CloudFront)
npm run cdk:deploy:dev -- --context hostedZoneId=<your-hosted-zone-id> --context certificateArn=<your-certificate-arn>
npm run cdk:deploy:test -- --context hostedZoneId=<your-hosted-zone-id> --context certificateArn=<your-certificate-arn>
npm run cdk:deploy:qa -- --context hostedZoneId=<your-hosted-zone-id> --context certificateArn=<your-certificate-arn>
npm run cdk:deploy:prod -- --context hostedZoneId=<your-hosted-zone-id> --context certificateArn=<your-certificate-arn>

# Bootstrap a new environment
npm run cdk:bootstrap

# For custom environment names
CDK_DEFAULT_ACCOUNT=590184067494 CDK_DEFAULT_REGION=ap-southeast-1 npx cdk deploy --all \
  --context environment=<custom-env-name> \
  --context hostedZoneId=<your-hosted-zone-id> \
  --context certificateArn=<your-certificate-arn>
```

See [CDK Environment Setup](docs/TECH/cdk-environment-setup.md) for more details on environment configuration.

## GitHub Actions for Custom Environments

For feature branches and custom environments, you can use GitHub Actions:

1. Go to the **Actions** tab in the repository
2. Select the "Deploy Custom Environment" workflow
3. Click "Run workflow"
4. Enter the environment name and branch name
5. Enter the hosted zone ID and certificate ARN for CloudFront (only needed for the first deployment)
6. Click "Run workflow"

After the first deployment, the hosted zone ID and certificate ARN will be stored in SSM Parameter Store, and you won't need to provide them again for future deployments.

### CICD Stack Auto-Deployment

The CICD stack itself is automatically deployed through GitHub Actions when changes are made to:

- `lib/cicd-stack.ts`
- `lib/frontend-cicd-stack.ts`
- `lib/frontend-deployment-stack.ts`
- `lib/config.ts`
- `.github/workflows/deploy-cicd.yml`

The workflow will:

1. Detect changes to the CICD stack files
2. Deploy the backend CICD stack to the appropriate environment based on the branch:
    - `master` branch → Production CICD stack
    - `staging` branch → QA CICD stack
    - `test` branch → Test CICD stack
3. Wait for the CloudFormation stack update to complete
4. Stop any running AWS CodePipeline executions
5. Start a new AWS CodePipeline execution

This ensures that:

- CICD infrastructure changes are automatically propagated
- GitHub Actions completes before AWS CodePipeline starts
- No concurrent pipeline executions interfere with each other

### Frontend CICD Stack Deployment

**Important Note**: The frontend CICD stack (`BellyfedFrontendCicdStack-{env}`) requires CloudFront resources (S3 bucket and CloudFront distribution) that are created during a regular deployment. It cannot be deployed with `deploy-cicd-only=true`.

#### Automatic Certificate and Hosted Zone Management

The infrastructure now includes a `CertificateParametersStack` that automatically manages the certificate and hosted zone values for CloudFront deployment. This stack:

1. Stores the certificate ARN and hosted zone ID in SSM Parameter Store
2. Makes these values available to the CloudFront stack during deployment
3. Allows for both local synthesis and automated CI/CD deployment

You can provide these values in several ways:

```bash
# Option 1: For local development/testing (synthesis only)
npm run synth:test

# Option 2: For local deployment with context values
npm run cdk:deploy:test -- --context hostedZoneId=Z1234567890ABCDEF --context certificateArn=arn:aws:acm:us-east-1:123456789012:certificate/abcdef...

# Option 3: For CI/CD deployment (values stored in SSM)
# First, store the values in SSM Parameter Store:
npm run cdk:deploy:test -- --only BellyfedCertificateParametersStack-test --context hostedZoneId=Z1234567890ABCDEF --context certificateArn=arn:aws:acm:us-east-1:123456789012:certificate/abcdef...

# Then, deploy the rest of the stacks (no context values needed)
npm run cdk:deploy:test
```

For CI/CD pipelines, you only need to store the values in SSM Parameter Store once, and then all future deployments will automatically use those values.

There are two ways to deploy the frontend CICD stack:

#### Option 1: Using GitHub Actions (Recommended)

1. Go to the **Actions** tab in the repository
2. Select the "Deploy CICD Stack" workflow
3. Click "Run workflow"
4. Enter the environment name (dev, qa, or prod)
5. Check the "Deploy frontend CICD stack" option
6. Click "Run workflow"

This will:

- Deploy all stacks to ensure CloudFront resources exist
- Deploy the frontend CICD stack
- Start both the backend and frontend pipelines

#### Option 2: Manual Deployment

1. First run a regular deployment to create all required resources:
    ```bash
    npx cdk deploy --context environment=dev --all
    ```
2. Then, deploy the frontend CICD stack separately:
    ```bash
    npx cdk deploy --context environment=dev "BellyfedFrontendCicdStack-dev"
    ```

The regular GitHub Actions workflow (triggered by pushes) is configured to deploy only the backend CICD stack when using `deploy-cicd-only=true` to avoid validation errors.

### New Branches and Feature Environments

**Updated**: The frontend CICD stack now automatically creates pipelines for new branches, just like the backend CICD stack. This means you can deploy feature branches without manually updating the configuration.

To deploy a feature branch to a new environment:

```bash
npx cdk deploy --context environment=feature1 --context branch=feature/your-branch-name --all
```

This will automatically:

1. Create CloudFront resources for the new environment
2. Create a frontend CICD pipeline that watches your feature branch
3. Deploy changes from your feature branch to the new environment

The system works by:

1. First checking if there's a mapping in `CONFIG.frontend.branchMapping` for the environment
2. If a mapping exists, it uses the mapped branch name
3. If no mapping exists, it uses the branch name directly

#### Custom Branch Mapping (Optional)

If you prefer to explicitly define branch mappings, you can still update the `CONFIG.frontend.branchMapping` in `config.ts`:

```typescript
frontend: {
    owner: 'ming0627',
    repo: 'bellyfed',
    branchMapping: {
        dev: 'develop',
        staging: 'staging',
        prod: 'main',
        feature1: 'feature/your-branch-name' // Custom mapping
    }
}
```

### Branch to Environment Mapping

The repository follows this branch to environment mapping:

- `master` branch deploys to Production environment
- `staging` branch deploys to QA environment
- `test` branch deploys to Test environment

When you push changes to the `staging` branch, they will be deployed to the QA environment in AWS. This maintains a consistent branching strategy while mapping to the appropriate AWS environments.

## Branching Strategy and CICD Workflow

### Branch Structure

- `main` (or `master`): Production environment
- `staging`: Pre-production/QA environment
- `develop`: Development integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Hotfix branches for urgent production fixes
- `release/*`: Release branches for version management

### Workflow Process

1. **Feature Development**

    - Create feature branch from `develop`: `feature/my-new-feature`
    - Develop and commit changes
    - Create Pull Request (PR) to `develop`
    - GitHub Actions runs pre-merge checks
    - After approval and successful checks, merge to `develop`

2. **Release Process**

    - Create release branch from `develop`: `release/v1.x.x`
    - Create PR to `staging`
    - GitHub Actions runs deployment checks
    - After approval and successful checks, merge to `staging`
    - QA testing in staging environment
    - Create PR from `staging` to `main`
    - After approval and successful checks, merge to `main`
    - Tag release version

3. **Hotfix Process**
    - Create hotfix branch from `main`: `hotfix/fix-description`
    - Create PR to `main`
    - After approval and checks, merge to `main`
    - Cherry-pick changes to `staging` and `develop`

### GitHub Actions Workflow

Each PR triggers the following checks:

1. Code linting and formatting
2. Unit tests
3. Integration tests
4. Infrastructure validation (CDK synth)
5. Security scanning
6. Dependency audit

### Environment Deployments

- **Feature Environments**: Created on-demand for feature testing
- **Development**: Updated with each merge to `develop`
- **Staging/QA**: Updated with each merge to `staging`
- **Production**: Updated with each merge to `main`

### CICD Architecture Diagram

```mermaid
graph TD
    FB[Feature Branch] -->|PR| D[Develop]
    D -->|PR| S[Staging]
    S -->|PR| M[Main]

    FB -->|GitHub Actions| C1[Pre-merge Checks]
    D -->|GitHub Actions| C2[Dev Deployment]
    S -->|GitHub Actions| C3[QA Deployment]
    M -->|GitHub Actions| C4[Prod Deployment]

    C1 -->|Success| MG1[Merge to Develop]
    C2 -->|Success| AWS1[AWS Dev Environment]
    C3 -->|Success| AWS2[AWS QA Environment]
    C4 -->|Manual Approval| AWS3[AWS Prod Environment]
```

### Required GitHub Actions Configuration

```yaml
# Required GitHub Secrets
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
```

## Development

### Environment Variables

This project uses a single `.env.example` file as the reference for all environment variables. To set up your local environment:

1. Copy `.env.example` to `.env`:

    ```bash
    cp .env.example .env
    ```

2. Update the values in `.env` with your specific configuration.

For ECS task environment variables, the `scripts/env-vars-example.json` file provides a template in JSON format that can be used with the `update-ecs-env-vars.sh` script.

### Prerequisites

- Node.js 18 or later
- AWS CLI
- AWS CDK

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to your environment
cdk deploy --context environment=dev
```

### Automatic Build Checks

The project uses Husky to automatically run build checks before pushing changes to GitHub. This helps prevent common CodeBuild errors by:

1. Testing package dependencies in all function and layer directories
2. Ensuring package.json and package-lock.json files are in sync
3. Running a full build test
4. Cleaning up temporary files after the check

These checks run automatically when you try to push changes. If any issues are found:

1. The push will be blocked
2. You'll see detailed error messages about what failed
3. Follow the instructions to fix the issues (usually running `npm install` in the affected directory)
4. Commit the updated package-lock.json files
5. Try pushing again

## CI/CD Build Process

The CI/CD pipeline uses AWS CodeBuild to build and deploy the infrastructure. The build process:

1. Installs dependencies with `npm install` (rather than `npm ci`)
2. Builds all packages using Lerna
3. Deploys the infrastructure using CDK

If you encounter package-lock.json sync issues, you can update it locally:

```
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

## SSM Parameter Naming

SSM parameters use a consistent naming convention:

- All stacks: `/bellyfed/{environment}/...`

This ensures that all resources can locate their dependencies through standardized parameter paths.

### SSM-Based Stack Decoupling

The infrastructure now uses SSM Parameter Store for cross-stack references instead of direct CloudFormation exports/imports. This approach provides several benefits:

1. **Complete Decoupling**: Stacks no longer have direct dependencies on each other.
2. **Simplified Rollbacks**: If a stack deployment fails, it doesn't affect other stacks.
3. **Easier Updates**: Resources can be updated without affecting dependent stacks.

Resources are stored in SSM using the following pattern:

- `/bellyfed/{environment}/{resource-type}/{resource-name}`

For example:

- `/bellyfed/dev/vpc/vpc-id`
- `/bellyfed/dev/ecs/cluster-name`
- `/bellyfed/dev/iam/execution-role`

See [SSM-Based Stack Decoupling](docs/ssm-based-decoupling.md) for more details.

### Lambda Functions

Lambda functions should be placed in the `functions/` directory with each function in its own subdirectory. Each function is treated as a separate workspace package and built using Lerna. The source code can be organized in two ways:

1. Root directory: Simple functions can have their source code directly in the root directory:

```
functions/
  db-init/
    index.ts
    package.json
    tsconfig.json
  write-processor/
    index.ts
    package.json
    tsconfig.json
```

2. Src directory: More complex functions can organize their code in a `src` directory:

```
functions/
  user-query/
    src/
      index.ts
    package.json
    tsconfig.json
```

Each Lambda function should have:

1. A `package.json` with build scripts (`build`, `clean`, `type-check`, etc.)
2. A `tsconfig.json` that extends the root configuration
3. Source code files (TypeScript or JavaScript)

The `functions/package-defaults.json` file provides shared dependencies and configuration for all Lambda functions.

When the CI/CD pipeline runs, Lerna will automatically build all Lambda functions, ensuring each has a `dist` directory with the compiled JavaScript.

### GitHub Actions Workflow Status

[![Pull Request Checks](https://github.com/ming0627/bellyfed-infra/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/ming0627/bellyfed-infra/actions/workflows/pr-checks.yml)
[![Deploy CICD Stack](https://github.com/ming0627/bellyfed-infra/actions/workflows/deploy-cicd.yml/badge.svg)](https://github.com/ming0627/bellyfed-infra/actions/workflows/deploy-cicd.yml)

## Troubleshooting

### CDK Synth Context Issues

If you encounter errors during CDK synthesis related to missing context values, follow these steps:

1. **For GitHub Actions workflows**:

    - Look for error messages like `Context lookups have been disabled. Make sure all necessary context is already in 'cdk.context.json'`
    - Check if the error mentions missing context for hosted zones, VPC lookups, or other AWS resources
    - Update the `/scripts/cdk-synth-mock.sh` script to add the missing context values

2. **For local CDK synth**:

    - Run `cdk synth` with AWS credentials to generate the required context
    - The context values will be stored in `cdk.context.json`
    - Commit the updated `cdk.context.json` file

3. **Common CDK context values**:

    ```json
    {
      "availability-zones:account=<account-id>:region=<region>": [
        "<region>a",
        "<region>b",
        "<region>c"
      ],
      "hosted-zone:account=<account-id>:domainName=<domain-name>:region=<region>": {
        "Id": "/hostedzone/<zone-id>",
        "Name": "<domain-name>."
      },
      "vpc-provider:account=<account-id>:filter.vpc-id=<vpc-id>:region=<region>": {
        "vpcId": "<vpc-id>",
        "availabilityZones": [...],
        "privateSubnetIds": [...],
        "privateSubnetRouteTableIds": [...],
        "publicSubnetIds": [...],
        "publicSubnetRouteTableIds": [...]
      }
    }
    ```

4. **Debugging context issues**:
    - Run `scripts/cdk-synth-mock.sh` locally to test if the mock context is sufficient
    - Check the error output for specific missing context keys
    - Add the missing context to the script and test again

## Managing Secrets for ECS Fargate

The infrastructure now includes a dedicated `SecretsStack` for managing application secrets that are used by the ECS Fargate tasks. This approach:

1. Creates secrets in AWS Secrets Manager
2. Grants the ECS task execution role permissions to access these secrets
3. Securely passes secrets to ECS containers at runtime

### Available Secrets

The following secrets are automatically created for each environment:

- `API_KEY`: For third-party service integrations
- `DATABASE_URL`: Complete database connection string
- `JWT_SECRET`: Secret for signing JWT tokens

### Accessing Secrets in Your Application

Inside your container, secrets will be available as environment variables with the same names listed above.

For Next.js applications, you can access them like any other environment variable:

```javascript
// Example usage in backend code (server-side only)
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

**Important:** Never expose secrets to the client-side in a Next.js application. Do not prefix secret environment variables with `NEXT_PUBLIC_`.

### Adding New Secrets

To add new secrets for your application:

1. Edit the `lib/secrets-stack.ts` file
2. Add new secrets in the constructor using the `createSecret` method
3. Deploy the updated stack

Example:

```typescript
// Add a new secret
this.createSecret('MyNewSecret', 'MY_NEW_SECRET', environment, 'Description of the secret', {
    generateInitialValue: true,
});
```

### Setting Secret Values

For secrets that are automatically generated (with `generateInitialValue: true`), a random value will be created on first deployment.

For secrets that need specific values:

1. Deploy the stacks to create the empty secrets
2. Use the AWS Console or CLI to set the values:

```bash
# Set a secret value using AWS CLI
aws secretsmanager put-secret-value \
  --secret-id bellyfed/dev/database-url \
  --secret-string "postgres://username:password@hostname:5432/database"
```
