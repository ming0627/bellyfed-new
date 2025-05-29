#!/bin/bash
# Script to deploy CDK stacks with rollback prevention

# Get environment from command line argument or default to dev
ENVIRONMENT=${1:-dev}
STACK_NAME="BellyfedCognitoStack-$ENVIRONMENT"
echo "Deploying to environment: $ENVIRONMENT"

# First, synthesize the CloudFormation template
echo "Synthesizing CloudFormation template..."
npx cdk synth --context environment=$ENVIRONMENT $STACK_NAME

# Check if synthesis was successful
if [ $? -ne 0 ]; then
  echo "Failed to synthesize CloudFormation template"
  exit 1
fi

# Get the template path
TEMPLATE_PATH="cdk.out/$STACK_NAME.template.json"

# Check if the template exists
if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Template file not found: $TEMPLATE_PATH"
  exit 1
fi

# Deploy using AWS CLI directly with disable-rollback
echo "Deploying stack with rollback prevention..."
aws cloudformation deploy \
  --template-file $TEMPLATE_PATH \
  --stack-name $STACK_NAME \
  --disable-rollback \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND

echo "Deployment completed. Check CloudFormation console for status."
