#!/bin/bash
set -e

# Script to update the ECS task definition and service outside of CloudFormation
# This script is designed to be used with the new ECS Fargate stack that separates
# infrastructure from application deployment.
#
# Usage: ./update-ecs-task-definition.sh [environment] [image_tag]
# Example: ./update-ecs-task-definition.sh dev latest
# Example: ./update-ecs-task-definition.sh dev 1.2.3

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-ecs-task-definition.sh [environment] [image_tag]"
  echo "Example: ./update-ecs-task-definition.sh dev latest"
  exit 1
fi

# Set environment
ENVIRONMENT=$1

# Set image tag (default to 'latest' if not provided)
IMAGE_TAG=${2:-latest}

# Get parameters from SSM Parameter Store
echo "Retrieving parameters from SSM Parameter Store..."
TASK_FAMILY=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/task-definition-family" --query "Parameter.Value" --output text)
EXECUTION_ROLE_ARN=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/execution-role-arn" --query "Parameter.Value" --output text)
TASK_ROLE_ARN=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/task-role-arn" --query "Parameter.Value" --output text)
CLUSTER_NAME=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/cluster-name" --query "Parameter.Value" --output text)
SERVICE_NAME=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/service-name" --query "Parameter.Value" --output text)
REPOSITORY_URI=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/repository-uri" --query "Parameter.Value" --output text)

echo "Environment: ${ENVIRONMENT}"
echo "Task Definition Family: ${TASK_FAMILY}"
echo "Execution Role ARN: ${EXECUTION_ROLE_ARN}"
echo "Task Role ARN: ${TASK_ROLE_ARN}"
echo "Cluster Name: ${CLUSTER_NAME}"
echo "Service Name: ${SERVICE_NAME}"
echo "Repository URI: ${REPOSITORY_URI}"
echo "Image Tag: ${IMAGE_TAG}"

# Get the current task definition
echo "Retrieving current task definition..."
CURRENT_TASK_DEF=$(aws ecs describe-task-definition --task-definition ${TASK_FAMILY} --query "taskDefinition" --output json)

if [ $? -ne 0 ]; then
  echo "Error: Failed to retrieve task definition. Make sure the task definition exists and you have the necessary permissions."
  exit 1
fi

# Extract current container definition
echo "Extracting current container definition..."
CONTAINER_DEF=$(echo $CURRENT_TASK_DEF | jq '.containerDefinitions[0]')

# Update the image in the container definition
echo "Updating image in container definition..."
CONTAINER_DEF=$(echo $CONTAINER_DEF | jq --arg image "${REPOSITORY_URI}:${IMAGE_TAG}" '.image = $image')

# Prompt for environment variable updates
echo ""
echo "Do you want to:"
echo "1. Add/update a specific environment variable"
echo "2. Update all environment variables from a file"
echo "3. Just update the image without changing environment variables"
read -p "Enter your choice (1-3): " CHOICE

case $CHOICE in
  1)
    # Add/update a specific environment variable
    read -p "Enter environment variable name: " ENV_NAME
    read -p "Enter environment variable value: " ENV_VALUE
    
    # Get current environment variables
    ENV_VARS=$(echo $CONTAINER_DEF | jq '.environment')
    
    # Check if the environment variable already exists
    ENV_INDEX=$(echo $ENV_VARS | jq --arg name "$ENV_NAME" 'map(.name == $name) | index(true)')
    
    if [ "$ENV_INDEX" != "null" ]; then
      # Update existing environment variable
      echo "Updating existing environment variable: $ENV_NAME"
      ENV_VARS=$(echo $ENV_VARS | jq --arg name "$ENV_NAME" --arg value "$ENV_VALUE" 'map(if .name == $name then .value = $value else . end)')
    else
      # Add new environment variable
      echo "Adding new environment variable: $ENV_NAME"
      ENV_VARS=$(echo $ENV_VARS | jq --arg name "$ENV_NAME" --arg value "$ENV_VALUE" '. += [{"name": $name, "value": $value}]')
    fi
    
    # Update container definition with new environment variables
    CONTAINER_DEF=$(echo $CONTAINER_DEF | jq --argjson env "$ENV_VARS" '.environment = $env')
    ;;
    
  2)
    # Update all environment variables from a file
    read -p "Enter path to environment variables JSON file: " ENV_FILE
    
    if [ ! -f "$ENV_FILE" ]; then
      echo "Error: File not found: $ENV_FILE"
      exit 1
    fi
    
    # Replace all environment variables with those from the file
    echo "Updating environment variables from file: $ENV_FILE"
    ENV_VARS=$(cat $ENV_FILE)
    CONTAINER_DEF=$(echo $CONTAINER_DEF | jq --argjson env "$ENV_VARS" '.environment = $env')
    ;;
    
  3)
    # Just update the image without changing environment variables
    echo "Using current environment variables"
    ;;
    
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Create new task definition JSON
echo "Creating new task definition..."
NEW_TASK_DEF=$(echo $CURRENT_TASK_DEF | jq --argjson container "$CONTAINER_DEF" '.containerDefinitions[0] = $container' | \
  jq --arg family "$TASK_FAMILY" '.family = $family' | \
  jq --arg executionRoleArn "$EXECUTION_ROLE_ARN" '.executionRoleArn = $executionRoleArn' | \
  jq --arg taskRoleArn "$TASK_ROLE_ARN" '.taskRoleArn = $taskRoleArn' | \
  jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF" --query 'taskDefinition.taskDefinitionArn' --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: $NEW_TASK_DEF_ARN"

# Update service to use new task definition
echo "Updating service to use new task definition..."
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $NEW_TASK_DEF_ARN --force-new-deployment

if [ $? -ne 0 ]; then
  echo "Error: Failed to update service."
  exit 1
fi

echo "Service update initiated successfully."
echo "The new task definition will be deployed to the service."
echo "You can monitor the deployment status in the AWS Console or using the AWS CLI:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query 'services[0].deployments'"

# Optional: Wait for deployment to complete
read -p "Do you want to wait for the deployment to complete? (y/n): " WAIT_RESPONSE
if [[ "$WAIT_RESPONSE" =~ ^[Yy]$ ]]; then
  echo "Waiting for deployment to complete..."
  aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME
  
  if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
  else
    echo "Deployment is taking longer than expected. Please check the AWS Console for status."
  fi
fi

echo "Done!"
