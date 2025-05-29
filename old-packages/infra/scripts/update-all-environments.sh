#!/bin/bash
set -e

# This script updates SSM parameters for all environments
# It's useful when you need to update all environments at once

# Set the region
REGION=${AWS_DEFAULT_REGION:-ap-southeast-1}
export AWS_DEFAULT_REGION=$REGION

echo "Updating SSM parameters for all environments in region $REGION"

# Update each environment
for ENV in dev test qa prod; do
  echo "Processing environment: $ENV"
  ./scripts/update-ssm-parameters.sh $ENV
  echo "-----------------------------------"
done

echo "All environments updated successfully."
echo "You can now deploy the certificate parameters stacks for each environment."
