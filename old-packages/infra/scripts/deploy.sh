#!/usr/bin/env bash
set -eo pipefail

# Deployment script for Bellyfed-infra

# Function to display usage information
function show_usage {
  echo "Usage: $0 [OPTIONS]"
  echo "Deploy Bellyfed infrastructure to a specified environment"
  echo
  echo "Options:"
  echo "  -e, --environment ENV  Environment to deploy to"
  echo "  -b, --branch BRANCH    Git branch associated with the environment (defaults to environment name)"
  echo "  -m, --migration NAME   Optional migration name to run"
  echo "  -s, --bootstrap        Bootstrap the environment before deployment"
  echo "  -h, --help             Display this help message"
  echo
  echo "Examples:"
  echo "  $0 --environment test                  # Deploy to test environment"
  echo "  $0 --environment qa                    # Deploy to qa environment"
  echo "  $0 --environment prod                  # Deploy to production environment"
  echo "  $0 --environment dev --branch feature/auth  # Deploy to dev environment using feature/auth branch"
  echo "  $0 --environment test --bootstrap      # Bootstrap test environment"
  echo "  $0 --environment test --migration init # Run init migration in test environment"
}

# Default values
ENVIRONMENT=""
BRANCH=""
MIGRATION=""
BOOTSTRAP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    -m|--migration)
      MIGRATION="$2"
      shift 2
      ;;
    -s|--bootstrap)
      BOOTSTRAP=true
      shift
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

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
  echo "Error: Environment is required"
  show_usage
  exit 1
fi

# Set branch to environment name if not specified
if [[ -z "$BRANCH" ]]; then
  BRANCH="$ENVIRONMENT"
  # Handle special case for prod
  if [[ "$ENVIRONMENT" == "prod" ]]; then
    BRANCH="master"
  fi
fi

# Set up command
CMD="npm run build && cdk synth --context environment=$ENVIRONMENT"

# Add branch context if specified
CMD="$CMD --context branch=$BRANCH"

# Add bootstrap context if needed
if [[ "$BOOTSTRAP" == true ]]; then
  CMD="$CMD --context bootstrap=true"
fi

# Add migration if specified
if [[ -n "$MIGRATION" ]]; then
  CMD="$CMD --context migration=$MIGRATION"
  export MIGRATION_NAME="$MIGRATION"
fi

# Add deployment command
CMD="$CMD && cdk deploy --context environment=$ENVIRONMENT"

# Add branch context if specified
CMD="$CMD --context branch=$BRANCH"

# Add migration if specified
if [[ -n "$MIGRATION" ]]; then
  CMD="$CMD --context migration=$MIGRATION"
fi

# Add bootstrap context if needed
if [[ "$BOOTSTRAP" == true ]]; then
  CMD="$CMD --context bootstrap=true"
fi

# Add approval option for production or when environment name contains 'prod'
if [[ "$ENVIRONMENT" == "prod" || "$ENVIRONMENT" == *"prod"* ]]; then
  echo "⚠️ You are deploying to $ENVIRONMENT environment, which requires manual approval."
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
  fi
fi

# Execute the command
echo "Deploying to $ENVIRONMENT environment using branch $BRANCH..."
echo "Running: $CMD"
eval "$CMD"

echo "Deployment to $ENVIRONMENT complete!" 