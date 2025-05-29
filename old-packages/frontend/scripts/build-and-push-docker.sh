#!/bin/bash
set -e

# Script to build and push Docker images with immutable tags
# Usage: ./scripts/build-and-push-docker.sh [environment]

# Get environment (default to dev)
ENVIRONMENT=${1:-"dev"}

# Generate the Docker tag
DOCKER_TAG=$(./scripts/generate-docker-tag.sh $ENVIRONMENT)
echo "Generated Docker tag: $DOCKER_TAG"

# Set AWS region and account ID
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="590184067494"  # Replace with your AWS account ID

# Set ECR repository URI
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bellyfed-${ENVIRONMENT}"

echo "Building Docker image with tag: $DOCKER_TAG"
echo "ECR Repository URI: $ECR_REPOSITORY_URI"

# Build the Docker image
docker build -t bellyfed:$DOCKER_TAG .

# Tag the image for ECR
docker tag bellyfed:$DOCKER_TAG $ECR_REPOSITORY_URI:$DOCKER_TAG
docker tag bellyfed:$DOCKER_TAG $ECR_REPOSITORY_URI:latest

# Log in to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Push the image to ECR
echo "Pushing image to ECR..."
docker push $ECR_REPOSITORY_URI:$DOCKER_TAG
docker push $ECR_REPOSITORY_URI:latest

echo "Image pushed successfully with tags:"
echo "- $ECR_REPOSITORY_URI:$DOCKER_TAG"
echo "- $ECR_REPOSITORY_URI:latest"

# Update ECS service (optional)
read -p "Do you want to update the ECS service with the new image? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  CLUSTER_NAME="bellyfed-${ENVIRONMENT}"
  SERVICE_NAME="bellyfed-${ENVIRONMENT}"
  
  echo "Updating ECS service..."
  aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
  
  echo "ECS service update initiated."
  echo "You can check the deployment status in the AWS console."
fi

echo "Done!"
