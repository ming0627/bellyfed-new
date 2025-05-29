# Bellyfed Architecture Overview

This document provides a high-level overview of the Bellyfed platform architecture.

## System Architecture

The Bellyfed platform is built on AWS using a serverless-first approach with the following key components:

### Frontend

- **Next.js Application**: Server-side rendered React application
- **ECS Fargate**: Hosts the Next.js application
- **Application Load Balancer**: Routes traffic to the ECS service
- **Route 53**: DNS management
- **ACM**: SSL/TLS certificate management

### Backend

- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Serverless compute for API handlers
- **Aurora PostgreSQL**: Primary database for structured data
- **DynamoDB**: NoSQL database for high-throughput data
- **Cognito**: User authentication and authorization
- **S3**: Object storage for static assets and files
- **EventBridge**: Event-driven architecture for system integration
- **Typesense**: Fast, typo-tolerant search engine

### DevOps

- **CodePipeline**: CI/CD pipeline for automated deployments
- **CodeBuild**: Build and test automation
- **CloudWatch**: Monitoring and logging
- **CloudFormation**: Infrastructure as Code via CDK

## Repository Structure

The Bellyfed platform is split across two main repositories:

### Frontend Repository (`bellyfed`)

Contains the Next.js application code:

- **Pages**: Next.js pages and API routes
- **Components**: React components
- **Styles**: CSS and styling
- **Utils**: Utility functions and helpers
- **Public**: Static assets

### Infrastructure Repository (`bellyfed-infra`)

Contains the infrastructure code:

- **lib/**: CDK stack definitions
    - **ecs/**: ECS Fargate stacks
    - **typesense/**: Typesense stacks
    - **aurora/**: Database stacks
    - **api/**: API Gateway stacks
- **functions/**: Lambda function code
- **bin/**: CDK entry points
- **docs/**: Documentation

## Key Components

### Authentication

User authentication is handled by Amazon Cognito, which provides:

- User registration and sign-in
- Social identity federation
- Multi-factor authentication
- User profile management

### Database

The platform uses a combination of databases:

- **Aurora PostgreSQL**: Primary database for structured data
    - User profiles
    - Restaurant data
    - Dish data
    - Rankings and reviews
- **DynamoDB**: NoSQL database for high-throughput data
    - Session data
    - Real-time analytics
    - Caching

### Search

The platform uses Typesense for fast, typo-tolerant search:

- **Dish Search**: Search for dishes by name, type, restaurant, etc.
- **Restaurant Search**: Search for restaurants by name, location, cuisine, etc. (planned)
- **User Search**: Search for users by name, expertise, etc. (planned)

### API

The platform provides a RESTful API for frontend and third-party integration:

- **Authentication API**: User registration, login, and profile management
- **Restaurant API**: Restaurant data and management
- **Dish API**: Dish data and management
- **Ranking API**: One-Best Ranking System
- **Search API**: Typesense-powered search

## Deployment Environments

The platform is deployed to multiple environments:

- **Development (dev)**: For active development
- **Testing (test)**: For QA and testing
- **Staging (staging)**: For pre-production validation
- **Production (prod)**: For end users

Each environment has its own isolated infrastructure and database.

## Security

The platform implements security at multiple levels:

- **Network**: VPC, security groups, and network ACLs
- **Application**: Input validation, output encoding, and CSRF protection
- **Authentication**: Cognito with MFA and JWT tokens
- **Authorization**: IAM roles and policies
- **Data**: Encryption at rest and in transit

## Monitoring and Logging

The platform uses CloudWatch for monitoring and logging:

- **Metrics**: CPU, memory, and request metrics
- **Logs**: Application and infrastructure logs
- **Alarms**: Alerts for critical issues
- **Dashboards**: Visualization of system health

## Disaster Recovery

The platform implements disaster recovery through:

- **Backups**: Regular database backups
- **Multi-AZ**: High availability across multiple availability zones
- **Infrastructure as Code**: Reproducible infrastructure

## Resources

- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
