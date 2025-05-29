#!/bin/bash
set -e

# Script to update Cognito environment variables in ECS task definition
# This script ensures NEXT_PUBLIC_COGNITO_CLIENT_ID is set correctly and removes redundant variables

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./update-cognito-env-vars-fixed.sh [environment]"
  echo "Example: ./update-cognito-env-vars-fixed.sh dev"
  exit 1
fi

ENVIRONMENT=$1
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-${ENVIRONMENT}-service"
TASK_FAMILY="bellyfed-${ENVIRONMENT}-service"

echo "Updating Cognito environment variables for environment: ${ENVIRONMENT}"
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

# Get the current revision
REVISION=$(echo $TASK_DEFINITION | jq -r '.revision')
echo "Current task definition revision: $REVISION"

# Get the Cognito client ID from SSM Parameter Store
echo "Retrieving Cognito client ID from SSM Parameter Store..."
CLIENT_ID=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/cognito/user-pool-client-id" --query 'Parameter.Value' --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to retrieve Cognito client ID from SSM Parameter Store."
  exit 1
fi

echo "Cognito client ID: $CLIENT_ID"

# Check if NEXT_PUBLIC_COGNITO_CLIENT_ID exists in the environment variables
echo "Checking if NEXT_PUBLIC_COGNITO_CLIENT_ID exists in the environment variables..."
HAS_COGNITO_CLIENT_ID=$(echo $TASK_DEFINITION | jq '.containerDefinitions[0].environment | map(.name) | contains(["NEXT_PUBLIC_COGNITO_CLIENT_ID"])')

# Update or add the environment variables in the task definition
echo "Updating environment variables in task definition..."
if [ "$HAS_COGNITO_CLIENT_ID" = "true" ]; then
  # Update existing NEXT_PUBLIC_COGNITO_CLIENT_ID
  echo "Updating existing NEXT_PUBLIC_COGNITO_CLIENT_ID..."
  UPDATED_ENV_VARS=$(echo $TASK_DEFINITION | jq --arg client_id "$CLIENT_ID" '.containerDefinitions[0].environment |= map(if .name == "NEXT_PUBLIC_COGNITO_CLIENT_ID" then .value = $client_id else . end)')
  
  # Remove NEXT_PUBLIC_USER_POOL_CLIENT_ID if it exists (standardize on one variable)
  echo "Removing redundant NEXT_PUBLIC_USER_POOL_CLIENT_ID..."
  UPDATED_ENV_VARS=$(echo $UPDATED_ENV_VARS | jq '.containerDefinitions[0].environment |= map(select(.name != "NEXT_PUBLIC_USER_POOL_CLIENT_ID"))')
else
  # Add NEXT_PUBLIC_COGNITO_CLIENT_ID if it doesn't exist
  echo "Adding NEXT_PUBLIC_COGNITO_CLIENT_ID..."
  UPDATED_ENV_VARS=$(echo $TASK_DEFINITION | jq --arg client_id "$CLIENT_ID" '.containerDefinitions[0].environment += [{"name": "NEXT_PUBLIC_COGNITO_CLIENT_ID", "value": $client_id}]')
  
  # Remove NEXT_PUBLIC_USER_POOL_CLIENT_ID if it exists (standardize on one variable)
  echo "Removing redundant NEXT_PUBLIC_USER_POOL_CLIENT_ID..."
  UPDATED_ENV_VARS=$(echo $UPDATED_ENV_VARS | jq '.containerDefinitions[0].environment |= map(select(.name != "NEXT_PUBLIC_USER_POOL_CLIENT_ID"))')
fi

# Extract only the required fields for registering a new task definition
echo "Filtering task definition to include only required fields..."
FILTERED_TASK_DEF=$(echo $UPDATED_ENV_VARS | jq '{
  family: .family,
  taskRoleArn: .taskRoleArn,
  executionRoleArn: .executionRoleArn,
  networkMode: .networkMode,
  containerDefinitions: .containerDefinitions,
  volumes: .volumes,
  placementConstraints: .placementConstraints,
  requiresCompatibilities: .requiresCompatibilities,
  cpu: .cpu,
  memory: .memory
}')

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json "$FILTERED_TASK_DEF" --query 'taskDefinition.taskDefinitionArn' --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: $NEW_TASK_DEF_ARN"

# Update the service to use the new task definition
echo "Updating service to use new task definition..."
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $NEW_TASK_DEF_ARN

if [ $? -ne 0 ]; then
  echo "Error: Failed to update service."
  exit 1
fi

echo "Service updated successfully. The new task definition will be deployed shortly."
echo "You can monitor the deployment status in the AWS ECS console."
