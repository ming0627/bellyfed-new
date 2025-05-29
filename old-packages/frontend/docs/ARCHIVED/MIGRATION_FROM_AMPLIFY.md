# Migration from Amplify to Lambda Edge

This document outlines the migration process from AWS Amplify to Lambda Edge for the Bellyfed application.

## Overview

The Bellyfed application has been migrated from AWS Amplify to Lambda Edge for deployment. This migration provides better performance, more control over the infrastructure, and better integration with AWS services.

## Key Changes

1. **Infrastructure**:

   - Moved from Amplify to Lambda Edge
   - Infrastructure code is now in the `bellyfed-infra` repository
   - Using AWS CDK for infrastructure as code

2. **Authentication**:

   - Still using AWS Cognito for authentication
   - Custom authentication flows are now implemented directly with Cognito instead of through Amplify
   - Sign-up verification uses custom message templates

3. **Database**:

   - Moving from DynamoDB to RDS PostgreSQL for most data storage
   - DynamoDB is still used for data requiring quick access

4. **Deployment**:
   - Using AWS CodePipeline for CI/CD
   - Frontend application is deployed to custom domains following the pattern `app-{environment}.bellyfed.com`

## Testing

The test suite is currently being updated to work without Amplify dependencies. Until this work is complete, tests are temporarily disabled in the CI pipeline.

## Known Issues

1. Some test files still reference Amplify libraries and need to be updated
2. Some components may still have references to Amplify that need to be replaced

## Next Steps

1. Update all tests to work without Amplify dependencies
2. Complete the migration of all data from DynamoDB to RDS PostgreSQL
3. Ensure all components are using the new authentication approach
4. Update documentation to reflect the new architecture
