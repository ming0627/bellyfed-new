#!/bin/bash
set -e

# Script to create a task definition for the Typesense ECS service
# This script is used to recreate the task definition if it was manually deleted
# Usage: ./create-typesense-task-definition.sh [environment]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-typesense-${ENVIRONMENT}"
TASK_DEFINITION_NAME="bellyfed-typesense-${ENVIRONMENT}"
CONTAINER_NAME="TypesenseContainer"
EXECUTION_ROLE_NAME="bellyfed-typesense-${ENVIRONMENT}-execution-role"
TASK_ROLE_NAME="bellyfed-typesense-${ENVIRONMENT}-task-role"
LOG_GROUP_NAME="/aws/ecs/typesense-${ENVIRONMENT}"
TYPESENSE_IMAGE="typesense/typesense:28.0"
TYPESENSE_PORT=8108

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Task Definition: ${TASK_DEFINITION_NAME}"
echo "Container Name: ${CONTAINER_NAME}"
echo "Execution Role: ${EXECUTION_ROLE_NAME}"
echo "Task Role: ${TASK_ROLE_NAME}"
echo "Log Group: ${LOG_GROUP_NAME}"
echo "Typesense Image: ${TYPESENSE_IMAGE}"
echo "Typesense Port: ${TYPESENSE_PORT}"

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

# Get the Typesense API key
TYPESENSE_API_KEY=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/typesense/api-key" --query "Parameter.Value" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get Typesense API key."
  exit 1
fi
echo "Typesense API Key: ${TYPESENSE_API_KEY}"

# Get the EFS file system ID
EFS_FILE_SYSTEM_ID=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/typesense/file-system-id" --query "Parameter.Value" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get EFS file system ID."
  exit 1
fi
echo "EFS File System ID: ${EFS_FILE_SYSTEM_ID}"

# Get the EFS access point ID
EFS_ACCESS_POINT_ID=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/typesense/access-point-id" --query "Parameter.Value" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get EFS access point ID."
  exit 1
fi
echo "EFS Access Point ID: ${EFS_ACCESS_POINT_ID}"

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
cat > typesense-task-definition.json << EOF
{
    "family": "${TASK_DEFINITION_NAME}",
    "containerDefinitions": [
        {
            "name": "${CONTAINER_NAME}",
            "image": "${TYPESENSE_IMAGE}",
            "cpu": 0,
            "portMappings": [
                {
                    "containerPort": ${TYPESENSE_PORT},
                    "hostPort": ${TYPESENSE_PORT},
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "environment": [
                {
                    "name": "TYPESENSE_API_KEY",
                    "value": "${TYPESENSE_API_KEY}"
                },
                {
                    "name": "TYPESENSE_DATA_DIR",
                    "value": "/data"
                },
                {
                    "name": "TYPESENSE_ENABLE_CORS",
                    "value": "true"
                },
                {
                    "name": "ECS_ENABLE_CONTAINER_METADATA",
                    "value": "true"
                },
                {
                    "name": "PLATFORM",
                    "value": "linux/amd64"
                }
            ],
            "mountPoints": [
                {
                    "sourceVolume": "typesense-data",
                    "containerPath": "/data",
                    "readOnly": false
                }
            ],
            "healthCheck": {
                "command": [
                    "CMD-SHELL",
                    "curl -f http://localhost:${TYPESENSE_PORT}/health || exit 1"
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
    "volumes": [
        {
            "name": "typesense-data",
            "efsVolumeConfiguration": {
                "fileSystemId": "${EFS_FILE_SYSTEM_ID}",
                "rootDirectory": "/",
                "transitEncryption": "ENABLED",
                "authorizationConfig": {
                    "accessPointId": "${EFS_ACCESS_POINT_ID}",
                    "iam": "ENABLED"
                }
            }
        }
    ],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "256",
    "memory": "1024"
}
EOF

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://typesense-task-definition.json --query "taskDefinition.taskDefinitionArn" --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: ${NEW_TASK_DEF_ARN}"

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -f typesense-task-definition.json

echo "Done!"
