# Deployment Plan: Use Official Typesense Docker Image from Docker Hub

## Overview

This document outlines the steps to deploy the changes that replace the custom Typesense Docker image with the official image from Docker Hub (version 28.0).

## Pre-Deployment Checks

1. Ensure you have the latest code from the `develop` branch
2. Verify that you have the necessary AWS credentials and permissions
3. Make sure you have the AWS CDK CLI installed (`npm install -g aws-cdk`)

## Deployment Steps

### 1. Create and Switch to the Feature Branch

```bash
# Checkout the develop branch
git checkout develop

# Pull the latest changes
git pull origin develop --rebase

# Create a new feature branch
git checkout -b fix/typesense-docker-image-build

# Apply the changes from this PR
# (Either by cherry-picking or manually applying the changes)
```

### 2. Test the Changes Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Synthesize the CloudFormation templates
cdk synth --context environment=dev
```

Verify that the synthesized templates don't include the TypesenseEcrStack and that the TypesenseServiceStack correctly references the official Docker Hub image.

### 3. Deploy the Changes

```bash
# Deploy the changes to the development environment
cdk deploy BellyfedTypesenseServiceStack-dev --context environment=dev
```

### 4. Verify the Deployment

1. Check the AWS Management Console to verify that the Typesense service is running correctly
2. Verify that the Typesense service is using the official Docker Hub image
3. Test the Typesense functionality in the application

### 5. Commit and Push the Changes

```bash
# Add the changes
git add .

# Commit the changes
git commit -m "Use official Typesense Docker image from Docker Hub"

# Push the changes
git push -u origin fix/typesense-docker-image-build
```

### 6. Create a Pull Request

Create a pull request from the `fix/typesense-docker-image-build` branch to the `develop` branch.

## Rollback Plan

If issues are encountered during deployment, follow these steps to roll back:

1. Revert the changes in the feature branch:

    ```bash
    git revert HEAD
    git push
    ```

2. Redeploy the previous version:
    ```bash
    cdk deploy BellyfedTypesenseServiceStack-dev --context environment=dev
    ```

## Post-Deployment Tasks

1. Monitor the Typesense service to ensure it's functioning correctly
2. Update any documentation that references the custom Typesense Docker image
3. Clean up any unused ECR repositories related to Typesense:

    ```bash
    # List all ECR repositories related to Typesense
    aws ecr describe-repositories --query "repositories[?contains(repositoryName, 'typesense')].repositoryName" --output text

    # Delete the ECR repositories (replace REPOSITORY_NAME with the actual repository name)
    aws ecr delete-repository --repository-name REPOSITORY_NAME --force
    ```
