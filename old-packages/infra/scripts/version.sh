#!/usr/bin/env bash
set -euo pipefail

# Unified script for generating immutable Docker tags
# Usage:
#   ./scripts/version.sh                     # Basic tag generation
#   ./scripts/version.sh --ci                # CI mode with GitHub Actions variables
#   ./scripts/version.sh --update-changelog  # Update DOCKER-CHANGELOG.md
#   ./scripts/version.sh --env=prod          # Specify environment

# Process arguments
CI_MODE=false
UPDATE_CHANGELOG=false
ENVIRONMENT=""

for arg in "$@"; do
  case $arg in
    --ci)
      CI_MODE=true
      shift
      ;;
    --update-changelog)
      UPDATE_CHANGELOG=true
      shift
      ;;
    --env=*)
      ENVIRONMENT="${arg#*=}"
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Set environment if not specified
if [ -z "$ENVIRONMENT" ]; then
  ENVIRONMENT="dev"
fi

# Get Git information - handle CI environment variables
if [ "$CI_MODE" = true ]; then
  GIT_BRANCH=${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}
  GIT_SHORT_SHA=${GITHUB_SHA:0:7:-$(git rev-parse --short HEAD)}
  GIT_FULL_SHA=${GITHUB_SHA:-$(git rev-parse HEAD)}
else
  GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  GIT_SHORT_SHA=$(git rev-parse --short HEAD)
  GIT_FULL_SHA=$(git rev-parse HEAD)
fi

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
  ENVIRONMENT="prod"
elif [[ "$GIT_BRANCH" == "develop" ]]; then
  # Development tag: develop-20250426-abc1234
  TAG="develop-${TIMESTAMP}-${GIT_SHORT_SHA}"
  ENVIRONMENT="dev"
elif [[ "$GIT_BRANCH" == release/* ]]; then
  # Release tag: release-1.2.3-20250426-abc1234
  RELEASE_VERSION=$(echo $GIT_BRANCH | sed 's/release\///')
  TAG="release-${RELEASE_VERSION}-${TIMESTAMP}-${GIT_SHORT_SHA}"
  ENVIRONMENT="staging"
elif [[ "$GIT_BRANCH" == hotfix/* ]]; then
  # Hotfix tag: hotfix-1.2.4-20250426-abc1234
  HOTFIX_VERSION=$(echo $GIT_BRANCH | sed 's/hotfix\///')
  TAG="hotfix-${HOTFIX_VERSION}-${TIMESTAMP}-${GIT_SHORT_SHA}"
  ENVIRONMENT="prod"
elif [[ "$GIT_BRANCH" == feature/* ]]; then
  # Feature tag: feature-abc-123-20250426-abc1234
  FEATURE_NAME=$(echo $GIT_BRANCH | sed 's/feature\///')
  TAG="feature-${FEATURE_NAME}-${TIMESTAMP}-${GIT_SHORT_SHA}"
  ENVIRONMENT="dev"
else
  # Default tag: branch-name-20250426-abc1234
  SANITIZED_BRANCH=$(echo $GIT_BRANCH | sed 's/[^a-zA-Z0-9]/-/g')
  TAG="${SANITIZED_BRANCH}-${TIMESTAMP}-${GIT_SHORT_SHA}"
fi

# Update changelog if requested
if [ "$UPDATE_CHANGELOG" = true ]; then
  # Create the CHANGELOG entry
  CHANGELOG_ENTRY="## ${TAG} ($(date +%Y-%m-%d))\n\n"
  CHANGELOG_ENTRY+="- Branch: ${GIT_BRANCH}\n"
  CHANGELOG_ENTRY+="- Commit: ${GIT_FULL_SHA}\n"
  CHANGELOG_ENTRY+="- Environment: ${ENVIRONMENT}\n"
  
  if [ "$CI_MODE" = true ]; then
    CHANGELOG_ENTRY+="- Build: ${GITHUB_RUN_NUMBER:-Manual}\n"
    CHANGELOG_ENTRY+="- Workflow: ${GITHUB_WORKFLOW:-Manual}\n"
  fi

  if [[ -f DOCKER-CHANGELOG.md ]]; then
    # Find the line number where the "Latest Tags" section ends
    LATEST_TAGS_END=$(grep -n "<!-- New tags will be automatically added here by the CI/CD pipeline -->" DOCKER-CHANGELOG.md | cut -d: -f1)
    
    if [ -n "$LATEST_TAGS_END" ]; then
      # Create a temporary file with the updated content
      TEMP_FILE=$(mktemp)
      
      # Copy the content up to the end of the "Latest Tags" section
      head -n $LATEST_TAGS_END DOCKER-CHANGELOG.md > $TEMP_FILE
      
      # Add the new entry
      echo -e "\n${CHANGELOG_ENTRY}" >> $TEMP_FILE
      
      # Copy the rest of the file
      tail -n +$((LATEST_TAGS_END + 1)) DOCKER-CHANGELOG.md >> $TEMP_FILE
      
      # Replace the original file
      mv $TEMP_FILE DOCKER-CHANGELOG.md
      
      echo "DOCKER-CHANGELOG.md updated successfully" >&2
    else
      echo "Warning: Could not find the 'Latest Tags' section in DOCKER-CHANGELOG.md" >&2
      # Prepend the new entry to the existing DOCKER-CHANGELOG.md
      TEMP_FILE=$(mktemp)
      echo -e "# Docker Image Tag Changelog\n\nThis file tracks the purpose and details of each Docker image tag.\n\n${CHANGELOG_ENTRY}\n$(cat DOCKER-CHANGELOG.md | grep -v "# Docker Image Tag Changelog" | grep -v "This file tracks the purpose and details of each Docker image tag.")" > $TEMP_FILE
      mv $TEMP_FILE DOCKER-CHANGELOG.md
    fi
  else
    echo "Warning: DOCKER-CHANGELOG.md not found, creating new file" >&2
    # Create a new DOCKER-CHANGELOG.md file
    echo -e "# Docker Image Tag Changelog\n\nThis file tracks the purpose and details of each Docker image tag.\n\n## Latest Tags\n\n<!-- New tags will be automatically added here by the CI/CD pipeline -->\n\n${CHANGELOG_ENTRY}" > DOCKER-CHANGELOG.md
  fi
fi

# Output in different formats based on mode
if [ "$CI_MODE" = true ]; then
  # Output for CI environment
  echo "DOCKER_TAG=${TAG}"
  echo "ENVIRONMENT=${ENVIRONMENT}"
  # Also set GitHub Actions environment variables
  if [ -n "${GITHUB_ENV:-}" ]; then
    echo "DOCKER_TAG=${TAG}" >> $GITHUB_ENV
    echo "ENVIRONMENT=${ENVIRONMENT}" >> $GITHUB_ENV
  fi
else
  # Simple output for scripts
  echo "${TAG}"
fi
