#!/bin/bash
set -e

# Script to update the task definition with the actual Docker image
# Usage: ./update-task-definition-with-image.sh [environment] [image_tag]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
IMAGE_TAG=${2:-"latest"}
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}-cluster"
SERVICE_NAME="bellyfed-${ENVIRONMENT}"
REPOSITORY_URI="590184067494.dkr.ecr.ap-southeast-1.amazonaws.com/bellyfed-${ENVIRONMENT}"
IMAGE_URI="${REPOSITORY_URI}:${IMAGE_TAG}"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Image URI: ${IMAGE_URI}"

# Get the current task definition
echo "Getting current task definition..."
TASK_DEF=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].taskDefinition" --output text)
echo "Current task definition: $TASK_DEF"

# Get the current task definition JSON
echo "Extracting task definition details..."
aws ecs describe-task-definition --task-definition $TASK_DEF --query "taskDefinition" > task-definition.json

# Get the task definition family
TASK_FAMILY=$(jq -r .family task-definition.json)
echo "Task family: ${TASK_FAMILY}"

# Update the container image in the task definition
CONTAINER_NAME=$(jq -r ".containerDefinitions[0].name" task-definition.json)
echo "Container name: $CONTAINER_NAME"

# Create a new task definition with the updated image
echo "Creating new task definition with updated image..."
jq ".containerDefinitions[0].image = \"$IMAGE_URI\"" task-definition.json > new-task-definition.json

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --family $(jq -r .family task-definition.json) \
  --execution-role-arn $(jq -r .executionRoleArn task-definition.json) \
  --task-role-arn $(jq -r .taskRoleArn task-definition.json) \
  --network-mode $(jq -r .networkMode task-definition.json) \
  --container-definitions $(jq .containerDefinitions new-task-definition.json) \
  --cpu $(jq -r .cpu task-definition.json) \
  --memory $(jq -r .memory task-definition.json) \
  --requires-compatibilities $(jq -r .requiresCompatibilities[] task-definition.json) \
  --query "taskDefinition.taskDefinitionArn" --output text)

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
rm -f task-definition.json new-task-definition.json

echo "Done!"
