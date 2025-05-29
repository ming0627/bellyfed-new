#!/bin/bash

# Set default values for CDK environment variables if not already set
export CDK_DEFAULT_ACCOUNT=${CDK_DEFAULT_ACCOUNT:-590184067494}
export CDK_DEFAULT_REGION=${CDK_DEFAULT_REGION:-ap-southeast-1}
export ENV=${ENV:-dev}

# Print environment information for debugging
echo "Using environment: $ENV"
echo "Using AWS account: $CDK_DEFAULT_ACCOUNT"
echo "Using AWS region: $CDK_DEFAULT_REGION"

# Run the CDK synth command
npx cdk synth --context environment=$ENV

# Check if synth was successful
if [ $? -eq 0 ]; then
  echo "✅ CDK synth completed successfully"
  exit 0
else
  echo "❌ CDK synth failed with error code $?"
  exit 1
fi 