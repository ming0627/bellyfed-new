#!/bin/bash
set -e

# Script to create a task definition for the ECS service
# This script is used to recreate the task definition if it was manually deleted
# Usage: ./create-task-definition.sh [environment]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-${ENVIRONMENT}-app"
TASK_DEFINITION_NAME="bellyfed-${ENVIRONMENT}-app"
CONTAINER_NAME="bellyfed-${ENVIRONMENT}-container"
EXECUTION_ROLE_NAME="bellyfed-${ENVIRONMENT}-execution-role"
TASK_ROLE_NAME="bellyfed-${ENVIRONMENT}-task-role"
LOG_GROUP_NAME="/aws/ecs/bellyfed-${ENVIRONMENT}"
ECR_REPOSITORY_NAME="bellyfed-${ENVIRONMENT}-app"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Task Definition: ${TASK_DEFINITION_NAME}"
echo "Container Name: ${CONTAINER_NAME}"
echo "Execution Role: ${EXECUTION_ROLE_NAME}"
echo "Task Role: ${TASK_ROLE_NAME}"
echo "Log Group: ${LOG_GROUP_NAME}"
echo "ECR Repository: ${ECR_REPOSITORY_NAME}"

# Get the execution role ARN
EXECUTION_ROLE_ARN=$(aws iam get-role --role-name ${EXECUTION_ROLE_NAME} --query "Role.Arn" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get execution role ARN."
  exit 1
fi
echo "Execution Role ARN: ${EXECUTION_ROLE_ARN}"

# Get the task role ARN
TASK_ROLE_ARN=$(aws iam get-role --role-name ${TASK_ROLE_NAME} --query "Role.Arn" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get task role ARN."
  exit 1
fi
echo "Task Role ARN: ${TASK_ROLE_ARN}"

# Get the ECR repository URI
ECR_REPOSITORY_URI=$(aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NAME} --query "repositories[0].repositoryUri" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get ECR repository URI."
  exit 1
fi
echo "ECR Repository URI: ${ECR_REPOSITORY_URI}"

# Check if the task definition already exists
EXISTING_TASK_DEF=$(aws ecs list-task-definitions --family-prefix ${TASK_DEFINITION_NAME} --status ACTIVE --query "taskDefinitionArns[0]" --output text)
if [ "${EXISTING_TASK_DEF}" != "None" ] && [ -n "${EXISTING_TASK_DEF}" ]; then
  echo "Task definition already exists: ${EXISTING_TASK_DEF}"
  echo "Do you want to create a new revision? (y/n)"
  read -p "> " CREATE_NEW_REVISION
  if [[ "${CREATE_NEW_REVISION}" != "y" ]]; then
    echo "Exiting without creating a new revision."
    exit 0
  fi
fi

# Create a new task definition
echo "Creating task definition JSON..."
cat > task-definition.json << EOF
{
    "family": "${TASK_DEFINITION_NAME}",
    "containerDefinitions": [
        {
            "name": "${CONTAINER_NAME}",
            "image": "${ECR_REPOSITORY_URI}:latest",
            "cpu": 0,
            "portMappings": [
                {
                    "containerPort": 3000,
                    "hostPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "ENVIRONMENT",
                    "value": "${ENVIRONMENT}"
                },
                {
                    "name": "AWS_REGION",
                    "value": "${AWS_REGION}"
                }
            ],
            "healthCheck": {
                "command": [
                    "CMD-SHELL",
                    "wget -q --spider http://localhost:3000/health || exit 1"
                ],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 120
            },
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "${LOG_GROUP_NAME}",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "${CONTAINER_NAME}"
                }
            }
        }
    ],
    "taskRoleArn": "${TASK_ROLE_ARN}",
    "executionRoleArn": "${EXECUTION_ROLE_ARN}",
    "networkMode": "awsvpc",
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "256",
    "memory": "1024"
}
EOF

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://task-definition.json --query "taskDefinition.taskDefinitionArn" --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: ${NEW_TASK_DEF_ARN}"

# Check if the service exists
SERVICE_EXISTS=$(aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --query "services[0].status" --output text 2>/dev/null || echo "MISSING")

if [ "${SERVICE_EXISTS}" == "ACTIVE" ]; then
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
else
  echo "Service ${SERVICE_NAME} does not exist in cluster ${CLUSTER_NAME}."
  echo "You will need to create the service using the AWS Console or CDK."
fi

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -f task-definition.json

echo "Done!"
