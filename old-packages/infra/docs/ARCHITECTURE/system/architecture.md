# Bellyfed Architecture Documentation

## System Architecture Overview

Bellyfed uses a serverless architecture combining direct API responses with event-driven processing:

1. **Direct Query Path**: For read operations requiring immediate responses (API Gateway → Lambda → Aurora PostgreSQL)
2. **Event-Driven Path**: For data imports and analytics (SQS → Event Processor → EventBridge → Lambda)

## Components

### API Gateway

- Serves as the main entry point for all HTTP requests
- Requires API key for authentication
- CORS enabled for web client access
- WAF rules for rate limiting and security

### Restaurant Query Lambda

Handles read operations with direct PostgreSQL access.

#### Endpoints

1. **List Restaurants**

    - `GET /restaurants`
    - Optional query parameters:
        - `city`: Filter by city
        - `cuisine`: Filter by cuisine type
    - Returns: Array of restaurant objects
    - Analytics Event: `RESTAURANTS_LISTED`

2. **Get Restaurant**

    - `GET /restaurants/{id}`
    - Parameters:
        - `id`: Restaurant ID
    - Returns: Restaurant details
    - Analytics Event: `RESTAURANT_VIEWED`

3. **Get Restaurant Menu**

    - `GET /restaurants/{id}/menu`
    - Parameters:
        - `id`: Restaurant ID
    - Returns: Array of menu items
    - Analytics Event: `RESTAURANT_MENU_VIEWED`

4. **Get Restaurant Reviews**
    - `GET /restaurants/{id}/reviews`
    - Parameters:
        - `id`: Restaurant ID
    - Returns: Latest 50 reviews, sorted by newest first
    - Analytics Event: `RESTAURANT_REVIEWS_VIEWED`

### Event Processor Lambda

Handles asynchronous operations and data imports:

- Processes SQS messages for data imports
- Transforms data into standardized event format
- Publishes events to EventBridge

### EventBridge

Central event bus for:

- Analytics events from Restaurant Query Lambda
- Import events from Event Processor
- Routing events to appropriate downstream processors

### Database Architecture (Phase 1)

#### Aurora PostgreSQL

- Relational database for all application data
- Ensures ACID compliance for transactions
- Handles complex relationships and joins
- Stores user profiles, restaurant details, and relationship data
- Schema optimized for reporting and analytics

### Future Data Architecture (Phase 2)

In Phase 2, the system will evolve to include:

- **Debezium** for change data capture from PostgreSQL
- **Amazon MSK Serverless** for Kafka event streaming
- **Kafka Connect on ECS/Fargate** for data transformation and loading
- **DynamoDB** for high-performance read access patterns

This hybrid approach will be implemented after the initial launch, allowing for optimization of specific high-traffic query patterns.

## Analytics Events

All read operations emit analytics events to EventBridge:

1. `RESTAURANTS_LISTED`

    ```typescript
    {
      event_id: string;
      timestamp: string;
      event_type: 'RESTAURANTS_LISTED';
      data: {
        filters: {
          city?: string;
          cuisine?: string;
        };
        count: number;
      }
    }
    ```

2. `RESTAURANT_VIEWED`
    ```typescript
    {
        event_id: string;
        timestamp: string;
        event_type: 'RESTAURANT_VIEWED';
        data: {
            restaurant_id: string;
            source: 'API' | 'MOBILE' | 'WEB';
        }
    }
    ```

## Monitoring & Metrics

### Key Metrics

1. **API Gateway**

    - Request count by endpoint
    - Error rates (4xx, 5xx)
    - Latency (p50, p90, p99)

2. **Lambda Functions**

    - Invocation count
    - Error count
    - Duration
    - Memory usage

3. **Aurora PostgreSQL**

    - CPU utilization
    - Connection count
    - Free storage space
    - Read/write latency
    - Query throughput
    - Slow query count

4. **EventBridge**
    - Events published
    - Failed deliveries
    - Delivery latency

### Monitoring Tools

1. **CloudWatch Metrics**

    - API Gateway request/response metrics
    - Lambda execution metrics
    - RDS performance insights
    - EventBridge event delivery

2. **CloudWatch Logs**

    - Lambda function logs
    - API Gateway access logs
    - RDS error logs
    - Custom application logs

3. **X-Ray Tracing**
    - Request flow visualization
    - Performance bottleneck identification
    - Error root cause analysis
