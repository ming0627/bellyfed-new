#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Prompt for Confluence credentials
read -p "Enter your Confluence base URL (e.g., https://your-domain.atlassian.net/wiki): " BASE_URL
read -p "Enter your Confluence username (email): " USERNAME
read -p "Enter your Confluence API token: " API_TOKEN
read -p "Enter your Confluence space key: " SPACE_KEY
read -p "Enter your Confluence parent page ID: " PARENT_PAGE_ID
read -p "Enter AWS region for the secret (e.g., ap-southeast-2): " AWS_REGION

# Create JSON string
SECRET_STRING=$(cat << EOF
{
    "base-url": "${BASE_URL}",
    "username": "${USERNAME}",
    "api-token": "${API_TOKEN}",
    "space-key": "${SPACE_KEY}",
    "parent-page-id": "${PARENT_PAGE_ID}"
}
EOF
)

# Create the secret in AWS Secrets Manager
echo "Creating secret in AWS Secrets Manager..."
aws secretsmanager create-secret \
    --name confluence-credentials \
    --description "Confluence API credentials for documentation sync" \
    --secret-string "$SECRET_STRING" \
    --region "$AWS_REGION"

if [ $? -eq 0 ]; then
    echo "Secret created successfully!"
    echo "You can now deploy your CI/CD stack with: cdk deploy CicdStack"
else
    echo "Failed to create secret. Please check your AWS credentials and permissions."
fi
