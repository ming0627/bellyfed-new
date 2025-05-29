#!/bin/bash
set -e

# Script to update the frontend ECS task definition with a new image
# Usage: ./update-frontend-task-definition.sh [environment] [image_tag]
# Example: ./update-frontend-task-definition.sh dev latest

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-frontend-task-definition.sh [environment] [image_tag]"
  echo "Example: ./update-frontend-task-definition.sh dev latest"
  exit 1
fi

# Set environment
ENVIRONMENT=$1

# Set image tag (default to 'latest' if not provided)
IMAGE_TAG=${2:-latest}

# Set AWS region
AWS_REGION="ap-southeast-1"

# Get parameters from SSM Parameter Store
echo "Getting parameters from SSM Parameter Store..."

# Get ECR repository URI
ECR_REPOSITORY_URI=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/repository-uri" --query "Parameter.Value" --output text)

# Set task definition family
TASK_FAMILY="bellyfed-frontend-${ENVIRONMENT}"

# Set ECS cluster and service names
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-frontend-service"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "Task Definition Family: ${TASK_FAMILY}"
echo "ECR Repository URI: ${ECR_REPOSITORY_URI}"
echo "Image Tag: ${IMAGE_TAG}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"

# Get the current task definition
echo "Retrieving current task definition..."
CURRENT_TASK_DEF=$(aws ecs describe-task-definition --task-definition ${TASK_FAMILY} --query "taskDefinition" --output json)

if [ $? -ne 0 ]; then
  echo "Error: Failed to retrieve current task definition."
  exit 1
fi

# Create a temporary file for the current task definition
echo $CURRENT_TASK_DEF > current-task-def.json

# Update the image in the task definition
echo "Updating image in task definition..."
jq --arg image "${ECR_REPOSITORY_URI}:${IMAGE_TAG}" '.containerDefinitions[0].image = $image' current-task-def.json > updated-task-def.json

# Remove read-only fields
echo "Removing read-only fields..."
jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)' updated-task-def.json > final-task-def.json

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://final-task-def.json --query "taskDefinition.taskDefinitionArn" --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: ${NEW_TASK_DEF_ARN}"

# Update the service to use the new task definition
echo "Updating service to use new task definition..."
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${NEW_TASK_DEF_ARN} --force-new-deployment

if [ $? -ne 0 ]; then
  echo "Error: Failed to update service."
  exit 1
fi

echo "Service update initiated."

# Ask if user wants to wait for deployment to complete
read -p "Do you want to wait for the deployment to complete? (y/n): " WAIT_RESPONSE
if [[ "$WAIT_RESPONSE" =~ ^[Yy]$ ]]; then
  echo "Waiting for deployment to complete..."
  aws ecs wait services-stable --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}
  
  if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
  else
    echo "Deployment is taking longer than expected. Please check the AWS Console for status."
  fi
fi

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -f current-task-def.json updated-task-def.json final-task-def.json

echo "Done!"
