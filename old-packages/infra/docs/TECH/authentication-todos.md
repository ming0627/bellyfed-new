# Cognito Authentication and User Registration TODOs

## Overview

This document outlines the pending tasks needed to implement proper user registration flow from AWS Cognito to PostgreSQL database. Currently, the system has a gap where user registration data from Cognito is not properly captured and stored in the PostgreSQL database.

## Current State Assessment

1. **What exists:**

    - Cognito user pool for authentication
    - Aurora PostgreSQL database with a users table
    - Event processor for handling standardized events
    - EventBridge infrastructure for event-driven architecture
    - `process-user-signup` Lambda (currently writing to DynamoDB)

2. **What's missing:**
    - Cognito Post-Confirmation Lambda trigger
    - Connection between Cognito events and PostgreSQL
    - Proper event flow from registration to database storage

## TODO Actions

### 1. Cognito Post-Confirmation Trigger

- [ ] **Create a new Lambda function for Cognito Post-Confirmation**

    ```typescript
    // Create Lambda function in /functions/cognito-post-confirmation/
    // This function will be triggered when a user confirms their registration
    ```

- [ ] **Connect the Lambda to Cognito User Pool**

    ```typescript
    // In lib/cognito-stack.ts
    this.userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmationLambda);
    ```

- [ ] **Standardize and publish Cognito events to EventBridge**
    ```typescript
    // In the post-confirmation Lambda, transform the Cognito event
    // and publish to the appropriate EventBridge bus
    ```

### 2. Update Processing Lambda for PostgreSQL

- [ ] **Modify the `process-user-signup` Lambda**

    ```typescript
    // Change from DynamoDB to PostgreSQL RDS for user data storage
    // Leverage RDS Data API for PostgreSQL access
    ```

- [ ] **Update database connection handling**

    ```typescript
    // Use the Aurora PostgreSQL credentials from Secrets Manager
    // Set up proper connection pooling for efficiency
    ```

- [ ] **Create SQL insert statement for users table**
    ```typescript
    // SQL query to insert user details into PostgreSQL
    const sql = `
      INSERT INTO users (id, email, name, created_at, updated_at)
      VALUES (:id, :email, :name, :created_at, :updated_at)
    `;
    ```

### 3. EventBridge and Queue Configuration

- [ ] **Configure EventBridge rule for user.registered events**

    ```typescript
    // In lib/eventbridge-stack.ts
    // Create a rule that captures registration events and routes to SQS
    ```

- [ ] **Set up SQS queue for user registration events**

    ```typescript
    // In lib/sqs-stack.ts
    // Create a dedicated queue for user registration processing
    ```

- [ ] **Connect SQS queue to processing Lambda**
    ```typescript
    // Set up the process-user-signup Lambda to consume from this queue
    ```

### 4. Database Schema Updates

- [ ] **Update users table schema**
    ```sql
    -- In functions/db-init/index.ts
    -- Enhance the users table schema to capture all necessary Cognito attributes
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      cognito_id VARCHAR(128) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      phone VARCHAR(20),
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```

### 5. Testing and Validation

- [ ] **Create test users in Cognito and verify flow**

    ```
    Test the entire flow:
    1. User registers in Cognito
    2. Post-confirmation trigger fires
    3. Event sent to EventBridge
    4. Event captured and sent to SQS
    5. Processing Lambda consumes event
    6. Data stored in PostgreSQL
    ```

- [ ] **Add CloudWatch alarms for failed event processing**

    ```typescript
    // Set up alarms for SQS dead-letter queue and Lambda errors
    ```

- [ ] **Implement logging and monitoring**
    ```typescript
    // Add detailed logging at each step of the process
    ```

## Implementation Sequence

1. First, update the database schema in the database initialization
2. Create the Cognito post-confirmation Lambda function
3. Connect the Lambda to the Cognito user pool
4. Configure EventBridge rules and SQS queue
5. Update the process-user-signup Lambda for PostgreSQL
6. Set up monitoring and validation
7. Test the end-to-end flow

## Additional Considerations

1. **Error Handling**

    - Implement proper error handling and recovery mechanisms
    - Set up dead-letter queues for failed event processing
    - Create alerts for high error rates

2. **Security**

    - Ensure proper IAM permissions for Lambda to access RDS
    - Use Secrets Manager for database credentials
    - Implement least privilege principle

3. **Performance**
    - Consider database connection pooling
    - Optimize SQS batch processing
    - Set appropriate Lambda concurrency limits

## Related Documentation

- [AWS Cognito Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
- [AWS Lambda to RDS PostgreSQL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-rds.html)
- [EventBridge to SQS](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html#eb-sqs-target)
