# Bellyfed Infrastructure Architecture

This document provides a detailed overview of the Bellyfed infrastructure architecture.

## AWS Infrastructure

The Bellyfed platform is built on AWS using the following services:

### Compute

- **ECS Fargate**: Hosts the Next.js application

    - Serverless container orchestration
    - Auto-scaling based on CPU and memory utilization
    - Managed by CDK infrastructure code

- **Lambda**: Serverless compute for API handlers and background processing
    - API handlers for RESTful endpoints
    - Event processors for asynchronous tasks
    - Scheduled tasks for maintenance and data processing

### Networking

- **VPC**: Isolated network environment

    - Public and private subnets across multiple availability zones
    - NAT gateways for outbound internet access
    - VPC endpoints for AWS service access

- **Application Load Balancer**: Routes traffic to the ECS service

    - SSL/TLS termination
    - Health checks and automatic failover
    - Path-based routing

- **Route 53**: DNS management
    - Domain registration and management
    - Health checks and failover routing
    - Latency-based routing

### Storage

- **Aurora PostgreSQL**: Primary database for structured data

    - Multi-AZ deployment for high availability
    - Automated backups and point-in-time recovery
    - Serverless v2 for cost optimization

- **DynamoDB**: NoSQL database for high-throughput data

    - On-demand capacity for cost optimization
    - Global tables for multi-region availability
    - Point-in-time recovery

- **S3**: Object storage for static assets and files

    - Versioning for file history
    - Lifecycle policies for cost optimization
    - Server-side encryption for security

- **EFS**: Elastic File System for persistent storage
    - Used by Typesense for data persistence
    - Shared storage for ECS tasks
    - Automatic backups

### Security

- **Cognito**: User authentication and authorization

    - User pools for authentication
    - Identity pools for AWS service access
    - Multi-factor authentication

- **IAM**: Identity and access management

    - Least privilege principle
    - Role-based access control
    - Service-linked roles

- **ACM**: SSL/TLS certificate management

    - Automatic certificate renewal
    - Wildcard certificates for subdomains
    - Certificate validation via DNS

- **Security Groups**: Firewall for EC2 instances and ECS tasks
    - Inbound and outbound rules
    - Service-to-service communication
    - Least privilege principle

### Integration

- **EventBridge**: Event-driven architecture for system integration

    - Custom event buses for domain events
    - Event rules for routing
    - Event patterns for filtering

- **API Gateway**: RESTful API endpoints

    - API key management
    - Request validation
    - Usage plans and throttling

- **SQS**: Message queuing for asynchronous processing
    - Dead-letter queues for error handling
    - FIFO queues for ordered processing
    - Standard queues for high throughput

### Monitoring

- **CloudWatch**: Monitoring and logging

    - Metrics for performance monitoring
    - Logs for troubleshooting
    - Alarms for alerting
    - Dashboards for visualization

- **X-Ray**: Distributed tracing
    - End-to-end request tracing
    - Service map visualization
    - Performance bottleneck identification

### DevOps

- **CodePipeline**: CI/CD pipeline for automated deployments

    - Source stage for code retrieval
    - Build stage for compilation and testing
    - Deploy stage for infrastructure and application deployment

- **CodeBuild**: Build and test automation

    - Custom build environments
    - Test execution
    - Artifact generation

- **CloudFormation**: Infrastructure as Code via CDK
    - Stack management
    - Change sets for safe deployments
    - Stack policies for protection

## Infrastructure as Code

The Bellyfed infrastructure is defined using the AWS Cloud Development Kit (CDK) in TypeScript. The CDK code is organized into stacks:

### Core Stacks

- **NetworkStack**: VPC, subnets, and networking components
- **AuroraStack**: Aurora PostgreSQL database
- **DynamoDBStack**: DynamoDB tables
- **CognitoStack**: User authentication and authorization

### Application Stacks

- **EcsInfrastructureStack**: ECS cluster, VPC, and networking
- **EcsServiceStack**: ECS service, task definition, and container
- **ApiGatewayStack**: API Gateway and Lambda integrations
- **LambdaStack**: Lambda functions for API handlers

### Search Stacks

- **TypesenseInfrastructureStack**: Typesense ECS infrastructure
- **TypesenseServiceStack**: Typesense ECS service
- **TypesenseLambdaStack**: Lambda functions for Typesense integration

### DevOps Stacks

- **CicdStack**: CI/CD pipeline for backend
- **FrontendCicdStack**: CI/CD pipeline for frontend
- **MonitoringStack**: CloudWatch dashboards and alarms

## Deployment Environments

The infrastructure is deployed to multiple environments:

- **Development (dev)**:

    - Minimal resources for cost optimization
    - Shared database for simplicity
    - Single instance of each service

- **Testing (test)**:

    - Similar to development but isolated
    - Used for QA and testing
    - Automated testing environment

- **Staging (staging)**:

    - Production-like environment
    - Used for pre-production validation
    - Full-scale resources

- **Production (prod)**:
    - Highly available and scalable
    - Multi-AZ deployment
    - Auto-scaling for all services

## Security Architecture

The infrastructure implements security at multiple levels:

### Network Security

- **VPC**: Isolated network environment
- **Security Groups**: Firewall for EC2 instances and ECS tasks
- **Network ACLs**: Stateless firewall for subnets
- **Private Subnets**: Resources not directly accessible from the internet

### Data Security

- **Encryption at Rest**: All data stored in AWS services is encrypted
- **Encryption in Transit**: All communication uses HTTPS/TLS
- **IAM Policies**: Least privilege access to data
- **S3 Bucket Policies**: Restrict access to S3 buckets

### Application Security

- **Input Validation**: Validate all user input
- **Output Encoding**: Encode all output to prevent XSS
- **CSRF Protection**: Prevent cross-site request forgery
- **Content Security Policy**: Restrict resource loading

### Authentication and Authorization

- **Cognito**: User authentication and authorization
- **JWT Tokens**: Secure, short-lived tokens
- **IAM Roles**: Role-based access control
- **Resource Policies**: Control access to AWS resources

## Disaster Recovery

The infrastructure implements disaster recovery through:

### Backups

- **Aurora Backups**: Automated daily backups with 7-day retention
- **DynamoDB Backups**: Point-in-time recovery
- **S3 Versioning**: File version history
- **EFS Backups**: Automated daily backups

### High Availability

- **Multi-AZ**: Resources deployed across multiple availability zones
- **Auto-Scaling**: Automatic scaling based on demand
- **Load Balancing**: Distribute traffic across healthy instances
- **Health Checks**: Automatic detection and replacement of unhealthy instances

### Infrastructure as Code

- **CDK**: Infrastructure defined as code
- **Version Control**: Infrastructure code in Git
- **CI/CD**: Automated deployment of infrastructure
- **Testing**: Infrastructure tests in CI/CD pipeline

## Resources

- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
