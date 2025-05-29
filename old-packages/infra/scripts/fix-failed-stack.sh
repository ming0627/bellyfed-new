#!/bin/bash
# Script to check and fix a failed stack

# Get environment from command line argument or default to dev
ENVIRONMENT=${1:-dev}
STACK_NAME="BellyfedCognitoStack-$ENVIRONMENT"
echo "Checking stack: $STACK_NAME"

# Get stack status
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].StackStatus" --output text 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "Stack $STACK_NAME not found"
  exit 1
fi

echo "Current stack status: $STACK_STATUS"

# Check if stack is in a failed state
if [[ $STACK_STATUS == *"FAILED"* || $STACK_STATUS == *"ROLLBACK"* ]]; then
  echo "Stack is in a failed state. Attempting to fix..."

  # Continue update rollback if needed
  if [[ $STACK_STATUS == "UPDATE_ROLLBACK_FAILED" ]]; then
    echo "Continuing update rollback..."
    aws cloudformation continue-update-rollback --stack-name $STACK_NAME
    echo "Waiting for rollback to complete..."
    aws cloudformation wait stack-rollback-complete --stack-name $STACK_NAME
  fi

  # Synthesize the template
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

  # Deploy with rollback prevention using AWS CLI
  echo "Redeploying stack with rollback prevention..."
  aws cloudformation deploy \
    --template-file $TEMPLATE_PATH \
    --stack-name $STACK_NAME \
    --disable-rollback \
    --no-fail-on-empty-changeset \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND

  echo "Deployment completed. Check CloudFormation console for status."
else
  echo "Stack is not in a failed state. No action needed."
fi
