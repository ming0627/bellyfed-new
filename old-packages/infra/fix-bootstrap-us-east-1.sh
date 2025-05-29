#!/bin/bash
set -e

# This script fixes the bootstrapping issue for us-east-1 region
# It creates the missing SSM parameter that the CDK is looking for

# Set the environment
ENVIRONMENT="dev"
ACCOUNT_ID="590184067494"
REGION="us-east-1"
QUALIFIER="hnb659fds"

# Create the SSM parameter
echo "Creating SSM parameter /cdk-bootstrap/$QUALIFIER/version in $REGION..."
aws ssm put-parameter \
  --name "/cdk-bootstrap/$QUALIFIER/version" \
  --value "15" \
  --type "String" \
  --region "$REGION" \
  --overwrite

echo "SSM parameter created successfully."
echo "Now trying to deploy the Lambda@Edge stack..."

# Deploy the Lambda@Edge stack
npx cdk deploy edge-lambda-stack-c8b43fc3b2042cdd5b08bd783c2648bc4e29fa5c6c --context environment=$ENVIRONMENT --require-approval never
