# Database Architecture

## Current Architecture: Phase 1

In the initial phase, Bellyfed uses a single database architecture focusing on robustness and relational capabilities:

1. **Primary Database: Aurora PostgreSQL**
    - Handles all data storage and retrieval operations
    - Ensures ACID compliance for all transactions
    - Provides robust querying capabilities for reporting and analytics
    - Manages user accounts, restaurant profiles, and relationship data
    - Supports complex joins and multi-table transactions

## RDS Schema

### Core Tables

1. **Users**

    - Primary Key: `user_id`
    - Stores user profiles, preferences, and account information
    - Related to: Rankings, Reviews, Favorites

2. **Restaurants**

    - Primary Key: `restaurant_id`
    - Stores restaurant details, location, and business information
    - Related to: Menu, Categories, Reviews

3. **Menu_Items**

    - Primary Key: `item_id`
    - Foreign Key: `restaurant_id`
    - Stores menu details, pricing, and item information

4. **Rankings**

    - Composite Primary Key: `user_id`, `ranking_id`
    - Stores user's personal rankings and preferences
    - Includes timestamps for tracking preference changes over time

5. **Categories**
    - Primary Key: `category_id`
    - Stores cuisine types, dietary preferences, and other categorization data

## Future Architecture: Phase 2

In the next phase, Bellyfed will evolve to a hybrid database architecture leveraging:

1. **Aurora PostgreSQL** - Continuing as the system of record and source of truth
2. **DynamoDB** - For high-performance read operations and specific access patterns

### Data Synchronization Strategy (Phase 2)

1. **Debezium with Amazon MSK Serverless**

    - Captures change data from PostgreSQL WAL (Write-Ahead Log)
    - Streams change events to Kafka topics
    - Provides reliable and scalable CDC pipeline

2. **Kafka Connect on ECS/Fargate**

    - Processes change events from Kafka
    - Transforms relational data to DynamoDB format
    - Handles data synchronization with configurable consistency

3. **DynamoDB Destination**
    - Optimized for specific high-performance access patterns
    - Secondary indices for efficient queries
    - Eventual consistency with the primary database

## Query Patterns (Phase 1)

### Restaurant Query Lambda

Handles all operations with Aurora PostgreSQL.

#### Endpoints

1. **List Restaurants**

    - `GET /restaurants`
    - Optional query parameters:
        - `city`: Filter by city
        - `cuisine`: Filter by cuisine type
    - Uses: SQL queries with appropriate indexing for efficient filtering
    - Returns: Array of restaurant objects
    - Analytics Event: `RESTAURANTS_LISTED`

2. **Get Restaurant**

    - `GET /restaurants/{id}`
    - Direct lookup using primary key in PostgreSQL
    - Returns: Restaurant details
    - Analytics Event: `RESTAURANT_VIEWED`

3. **Get Restaurant Menu**

    - `GET /restaurants/{id}/menu`
    - SQL query joining restaurant and menu tables
    - Returns: Array of menu items
    - Analytics Event: `RESTAURANT_MENU_VIEWED`

4. **Get Restaurant Reviews**
    - `GET /restaurants/{id}/reviews`
    - SQL query joining restaurant and review tables with user information
    - Returns: Latest 50 reviews, sorted by newest first
    - Analytics Event: `RESTAURANT_REVIEWS_VIEWED`

## Performance Considerations

1. **PostgreSQL Optimization**

    - Appropriate indexes on frequently queried columns
    - Connection pooling for efficient resource utilization
    - Query optimization and monitoring
    - Read replicas for read-heavy workloads

2. **Monitoring and Scaling**
    - CloudWatch metrics for database performance
    - Aurora auto-scaling for unpredictable workloads
    - Performance Insights for query analysis
    - Regular index and query optimization
