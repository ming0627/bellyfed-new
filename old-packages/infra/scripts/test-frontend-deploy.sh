#!/bin/bash
set -e

# This script tests the frontend deployment process locally
# to ensure the ECS service update commands work correctly

# Set environment variables
ENVIRONMENT="dev"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}-cluster"
SERVICE_NAME="bellyfed-${ENVIRONMENT}"

echo "=== Testing Frontend Deployment Process ==="
echo "Environment: $ENVIRONMENT"
echo "Cluster Name: $CLUSTER_NAME"
echo "Service Name: $SERVICE_NAME"

# Check if imageDefinition.json exists
if [ ! -f "imageDefinition.json" ]; then
  echo "Error: imageDefinition.json not found"
  echo "Please run test-frontend-build.sh first"
  exit 1
fi

echo "=== Verifying Image Definition File ==="
cat imageDefinition.json
if ! jq . imageDefinition.json > /dev/null 2>&1; then
  echo "Error: imageDefinition.json is not valid JSON"
  exit 1
fi

echo "=== Testing Image Definition Parsing ==="
IMAGE_URI=$(jq -r .ImageURI imageDefinition.json)
if [ -z "$IMAGE_URI" ]; then
  echo "Error: Failed to extract ImageURI from imageDefinition.json"
  exit 1
fi

echo "Successfully extracted Image URI: $IMAGE_URI"

echo "=== Simulating ECS Service Update ==="
echo "Would run: aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment"
echo "Would run: aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME"

echo "=== Test Completed Successfully ==="
echo "Note: This script simulates the deployment process without actually updating the ECS service."
echo "To perform a real deployment, you would need to uncomment the aws commands and have proper AWS credentials."
