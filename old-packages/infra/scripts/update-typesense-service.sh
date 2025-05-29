#!/bin/bash
set -e

# Script to update the Typesense ECS service
# This script is used to fix the Typesense service if it's in an unhealthy state
# Usage: ./update-typesense-service.sh [environment]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-typesense-${ENVIRONMENT}"
TASK_DEFINITION_NAME="bellyfed-typesense-${ENVIRONMENT}"
CONTAINER_NAME="TypesenseContainer"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Task Definition: ${TASK_DEFINITION_NAME}"
echo "Container Name: ${CONTAINER_NAME}"

# Get the current task definition
echo "Getting current task definition..."
CURRENT_TASK_DEF=$(aws ecs describe-task-definition --task-definition ${TASK_DEFINITION_NAME} --query "taskDefinition.taskDefinitionArn" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get current task definition."
  exit 1
fi
echo "Current task definition: ${CURRENT_TASK_DEF}"

# Get the current service configuration
echo "Getting current service configuration..."
SERVICE_JSON=$(aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME})
if [ $? -ne 0 ]; then
  echo "Error: Failed to get service configuration."
  exit 1
fi

# Update the service with improved deployment configuration
echo "Updating service with improved deployment configuration..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --task-definition ${CURRENT_TASK_DEF} \
  --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=100,minimumHealthyPercent=0" \
  --health-check-grace-period-seconds 300 \
  --force-new-deployment

if [ $? -ne 0 ]; then
  echo "Error: Failed to update service."
  exit 1
fi

echo "Service update initiated. Waiting for deployment to complete..."
aws ecs wait services-stable --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}

if [ $? -ne 0 ]; then
  echo "Warning: Service did not stabilize within the timeout period."
  echo "Check the service status manually with:"
  echo "aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}"
else
  echo "Service update completed successfully!"
fi

echo "Done!"
