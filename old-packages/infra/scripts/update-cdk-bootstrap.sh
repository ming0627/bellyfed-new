#!/bin/bash
set -e

# This script updates the CDK bootstrap stack in the AWS environment
# Usage: ./update-cdk-bootstrap.sh [environment]
# Example: ./update-cdk-bootstrap.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-cdk-bootstrap.sh [environment]"
  echo "Example: ./update-cdk-bootstrap.sh dev"
  exit 1
fi

# Set environment
ENVIRONMENT=$1

# Get AWS account ID
echo "Getting AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to get AWS account ID. Make sure you have the AWS CLI configured correctly."
  exit 1
fi

# Set AWS region
AWS_REGION="ap-southeast-1"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Account ID: ${AWS_ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"

# Update the CDK bootstrap stack
echo "Updating CDK bootstrap stack..."
npx cdk bootstrap aws://${AWS_ACCOUNT_ID}/${AWS_REGION} \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  --force \
  --context environment=${ENVIRONMENT}

if [ $? -ne 0 ]; then
  echo "Error: Failed to update CDK bootstrap stack."
  exit 1
fi

echo "CDK bootstrap stack updated successfully!"
echo "You can now deploy your CDK stacks."
