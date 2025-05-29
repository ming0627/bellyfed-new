#!/bin/bash
set -e

# Script to check the status of a frontend deployment
# Usage: ./check-deployment-status.sh [environment]
# Example: ./check-deployment-status.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./check-deployment-status.sh [environment]"
  echo "Example: ./check-deployment-status.sh dev"
  exit 1
fi

# Set environment
ENVIRONMENT=$1

# Set ECS cluster and service names
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-frontend-service"

echo "Environment: ${ENVIRONMENT}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"

# Check if the ECS cluster exists
echo "Checking if ECS cluster exists..."
CLUSTER_RESULT=$(aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --query 'clusters[0].clusterName' --output text 2>/dev/null)

if [[ "$CLUSTER_RESULT" == "None" || "$CLUSTER_RESULT" == "" ]]; then
  echo "Error: ECS cluster ${CLUSTER_NAME} does not exist."
  exit 1
fi

echo "ECS cluster ${CLUSTER_NAME} exists."

# Check if the ECS service exists
echo "Checking if ECS service exists..."
SERVICE_RESULT=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --query 'services[0].serviceName' --output text 2>/dev/null)

if [[ "$SERVICE_RESULT" == "None" || "$SERVICE_RESULT" == "" ]]; then
  echo "Error: ECS service ${SERVICE_NAME} does not exist."
  exit 1
fi

echo "ECS service ${SERVICE_NAME} exists."

# Get service details
echo "Getting service details..."
SERVICE_DETAILS=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}")

# Get deployment status
echo "Checking deployment status..."
DEPLOYMENTS=$(echo $SERVICE_DETAILS | jq -r '.services[0].deployments')
PRIMARY_DEPLOYMENT=$(echo $SERVICE_DETAILS | jq -r '.services[0].deployments[] | select(.status == "PRIMARY")')
PRIMARY_DEPLOYMENT_ID=$(echo $PRIMARY_DEPLOYMENT | jq -r '.id')
PRIMARY_DEPLOYMENT_STATUS=$(echo $PRIMARY_DEPLOYMENT | jq -r '.status')
PRIMARY_DEPLOYMENT_DESIRED=$(echo $PRIMARY_DEPLOYMENT | jq -r '.desiredCount')
PRIMARY_DEPLOYMENT_PENDING=$(echo $PRIMARY_DEPLOYMENT | jq -r '.pendingCount')
PRIMARY_DEPLOYMENT_RUNNING=$(echo $PRIMARY_DEPLOYMENT | jq -r '.runningCount')
PRIMARY_DEPLOYMENT_FAILED=$(echo $PRIMARY_DEPLOYMENT | jq -r '.failedTasks')
PRIMARY_DEPLOYMENT_CREATED=$(echo $PRIMARY_DEPLOYMENT | jq -r '.createdAt')
PRIMARY_DEPLOYMENT_UPDATED=$(echo $PRIMARY_DEPLOYMENT | jq -r '.updatedAt')

echo "Primary Deployment ID: ${PRIMARY_DEPLOYMENT_ID}"
echo "Status: ${PRIMARY_DEPLOYMENT_STATUS}"
echo "Desired Count: ${PRIMARY_DEPLOYMENT_DESIRED}"
echo "Pending Count: ${PRIMARY_DEPLOYMENT_PENDING}"
echo "Running Count: ${PRIMARY_DEPLOYMENT_RUNNING}"
echo "Failed Tasks: ${PRIMARY_DEPLOYMENT_FAILED}"
echo "Created At: $(date -r $PRIMARY_DEPLOYMENT_CREATED)"
echo "Updated At: $(date -r $PRIMARY_DEPLOYMENT_UPDATED)"

# Check if there are any other deployments
OTHER_DEPLOYMENTS=$(echo $SERVICE_DETAILS | jq -r '.services[0].deployments[] | select(.status != "PRIMARY")')
if [ ! -z "$OTHER_DEPLOYMENTS" ]; then
  echo "Other Deployments:"
  echo $OTHER_DEPLOYMENTS | jq -r '.id + " - " + .status + " - Desired: " + (.desiredCount|tostring) + " - Running: " + (.runningCount|tostring) + " - Pending: " + (.pendingCount|tostring)'
fi

# Get service events
echo "Recent Service Events:"
echo $SERVICE_DETAILS | jq -r '.services[0].events[0:5][] | .createdAt + " - " + .message' | while read line; do
  TIMESTAMP=$(echo $line | cut -d' ' -f1)
  MESSAGE=$(echo $line | cut -d' ' -f3-)
  echo "$(date -r $TIMESTAMP) - $MESSAGE"
done

# Get running tasks
echo "Getting running tasks..."
TASK_ARNS=$(aws ecs list-tasks --cluster "${CLUSTER_NAME}" --service-name "${SERVICE_NAME}" --desired-status RUNNING --query 'taskArns' --output text)

if [[ "$TASK_ARNS" == "None" || "$TASK_ARNS" == "" ]]; then
  echo "No running tasks found."
else
  echo "Running Tasks:"
  for TASK_ARN in $TASK_ARNS; do
    TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
    echo "Task ID: ${TASK_ID}"
    
    # Get task details
    TASK_DETAILS=$(aws ecs describe-tasks --cluster "${CLUSTER_NAME}" --tasks "${TASK_ARN}")
    
    # Get container details
    CONTAINER_DETAILS=$(echo $TASK_DETAILS | jq -r '.tasks[0].containers[0]')
    CONTAINER_NAME=$(echo $CONTAINER_DETAILS | jq -r '.name')
    CONTAINER_STATUS=$(echo $CONTAINER_DETAILS | jq -r '.lastStatus')
    CONTAINER_HEALTH=$(echo $CONTAINER_DETAILS | jq -r '.healthStatus')
    CONTAINER_IMAGE=$(echo $CONTAINER_DETAILS | jq -r '.image')
    
    echo "  Container Name: ${CONTAINER_NAME}"
    echo "  Status: ${CONTAINER_STATUS}"
    echo "  Health: ${CONTAINER_HEALTH}"
    echo "  Image: ${CONTAINER_IMAGE}"
    
    # Get task started at
    TASK_STARTED=$(echo $TASK_DETAILS | jq -r '.tasks[0].startedAt')
    if [ ! -z "$TASK_STARTED" ] && [ "$TASK_STARTED" != "null" ]; then
      echo "  Started At: $(date -r $TASK_STARTED)"
    fi
  done
fi

echo "Done!"
