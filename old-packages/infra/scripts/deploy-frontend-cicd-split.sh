#!/bin/bash

# Script to deploy the frontend CICD stack for the split architecture
# Usage: ./deploy-frontend-cicd-split.sh [environment]
# Example: ./deploy-frontend-cicd-split.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./deploy-frontend-cicd-split.sh [environment]"
  echo "Example: ./deploy-frontend-cicd-split.sh dev"
  exit 1
fi

ENVIRONMENT=$1
STACK_NAME="BellyfedFrontendCicdStack-${ENVIRONMENT}"

echo "Deploying frontend CICD stack for environment: ${ENVIRONMENT}"
echo "Stack name: ${STACK_NAME}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
  echo "Error: AWS CLI is not configured properly. Please configure AWS CLI with valid credentials."
  exit 1
fi

# Deploy the stack
echo "Deploying stack..."
npx cdk deploy ${STACK_NAME} \
  --require-approval never \
  --context environment=${ENVIRONMENT} \
  --context frontendRepo=bellyfed \
  --context frontendOwner=ming0627 \
  --context frontendBranch=develop

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "Stack deployment successful!"
  
  # Start the pipeline execution
  PIPELINE_NAME="${ENVIRONMENT}-frontend-pipeline"
  echo "Starting pipeline execution for: ${PIPELINE_NAME}"
  aws codepipeline start-pipeline-execution --name ${PIPELINE_NAME}
  
  if [ $? -eq 0 ]; then
    echo "Pipeline execution started successfully!"
    echo "You can monitor the pipeline in the AWS Console:"
    echo "https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${PIPELINE_NAME}/view"
  else
    echo "Failed to start pipeline execution."
  fi
else
  echo "Stack deployment failed."
  exit 1
fi
