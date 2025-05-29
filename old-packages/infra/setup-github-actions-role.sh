#!/bin/bash

# This script creates the necessary AWS resources for GitHub Actions to deploy your CDK stack
# You must have the AWS CLI installed and configured with admin access

# Replace these variables with your own values
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
GITHUB_REPO="ming0627/bellyfed-infra"
BRANCH_NAME="feature/test-github-actions" # Update this to include all branches you want to deploy from

echo "Setting up GitHub Actions role for AWS account: $AWS_ACCOUNT_ID"
echo "GitHub repository: $GITHUB_REPO"

# Update the trust policy with your account ID
sed -i.bak "s/<AWS_ACCOUNT_ID>/$AWS_ACCOUNT_ID/g" github-actions-trust-policy.json
# For macOS, use:
# sed -i '' "s/<AWS_ACCOUNT_ID>/$AWS_ACCOUNT_ID/g" github-actions-trust-policy.json

# Check if the GitHub OIDC provider exists, if not create it
if aws iam list-open-id-connect-providers | grep -q "arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"; then
    echo "GitHub OIDC provider already exists"
else
    echo "Creating GitHub OIDC provider"
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
fi

# Create the IAM role for GitHub Actions
ROLE_NAME="GitHubActions-CDKDeploy"
echo "Creating IAM role: $ROLE_NAME"
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://github-actions-trust-policy.json

# Create the IAM policy for GitHub Actions
POLICY_NAME="GitHubActions-CDKDeploy-Policy"
echo "Creating IAM policy: $POLICY_NAME"
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://github-actions-cdkdeploy-policy.json

# Attach the policy to the role
echo "Attaching policy to role"
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/$POLICY_NAME"

# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text)
echo ""
echo "Role setup complete. Use this ARN in your GitHub Actions secrets:"
echo "ROLE_ARN: $ROLE_ARN"
echo ""
echo "Next steps:"
echo "1. Add this ARN as a secret named 'AWS_ROLE_ARN' in your GitHub repository settings"
echo "2. Add your AWS region as a secret named 'AWS_REGION' in your GitHub repository settings"
echo "3. Update your trust policy if you need to add more branches or pull requests" 