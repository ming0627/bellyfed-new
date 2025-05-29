#!/bin/bash
set -e

# Manual deployment script for Bellyfed frontend
# This script builds and deploys the frontend Docker image to ECR and updates the ECS service
# Usage: ./manual-deploy.sh [environment]
# Example: ./manual-deploy.sh dev

# Check if environment is provided
if [ -z "$1" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./manual-deploy.sh [environment]"
  echo "Example: ./manual-deploy.sh dev"
  exit 1
fi

# Set environment
ENVIRONMENT=$1

# Set AWS region
AWS_REGION="ap-southeast-1"

# Get ECR repository URI from SSM Parameter Store
echo "Getting ECR repository URI from SSM Parameter Store..."
ECR_REPOSITORY_URI=$(aws ssm get-parameter --name "/bellyfed/${ENVIRONMENT}/ecs/repository-uri" --query "Parameter.Value" --output text)

if [ -z "$ECR_REPOSITORY_URI" ]; then
  echo "Error: Failed to get ECR repository URI from SSM Parameter Store."
  echo "Make sure the parameter /bellyfed/${ENVIRONMENT}/ecs/repository-uri exists."
  exit 1
fi

# Set ECS cluster and service names
CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
SERVICE_NAME="bellyfed-frontend-service"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECR Repository URI: ${ECR_REPOSITORY_URI}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"

# Confirm with the user
read -p "Do you want to proceed with the deployment? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Deployment cancelled."
  exit 0
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t bellyfed-frontend:latest .

# Log in to ECR
echo "Logging in to ECR..."
ECR_REGISTRY=$(echo $ECR_REPOSITORY_URI | cut -d'/' -f1)
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Tag the image
echo "Tagging image as ${ECR_REPOSITORY_URI}:latest..."
docker tag bellyfed-frontend:latest ${ECR_REPOSITORY_URI}:latest

# Push the image to ECR
echo "Pushing image to ECR..."
docker push ${ECR_REPOSITORY_URI}:latest

# Update the ECS service
echo "Updating ECS service..."
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment

# Wait for the deployment to complete
echo "Waiting for deployment to complete..."
echo "This may take several minutes..."
aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME

# Check the deployment status
echo "Checking deployment status..."
DEPLOYMENT_STATUS=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].deployments[0].status" --output text)

if [ "$DEPLOYMENT_STATUS" == "PRIMARY" ]; then
  echo "Deployment completed successfully!"
else
  echo "Deployment status: ${DEPLOYMENT_STATUS}"
  echo "Check the AWS Console for more details."
fi

echo "Done!"
