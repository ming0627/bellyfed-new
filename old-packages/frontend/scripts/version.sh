#!/usr/bin/env bash
set -euo pipefail

# Script to generate immutable Docker tags
# Usage: ./scripts/version.sh [environment]

# Get environment (default to current branch)
ENVIRONMENT=${1:-$(git rev-parse --abbrev-ref HEAD)}

# Get Git information
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_SHORT_SHA=$(git rev-parse --short HEAD)

# Try to get semantic version from package.json
if [ -f "package.json" ]; then
  VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
else
  VERSION="0.0.0"
fi

# Get the latest tag if it exists
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v$VERSION")

# Add timestamp for extra uniqueness
TIMESTAMP=$(date +%Y%m%d)

# Format the tag based on the branch
if [[ "$GIT_BRANCH" == "main" || "$GIT_BRANCH" == "master" ]]; then
  # Production tag: v1.2.3-20250426-abc1234
  TAG="${LATEST_TAG}-${TIMESTAMP}-${GIT_SHORT_SHA}"
elif [[ "$GIT_BRANCH" == "develop" ]]; then
  # Development tag: develop-20250426-abc1234
  TAG="develop-${TIMESTAMP}-${GIT_SHORT_SHA}"
elif [[ "$GIT_BRANCH" == release/* ]]; then
  # Release tag: release-1.2.3-20250426-abc1234
  RELEASE_VERSION=$(echo $GIT_BRANCH | sed 's/release\///')
  TAG="release-${RELEASE_VERSION}-${TIMESTAMP}-${GIT_SHORT_SHA}"
elif [[ "$GIT_BRANCH" == hotfix/* ]]; then
  # Hotfix tag: hotfix-1.2.4-20250426-abc1234
  HOTFIX_VERSION=$(echo $GIT_BRANCH | sed 's/hotfix\///')
  TAG="hotfix-${HOTFIX_VERSION}-${TIMESTAMP}-${GIT_SHORT_SHA}"
elif [[ "$GIT_BRANCH" == feature/* ]]; then
  # Feature tag: feature-abc-123-20250426-abc1234
  FEATURE_NAME=$(echo $GIT_BRANCH | sed 's/feature\///')
  TAG="feature-${FEATURE_NAME}-${TIMESTAMP}-${GIT_SHORT_SHA}"
else
  # Default tag: branch-name-20250426-abc1234
  SANITIZED_BRANCH=$(echo $GIT_BRANCH | sed 's/[^a-zA-Z0-9]/-/g')
  TAG="${SANITIZED_BRANCH}-${TIMESTAMP}-${GIT_SHORT_SHA}"
fi

# Output the tag
echo "$TAG"
