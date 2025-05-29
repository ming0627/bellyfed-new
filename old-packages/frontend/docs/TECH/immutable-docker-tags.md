# Immutable Docker Tags Strategy

This document outlines the immutable Docker tagging strategy implemented for the Bellyfed application.

## Overview

Immutable Docker tags provide a reliable way to track and deploy specific versions of your application. Unlike mutable tags like `latest`, which can point to different images over time, immutable tags ensure that a specific tag always refers to the same image.

## Key Improvements

1. **Single Source of Truth**: A dedicated `version.sh` script that generates consistent tags
2. **Immutable ECR Repository**: ECR repository configured with `TagMutability.IMMUTABLE` to prevent tag overwriting
3. **Digest Pinning**: Using image digests in task definitions for ultimate reproducibility
4. **Automated Changelog**: Using conventional-changelog to automatically generate release notes
5. **Standardized Tag Format**: Including semantic version, timestamp, and Git SHA
6. **GitHub Integration**: Automatic creation of Git tags and releases that match Docker image tags

## Tag Format

The improved tag format includes:

- **Semantic Version**: From package.json or Git tags
- **Timestamp**: YYYYMMDD format for uniqueness
- **Git SHA**: Short commit hash for traceability

Examples:

- Production: `v1.2.3-20250426-abc1234` (from main/master branch)
- Development: `develop-20250426-abc1234` (from develop branch)
- Release: `release-1.2.3-20250426-abc1234` (from release/\* branches)
- Hotfix: `hotfix-1.2.4-20250426-abc1234` (from hotfix/\* branches)
- Feature: `feature-abc-123-20250426-abc1234` (from feature/\* branches)

## Implementation

### 1. Version Script

The `scripts/version.sh` script is the single source of truth for generating tags. It:

- Extracts semantic version from package.json or Git tags
- Adds timestamp and Git SHA
- Formats the tag based on the branch

### 2. ECR Repository Configuration

The ECR repository is configured with:

- `TagMutability.IMMUTABLE`: Prevents overwriting existing tags
- `RemovalPolicy.RETAIN`: Prevents accidental deletion
- Lifecycle rules: Limits the number of images to control costs

### 3. CI/CD Pipeline

The CI/CD pipeline:

1. Generates the immutable tag using `version.sh`
2. Builds and tags the Docker image
3. Pushes the image to ECR
4. Captures the image digest for pinning
5. Creates `imageDefinitions.json` with the digest
6. Generates a changelog using conventional-changelog
7. Creates a Git tag matching the Docker image tag
8. Pushes the Git tag to GitHub
9. Optionally creates a GitHub release
10. Commits and pushes the updated changelog

### 4. GitHub Tagging

For each Docker image, a corresponding Git tag is created in the GitHub repository:

- The Git tag name matches the Docker image tag
- The tag includes detailed information in its message:
  - Docker image URI
  - Image digest
  - Build ID
  - Environment
- A GitHub release can also be created with the changelog as release notes

### 5. Digest Pinning

For ultimate reproducibility, the ECS task definition uses the image digest rather than the tag:

```json
[
  {
    "name": "bellyfed-dev-container",
    "imageUri": "590184067494.dkr.ecr.ap-southeast-1.amazonaws.com/bellyfed-dev@sha256:abc123..."
  }
]
```

## Branching Strategy

Our Git branches and ECS environments are aligned as follows:

1. **main / master**: Production environment
2. **develop**: Development environment
3. **release/\***: Staging environment
4. **hotfix/\***: Production hotfixes
5. **feature/\***: Feature development

## Changelog

The CHANGELOG.md file is automatically generated using conventional-changelog, which:

- Parses commit messages following the Conventional Commits format
- Generates structured release notes
- Adds Docker image information for traceability

## Rollback Process

To roll back to a previous version:

### Option 1: Using the CHANGELOG

1. Find the desired image digest in the CHANGELOG.md file
2. Update the ECS service to use that digest:

```bash
aws ecs update-service --cluster bellyfed-[environment] --service bellyfed-[environment] --force-new-deployment --task-definition $(aws ecs describe-task-definition --task-definition bellyfed-[environment] --query 'taskDefinition.taskDefinitionArn' --output text)
```

### Option 2: Using GitHub Tags

1. List the available Git tags to find the desired version:

```bash
git tag -l --sort=-creatordate | head -10  # Show 10 most recent tags
```

2. View the tag details to get the image digest:

```bash
git show [tag-name]  # This will show the tag message with the image digest
```

3. Use the image digest to update the ECS service as in Option 1

### Option 3: Using GitHub Releases

1. Go to the GitHub repository's Releases page
2. Find the desired release
3. The release notes will include the Docker image tag and digest
4. Use the image digest to update the ECS service

## Best Practices

1. **Use Conventional Commits**: Format commit messages as `type(scope): message` to enable automated changelog generation
2. **Never rely on `latest`**: Always use immutable tags or digests for deployments
3. **Keep the changelog up to date**: The CI/CD pipeline automatically updates it
4. **Use semantic versioning**: For release branches, use semantic versioning (e.g., `release/1.2.3`)
5. **Clean up old images**: Use lifecycle rules to manage ECR repository size

## Implementation Files

1. **scripts/version.sh**: Script for generating immutable tags
2. **frontend-cicd-stack.ts**: AWS CodeBuild configuration with immutable tags
3. **CHANGELOG.md**: Automatically generated changelog
4. **GitHub Tags**: Automatically created Git tags that match Docker image tags
5. **GitHub Releases**: Optional releases created with changelog information
