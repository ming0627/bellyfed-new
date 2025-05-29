# ECS Fargate Stack (New Frontend Hosting Architecture)

> **IMPORTANT**: This is the new hosting architecture for the Bellyfed frontend. The application has been migrated from CloudFront with Lambda@Edge to ECS Fargate to support ISR (Incremental Static Regeneration).

This document details how ECS Fargate is used in the Bellyfed application for hosting the Next.js frontend with ISR support.

## Overview

The application uses AWS ECS Fargate for hosting the Next.js application with server-side rendering and ISR capabilities. This architectural approach improves the developer experience by enabling ISR, which allows for incremental updates to static pages without rebuilding the entire site.

## Migration from CloudFront with Lambda@Edge

The Bellyfed frontend was previously hosted on CloudFront with Lambda@Edge but has been migrated to ECS Fargate for the following benefits:

1. **ISR Support**: ECS Fargate enables ISR, which allows for incremental updates to static pages
2. **Server-Side Rendering**: Full support for Next.js server-side rendering capabilities
3. **Simplified Architecture**: No need for complex Lambda@Edge functions for routing and authentication
4. **Improved Developer Experience**: Better alignment with Next.js development practices

## ECS Fargate Stack

The ECS Fargate stack is defined in `EcsFargateStack` in the CDK codebase with the following features:

- VPC with public and private subnets
- ECS cluster with Fargate launch type
- Application Load Balancer for routing traffic
- Custom domain name with SSL/TLS
- Auto-scaling capabilities
- ECR repository for Docker images

## Next.js Configuration

The Next.js application is configured for server-side rendering and ISR:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure for server-side rendering with ISR support
    // Remove static export configuration to enable ISR

    // Image configuration for server-side rendering
    images: {
        domains: [
            'bellyfed-assets.s3.ap-southeast-1.amazonaws.com',
            'images.unsplash.com',
            'source.unsplash.com',
            'ui-avatars.com',
            'maps.googleapis.com',
        ],
        // Enable image optimization for server-side rendering
        unoptimized: false,
    },

    // Define trailingSlash to ensure consistent URL handling
    trailingSlash: true,

    // Define custom build script to handle country paths
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/my',
            },
        ];
    },
};
```

## Deployment Process

The deployment process for the ECS Fargate and Next.js integration involves:

1. Building the Next.js application as a Docker image
2. Pushing the Docker image to ECR
3. Deploying the Docker image to ECS Fargate
4. Updating the ECS service with the new image

```bash
# Build Docker image
docker build -t bellyfed-frontend .

# Tag the image for ECR
docker tag bellyfed-frontend:latest $ECR_REPOSITORY_URI:latest

# Push the image to ECR
docker push $ECR_REPOSITORY_URI:latest

# Update the ECS service
aws ecs update-service --cluster bellyfed-cluster --service bellyfed-service --force-new-deployment
```

## Best Practices

1. **Container Optimization**: Optimize Docker images for size and security
2. **Resource Allocation**: Configure appropriate CPU and memory for Fargate tasks
3. **Auto-Scaling**: Set up auto-scaling based on CPU and memory utilization
4. **Health Checks**: Configure health checks for the Application Load Balancer using the standardized `/health` endpoint
5. **Logging**: Enable CloudWatch logging for ECS tasks
6. **Monitoring**: Set up CloudWatch alarms for key metrics

## Troubleshooting

1. **Service Deployment Issues**: Check ECS service events and task status
2. **Container Startup Failures**: Check CloudWatch logs for container startup issues
3. **Health Check Failures**: Verify that the `/health` endpoint is accessible and returning a 200 status code
4. **Load Balancer Issues**: Verify target group health checks and routing rules
5. **DNS Issues**: Ensure Route53 records are correctly configured

## Health Check Configuration

The ECS Fargate stack uses a standardized health check approach:

1. **Target Group Health Check**: The ALB target group is configured to check the `/health` endpoint
2. **Container Health Check**: The container is configured to check the `/health` endpoint
3. **Next.js Health Endpoint**: A dedicated `/health` endpoint is implemented in the Next.js application

For more details, see the [Health Check Standardization](./health-check-standardization.md) documentation.

## References

- [AWS ECS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [AWS CDK ECS Patterns](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ecs-patterns-readme.html)
- [Health Check Standardization](./health-check-standardization.md)
