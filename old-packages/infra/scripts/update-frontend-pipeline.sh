#!/bin/bash

# Simple script to trigger a new frontend pipeline execution
# Usage: ./update-frontend-pipeline.sh [environment]
# Example: ./update-frontend-pipeline.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-frontend-pipeline.sh [environment]"
  echo "Example: ./update-frontend-pipeline.sh dev"
  exit 1
fi

ENVIRONMENT=$1
PIPELINE_NAME="${ENVIRONMENT}-frontend-pipeline"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-frontend-service"

echo "Triggering frontend pipeline for environment: ${ENVIRONMENT}"
echo "Pipeline name: ${PIPELINE_NAME}"

# Check if the pipeline exists
if aws codepipeline get-pipeline --name "${PIPELINE_NAME}" &>/dev/null; then
  echo "Pipeline ${PIPELINE_NAME} exists."

  # Start the pipeline execution
  echo "Starting pipeline execution..."
  EXECUTION_RESULT=$(aws codepipeline start-pipeline-execution --name "${PIPELINE_NAME}")

  if [ $? -eq 0 ]; then
    echo "Pipeline execution started successfully."
    echo "Execution ID: $(echo $EXECUTION_RESULT | jq -r '.pipelineExecutionId')"
  else
    echo "Failed to start pipeline execution."
    exit 1
  fi
else
  echo "Pipeline ${PIPELINE_NAME} does not exist."
  echo "This is expected if this is the first deployment of the frontend CICD stack."
  echo "You'll need to create the pipeline first using CDK or CloudFormation."
  exit 1
fi

# Check ECS cluster and service
echo "Checking ECS cluster and service..."

# Check if the ECS cluster exists
CLUSTER_RESULT=$(aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --query 'clusters[0].clusterName' --output text 2>/dev/null)

if [[ "$CLUSTER_RESULT" != "None" && "$CLUSTER_RESULT" != "" ]]; then
  echo "ECS cluster ${CLUSTER_NAME} exists"

  # Check if the ECS service exists
  SERVICE_RESULT=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --query 'services[0].serviceName' --output text 2>/dev/null)

  if [[ "$SERVICE_RESULT" != "None" && "$SERVICE_RESULT" != "" ]]; then
    echo "ECS service ${SERVICE_NAME} exists"

    # Force a new deployment of the ECS service
    echo "Forcing new deployment of ECS service..."
    DEPLOY_RESULT=$(aws ecs update-service --cluster "${CLUSTER_NAME}" --service "${SERVICE_NAME}" --force-new-deployment)

    if [ $? -eq 0 ]; then
      echo "Forced new deployment of ECS service ${SERVICE_NAME} successfully."
    else
      echo "Failed to force new deployment of ECS service."
    fi
  else
    echo "ECS service ${SERVICE_NAME} does not exist. Skipping service update."
  fi
else
  echo "ECS cluster ${CLUSTER_NAME} does not exist. Skipping service update."
fi

echo "Done! The frontend pipeline has been triggered successfully."
echo "You can check the pipeline status in the AWS Console at:"
echo "https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${PIPELINE_NAME}/view"
