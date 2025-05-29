#!/bin/bash
# Script to deploy a new Cognito stack with a different name

# Get environment from command line argument or default to dev
ENVIRONMENT=${1:-dev}
STACK_SUFFIX=${2:-v1}
STACK_NAME="BellyfedCognitoStack-$ENVIRONMENT-$STACK_SUFFIX"
echo "Deploying new stack: $STACK_NAME to environment: $ENVIRONMENT"

# Skip email configuration entirely
export SKIP_EMAIL_CONFIG=true

# First, synthesize the CloudFormation template
echo "Synthesizing CloudFormation template..."
npx cdk synth --context environment=$ENVIRONMENT

# Check if synthesis was successful
if [ $? -ne 0 ]; then
  echo "Failed to synthesize CloudFormation template"
  exit 1
fi

# Get the template path
TEMPLATE_PATH="cdk.out/BellyfedCognitoStack-$ENVIRONMENT.template.json"

# Check if the template exists
if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Template file not found: $TEMPLATE_PATH"
  echo "Trying to find the template file..."
  TEMPLATE_PATH=$(find cdk.out -name "BellyfedCognitoStack-$ENVIRONMENT.template.json" | head -1)

  if [ -z "$TEMPLATE_PATH" ]; then
    echo "Could not find the template file. Exiting."
    exit 1
  else
    echo "Found template file: $TEMPLATE_PATH"
  fi
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
echo ""
echo "If you want to switch to SES later:"
echo "1. Verify the email address 'no-reply@bellyfed.com' in the AWS SES console"
echo "2. Update the stack with SES email sending"
