# Bellyfed Deployment

This directory contains documentation and scripts related to the deployment process for Bellyfed.

## Quick Start

To deploy to a new environment:

```bash
./scripts/deploy-environment.sh <environment> [options]
```

Options:

- `--bootstrap`: Bootstrap the environment first
- `--use-fallback-image`: Use a fallback image (nginx:alpine) for the ECS service
- `--push-image`: Build and push a Docker image to ECR
- `--deploy-cicd-only`: Deploy only the CICD stack

## Documentation

- [Deployment Coordinator Guide](./deployment-coordinator.md): Comprehensive guide to the deployment coordination system
- [Deployment Guide](./deployment-guide.md): General deployment process and best practices

## Scripts

- `scripts/deploy-environment.sh`: Main script for deploying to new environments
- `scripts/fix-ecs-service.sh`: Script for fixing ECS services with missing images

## Deployment Process Overview

The deployment process follows these steps:

1. **Bootstrap** the environment (if needed)
2. **Create the ECR repository** for Docker images
3. **Deploy the Deployment Coordinator Stack** to manage dependencies
4. **Build and push Docker images** (if needed)
5. **Deploy all stacks** with appropriate options

For more details, see the [Deployment Coordinator Guide](./deployment-coordinator.md).
