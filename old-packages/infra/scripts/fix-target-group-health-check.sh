#!/bin/bash
set -e

# Script to fix the target group health check settings
# This script updates the target group health check to accept 307 redirects as healthy
# Usage: ./scripts/fix-target-group-health-check.sh [environment]

# Set environment variables
ENVIRONMENT=${1:-"dev"}
TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:ap-southeast-1:590184067494:targetgroup/bellyfed-${ENVIRONMENT}-tg/36e53eba5927529f"

echo "Environment: ${ENVIRONMENT}"
echo "Target Group ARN: ${TARGET_GROUP_ARN}"

# Update the target group health check settings
echo "Updating target group health check settings..."
aws elbv2 modify-target-group --target-group-arn ${TARGET_GROUP_ARN} \
  --health-check-path "/health" \
  --matcher '{"HttpCode": "200-399"}'

if [ $? -ne 0 ]; then
  echo "Error: Failed to update target group health check settings."
  exit 1
fi

echo "Target group health check settings updated successfully."
echo "Waiting for targets to become healthy..."

# Wait for a moment to allow the health checks to run
sleep 30

# Check the target health
aws elbv2 describe-target-health --target-group-arn ${TARGET_GROUP_ARN}

echo "Done!"
