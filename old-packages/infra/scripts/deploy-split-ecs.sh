#!/bin/bash
set -e

# Script to deploy the split ECS architecture
# This script demonstrates the independent deployment of infrastructure and service stacks
# Usage: ./deploy-split-ecs.sh [environment] [component]
# Example: ./deploy-split-ecs.sh dev infra
#
# Components:
#   - infra: Deploy only the ECS Infrastructure Stack
#   - service: Deploy only the ECS Service Stack
#   - all: Deploy both Infrastructure and Service Stacks (default)

# Environment to work with
ENVIRONMENT=${1:-dev}
COMPONENT=${2:-all}

echo "Starting split ECS deployment for environment: $ENVIRONMENT, component: $COMPONENT"

# Build and synthesize
npm run build
cdk synth

case "$COMPONENT" in
  infra)
    echo "Deploying only the ECS Infrastructure Stack..."
    cdk deploy BellyfedEcsInfraStack-$ENVIRONMENT \
      --require-approval never \
      --context environment=$ENVIRONMENT
    ;;
    
  service)
    echo "Deploying only the ECS Service Stack..."
    cdk deploy BellyfedEcsServiceStack-$ENVIRONMENT \
      --require-approval never \
      --context environment=$ENVIRONMENT
    ;;
    
  all)
    echo "Deploying both ECS Infrastructure and Service Stacks..."
    # Deploy infrastructure first
    cdk deploy BellyfedEcsInfraStack-$ENVIRONMENT \
      --require-approval never \
      --context environment=$ENVIRONMENT
      
    # Then deploy service
    cdk deploy BellyfedEcsServiceStack-$ENVIRONMENT \
      --require-approval never \
      --context environment=$ENVIRONMENT
    ;;
    
  *)
    echo "Unknown component: $COMPONENT"
    echo "Available options: infra, service, all"
    exit 1
    ;;
esac

echo "Split ECS deployment completed successfully!"
echo ""
echo "Note: This split architecture allows you to update the service independently"
echo "from the infrastructure, making deployments faster and more reliable."
