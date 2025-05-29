#!/bin/bash

# Script to deploy the frontend CICD stack using CDK
# Usage: ./deploy-frontend-cicd.sh [environment]
# Example: ./deploy-frontend-cicd.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./deploy-frontend-cicd.sh [environment]"
  echo "Example: ./deploy-frontend-cicd.sh dev"
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

# Check if CDK is installed
if ! command -v cdk &>/dev/null; then
  echo "Error: CDK is not installed. Please install CDK using 'npm install -g aws-cdk'."
  exit 1
fi

# Deploy the frontend CICD stack
echo "Deploying ${STACK_NAME} using CDK..."
npx cdk deploy ${STACK_NAME} \
  --context environment=${ENVIRONMENT} \
  --require-approval never \
  --verbose

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "Frontend CICD stack deployed successfully!"
  
  # Get the pipeline name
  PIPELINE_NAME="${ENVIRONMENT}-frontend-pipeline"
  
  # Start the pipeline execution
  echo "Starting pipeline execution..."
  EXECUTION_RESULT=$(aws codepipeline start-pipeline-execution --name "${PIPELINE_NAME}")
  
  if [ $? -eq 0 ]; then
    echo "Pipeline execution started successfully."
    echo "Execution ID: $(echo $EXECUTION_RESULT | jq -r '.pipelineExecutionId')"
    echo "You can check the pipeline status in the AWS Console at:"
    echo "https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${PIPELINE_NAME}/view"
  else
    echo "Failed to start pipeline execution."
  fi
else
  echo "Error: Failed to deploy frontend CICD stack."
  exit 1
fi

echo "Done!"
