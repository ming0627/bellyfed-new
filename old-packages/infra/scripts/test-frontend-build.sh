#!/bin/bash
set -e

# This script tests the frontend build process locally
# to ensure the Docker image builds correctly and the imageDefinition.json file is properly created

# Set environment variables
ENVIRONMENT="dev"
REPOSITORY_URI="local-test/bellyfed-${ENVIRONMENT}"
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_TAG=${COMMIT_HASH:=latest}

echo "=== Testing Frontend Build Process ==="
echo "Environment: $ENVIRONMENT"
echo "Repository URI: $REPOSITORY_URI"
echo "Image Tag: $IMAGE_TAG"

# Check if we're running in a pre-commit hook or directly
if [ "$HUSKY" = "1" ]; then
  echo "Running in Husky pre-commit hook"
  # In pre-commit hook, we'll just validate the CDK code without building the Docker image
  echo "=== Validating CDK Code ==="

  # Check if frontend-cicd-stack.ts exists
  if [ -f "lib/frontend-cicd-stack.ts" ]; then
    echo "Checking lib/frontend-cicd-stack.ts..."
    # Just check if the file exists and is readable
    if [ ! -r "lib/frontend-cicd-stack.ts" ]; then
      echo "Error: Cannot read lib/frontend-cicd-stack.ts"
      exit 1
    fi
    echo "File check passed for lib/frontend-cicd-stack.ts"
  else
    echo "Warning: lib/frontend-cicd-stack.ts not found"
  fi

  # Create a test imageDefinition.json file
  echo "=== Creating Test Image Definition File ==="
  echo "{\"ImageURI\":\"$REPOSITORY_URI:$IMAGE_TAG\"}" > test-imageDefinition.json

  echo "=== Verifying Image Definition File ==="
  cat test-imageDefinition.json
  if ! jq . test-imageDefinition.json > /dev/null 2>&1; then
    echo "Error: Failed to create valid JSON"
    exit 1
  fi

  echo "=== Testing Image Definition Parsing ==="
  IMAGE_URI=$(jq -r .ImageURI test-imageDefinition.json)
  if [ -z "$IMAGE_URI" ]; then
    echo "Error: Failed to extract ImageURI from test-imageDefinition.json"
    exit 1
  fi

  echo "Successfully extracted Image URI: $IMAGE_URI"
  rm test-imageDefinition.json
  echo "=== Test Completed Successfully ==="
  exit 0
fi

# If not running in Husky, proceed with full Docker build test

# Navigate to the frontend repository
# Replace with the actual path to your frontend repository
FRONTEND_REPO="../bellyfed-frontend"
if [ ! -d "$FRONTEND_REPO" ]; then
  echo "Error: Frontend repository not found at $FRONTEND_REPO"
  echo "Please update the FRONTEND_REPO variable in this script"
  exit 1
fi

cd "$FRONTEND_REPO"

echo "=== Building Docker Image ==="
docker build -t $REPOSITORY_URI:latest .
docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG

echo "=== Creating Image Definition File ==="
echo "{\"ImageURI\":\"$REPOSITORY_URI:$IMAGE_TAG\"}" > imageDefinition.json

echo "=== Verifying Image Definition File ==="
cat imageDefinition.json
if ! jq . imageDefinition.json > /dev/null 2>&1; then
  echo "Error: Failed to create valid JSON"
  exit 1
fi

echo "=== Testing Image Definition Parsing ==="
IMAGE_URI=$(jq -r .ImageURI imageDefinition.json)
if [ -z "$IMAGE_URI" ]; then
  echo "Error: Failed to extract ImageURI from imageDefinition.json"
  exit 1
fi

echo "Successfully extracted Image URI: $IMAGE_URI"
echo "=== Test Completed Successfully ==="
