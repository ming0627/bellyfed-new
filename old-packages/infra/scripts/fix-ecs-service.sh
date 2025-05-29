#!/bin/bash
set -e

# This script fixes the ECS service by updating the task definition to use a different image
# Usage: ./scripts/fix-ecs-service.sh [environment]

# Get environment (default to dev)
ENVIRONMENT=${1:-"dev"}
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="590184067494"

# Set ECR repository URI
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bellyfed-${ENVIRONMENT}"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}-cluster"
SERVICE_NAME="bellyfed-${ENVIRONMENT}"

echo "Fixing ECS service for environment: $ENVIRONMENT"
echo "ECR Repository URI: $ECR_REPOSITORY_URI"
echo "Cluster Name: $CLUSTER_NAME"
echo "Service Name: $SERVICE_NAME"

# Step 1: Get the current task definition
echo "Getting current task definition..."
TASK_DEFINITION=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION | jq -r '.services[0].taskDefinition')
echo "Current task definition: $TASK_DEFINITION"

# Step 2: Get the task definition details
echo "Getting task definition details..."
TASK_DEF_JSON=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION --region $AWS_REGION)
echo "Task definition retrieved."

# Step 3: Create a new task definition with a different image
echo "Creating new task definition..."
NEW_TASK_DEF=$(echo $TASK_DEF_JSON | jq '.taskDefinition | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

# Step 4: Update the container image
echo "Updating container image..."
CONTAINER_NAME=$(echo $NEW_TASK_DEF | jq -r '.containerDefinitions[0].name')
echo "Container name: $CONTAINER_NAME"

# Use a public nginx image as a placeholder
NEW_TASK_DEF=$(echo $NEW_TASK_DEF | jq --arg image "nginx:alpine" '.containerDefinitions[0].image = $image')

# Step 5: Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --region $AWS_REGION --cli-input-json "$(echo $NEW_TASK_DEF)" | jq -r '.taskDefinition.taskDefinitionArn')
echo "New task definition registered: $NEW_TASK_DEF_ARN"

# Step 6: Update the service to use the new task definition with fast rollback settings
echo "Updating service to use new task definition with fast rollback settings..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_DEF_ARN \
  --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" \
  --health-check-grace-period-seconds 60 \
  --region $AWS_REGION

echo "Service updated successfully with fast rollback settings (under 5 minutes)."

echo "ECS service fix completed. The service will now use the nginx:alpine image as a placeholder."
echo "To deploy your actual application, build and push your Docker image to $ECR_REPOSITORY_URI:latest"
echo "Then update the service again with the correct image."
