# Deployment Guide

This document outlines the steps required to deploy the rankings feature backend to production.

## Prerequisites

Before deploying, ensure you have:

1. AWS account with appropriate permissions
2. AWS CLI configured on your local machine
3. Access to the RDS database
4. Access to the S3 bucket for photo storage

## Database Setup

### 1. Create Database Tables

Connect to your RDS instance and run the following SQL scripts:

```sql
-- Dishes table
CREATE TABLE dishes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_id VARCHAR(36) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  spicy_level INT DEFAULT 0,
  price DECIMAL(10, 2),
  country_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (slug, country_code),
  INDEX (restaurant_id),
  INDEX (category),
  INDEX (country_code)
);

-- User Rankings table
CREATE TABLE user_rankings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  rank INT,
  taste_status ENUM('ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, dish_id),
  INDEX (user_id),
  INDEX (dish_id),
  INDEX (restaurant_id),
  INDEX (rank),
  INDEX (taste_status),
  CONSTRAINT check_ranking_type CHECK (
    (rank IS NOT NULL AND taste_status IS NULL) OR
    (rank IS NULL AND taste_status IS NOT NULL)
  )
);

-- Ranking Photos table
CREATE TABLE ranking_photos (
  id VARCHAR(36) PRIMARY KEY,
  ranking_id VARCHAR(36) NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (ranking_id),
  FOREIGN KEY (ranking_id) REFERENCES user_rankings(id) ON DELETE CASCADE
);
```

### 2. Set Up Database User

Create a dedicated database user for the application:

```sql
CREATE USER 'bellyfed_app'@'%' IDENTIFIED BY 'strong-password-here';
GRANT SELECT, INSERT, UPDATE, DELETE ON bellyfed.* TO 'bellyfed_app'@'%';
FLUSH PRIVILEGES;
```

## S3 Bucket Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://bellyfed-uploads --region us-east-1
```

### 2. Configure CORS

Create a file named `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://bellyfed.com", "https://www.bellyfed.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply the CORS configuration:

```bash
aws s3api put-bucket-cors --bucket bellyfed-uploads --cors-configuration file://cors-config.json
```

### 3. Set Up IAM User for S3 Access

Create an IAM user with programmatic access and attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::bellyfed-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::bellyfed-uploads"
    }
  ]
}
```

## Environment Variables

Set up the following environment variables in your deployment environment:

```
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=bellyfed_app
DB_PASSWORD=strong-password-here
DB_NAME=bellyfed

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=bellyfed-uploads

# Application
NODE_ENV=production
```

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Vercel

If using Vercel for deployment:

```bash
vercel --prod
```

Or set up a GitHub integration for automatic deployments.

### 3. Set Environment Variables in Vercel

In the Vercel dashboard, go to your project settings and add all the required environment variables.

## Post-Deployment Verification

After deployment, verify that:

1. API endpoints are accessible and returning correct responses
2. Database connections are working properly
3. Photo uploads to S3 are functioning
4. Authentication and authorization are working as expected

## Monitoring and Logging

Set up monitoring and logging to track the performance and errors:

1. Configure Vercel Analytics for frontend monitoring
2. Set up CloudWatch for AWS services monitoring
3. Implement application-level logging for API requests and errors

## Backup Strategy

Implement a backup strategy for the database:

1. Configure automated RDS snapshots
2. Set up a schedule for database backups
3. Test the restore process to ensure backups are valid

## Rollback Plan

In case of deployment issues, have a rollback plan:

1. Keep the previous version of the application available
2. Document the steps to revert to the previous version
3. Have database rollback scripts ready if schema changes are involved

## Security Considerations

Ensure the following security measures are in place:

1. All API endpoints use HTTPS
2. Authentication is required for all ranking operations
3. Input validation is implemented for all user inputs
4. Rate limiting is in place to prevent abuse
5. S3 bucket is properly configured to prevent unauthorized access

## Performance Optimization

Optimize performance by:

1. Implementing caching for frequently accessed data
2. Using pagination for large result sets
3. Optimizing database queries with proper indexing
4. Implementing image compression for photo uploads

## Troubleshooting

Common issues and their solutions:

1. **Database Connection Issues**

   - Check network security groups and firewall rules
   - Verify database credentials
   - Check connection pool configuration

2. **S3 Upload Failures**

   - Verify IAM permissions
   - Check CORS configuration
   - Ensure pre-signed URLs are generated correctly

3. **API Errors**
   - Check server logs for detailed error messages
   - Verify environment variables are set correctly
   - Test API endpoints with Postman or similar tools
