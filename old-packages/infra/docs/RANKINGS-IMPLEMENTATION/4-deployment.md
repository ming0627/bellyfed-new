# 4. Deployment Guide

This document outlines the deployment process for the Rankings feature.

## Overview

Deploying the Rankings feature involves several steps:

1. Setting up the infrastructure (S3 bucket, database tables)
2. Deploying the backend API
3. Deploying the frontend components
4. Configuring environment variables
5. Running database migrations
6. Verifying the deployment

## Deployment Steps

### 1. Infrastructure Setup

#### S3 Bucket Setup

1. Deploy the S3 bucket stack using AWS CDK:

    ```bash
    cd bellyfed-infra
    cdk deploy BellyfedRankingsBucketStack-<environment>
    ```

2. Verify that the S3 bucket is created with the correct configuration:

    - CORS settings for frontend uploads
    - Bucket policy for security
    - Lifecycle rules for cost optimization

3. Note the bucket name and ARN from the CDK output or SSM Parameter Store.

#### Database Setup

1. Deploy the database migration stack using AWS CDK:

    ```bash
    cdk deploy BellyfedDbMigrationStack-<environment>
    ```

2. Run the database migration Lambda function:

    ```bash
    aws lambda invoke --function-name bellyfed-db-migration-<environment> --payload '{}' response.json
    ```

3. Verify that the database tables are created:
    - `dishes` table
    - `user_rankings` table
    - `ranking_photos` table

### 2. Backend API Deployment

1. Update the ECS service stack with the new environment variables:

    ```bash
    cdk deploy BellyfedEcsServiceStack-<environment>
    ```

2. Verify that the ECS task has the correct environment variables:

    - `AWS_S3_BUCKET` - Name of the S3 bucket for storing ranking photos
    - `AWS_REGION` - AWS region where the S3 bucket is located

3. Deploy the backend API code:

    ```bash
    cd bellyfed
    git checkout main
    git pull
    git checkout -b deploy/rankings-backend
    git merge feature/rankings-backend
    npm run build
    npm run deploy:<environment>
    ```

4. Verify that the API endpoints are accessible:
    - `/api/dishes` - List dishes
    - `/api/rankings/my` - Get user rankings
    - `/api/upload/ranking-photo` - Upload a photo

### 3. Frontend Deployment

1. Deploy the frontend code:

    ```bash
    cd bellyfed
    git checkout main
    git pull
    git checkout -b deploy/rankings-frontend
    git merge feature/rankings-frontend
    npm run build
    npm run deploy:<environment>
    ```

2. Verify that the frontend pages are accessible:
    - `/my-rankings` - My Rankings page
    - `/dish/[slug]` - Dish Rankings page
    - `/restaurant/[id]` - Restaurant Rankings page

### 4. Environment Variables Configuration

Ensure that the following environment variables are set in the ECS task definition:

```json
{
  "name": "AWS_S3_BUCKET",
  "value": "bellyfed-rankings-<environment>-<account-id>"
},
{
  "name": "AWS_REGION",
  "value": "us-east-1"
}
```

### 5. Database Migrations

The database migration should be run automatically by the Lambda function deployed in step 1. However, if you need to run it manually:

1. Connect to the database:

    ```bash
    mysql -h <database-host> -u <username> -p
    ```

2. Run the migration script:

    ```sql
    USE bellyfed_<environment>;
    SOURCE migrations/rankings-tables.sql;
    ```

3. Verify that the tables are created:
    ```sql
    SHOW TABLES;
    DESCRIBE dishes;
    DESCRIBE user_rankings;
    DESCRIBE ranking_photos;
    ```

### 6. Deployment Verification

#### Backend Verification

1. Test the API endpoints:

    ```bash
    # Get dishes
    curl -X GET https://api-<environment>.bellyfed.com/api/dishes

    # Get user rankings (with authentication)
    curl -X GET https://api-<environment>.bellyfed.com/api/rankings/my -H "Authorization: Bearer <token>"

    # Get photo upload URL (with authentication)
    curl -X POST https://api-<environment>.bellyfed.com/api/upload/ranking-photo -H "Authorization: Bearer <token>" -d '{"contentType":"image/jpeg"}'
    ```

2. Check the logs for any errors:
    ```bash
    aws logs filter-log-events --log-group-name /aws/ecs/bellyfed-<environment> --filter-pattern "ERROR"
    ```

#### Frontend Verification

1. Navigate to the My Rankings page and verify that it loads correctly.
2. Navigate to a Dish Rankings page and verify that it loads correctly.
3. Try adding a ranking and uploading a photo.
4. Verify that the ranking appears in the My Rankings page.

## Rollback Procedure

If the deployment fails or causes issues, follow these steps to roll back:

### 1. Roll Back Frontend

1. Revert to the previous version:
    ```bash
    cd bellyfed
    git checkout main
    git revert <commit-hash>
    npm run build
    npm run deploy:<environment>
    ```

### 2. Roll Back Backend API

1. Revert to the previous version:
    ```bash
    cd bellyfed
    git checkout main
    git revert <commit-hash>
    npm run build
    npm run deploy:<environment>
    ```

### 3. Roll Back Database Changes

1. Connect to the database:

    ```bash
    mysql -h <database-host> -u <username> -p
    ```

2. Drop the tables:
    ```sql
    USE bellyfed_<environment>;
    DROP TABLE ranking_photos;
    DROP TABLE user_rankings;
    DROP TABLE dishes;
    ```

### 4. Roll Back Infrastructure

1. Destroy the database migration stack:

    ```bash
    cd bellyfed-infra
    cdk destroy BellyfedDbMigrationStack-<environment>
    ```

2. Destroy the S3 bucket stack:
    ```bash
    cdk destroy BellyfedRankingsBucketStack-<environment>
    ```

## Monitoring

After deployment, monitor the following:

1. API error rates:

    - Check CloudWatch metrics for 4xx and 5xx errors
    - Set up alarms for high error rates

2. S3 bucket usage:

    - Monitor storage usage
    - Set up alarms for approaching storage limits

3. Database performance:

    - Monitor query performance
    - Check for slow queries

4. User feedback:
    - Monitor user feedback channels
    - Address any reported issues promptly

## Troubleshooting

### Common Issues

1. **S3 Bucket Access Denied**

    - Check IAM permissions for the ECS task role
    - Verify that the bucket policy is correct
    - Ensure that the environment variables are set correctly

2. **Database Connection Issues**

    - Check the database security group
    - Verify that the database credentials are correct
    - Ensure that the database is accessible from the ECS task

3. **API Errors**

    - Check the API logs for detailed error messages
    - Verify that the API endpoints are correctly implemented
    - Ensure that the authentication is working correctly

4. **Frontend Errors**
    - Check the browser console for JavaScript errors
    - Verify that the API integration is correct
    - Ensure that the environment variables are set correctly
