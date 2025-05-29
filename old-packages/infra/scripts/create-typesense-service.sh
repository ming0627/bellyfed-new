#!/bin/bash
set -e

# Script to create an ECS service for the Typesense search engine
# This script is used to recreate the service if it was manually deleted
# Usage: ./create-typesense-service.sh [environment]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-typesense-${ENVIRONMENT}"
TASK_DEFINITION_NAME="bellyfed-typesense-${ENVIRONMENT}"
CONTAINER_NAME="TypesenseContainer"
TYPESENSE_PORT=8108

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Task Definition: ${TASK_DEFINITION_NAME}"
echo "Container Name: ${CONTAINER_NAME}"
echo "Typesense Port: ${TYPESENSE_PORT}"

# Check if the service already exists
SERVICE_EXISTS=$(aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --query "services[0].status" --output text 2>/dev/null || echo "MISSING")

if [ "${SERVICE_EXISTS}" == "ACTIVE" ]; then
  echo "Service ${SERVICE_NAME} already exists in cluster ${CLUSTER_NAME}."
  echo "Do you want to recreate it? (y/n)"
  read -p "> " RECREATE_SERVICE
  if [[ "${RECREATE_SERVICE}" != "y" ]]; then
    echo "Exiting without recreating the service."
    exit 0
  fi

  # Delete the existing service
  echo "Deleting existing service..."
  aws ecs delete-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --force

  # Wait for the service to be deleted
  echo "Waiting for service to be deleted..."
  aws ecs wait services-inactive --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}
fi

# Get the latest task definition revision
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition ${TASK_DEFINITION_NAME} --query "taskDefinition.taskDefinitionArn" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Task definition ${TASK_DEFINITION_NAME} not found."
  echo "Please run ./create-typesense-task-definition.sh first."
  exit 1
fi
echo "Using task definition: ${TASK_DEFINITION}"

# Get the security group for the service
SERVICE_SG=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/security-group/typesense-service-security-group" --query "Parameter.Value" --output text)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get service security group."
  exit 1
fi
echo "Service Security Group: ${SERVICE_SG}"

# Get the subnets for the service
SUBNET_1="subnet-091fbb4f8be4add78"  # PrivateSubnet-devSubnet1
SUBNET_2="subnet-0b4c48851e37ee7e4"  # PrivateSubnet-devSubnet2

SUBNET_LIST="${SUBNET_1},${SUBNET_2}"
echo "Subnets: ${SUBNET_LIST}"

# Skip service discovery for now
echo "Skipping service discovery setup for Typesense service."

# Create the service
echo "Creating ECS service..."
aws ecs create-service \
  --cluster ${CLUSTER_NAME} \
  --service-name ${SERVICE_NAME} \
  --task-definition ${TASK_DEFINITION} \
  --desired-count 1 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_LIST}],securityGroups=[${SERVICE_SG}],assignPublicIp=DISABLED}" \
  --health-check-grace-period-seconds 180 \
  --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=0" \
  --enable-execute-command \
  --tags key=Environment,value=${ENVIRONMENT} key=Application,value=Bellyfed key=Stack,value=Typesense-Service

if [ $? -ne 0 ]; then
  echo "Error: Failed to create service."
  exit 1
fi

echo "Service ${SERVICE_NAME} created successfully."
echo "Waiting for service to stabilize..."
aws ecs wait services-stable --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}

if [ $? -eq 0 ]; then
  echo "Service is now stable."
else
  echo "Service is taking longer than expected to stabilize. Please check the AWS Console for status."
fi

echo "Done!"
