#!/bin/bash
set -e

# Script to selectively deploy specific stacks
# Usage: ./selective-deploy.sh [environment] [deploy-type]
# Example: ./selective-deploy.sh dev ecs-service-only
#
# Deploy types:
#   - shared-only: Deploy only the Shared ECS Resources Stack
#   - ecs-infra-only: Deploy only the ECS Infrastructure Stack
#   - ecs-service-only: Deploy only the ECS Service Stack
#   - ecs-all: Deploy both ECS Infrastructure and Service Stacks
#   - frontend-cicd-only: Deploy only the Frontend CICD Stack
#   - all: Deploy all stacks (default)

# Environment to work with
ENVIRONMENT=${1:-dev}
DEPLOY_TYPE=${2:-all}

echo "Starting selective deployment for environment: $ENVIRONMENT, type: $DEPLOY_TYPE"

# Build and synthesize
npm run build
cdk synth

case "$DEPLOY_TYPE" in
  shared-only)
    echo "Deploying only the Shared ECS Resources Stack..."
    cdk deploy BellyfedSharedEcsResourcesStack-$ENVIRONMENT --require-approval never --context skip-ecs-stacks=true --context skip-frontend-cicd=true
    ;;

  ecs-infra-only)
    echo "Deploying only the ECS Infrastructure Stack..."
    cdk deploy BellyfedEcsInfraStack-$ENVIRONMENT --require-approval never --context skip-frontend-cicd=true
    ;;

  ecs-service-only)
    echo "Deploying only the ECS Service Stack..."
    cdk deploy BellyfedEcsServiceStack-$ENVIRONMENT --require-approval never --context skip-frontend-cicd=true
    ;;

  ecs-all)
    echo "Deploying both ECS Infrastructure and Service Stacks..."
    cdk deploy BellyfedEcsInfraStack-$ENVIRONMENT BellyfedEcsServiceStack-$ENVIRONMENT --require-approval never --context skip-frontend-cicd=true
    ;;

  frontend-cicd-only)
    echo "Deploying only the Frontend CICD Stack..."
    cdk deploy BellyfedFrontendCicdStack-$ENVIRONMENT --require-approval never
    ;;

  all)
    echo "Deploying all stacks..."
    cdk deploy BellyfedSharedEcsResourcesStack-$ENVIRONMENT BellyfedEcsInfraStack-$ENVIRONMENT BellyfedEcsServiceStack-$ENVIRONMENT BellyfedFrontendCicdStack-$ENVIRONMENT --require-approval never
    ;;

  *)
    echo "Unknown deployment type: $DEPLOY_TYPE"
    echo "Available options: shared-only, ecs-infra-only, ecs-service-only, ecs-all, frontend-cicd-only, all"
    exit 1
    ;;
esac

echo "Deployment completed successfully!"
