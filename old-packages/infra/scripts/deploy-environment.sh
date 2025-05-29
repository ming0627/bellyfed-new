#!/bin/bash
set -e

# This script handles the complete deployment process for a new environment
# Usage: ./scripts/deploy-environment.sh [environment] [options]
# Options:
#   --bootstrap: Bootstrap the environment first
#   --use-fallback-image: Use a fallback image (nginx:alpine) for the ECS service
#   --push-image: Build and push a Docker image to ECR
#   --deploy-cicd-only: Deploy only the CICD stack

# Get environment (default to dev)
ENVIRONMENT=${1:-"dev"}
shift

# Parse options
BOOTSTRAP=false
PUSH_IMAGE=false
DEPLOY_CICD_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bootstrap)
      BOOTSTRAP=true
      shift
      ;;
    --push-image)
      PUSH_IMAGE=true
      shift
      ;;
    --deploy-cicd-only)
      DEPLOY_CICD_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set AWS region
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# Set ECR repository URI
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bellyfed-${ENVIRONMENT}"

echo "=== Deploying Environment: $ENVIRONMENT ==="
echo "Bootstrap: $BOOTSTRAP"
echo "Push Image: $PUSH_IMAGE"
echo "Deploy CICD Only: $DEPLOY_CICD_ONLY"
echo "ECR Repository URI: $ECR_REPOSITORY_URI"

# Step 1: Bootstrap the environment if requested
if [ "$BOOTSTRAP" = "true" ]; then
  echo "=== Bootstrapping Environment ==="
  npx cdk bootstrap aws://${AWS_ACCOUNT_ID}/${AWS_REGION} --context environment=${ENVIRONMENT}

  # Update the bootstrap version to 21 if needed
  BOOTSTRAP_VERSION=$(aws ssm get-parameter --name /cdk-bootstrap/hnb659fds/version --region ${AWS_REGION} --query "Parameter.Value" --output text)
  if [ "$BOOTSTRAP_VERSION" -lt "21" ]; then
    echo "Updating bootstrap version to 21..."
    aws ssm put-parameter --name /cdk-bootstrap/hnb659fds/version --value "21" --type "String" --region ${AWS_REGION} --overwrite
  fi
fi

# Step 2: Create or ensure the ECR repository exists
echo "=== Ensuring ECR Repository Exists ==="
aws ecr describe-repositories --repository-names bellyfed-${ENVIRONMENT} --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name bellyfed-${ENVIRONMENT} --region ${AWS_REGION}

# Step 3: Deploy the Deployment Coordinator Stack first
echo "=== Deploying Deployment Coordinator Stack ==="
npx cdk deploy BellyfedDeploymentCoordinatorStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 4: Build and push Docker image if requested
if [ "$PUSH_IMAGE" = "true" ]; then
  echo "=== Building and Pushing Docker Image ==="

  # Check if Docker is running
  if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
  fi

  # Generate a tag based on the current timestamp and git commit
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  GIT_COMMIT=$(git rev-parse --short HEAD)
  IMAGE_TAG="${TIMESTAMP}-${GIT_COMMIT}"

  echo "Building Docker image with tag: $IMAGE_TAG"
  docker build -t bellyfed-${ENVIRONMENT}:${IMAGE_TAG} .

  # Log in to ECR
  echo "Logging in to ECR..."
  aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

  # Tag and push the image
  echo "Tagging and pushing image to ECR..."
  docker tag bellyfed-${ENVIRONMENT}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
  docker tag bellyfed-${ENVIRONMENT}:${IMAGE_TAG} ${ECR_REPOSITORY_URI}:latest

  docker push ${ECR_REPOSITORY_URI}:${IMAGE_TAG}
  docker push ${ECR_REPOSITORY_URI}:latest

  echo "Image pushed successfully with tags:"
  echo "- ${ECR_REPOSITORY_URI}:${IMAGE_TAG}"
  echo "- ${ECR_REPOSITORY_URI}:latest"
fi

# Step 5: Deploy the infrastructure
if [ "$DEPLOY_CICD_ONLY" = "true" ]; then
  echo "=== Deploying CICD Stack Only ==="
  npx cdk deploy BellyfedCicdStack-${ENVIRONMENT} \
    --context environment=${ENVIRONMENT} \
    --context deploy-cicd-only=true \
    --require-approval never
else
  echo "=== Deploying Full Infrastructure ==="

  # Deploy all stacks
  npx cdk deploy --all \
    --context environment=${ENVIRONMENT} \
    --require-approval never
fi

echo "=== Deployment Completed Successfully ==="
echo "Environment: $ENVIRONMENT"
echo "Next steps:"
echo "1. Verify the deployment in the AWS console"
echo "2. Build and push your Docker image to ${ECR_REPOSITORY_URI}:latest"
echo "3. Update the ECS service to use your image with fast rollback settings:"
echo "   aws ecs update-service --cluster bellyfed-${ENVIRONMENT}-cluster --service bellyfed-${ENVIRONMENT} \\"
echo "     --force-new-deployment \\"
echo "     --deployment-configuration \"deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100\" \\"
echo "     --health-check-grace-period-seconds 60 \\"
echo "     --region ${AWS_REGION}"
