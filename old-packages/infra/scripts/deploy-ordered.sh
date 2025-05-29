#!/bin/bash
# Script to deploy stacks in the correct order to ensure ECR repository is populated
# before ECS service is deployed

# Set default values
ENVIRONMENT="dev"

# Show usage information
show_usage() {
  echo "Usage: $0 -e <environment>"
  echo "  -e <environment>       Environment to deploy (default: dev)"
  echo "  -h                     Show this help message"
}

# Parse command line arguments
while getopts "e:h" opt; do
  case $opt in
    e) ENVIRONMENT="$OPTARG" ;;
    h) show_usage; exit 0 ;;
    *) show_usage; exit 1 ;;
  esac
done

echo "=== Deploying to environment: $ENVIRONMENT ==="

# Step 1: Deploy Bootstrap Stack
echo "=== Deploying Bootstrap Stack ==="
npx cdk deploy BellyfedBootstrapStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 2: Deploy Deployment Coordinator Stack
echo "=== Deploying Deployment Coordinator Stack ==="
npx cdk deploy BellyfedDeploymentCoordinatorStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 3: Deploy Network Stack
echo "=== Deploying Network Stack ==="
npx cdk deploy BellyfedNetworkStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 4: Deploy ECS Infrastructure Stack
echo "=== Deploying ECS Infrastructure Stack ==="
npx cdk deploy BellyfedEcsInfraStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 5: Deploy Frontend CICD Stack
echo "=== Deploying Frontend CICD Stack ==="
npx cdk deploy BellyfedFrontendCicdStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

# Step 6: Deploy ECS Service Stack
echo "=== Deploying ECS Service Stack ==="
npx cdk deploy BellyfedEcsServiceStack-${ENVIRONMENT} \
  --context environment=${ENVIRONMENT} \
  --require-approval never

echo "=== Deployment completed successfully ==="
