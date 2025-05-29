# Typesense Architecture in Bellyfed

This document provides an overview of the Typesense search implementation in the Bellyfed platform. It's designed to help new team members understand how Typesense is integrated into our architecture.

## What is Typesense?

Typesense is a fast, typo-tolerant search engine that's designed to be a simpler and more lightweight alternative to Elasticsearch or OpenSearch. It's optimized for search-as-you-type experiences with typo tolerance and provides relevant results in milliseconds.

## Why Typesense?

We chose Typesense for the following reasons:

1. **Lightweight**: Requires minimal resources compared to Elasticsearch/OpenSearch
2. **Simple**: Easy to set up and maintain
3. **Fast**: Optimized for search-as-you-type experiences
4. **Typo-Tolerant**: Handles typos and misspellings gracefully
5. **Cost-Effective**: Lower resource requirements mean lower costs

## Architecture Overview

Our Typesense implementation consists of the following components:

![Typesense Architecture Diagram](./images/typesense-architecture.png)

### 1. Typesense Service

- **ECS Fargate Task**: Runs the Typesense container
- **EFS Volume**: Provides persistent storage for Typesense data
- **Security Groups**: Control access to the Typesense service

### 2. Data Synchronization

- **Lambda Function**: Syncs dish data from PostgreSQL to Typesense
- **EventBridge Rule**: Schedules regular synchronization
- **IAM Roles**: Provide necessary permissions

### 3. Search API

- **API Gateway**: Exposes the search endpoint
- **Lambda Function**: Handles search requests
- **Security Groups**: Control access to the API

### 4. Frontend Integration

- **Typesense Client**: Communicates with the Typesense service
- **Search Components**: Provide UI for searching dishes
- **API Client**: Interacts with the search API

## Repository Structure

Our Typesense implementation is split across two repositories:

### Infrastructure Repository (`bellyfed-infra`)

Contains all the infrastructure code for Typesense:

- `lib/typesense/typesense-infrastructure-stack.ts`: Defines the Typesense ECS infrastructure
- `lib/typesense/typesense-service-stack.ts`: Defines the Typesense service
- `lib/typesense/typesense-lambda-stack.ts`: Defines the Lambda functions for Typesense
- `lib/typesense/typesense-utils.ts`: Utility functions for Typesense
- `lib/typesense/typesense-dish-schema.ts`: Schema definition for dishes
- `functions/typesense-dish-sync/index.ts`: Lambda function for syncing dish data
- `functions/typesense-dish-search/index.ts`: Lambda function for searching dishes

### Frontend Repository (`bellyfed`)

Contains the frontend code for interacting with Typesense:

- `src/utils/typesense.ts`: Typesense client utility
- `src/api/dishSearch.ts`: API client for dish search
- `src/components/DishSearch.tsx`: Search component
- `src/pages/rank-dish.tsx`: Page that integrates the search component

## Data Flow

1. **Data Synchronization**:

    - Dish data is stored in PostgreSQL
    - The sync Lambda function queries PostgreSQL for dish data
    - The data is formatted and indexed in Typesense
    - This happens hourly via an EventBridge scheduled rule

2. **Search Flow**:
    - User enters a search query in the frontend
    - The frontend sends a request to the search API
    - The search Lambda function queries Typesense
    - Results are returned to the frontend
    - The frontend displays the results

## Configuration

Typesense is configured with minimal resources to be cost-effective:

- **CPU**: 256 units (0.25 vCPU)
- **Memory**: 512 MB
- **Scaling**: Min 1, Max 2 instances
- **Storage**: EFS for persistence

## Environment Variables

### Infrastructure

The following environment variables are used in the infrastructure:

- `TYPESENSE_API_KEY`: API key for Typesense
- `RDS_SECRET_ARN`: ARN of the RDS secret
- `RDS_RESOURCE_ARN`: ARN of the RDS cluster
- `RDS_DATABASE`: Name of the database

### Frontend

The following environment variables are used in the frontend:

- `NEXT_PUBLIC_TYPESENSE_HOST`: Host of the Typesense service
- `NEXT_PUBLIC_TYPESENSE_PORT`: Port of the Typesense service
- `NEXT_PUBLIC_TYPESENSE_PROTOCOL`: Protocol for Typesense (http/https)
- `NEXT_PUBLIC_TYPESENSE_API_KEY`: API key for Typesense

## Dish Schema

The dish schema in Typesense includes the following fields:

```typescript
{
  name: 'dishes',
  fields: [
    { name: 'dish_id', type: 'string' },
    { name: 'restaurant_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'price', type: 'float', optional: true },
    { name: 'dish_type', type: 'string' },
    { name: 'tags', type: 'string[]', optional: true },
    { name: 'is_seasonal', type: 'bool', optional: true },
    { name: 'is_available', type: 'bool', optional: true },
    { name: 'restaurant_name', type: 'string' },
    { name: 'average_rank', type: 'float', optional: true },
    { name: 'ranking_count', type: 'int32', optional: true },
    { name: 'created_at', type: 'int64' }
  ],
  default_sorting_field: 'created_at'
}
```

## Search API

The search API is available at `/api/dishes/search` and supports the following parameters:

- `q`: Search query
- `dish_type`: Filter by dish type
- `restaurant_id`: Filter by restaurant
- `tags`: Filter by tags (comma-separated)
- `price_min`: Minimum price
- `price_max`: Maximum price
- `per_page`: Number of results per page
- `page`: Page number

## CI/CD Pipeline

The Typesense service is deployed through an automated CI/CD pipeline:

![Typesense CI/CD Architecture](./images/typesense-cicd-architecture.png)

### Pipeline Components

- **Source Stage**: Code is pulled from the GitHub repository
- **Build Stage**: Infrastructure code is built and tested
- **Deploy Stage**: Infrastructure is deployed to the target environment

### Deployment Process

1. Changes are pushed to the GitHub repository
2. The CI/CD pipeline is triggered automatically
3. The code is built and tested
4. CloudFormation templates are synthesized
5. The infrastructure is deployed to the target environment

### Deployment Strategies

- **Blue/Green Deployment**: Zero-downtime deployments with easy rollback
- **Canary Deployments**: Gradual rollout for critical environments

For more details, see the [Typesense CI/CD Pipeline](../../IMPLEMENTATION/backend/typesense-cicd.md) documentation.

## Monitoring and Maintenance

### Monitoring

- CloudWatch metrics for Typesense service
- CloudWatch logs for Lambda functions
- API Gateway metrics for search API

### Maintenance

- Typesense version upgrades should be tested in a non-production environment first
- Data synchronization can be manually triggered if needed
- Schema changes require careful planning to avoid breaking existing functionality

## Troubleshooting

### Common Issues

1. **Search Not Working**:

    - Check if the Typesense service is running
    - Verify the API key is correct
    - Check the CloudWatch logs for errors

2. **Data Not Syncing**:

    - Check the CloudWatch logs for the sync Lambda function
    - Verify the database connection is working
    - Manually trigger the sync function to test

3. **Performance Issues**:
    - Check the Typesense service metrics
    - Consider increasing resources if needed
    - Optimize the search query

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense JavaScript Client](https://github.com/typesense/typesense-js)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
