#!/bin/bash

# Script to fix CDK bootstrap issue with missing SSM parameter
# This script bootstraps the CDK environment with a specific qualifier

# Set environment variables
export CDK_DEFAULT_ACCOUNT=590184067494
export CDK_DEFAULT_REGION=ap-southeast-1

# Bootstrap with the specific qualifier that's being looked for
echo "Bootstrapping CDK environment with qualifier mhb659fds..."
npx cdk bootstrap aws://590184067494/ap-southeast-1 --qualifier mhb659fds --context environment=dev

# Also bootstrap us-east-1 for Lambda@Edge
echo "Bootstrapping us-east-1 for Lambda@Edge..."
npx cdk bootstrap aws://590184067494/us-east-1 --qualifier mhb659fds --context environment=dev

echo "Bootstrap complete. Now deploying the stack..."
npx cdk deploy edge-lambda-stack-c8b43fc3b2042cdd5b08bd783c2648bc4e29fa5c6c --context environment=dev --require-approval never
