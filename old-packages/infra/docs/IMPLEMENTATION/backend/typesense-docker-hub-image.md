# Using Official Typesense Docker Hub Image

This document explains the change from building a custom Typesense Docker image to using the official image from Docker Hub.

## Overview

Previously, we were building a custom Typesense Docker image and storing it in ECR. This approach had several issues:

1. It required maintaining a custom Dockerfile
2. It added complexity to our infrastructure code
3. It required additional AWS resources (ECR repositories)

To simplify our approach and improve reliability, we've switched to using the official Typesense Docker image directly from Docker Hub.

## Implementation

### Removed TypesenseEcrStack

We've completely removed the `TypesenseEcrStack` and all ECR-related code. The Typesense service now pulls the official image directly from Docker Hub:

```typescript
// Use the official Typesense Docker image from Docker Hub
const imageUri = 'typesense/typesense:28.0';

// Store the Docker image URI in SSM Parameter Store for reference
new ssm.StringParameter(this, 'TypesenseDockerImageUri', {
    parameterName: `/bellyfed/${props.environment}/typesense/docker-image-uri`,
    stringValue: imageUri,
    description: 'Docker Hub image URI for Typesense',
    tier: ssm.ParameterTier.STANDARD,
});
```

### Removed Dependencies

We've removed the following dependencies:

1. The `TypesenseEcrStack` and all related code
2. All ECR-related infrastructure for Typesense
3. The custom Dockerfile in the docker/typesense directory (kept with deprecation notice)
4. The build-and-push.sh script (kept with deprecation notice)

### ECS Service Configuration

The ECS service is now configured to pull the image directly from Docker Hub:

```typescript
const container = this.taskDefinition.addContainer('TypesenseContainer', {
    // Use the official Typesense Docker image from Docker Hub
    image: ecs.ContainerImage.fromRegistry(imageUri),
    // ... other configuration ...
});
```

## Benefits

Using the official Docker Hub image directly provides several benefits:

1. **Simplicity**: No need to maintain a custom Dockerfile or ECR repositories
2. **Reliability**: The official image is well-tested and maintained by the Typesense team
3. **Updates**: Easier to update to new versions of Typesense
4. **Consistency**: The same image is used in development and production
5. **Cost Savings**: No need to pay for ECR storage
6. **Latest Features**: Using the latest Typesense version (28.0) provides access to the newest features and bug fixes

## Deployment

This change should be deployed as part of the regular deployment process. The CICD pipeline has been updated to remove the TypesenseEcrStack deployment step.

## Testing

To test this change:

1. Deploy the TypesenseServiceStack using the CDK
2. Verify that the Typesense service can pull and run the Docker Hub image
3. Verify that the image URI is stored in SSM Parameter Store

## References

- [Typesense Docker Hub Repository](https://hub.docker.com/r/typesense/typesense)
- [Typesense Documentation](https://typesense.org/docs/guide/install-typesense.html#docker)
