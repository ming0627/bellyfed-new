# Bellyfed Codebase Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Directory Structure](#directory-structure)
3. [Configuration](#configuration)
4. [Dynamic Environments](#dynamic-environments)
5. [GitHub Actions Integration](#github-actions-integration)
6. [AWS CDK Stacks](#aws-cdk-stacks)
    - [Networking Stack](#networking-stack)
    - [Lambda Stack](#lambda-stack)
    - [Messaging Stack](#messaging-stack)
    - [EventBridge Stack](#eventbridge-stack)
    - [Aurora PostgreSQL Stack](#aurora-postgresql-stack)
    - [Cognito Stack](#cognito-stack)
    - [CI/CD Stack](#cicd-stack)
7. [Lambda Functions](#lambda-functions)
    - [Event Processor](#event-processor)
    - [Schema Setup](#schema-setup)
    - [Post Handler](#post-handler)
    - [Challenge Handler](#challenge-handler)
    - [Food Establishment Handler](#food-establishment-handler)
    - [Other Lambda Handlers](#other-lambda-handlers)
8. [Utilities and Constructs](#utilities-and-constructs)
    - [Environment Configuration](#environment-configuration)
    - [API Gateway with Lambda](#api-gateway-with-lambda)
    - [Resource Creators](#resource-creators)
9. [Testing](#testing)
10. [Types](#types)
11. [Common Patterns and Best Practices](#common-patterns-and-best-practices)
12. [Conclusion](#conclusion)

---

## Introduction

Bellyfed is a serverless application built using AWS services, TypeScript, and the AWS Cloud Development Kit (CDK). The project follows Event-Driven Architecture (EDA) principles, leveraging AWS Lambda, EventBridge, Aurora PostgreSQL, and other managed services to ensure scalability, maintainability, and efficient resource utilization.

This documentation provides a comprehensive overview of the codebase, detailing the purpose and functionality of each component within the `lib` directory.

---

## Directory Structure

```
lib/
├── config.ts
├── environmentConfig.ts
├── types.ts
├── networking-stack.ts
├── lambda-stack.ts
├── messaging-stack.ts
├── eventbridge-stack.ts
├── aurora-stack.ts
├── cognito-stack.ts
├── cicd-stack.ts
├── constructs/
│   └── lambdaWithRetry.ts
├── lambda/
│   ├── event-processor/
│   │   ├── handler.ts
│   │   └── middlewares/
│   │       ├── errorHandler.ts
│   │       └── inputValidation.ts
│   ├── schema-setup/
│   │   ├── schema/
│   │   │   ├── createChallengeTable.ts
│   │   │   ├── createChallengeParticipationTable.ts
│   │   │   ├── createComparisonTable.ts
│   │   │   ├── createComparisonVoteTable.ts
│   │   │   ├── createReviewTable.ts
│   │   │   └── createUserTable.ts
│   │   ├── index.ts
│   │   └── package.json
│   ├── post/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── challenge/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── food-establishment/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── registration-handler/
│   │   └── index.ts
│   ├── menu/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── competition/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── user-registration/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── menu-item/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── favorite/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── ranking/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── comment/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── like/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── promotion/
│   │   ├── handler.ts
│   │   └── package.json
│   ├── schema-setup/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── src/
│   └── shared-layer/
│       ├── nodejs/
│       │   ├── package.json
│       │   └── ...
├── utils/
│   └── resource-creators.ts
└── ...
```

.github/
├── workflows/
│ ├── create-environment.yml
│ └── cleanup-environment.yml
└── ISSUE_TEMPLATE/
├── environment-request.md
└── environment-cleanup.md

````

---

## Configuration

### `lib/config.ts`

Defines the configuration settings for dynamic environments. It includes settings for AWS regions, VPC configurations, Aurora PostgreSQL scaling options, Lambda function configurations, and GitHub repository details.

```typescript
export interface EnvironmentConfig {
  account: string;
  region: string;
  vpc: {
    maxAzs: number;
    natGateways: number;
    vpcCidr: string;
  };
  aurora: {
    minCapacity: number;
    maxCapacity: number;
    autoPauseMinutes: number;
  };
  lambda: {
    memorySize: number;
    timeout: number;
  };
  slackWebhookUrl: string;
}

export const CONFIG = {
  cicdRegion: 'ap-southeast-1', // CI/CD region
  region: 'ap-southeast-1', // Region for application resources
  github: {
    owner: 'ming0627',
    repo: 'bellyfed-infra',
    oauthSecretName: 'github-oauth-token',
  },
  // Default environment configurations
  defaultEnvironmentConfigs: {
    prod: {
      // Production environment configurations
    },
    qa: {
      // QA environment configurations
    },
    dev: {
      // Development environment configurations
    }
  },
  // Get environment config based on branch name
  getEnvironmentConfig: (environment: string): EnvironmentConfig => {
    // Implementation details
  }
} as const;
````

---

## Dynamic Environments

The infrastructure now supports dynamic environment creation based on Git branches. This feature allows developers to create isolated environments for feature development, testing, or experimentation.

### Environment Architecture

Each environment is completely isolated and includes:

1. **Networking Layer**:

    - Virtual Private Cloud (VPC)
    - Public and private subnets
    - NAT gateways
    - Security groups

2. **Database Layer**:

    - Aurora PostgreSQL Serverless v2 cluster
    - Auto-scaling configuration
    - Database parameter groups

3. **Compute Layer**:

    - Lambda functions
    - API Gateway endpoints
    - Event processing

4. **Monitoring Layer**:
    - CloudWatch alarms
    - Log groups
    - SNS notifications

### Environment Naming Conventions

Environment names should follow these conventions:

- Use lowercase alphanumeric characters or hyphens
- For feature branches, use the format `feature-name`
- For developer environments, use the format `dev-username`
- For release branches, use the format `release-version`

### Environment Lifecycle

The typical lifecycle of an environment is:

1. **Creation**: Initiated via GitHub issue
2. **Deployment**: Resources deployed via CDK
3. **Usage**: Development and testing
4. **Cleanup**: Resources removed when no longer needed

---

## GitHub Actions Integration

The infrastructure uses GitHub Actions to automate environment management without requiring local deployment.

### Environment Creation Workflow

**File:** `.github/workflows/create-environment.yml`

This workflow is triggered when an issue is created with the `environment-request` label. It:

1. Parses the environment name and branch from the issue
2. Sets up AWS credentials
3. Bootstraps the CDK environment
4. Deploys all resources
5. Updates the issue with progress and results

### Environment Cleanup Workflow

**File:** `.github/workflows/cleanup-environment.yml`

This workflow is triggered when an issue is created with the `environment-cleanup` label. It:

1. Parses the environment name from the issue
2. Identifies all AWS CloudFormation stacks associated with the environment
3. Deletes the stacks in the correct order
4. Updates the issue with progress and results

### Issue Templates

**Files:**

- `.github/ISSUE_TEMPLATE/environment-request.md`
- `.github/ISSUE_TEMPLATE/environment-cleanup.md`

These templates provide structured forms for users to request new environments or cleanup of existing environments. They include fields for:

- Environment name
- Branch name
- Purpose
- Expected lifetime
- Approval signatures

### Required GitHub Secrets

For the workflows to function properly, the following secrets must be configured in the GitHub repository:

- `AWS_ROLE_TO_ASSUME`: ARN of an IAM role that has permissions to deploy the CDK stacks

---

## AWS CDK Stacks

### Networking Stack

**File:** `lib/networking-stack.ts`

**Purpose:**  
Sets up the Virtual Private Cloud (VPC) infrastructure for the application. It configures subnets, NAT gateways, and outputs the VPC and subnet IDs for reference.

**Key Components:**

- **VPC Configuration:**  
  Creates a VPC with public, private with egress, and isolated subnets based on environment-specific settings.

- **Outputs:**  
  Provides the VPC ID and subnet IDs for use in other stacks or for reference.

### Lambda Stack

**File:** `lib/lambda-stack.ts`

**Purpose:**  
Deploys all Lambda functions required by the application. It sets up centralized Dead-Letter Queue (DLQ) notifications via SNS and organizes Lambda functions with retry mechanisms.

**Key Components:**

- **Centralized DLQ Topic:**  
  An SNS topic that collects DLQ notifications from all Lambda functions.

- **Slack Notification Lambda:**  
  A Lambda function that processes DLQ notifications and sends them to Slack.

- **Lambda Functions with Retry:**  
  Deploys individual Lambda functions with retry configurations and associates them with the centralized DLQ.

### Messaging Stack

**File:** `lib/messaging-stack.ts`

**Purpose:**  
Sets up the messaging infrastructure using SNS and SQS. It creates an SNS topic and an SQS queue, subscribing the queue to the topic for reliable message delivery.

**Key Components:**

- **SNS Topic:**  
  Centralized topic for application events.

- **SQS Queue:**  
  Queue subscribed to the SNS topic to receive messages.

### EventBridge Stack

**File:** `lib/eventbridge-stack.ts`

**Purpose:**  
Manages the EventBridge event bus and sets up rules to route events to corresponding Lambda functions.

**Key Components:**

- **Custom Event Bus:**  
  Dedicated event bus for Bellyfed events.

- **Event Rules:**  
  Define event patterns to trigger Lambda functions based on specific event types.

- **Lambda Targets:**  
  Associates Lambda functions with EventBridge rules for event processing.

### Aurora PostgreSQL Stack

**File:** `lib/aurora-stack.ts`

**Purpose:**  
Deploys Aurora PostgreSQL Serverless v2 database used by the application. This stack provides a highly scalable, managed relational database that serves as the primary data store for all application entities.

**Key Components:**

- **Aurora Serverless v2 Cluster:**  
  A PostgreSQL-compatible Aurora cluster that automatically scales compute capacity based on application demand.

- **Security Group:**  
  Controls network access to the database cluster, allowing connections only from approved sources.

- **Subnet Group:**  
  Defines which subnets in the VPC can host database instances.

- **Parameter Group:**  
  Configures PostgreSQL settings for optimal performance.

- **Secrets Manager Integration:**  
  Stores and manages database credentials securely using AWS Secrets Manager.

- **Auto-Pause Configuration:**  
  Automatically pauses the database after a period of inactivity to reduce costs in development environments.

- **SSM Parameters:**  
  Exports database connection details as SSM parameters for use by other stacks and components.

### Cognito Stack

**File:** `lib/cognito-stack.ts`

**Purpose:**  
[Details not provided in the code snippets.]

**Note:**  
The Cognito Stack likely manages user authentication and authorization using AWS Cognito, setting up user pools, identity pools, and related configurations.

### CI/CD Stack

**File:** `lib/cicd-stack.ts`

**Purpose:**  
Sets up the Continuous Integration and Continuous Deployment pipelines using AWS CodePipeline, CodeBuild, and integrates with GitHub for source control. Creates dynamic pipelines for environments based on branch names.

**Key Components:**

- **Dynamic Environment Pipelines:**  
  Creates pipelines based on Git branch names, enabling isolated environments for feature development.

- **Approval Gates:**  
  Includes manual approval stages for production deployments to ensure controlled releases.

- **CodeBuild Projects:**  
  Compiles and builds the application using specified commands and environment variables.

- **Database Migration Stages:**  
  Sequential deployment of database migrations with appropriate safety checks.

- **Documentation Sync:**  
  Automatically updates documentation based on code changes.

- **Notification System:**  
  Alerts stakeholders about pipeline status (started, successful, failed) via SNS topics.

- **IAM Roles and Permissions:**  
  Grants necessary permissions for the CI/CD processes to interact with AWS resources.

## Lambda Functions

### Event Processor

**File:** `lib/lambda/event-processor/handler.ts`

**Purpose:**  
Handles incoming events, processes them, and dispatches them to EventBridge for further processing. It supports different event sources such as Cognito triggers and API Gateway events.

**Key Components:**

- **Middleware Integration:**  
  Utilizes Middy for middleware functionalities like input validation, error handling, and tracing.

- **Event Processing:**  
  Standardizes incoming events and sends them to EventBridge.

### Schema Setup

**File:** `lib/lambda/schema-setup/schema/index.ts`

**Purpose:**  
Initializes the database schema by executing a series of table creation functions using a PostgreSQL client.

**Key Components:**

- **Schema Setup Functions:**  
  Sequentially creates tables in the database.

### Post Handler

**File:** `lib/lambda/post/handler.ts`

**Purpose:**  
Processes "New Post" events by performing actions such as indexing the post for search, notifying relevant users, and updating analytics.

**Key Components:**

- **Event Handling:**  
  Extracts details from the event and performs sequential processing steps.

### Challenge Handler

**File:** `lib/lambda/challenge/handler.ts`

**Purpose:**  
Handles "Challenge Started" and "Challenge Ended" events by performing actions such as notifying participants, initializing challenge data, announcing winners, and updating user achievements.

**Key Components:**

- **Event Type Handling:**  
  Differentiates between challenge start and end events to execute appropriate logic.

### Food Establishment Handler

**File:** `lib/lambda/food-establishment/handler.ts`

**Purpose:**  
Handles events related to food establishment creation by adding establishments to the search index and notifying nearby users.

**Key Components:**

- **Event Processing:**  
  Executes actions based on food establishment creation events.

### Other Lambda Handlers

**Folders and Files:**

- `registration-handler/index.ts`
- `menu/handler.ts`
- `competition/handler.ts`
- `user-registration/handler.ts`
- `menu-item/handler.ts`
- `favorite/handler.ts`
- `ranking/handler.ts`
- `comment/handler.ts`
- `like/handler.ts`
- `promotion/handler.ts`

**Purpose:**  
Each Lambda handler is responsible for processing specific event types related to different aspects of the application, such as user registrations, menu management, competitions, favorites, rankings, comments, likes, and promotions.

**Example:**

#### Like Handler

**File:** `lib/lambda/like/handler.ts`

**Purpose:**  
Processes "Like" events by updating the like count of posts and notifying users if necessary.

## Utilities and Constructs

### Environment Configuration

**File:** `lib/environmentConfig.ts`

**Purpose:**  
Manages environment-specific configurations dynamically based on environment names. Ensures that the appropriate configuration is used based on the deployment environment.

**Key Components:**

- **Singleton Pattern:**  
  Ensures a single instance of the environment configuration throughout the application.

- **Dynamic Configuration Retrieval:**  
  Fetches environment-specific settings from the `CONFIG` object based on the environment name.

### API Gateway with Lambda

**File:** `lib/constructs/apiGatewayWithLambda.ts`

**Purpose:**  
A reusable construct that integrates AWS API Gateway with Lambda functions. It simplifies the creation of API endpoints routed to specific Lambda handlers.

**Key Components:**

- **Lambda Integration:**  
  Connects a Lambda function to an API Gateway resource and method.

- **Flexible Configuration:**  
  Supports both creating new APIs and integrating with existing APIs.

### Resource Creators

**File:** `lib/utils/resource-creators.ts`

**Purpose:**  
Contains utility functions for creating AWS resources programmatically. This promotes code reuse and modularity across the codebase.

## Testing

### Event Processor Handler Tests

**File:** `lib/lambda/event-processor/handler.test.ts`

**Purpose:**  
Tests the Event Processor Lambda function to ensure it correctly processes different event types and handles errors gracefully.

**Key Components:**

- **Mocks:**

    - Middy middleware
    - AWS EventBridge Client
    - UUID generation
    - Event utility functions

- **Test Cases:**
    - Processing Cognito trigger events
    - Processing API Gateway events
    - Utilizing existing trace IDs
    - Handling errors during processing
    - Handling unrecognized event types
    - Processing Cognito post-sign-up events and triggering verification emails

---

## Types

**File:** `lib/types.ts`

**Purpose:**  
Defines TypeScript types used throughout the application for type safety and clarity.

**Code Overview:**

```typescript:lib/types.ts
export type BranchName = string;
export type Environment = string;
```

---

## Common Patterns and Best Practices

- **Dynamic Environment Configuration:**  
  Utilizes a centralized configuration file (`config.ts`) and environment-specific settings to manage different deployment environments seamlessly, including on-demand environments.

- **GitHub Actions for Automation:**  
  Leverages GitHub Actions for automated environment provisioning and cleanup, reducing manual intervention.

- **Issue-Based Workflow:**  
  Uses GitHub Issues as a user interface for requesting and managing environments, providing a clear audit trail and documentation.

- **Environment-Driven Configuration:**  
  Utilizes a centralized configuration file (`config.ts`) and environment-specific settings to manage different deployment environments seamlessly.

- **Modular Constructs:**  
  Employs reusable AWS CDK constructs like `ApiGatewayWithLambda` and `LambdaWithRetry` to promote code reuse and maintainability.

- **Event-Driven Architecture:**  
  Leverages AWS EventBridge to handle and route events efficiently, ensuring decoupled and scalable services.

- **Infrastructure as Code (IaC):**  
  Manages all AWS resources using AWS CDK, ensuring consistency and ease of maintenance through code.

- **TypeScript Usage:**  
  Ensures type safety across the codebase by defining explicit types and interfaces, avoiding the use of `any`.

- **Lambda Best Practices:**  
  Configures Lambda functions with appropriate memory sizes, timeouts, and integrates retry mechanisms to handle failures gracefully.

- **Security:**  
  Applies least privilege principles by defining tight IAM policies within CDK constructs and manages AWS credentials securely.

- **Testing:**  
  Implements comprehensive unit tests using Jest and mocks AWS services to ensure Lambda functions behave as expected.

- **Performance Optimization:**  
  Designs code and infrastructure to minimize cold starts, optimize execution time, and use dynamic imports where necessary.

---

## Conclusion

The Bellyfed codebase exemplifies a well-architected serverless application leveraging AWS services and modern TypeScript practices. By following Event-Driven Architecture principles and utilizing AWS CDK for infrastructure management, the application ensures scalability, maintainability, and efficient resource utilization.

The addition of dynamic environments and GitHub Actions automation further enhances the development workflow, allowing teams to quickly create isolated environments for feature development and testing without manual intervention.

For further details or specific module implementations, please refer to the respective files within the `lib` directory and the GitHub Actions workflows in the `.github` directory.
