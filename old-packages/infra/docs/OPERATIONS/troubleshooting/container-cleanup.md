# Container Cleanup

This document explains the recent cleanup of simplified test containers from the repository.

## Overview

As part of our ongoing efforts to streamline the codebase and remove unnecessary files, we have removed several simplified test container files that were previously used for testing ECS deployments.

## Removed Files

The following files have been removed:

- `Dockerfile.simple`
- `Dockerfile.simple2`
- `Dockerfile.simple3`
- `Dockerfile.simple4`

## Rationale for Removal

These simplified test containers were initially created to test ECS deployments with minimal configuration. They contained basic Node.js servers that returned simple HTML responses.

Now that we have a fully functional production Dockerfile and established deployment processes, these test containers are no longer needed. Removing them helps to:

1. Reduce repository clutter
2. Eliminate confusion about which Docker configuration to use
3. Standardize on a single, well-documented Docker setup

## Current Docker Configuration

The application now uses a single multi-stage Dockerfile that supports both development and production environments:

- **Development**: Uses the `development` target with live reloading
- **Production**: Uses the `runner` target with optimized build

For more information on the current Docker configuration, see the [DOCKER.md](../../DOCKER.md) file.

## Deployment Process

The application is deployed using AWS CodePipeline, which:

1. Builds the Docker image using the production configuration
2. Pushes the image to Amazon ECR
3. Updates the ECS service with the new image

This process is fully automated and does not require manual intervention or simplified test containers.
