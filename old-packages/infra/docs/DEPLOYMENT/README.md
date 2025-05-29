# Deployment Documentation

This directory contains documentation related to the deployment process for Bellyfed.

## Quick Start

To deploy to a new environment:

```bash
./scripts/deploy-environment.sh <environment> [options]
```

Options:

- `--bootstrap`: Bootstrap the environment first

## Deployment Guides

- [Deployment Order](./deployment-order.md) - Recommended order for deploying stacks
- [CICD Deployment Cheatsheet](./cicd-deployment-cheatsheet.md) - Quick reference for common deployment tasks

### Frontend Deployment

- [Frontend Deployment Guide](./frontend/frontend-deployment.md) - Comprehensive guide for deploying the frontend application
- [Frontend Deployment Scripts](./frontend/README.md) - Overview of frontend deployment scripts and workflows

### CICD

- [Deployment Coordinator Guide](./cicd/deployment-coordinator.md) - How the deployment coordinator manages dependencies
- [General Deployment Guide](./cicd/deployment-guide.md) - General guidance for deployments

### ECS Deployment

- [ECS Fargate Stack](./ecs/ecs-fargate-stack.md) - Details about the ECS Fargate stack
- [Split ECS Architecture](./ecs/split-ecs-architecture.md) - Information about the split ECS architecture
- [ECS Cost Optimization](./ecs/ecs-cost-optimization.md) - Strategies for optimizing ECS costs

## Key Scripts

- `scripts/deploy-environment.sh`: Main script for deploying to new environments
- `scripts/deploy-frontend-cicd.sh`: Deploys the Frontend CICD Stack using CDK
- `scripts/update-frontend-pipeline.sh`: Triggers a new execution of the existing frontend pipeline

## Deployment Process Overview

The deployment process follows these steps:

1. **Bootstrap** the environment (if needed)
2. **Create the ECR repository** for Docker images
3. **Deploy the infrastructure stacks** in the correct order (see [Deployment Order](./deployment-order.md))
4. **Deploy the CICD stacks** to set up the pipelines
5. **Deploy the service stacks** to create the ECS services

For frontend-specific deployments, refer to the [Frontend Deployment Guide](./frontend/frontend-deployment.md).
