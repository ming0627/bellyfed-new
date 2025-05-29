# DynamoDB to PostgreSQL Migration Guide

This guide explains how to migrate restaurant data from DynamoDB to PostgreSQL RDS.

## Overview

The migration process involves:

1. Scanning DynamoDB for restaurant data
2. Transforming the data to match the PostgreSQL schema
3. Importing the data into PostgreSQL RDS

## Prerequisites

- AWS credentials with access to DynamoDB
- PostgreSQL RDS connection details
- Node.js 16+

## Setup

1. Configure environment variables in `.env`:

```
# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Configuration
DYNAMODB_TABLE=FoodEstablishment-dev

# PostgreSQL Configuration
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

2. Install dependencies:

```bash
npm install
```

## Running the Migration

Execute the migration script:

```bash
node migrate-dynamodb-to-rds.js
```

The script will:

1. Scan DynamoDB for restaurant data
2. Transform the data to match the PostgreSQL schema
3. Import the data into PostgreSQL RDS
4. Log the results

## Monitoring

The script provides detailed logs of the migration process:

- Number of restaurants found in DynamoDB
- Number of restaurants successfully migrated
- Number of restaurants that failed to migrate
- Total time taken for the migration

## Troubleshooting

If you encounter issues:

1. Check AWS credentials and permissions
2. Verify PostgreSQL connection details
3. Check DynamoDB table name
4. Look for specific error messages in the logs

## Post-Migration

After migration:

1. Verify data in PostgreSQL using a database client
2. Update application code to use PostgreSQL instead of DynamoDB
3. Consider running the migration script with the `--verify` flag to compare data between DynamoDB and PostgreSQL

## Example

```bash
# Run migration
node migrate-dynamodb-to-rds.js

# Output
Scanning DynamoDB table FoodEstablishment-dev for restaurant data...
Found 25 restaurants in this scan
Total restaurants found in DynamoDB: 25
Starting migration of 25 restaurants from DynamoDB to PostgreSQL...
Processing batch 1 of 1 (25 items)...
Inserting new restaurant: Golden Fried Rice Restaurant (123e4567-e89b-12d3-a456-426614174000)
Inserting new restaurant: Wok Master (123e4567-e89b-12d3-a456-426614174001)
...
Batch 1 complete. Progress: 25/25

Migration Summary:
Total restaurants: 25
Successfully migrated: 25
Failed to migrate: 0
Migration completed at: 2023-08-01T12:34:56.789Z
```
