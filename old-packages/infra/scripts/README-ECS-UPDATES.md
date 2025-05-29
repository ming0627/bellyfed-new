# ECS Environment Variable Update Scripts

This directory contains scripts to help manage ECS deployments and environment variables without requiring a full CloudFormation stack update.

## Quick Environment Variable Updates

### Using the `update-ecs-env-vars.sh` Script

This script allows you to update environment variables in your ECS task definition and force a new deployment without waiting for a full CloudFormation stack update.

```bash
# Make the script executable (first time only)
chmod +x scripts/update-ecs-env-vars.sh

# Run the script for a specific environment
./scripts/update-ecs-env-vars.sh dev
```

The script provides three options:

1. **Add/update a specific environment variable**: Interactively add or update a single environment variable
2. **Update all environment variables from a file**: Replace all environment variables with those defined in a JSON file
3. **Force a new deployment with current variables**: Just redeploy the current task definition

### Using a JSON File for Environment Variables

For option 2, you can use a JSON file like `env-vars-example.json` to define all your environment variables:

```json
[
  {
    "name": "NODE_ENV",
    "value": "production"
  },
  {
    "name": "ENVIRONMENT",
    "value": "dev"
  },
  ...
]
```

## Optimized ECS Deployment Settings

The ECS Fargate stack has been optimized for faster deployments with the following changes:

1. **Reduced health check interval**: From 60 seconds to 30 seconds
2. **Reduced health check timeout**: From 30 seconds to 15 seconds
3. **Reduced unhealthy threshold count**: From 5 to 3
4. **Reduced health check grace period**: From 120 seconds to 60 seconds
5. **Added deployment circuit breaker**: Automatically rolls back failed deployments

These changes should significantly reduce the time it takes for ECS deployments to complete.

## When to Use These Scripts vs. CloudFormation

- **Use the scripts for**: Quick environment variable updates, forcing redeployments, or any changes that only affect the task definition
- **Use CloudFormation for**: Infrastructure changes (VPC, security groups, load balancer settings, etc.)

## Troubleshooting

If you encounter issues with the scripts:

1. Check that you have the AWS CLI installed and configured with the correct credentials
2. Verify that the task definition family name is correct (it may change if the CloudFormation stack is recreated)
3. Check the AWS ECS console for any deployment errors

For persistent issues, you may need to fall back to the CloudFormation deployment process.
