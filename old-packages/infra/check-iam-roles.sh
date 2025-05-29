#!/bin/bash
set -e

# This script checks if the required IAM roles exist and creates them if they don't

# Set the environment
ENVIRONMENT="dev"
ACCOUNT_ID="590184067494"
REGION="ap-southeast-1"
QUALIFIER="hnb659fds"

# Check if the CloudFormation execution role exists
echo "Checking if the CloudFormation execution role exists in $REGION..."
ROLE_NAME="cdk-$QUALIFIER-cfn-exec-role-$ACCOUNT_ID-$REGION"
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

# Try to get the role
ROLE_EXISTS=$(aws iam get-role --role-name "$ROLE_NAME" 2>&1 || echo "ROLE_NOT_FOUND")

if [[ "$ROLE_EXISTS" == *"ROLE_NOT_FOUND"* ]]; then
  echo "Role $ROLE_NAME does not exist. Creating it..."
  
  # Create the trust policy document
  cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudformation.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create the role
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://trust-policy.json

  # Attach the AdministratorAccess policy to the role
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"

  echo "Role $ROLE_NAME created successfully."
else
  echo "Role $ROLE_NAME already exists."
fi

# Check if the deployment role exists
echo "Checking if the deployment role exists in $REGION..."
DEPLOY_ROLE_NAME="cdk-$QUALIFIER-deploy-role-$ACCOUNT_ID-$REGION"
DEPLOY_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$DEPLOY_ROLE_NAME"

# Try to get the role
DEPLOY_ROLE_EXISTS=$(aws iam get-role --role-name "$DEPLOY_ROLE_NAME" 2>&1 || echo "ROLE_NOT_FOUND")

if [[ "$DEPLOY_ROLE_EXISTS" == *"ROLE_NOT_FOUND"* ]]; then
  echo "Role $DEPLOY_ROLE_NAME does not exist. Creating it..."
  
  # Create the trust policy document
  cat > deploy-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::$ACCOUNT_ID:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create the role
  aws iam create-role \
    --role-name "$DEPLOY_ROLE_NAME" \
    --assume-role-policy-document file://deploy-trust-policy.json

  # Attach the AdministratorAccess policy to the role
  aws iam attach-role-policy \
    --role-name "$DEPLOY_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"

  echo "Role $DEPLOY_ROLE_NAME created successfully."
else
  echo "Role $DEPLOY_ROLE_NAME already exists."
fi

# Clean up temporary files
rm -f trust-policy.json deploy-trust-policy.json

echo "IAM roles check completed."
echo "Now trying to deploy the CloudFront stack..."

# Deploy the CloudFront stack
npx cdk deploy BellyfedCloudFrontStack-dev --context environment=$ENVIRONMENT --require-approval never
