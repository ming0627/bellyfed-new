#!/bin/bash
set -e

# This script fixes the bootstrapping issue for ap-southeast-1 region
# It creates the missing SSM parameter that the CDK is looking for

# Set the environment
ENVIRONMENT="dev"
ACCOUNT_ID="590184067494"
REGION="ap-southeast-1"
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
echo "Now trying to deploy the CloudFront stack..."

# Deploy the CloudFront stack
npx cdk deploy BellyfedCloudFrontStack-dev --context environment=$ENVIRONMENT --require-approval never
