#!/bin/bash
set -e

# Script to update environment variables in ECS task definition and force a new deployment
# Usage: ./update-ecs-env-vars.sh [environment]
# Example: ./update-ecs-env-vars.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-ecs-env-vars.sh [environment]"
  echo "Example: ./update-ecs-env-vars.sh dev"
  exit 1
fi

ENVIRONMENT=$1
CLUSTER_NAME="bellyfed-${ENVIRONMENT}-cluster"
SERVICE_NAME="bellyfed-${ENVIRONMENT}"
TASK_FAMILY="BellyfedEcsFargateStack${ENVIRONMENT}${ENVIRONMENT}taskdefinition"

echo "Updating ECS environment variables for environment: ${ENVIRONMENT}"
echo "Cluster: ${CLUSTER_NAME}"
echo "Service: ${SERVICE_NAME}"
echo "Task Definition Family: ${TASK_FAMILY}"

# Get current task definition
echo "Retrieving current task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_FAMILY --query 'taskDefinition' --output json)

if [ $? -ne 0 ]; then
  echo "Error: Failed to retrieve task definition. Make sure the task definition exists and you have the necessary permissions."
  exit 1
fi

# Extract current environment variables
echo "Extracting current environment variables..."
ENV_VARS=$(echo $TASK_DEFINITION | jq '.containerDefinitions[0].environment')

# Display current environment variables
echo "Current environment variables:"
echo $ENV_VARS | jq '.'

# Prompt for environment variable updates
echo ""
echo "Do you want to:"
echo "1. Add/update a specific environment variable"
echo "2. Update all environment variables from a file"
echo "3. Just force a new deployment with current variables"
read -p "Enter your choice (1-3): " CHOICE

case $CHOICE in
  1)
    # Add/update a specific environment variable
    read -p "Enter environment variable name: " ENV_NAME
    read -p "Enter environment variable value: " ENV_VALUE
    
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
    ;;
    
  3)
    # Just force a new deployment with current variables
    echo "Using current environment variables for new deployment"
    ;;
    
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Create new task definition with updated environment variables
echo "Creating new task definition with updated environment variables..."
NEW_TASK_DEF=$(echo $TASK_DEFINITION | jq --argjson env "$ENV_VARS" '.containerDefinitions[0].environment = $env' | \
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
