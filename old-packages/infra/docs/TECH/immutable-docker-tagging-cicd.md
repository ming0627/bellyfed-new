# Immutable Docker Tagging in CI/CD

This document outlines how immutable Docker tagging is implemented in the CI/CD pipeline for the Bellyfed application.

## Overview

Immutable Docker tags provide a reliable way to track and deploy specific versions of the application. The CI/CD pipeline is configured to generate and use immutable tags for all Docker images.

## CI/CD Pipeline Configuration

The CI/CD pipeline is configured in `lib/frontend-cicd-stack.ts` to:

1. Generate immutable Docker tags based on:

    - Git branch
    - Commit SHA
    - Timestamp

2. Configure the ECR repository with:

    - `TagMutability.IMMUTABLE`: Prevents overwriting existing tags
    - `RemovalPolicy.RETAIN`: Prevents accidental deletion
    - Lifecycle rules: Limits the number of images to control costs

3. Use digest pinning in ECS task definitions:
    - Builds Docker images locally in CodeBuild
    - Pushes images to ECR with proper authentication
    - Uses the image digest in task definitions for immutability

## Versioning and Changelog Management

As of April 2025, versioning and changelog management have been removed from the CI/CD pipeline and are now handled manually as part of the standard Git workflow:

1. Developers create feature branches from develop
2. Changes are made and tested locally
3. Commits follow conventional commit format
4. Pull requests are created for code review
5. After merging, versioning and tagging are done manually

This approach simplifies the CI/CD pipeline and follows the principle of separation of concerns:

- Git handles versioning and history
- CI/CD handles building and deploying

## Tag Format

The tag format depends on the branch and environment:

- **Production**: `v1.2.3-20250426-abc1234` (from main/master branch)
- **Development**: `develop-20250426-abc1234` (from develop branch)
- **Release**: `release-1.2.3-20250426-abc1234` (from release/\* branches)
- **Hotfix**: `hotfix-1.2.4-20250426-abc1234` (from hotfix/\* branches)
- **Feature**: `feature-abc-123-20250426-abc1234` (from feature/\* branches)

## Implementation Details

### ECR Repository Configuration

```typescript
const ecrRepository = new ecr.Repository(this, 'Repository', {
    repositoryName: `bellyfed-${props.environment}`,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    imageScanOnPush: true,
    imageTagMutability: ecr.TagMutability.IMMUTABLE,
    lifecycleRules: [
        {
            description: 'Keep only the 100 most recent images',
            maxImageCount: 100,
            tagStatus: ecr.TagStatus.ANY,
        },
    ],
});
```

### CI/CD Pipeline Tag Generation

The pipeline generates immutable tags in the pre-build phase:

```bash
# Use CODEBUILD_RESOLVED_SOURCE_VERSION which is always available in CodeBuild
COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="${BRANCH_NAME}-${TIMESTAMP}-${COMMIT_HASH}"
```

This simplified approach:

- Uses the branch name from environment variables
- Adds a timestamp for uniqueness
- Includes the commit hash for traceability
- Creates a consistent format for all environments

### Digest Pinning

The pipeline captures the image digest and uses it in the task definition:

```bash
# Push Docker images with proper authentication
echo "Authenticating with ECR..."
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $REPOSITORY_URI

echo "Pushing Docker images..."
docker push $REPOSITORY_URI:$IMAGE_TAG
docker push $REPOSITORY_URI:latest

# Get the image digest for pinning
IMAGE_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' $REPOSITORY_URI:$IMAGE_TAG | cut -d'@' -f2)

# Create imageDefinitions.json with the digest
echo '[{"name":"bellyfed-dev-container","imageUri":"'$REPOSITORY_URI@sha256:$IMAGE_DIGEST'"}]' > imageDefinitions.json
```

## Rollback Process

To roll back to a previous version:

1. Find the desired image digest in the CodeBuild logs or ECR repository
2. Update the ECS service to use that digest:

```bash
aws ecs update-service --cluster bellyfed-[environment] --service bellyfed-[environment] --force-new-deployment --task-definition $(aws ecs describe-task-definition --task-definition bellyfed-[environment] --query 'taskDefinition.taskDefinitionArn' --output text)
```

## Standard Git Workflow

For versioning and changelog management, follow this standard Git workflow:

1. Start with the latest develop branch:

    ```bash
    git checkout develop
    git pull origin develop --rebase
    ```

2. Create a feature branch:

    ```bash
    git checkout -b feature/your-short-description
    ```

3. Make changes and test locally

4. Commit with a clear message following conventional commit format:

    ```bash
    git add .
    git commit -m "feat: Add new feature"
    ```

5. Push and create a pull request:

    ```bash
    git push origin HEAD
    # Then create a PR on GitHub
    ```

6. For versioning and tagging (after merging):

    ```bash
    # For semantic versioning
    git tag -a v1.2.3 -m "Version 1.2.3"
    git push origin v1.2.3

    # For changelog generation (if using conventional-changelog)
    npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
    git add CHANGELOG.md
    git commit -m "chore: Update changelog for v1.2.3"
    git push origin develop
    ```

## Related Documentation

For application-specific Docker tagging information, see the `immutable-docker-tags.md` document in the `bellyfed` repository.
