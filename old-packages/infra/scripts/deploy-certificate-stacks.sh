#!/bin/bash
set -e

# This script deploys certificate parameters and certificate stacks for a specific environment
# It's useful when you need to deploy both stacks at once

# Set the environment
ENVIRONMENT=${1:-dev}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|test|qa|prod)$ ]]; then
  echo "Error: Environment must be one of: dev, test, qa, prod"
  echo "Usage: $0 [environment]"
  exit 1
fi

echo "Deploying certificate stacks for environment: $ENVIRONMENT"

# First, update the SSM parameters
echo "Updating SSM parameters..."
./scripts/update-ssm-parameters.sh $ENVIRONMENT

# Deploy the certificate parameters stack
echo "Deploying certificate parameters stack..."
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-ap-southeast-1} npx cdk deploy BellyfedCertificateParametersStack-$ENVIRONMENT --context environment=$ENVIRONMENT --require-approval never

# Deploy the certificate stack
echo "Deploying certificate stack..."
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-ap-southeast-1} npx cdk deploy BellyfedCertificateStack-$ENVIRONMENT --context environment=$ENVIRONMENT --require-approval never

echo "Certificate stacks deployed successfully for environment: $ENVIRONMENT"
