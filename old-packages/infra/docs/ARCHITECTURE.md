# Bellyfed System Architecture

## Overview

Bellyfed uses a modern cloud-native architecture with a serverless approach for maximum scalability and cost efficiency. This document provides a high-level overview of the system architecture.

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│ Application │────▶│  ECS Fargate │
└─────────────┘     │ Load Balancer│     │  (Next.js)  │
                    └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ API Gateway │
                                        └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ EventBridge │◀───▶│   Lambda    │────▶│   Aurora    │
└─────────────┘     └─────────────┘     │ PostgreSQL  │
                                        └─────────────┘
```

## Key Components

### Frontend

- **Next.js**: React-based framework for the web application
- **ECS Fargate**: Container service for hosting the Next.js application with ISR support
- **Application Load Balancer**: Load balancing and routing for the ECS Fargate service
- **ECR**: Container registry for storing Docker images

### Backend

- **API Gateway**: RESTful API endpoints
- **Lambda**: Serverless compute for business logic
- **EventBridge**: Event bus for asynchronous processing
- **Aurora PostgreSQL**: Primary database for all application data

## Migration to ECS Fargate

The frontend was previously hosted on CloudFront with Lambda@Edge but has been migrated to ECS Fargate for improved ISR support, better developer experience, and simplified architecture.

### Benefits of the Migration

1. **ISR Support**: ECS Fargate enables ISR, which allows for incremental updates to static pages
2. **Server-Side Rendering**: Full support for Next.js server-side rendering capabilities
3. **Simplified Architecture**: No need for complex Lambda@Edge functions for routing and authentication
4. **Improved Developer Experience**: Better alignment with Next.js development practices

### Current Implementation

The ECS Fargate deployment is configured with:

- Application Load Balancer for routing traffic
- ECS Fargate service for hosting the Next.js application
- ECR repository for storing Docker images
- Route 53 for DNS routing

For detailed implementation information, see [ECS Fargate Stack](./TECH/ecs-fargate-stack.md).

## Data Flow

### Request Flow

1. User requests arrive at the Application Load Balancer
2. Requests are routed to the ECS Fargate service
3. Next.js application handles the request (SSR or ISR)
4. API requests are forwarded to API Gateway
5. Lambda functions process API requests
6. Data is retrieved from or stored in Aurora PostgreSQL
7. Responses flow back through the same path

### Event Flow

1. API requests generate events sent to EventBridge
2. EventBridge routes events to appropriate Lambda functions
3. Lambda functions process events asynchronously
4. Results are stored in the database or trigger additional events

## Security

- **Authentication**: Amazon Cognito for user authentication
- **Authorization**: IAM roles and policies for service-to-service authentication
- **Data Protection**: Encryption at rest and in transit
- **Network Security**: VPC for database isolation

## Monitoring and Observability

- **CloudWatch**: Metrics, logs, and alarms
- **X-Ray**: Distributed tracing
- **CloudTrail**: API activity monitoring

## Future Enhancements

- **Phase 2 Database Architecture**: Addition of DynamoDB for high-performance read patterns
- **Enhanced Event Processing**: Amazon MSK Serverless for event streaming
- **Data Synchronization**: Debezium for change data capture

## Related Documentation

- [ECS Fargate Stack](./TECH/ecs-fargate-stack.md)
- [Database Architecture](./TECH/architecture/database-architecture.md)
- [System Overview](./TECH/architecture/system-overview.md)

_Last updated: July 22, 2024_
