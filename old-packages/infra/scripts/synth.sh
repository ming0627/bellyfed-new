#!/bin/bash
set -eo pipefail

# CDK Synthesis script for Bellyfed-infra
# This script handles CDK synthesis with proper environment variables

# Function to display usage information
function show_usage {
  echo "Usage: $0 [OPTIONS]"
  echo "Synthesize CloudFormation templates for Bellyfed infrastructure"
  echo
  echo "Options:"
  echo "  -e, --environment ENV  Environment to synthesize for (default: dev)"
  echo "  -h, --help             Display this help message"
  echo
  echo "Examples:"
  echo "  $0                     # Synthesize for dev environment"
  echo "  $0 --environment test  # Synthesize for test environment"
  echo "  $0 --environment prod  # Synthesize for production environment"
}

# Default values
ENVIRONMENT="dev"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option $1"
      show_usage
      exit 1
      ;;
  esac
done

# Set AWS account and region
export CDK_DEFAULT_ACCOUNT=590184067494
export CDK_DEFAULT_REGION=ap-southeast-1

echo "Synthesizing CloudFormation templates for environment: $ENVIRONMENT"
npx cdk synth --context environment="$ENVIRONMENT"

echo "Synthesis complete for environment: $ENVIRONMENT"
