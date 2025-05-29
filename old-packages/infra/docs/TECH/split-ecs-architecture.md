# Split ECS Architecture

This document describes the split architecture for ECS deployments in the Bellyfed application.

## Overview

The split architecture separates the ECS infrastructure from the ECS service, allowing for faster and more reliable deployments. This approach has several benefits:

1. **Independent Deployments**: You can update the service without touching the infrastructure
2. **Faster Deployments**: Service updates are much faster since they don't need to validate infrastructure
3. **Reduced Risk**: If a service deployment fails, your infrastructure remains intact
4. **Better Testing**: You can test service changes without risking infrastructure stability

## Architecture Components

The split architecture consists of two separate CloudFormation stacks:

1. **Infrastructure Stack (`BellyfedEcsInfraStack-{env}`)**:

    - VPC and networking components
    - Security groups
    - Load balancer and target groups
    - ECS cluster
    - ECR repository
    - IAM roles and policies
    - CloudWatch log groups

2. **Service Stack (`BellyfedEcsServiceStack-{env}`)**:
    - ECS task definition
    - ECS service
    - Auto-scaling configuration
    - Container configuration

## Deployment Process

The deployment process for the split architecture is as follows:

1. Deploy the infrastructure stack (infrequently, only when infrastructure changes are needed)
2. Deploy the service stack (frequently, whenever the application code changes)

### Infrastructure Stack Deployment

```bash
# Deploy the infrastructure stack
./scripts/deploy-ecs-infra.sh dev
```

### Service Stack Deployment

```bash
# Deploy the service stack
./scripts/deploy-ecs-service.sh dev
```

### CI/CD Pipeline

The CI/CD pipeline has been updated to work with the split architecture. It now:

1. Builds the Docker image
2. Pushes the image to ECR
3. Updates the ECS service with the new image
4. Sets the desired count to 1 to start the service
5. Monitors the deployment status

## Troubleshooting

### Common Issues

1. **Service Deployment Failures**: If the service deployment fails, the infrastructure remains intact. You can fix the issue and redeploy the service without affecting the infrastructure.

2. **Task Definition Issues**: If the task definition is invalid, the service deployment will fail. Check the task definition for errors and redeploy the service.

3. **Container Health Check Failures**: If the container health check fails, the service will not be able to start. Verify that the `/health` endpoint is accessible and returning a 200 status code. Check the container logs for errors and fix the issue. See the [Health Check Standardization](./health-check-standardization.md) documentation for more details.

### Useful Commands

```bash
# Check the status of the ECS service
aws ecs describe-services --cluster bellyfed-dev --services bellyfed-dev-service

# Check the task definition
aws ecs describe-task-definition --task-definition bellyfed-dev-service:1

# Check the container logs
aws logs get-log-events --log-group-name /aws/ecs/bellyfed-dev --log-stream-name bellyfed-dev-container/bellyfed-dev-container/TASK_ID

# Check the target group health
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN
```

## Best Practices

1. **Infrastructure Changes**: Make infrastructure changes infrequently and test them thoroughly before deployment.

2. **Service Changes**: Make service changes frequently and deploy them independently of infrastructure changes.

3. **Monitoring**: Monitor the deployment status and check the container logs for errors.

4. **Rollback**: If a deployment fails, roll back to the previous version by updating the service with the previous task definition.

5. **Testing**: Test the application thoroughly before deployment to avoid deployment failures.

## Conclusion

The split architecture provides a more reliable and efficient way to deploy ECS services. By separating the infrastructure from the service, you can make changes to the application without affecting the underlying infrastructure, resulting in faster and more reliable deployments.
