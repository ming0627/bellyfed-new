# Frontend Deployment Documentation

This directory contains documentation related to the deployment of the Bellyfed frontend application.

## Main Documentation

- [Frontend Deployment Guide](./frontend-deployment.md) - Comprehensive guide for deploying the frontend application using AWS CodePipeline

## Key Scripts

The following scripts are available for frontend deployment:

- `scripts/deploy-frontend-cicd.sh` - Deploys the Frontend CICD Stack using CDK
- `scripts/update-frontend-pipeline.sh` - Triggers a new execution of the existing pipeline (recommended for most cases)

## Quick Reference

For most day-to-day operations, use the following workflow:

1. Make changes to the frontend code in the `bellyfed` repository
2. Follow the standard Git workflow (commit, push, create PR)
3. After merging to the appropriate branch, the pipeline will automatically deploy the changes

If you need to manually trigger a deployment without changing the pipeline configuration:

```bash
./scripts/update-frontend-pipeline.sh dev  # For dev environment
```

For more detailed instructions, refer to the [Frontend Deployment Guide](./frontend-deployment.md).
