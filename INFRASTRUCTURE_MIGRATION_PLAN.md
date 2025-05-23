# Infrastructure Components Migration Plan

This document outlines the plan for migrating the infrastructure components from the original Bellyfed repository to the new repository structure.

## Completed Migrations

1. **User Profile Service** (`/packages/infra/functions/user-profile` → `/apps/backend/src/services/user-profile`)
   - Migrated the Lambda function to a tRPC service
   - Created the necessary database models and schemas
   - Implemented the tRPC router for user profile operations

2. **Database Initialization Service** (`/packages/infra/functions/db-init` → `/apps/backend/src/services/db-init`)
   - Migrated the Lambda function to a tRPC service
   - Created the database schema definitions
   - Implemented the tRPC router for database initialization operations

3. **Analytics Processor** (`/packages/infra/functions/analytics-processor` → `/apps/backend/src/services/analytics-processor`)
   - Migrated the Lambda function to a tRPC service
   - Created the necessary database models and schemas
   - Implemented the tRPC router for analytics processing operations

4. **Analytics Service** (`/packages/infra/functions/analytics-service` → `/apps/backend/src/services/analytics-service`)
   - Migrated the Lambda function to a tRPC service
   - Created the necessary database models and schemas
   - Implemented the tRPC router for analytics service operations

5. **Cognito Custom Message** (`/packages/infra/functions/cognito-custom-message` → `/apps/backend/src/services/cognito-custom-message`)
   - Migrated the Lambda function to a tRPC service
   - Implemented the tRPC router for Cognito custom message operations

6. **Cognito Post Confirmation** (`/packages/infra/functions/cognito-post-confirmation` → `/apps/backend/src/services/cognito-post-confirmation`)
   - Migrated the Lambda function to a tRPC service
   - Implemented the tRPC router for Cognito post-confirmation operations

7. **Dead Letter Queue Processor** (`/packages/infra/functions/dlq-processor` → `/apps/backend/src/services/dlq-processor`)
   - Migrated the Lambda function to a tRPC service
   - Implemented the tRPC router for DLQ processor operations

8. **Event Processor** (`/packages/infra/functions/event-processor` → `/apps/backend/src/services/event-processor`)
   - Migrated the Lambda function to a tRPC service
   - Implemented the tRPC router for event processor operations

9. **Google Maps Integration** (`/packages/infra/functions/google-maps-integration` → `/apps/backend/src/services/google-maps-integration`)
   - Migrated the Lambda function to a tRPC service
   - Implemented the tRPC router for Google Maps integration operations
   - Created the necessary database models for restaurants, photos, and hours

10. **Process User Signup** (`/packages/infra/functions/process-user-signup` → `/apps/backend/src/services/process-user-signup`)
    - Migrated the Lambda function to a tRPC service
    - Updated the User model with additional fields
    - Implemented the tRPC router for user signup processing operations

11. **Query Processor** (`/packages/infra/functions/query-processor` → `/apps/backend/src/services/query-processor`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for query processor operations
    - Added advanced restaurant search functionality

12. **Restaurant Processor** (`/packages/infra/functions/restaurant-processor` → `/apps/backend/src/services/restaurant-processor`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for restaurant processor operations
    - Added event tracking and completion notifications

13. **Restaurant Query** (`/packages/infra/functions/restaurant-query` → `/apps/backend/src/services/restaurant-query`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for restaurant query operations
    - Added performance monitoring and analytics tracking

14. **Review Processor** (`/packages/infra/functions/review-processor` → `/apps/backend/src/services/review-processor`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for review processor operations
    - Added restaurant rating updates based on reviews
    - Created the Review model in the Prisma schema

15. **Review Query** (`/packages/infra/functions/review-query` → `/apps/backend/src/services/review-query`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for review query operations
    - Added performance monitoring and analytics tracking
    - Added additional endpoints for recent and top-rated reviews

16. **Typesense Dish Search** (`/packages/infra/functions/typesense-dish-search` → `/apps/backend/src/services/typesense-dish-search`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for Typesense dish search operations
    - Created a shared Typesense client utility
    - Added additional endpoints for popular dishes and price range filtering

17. **Typesense Dish Sync** (`/packages/infra/functions/typesense-dish-sync` → `/apps/backend/src/services/typesense-dish-sync`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for Typesense dish sync operations
    - Added functionality to sync dishes by restaurant ID
    - Added event handling for dish creation, updates, and deletion

18. **User Account Processor** (`/packages/infra/functions/user-account-processor` → `/apps/backend/src/services/user-account-processor`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for user account processor operations
    - Added event handling for user registration, updates, and deletion
    - Integrated with EventBridge for completion events

19. **Write Processor** (`/packages/infra/functions/write-processor` → `/apps/backend/src/services/write-processor`)
    - Migrated the Lambda function to a tRPC service
    - Implemented the tRPC router for write processor operations
    - Added batch operations for writing and deleting items
    - Integrated with AWS SDK v3 for DynamoDB operations

## Skipped Migrations

20. **Analytics Writer** (`/packages/infra/functions/analytics-writer` → `/apps/backend/src/services/analytics-writer`)
    - Not implemented in the original repository, skipped in migration

## Migration Complete

The infrastructure migration is now 100% complete. All Lambda functions have been successfully migrated to tRPC services in the new repository structure. The new architecture provides:

- Improved developer experience with type-safe APIs
- Better error handling and logging
- Consistent patterns across all services
- Easier testing and maintenance
- Reduced cold start times
- Simplified deployment process

## Migration Strategy

For each infrastructure component, follow these steps:

1. **Analyze the original Lambda function**
   - Understand its purpose and functionality
   - Identify dependencies and external services it interacts with
   - Determine the database models and schemas it uses

2. **Create the service directory structure**
   - Create the service directory in `/apps/backend/src/services/`
   - Create the necessary files (index.ts, router.ts, etc.)

3. **Migrate the Lambda function code**
   - Convert the Lambda handler to a tRPC service
   - Update imports and dependencies
   - Ensure proper error handling

4. **Create the tRPC router**
   - Define the tRPC procedures for the service
   - Implement the necessary input validation using Zod
   - Connect the router to the service functions

5. **Update the main router**
   - Add the new service router to the main app router

6. **Test the migrated service**
   - Ensure the service works as expected
   - Verify that it integrates properly with the rest of the application

## Architectural Changes

The migration involves several architectural changes:

1. **From AWS Lambda to tRPC**
   - Lambda functions are being converted to tRPC services
   - API Gateway is being replaced with Express.js and tRPC
   - Authentication is being handled by tRPC middleware instead of API Gateway authorizers

2. **Database Access**
   - Direct RDS Data API calls are being replaced with Prisma ORM
   - The Outbox pattern is being maintained for reliable event processing

3. **Error Handling**
   - Lambda-specific error handling is being replaced with tRPC error handling
   - HTTP status codes are being mapped to tRPC error codes

## Next Steps

1. Continue migrating the remaining infrastructure components according to the priority order
2. Update the database schema as needed for each component
3. Ensure proper integration between all components
4. Test the migrated services thoroughly
