# Cognito Stack Documentation

## Overview

This document describes the changes made to the Cognito stack. The main changes include:

1. Splitting the Cognito resources into separate stacks
2. Removing SES email configuration to avoid email verification requirements
3. Adding version suffixes to resource names
4. Storing Cognito IDs in SSM parameters with version suffixes

## Stack Structure

The Cognito resources are now split into two stacks:

1. **BellyfedCognitoStack-{environment}**: Contains the actual Cognito resources

    - User Pool
    - User Pool Client
    - Identity Pool
    - Lambda triggers for post-confirmation and custom messages

2. **BellyfedCognitoParametersStack-{environment}**: Contains the SSM parameters
    - Stores the IDs of the Cognito resources in SSM Parameter Store
    - Depends on the Cognito stack to ensure proper deployment order

## SSM Parameters

The following SSM parameters are created by the Cognito Parameters Stack:

- `/bellyfed/{environment}/cognito/user-pool-id`: The ID of the Cognito User Pool
- `/bellyfed/{environment}/cognito/user-pool-client-id`: The ID of the Cognito User Pool Client
- `/bellyfed/{environment}/cognito/identity-pool-id`: The ID of the Cognito Identity Pool

## Environment Variables

The frontend application uses the following environment variables for Cognito configuration:

```
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_USER_POOL_ID=<value-from-ssm-parameter>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<value-from-ssm-parameter>
```

These environment variables should be updated with the values from the new SSM parameters.

## Deployment

To deploy the Cognito stacks:

1. Deploy the Cognito Stack first:

    ```bash
    npx cdk deploy BellyfedCognitoStack-dev --context environment=dev
    ```

2. Then deploy the Cognito Parameters Stack:

    ```bash
    npx cdk deploy BellyfedCognitoParametersStack-dev --context environment=dev
    ```

3. Update the frontend environment variables with the new Cognito IDs.

## Troubleshooting

If you encounter issues with the Cognito stack deployment:

1. Check the CloudFormation events in the AWS Console
2. Verify that the SES email configuration has been removed
3. Ensure that the Cognito Parameters Stack has the correct dependencies

## Migration

When migrating from the previous Cognito stack:

1. Update any references to the old SSM parameters to use the new parameters
2. Update the frontend environment variables with the new Cognito IDs
3. Test the authentication flow with the new Cognito resources
4. Once everything is working correctly, the old Cognito stack can be deleted
