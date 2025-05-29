#!/bin/bash

# This script deletes the existing IAM role and policy, then creates a new role for all branches
# You must have the AWS CLI installed and configured with admin access

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
GITHUB_REPO="ming0627/bellyfed-infra"

echo "Setting up GitHub Actions role for AWS account: $AWS_ACCOUNT_ID"
echo "GitHub repository: $GITHUB_REPO"

# 1. Delete existing role and policy
echo "Deleting existing GitHubActions-CDKDeploy role and policy..."

# Detach the policy from the role
aws iam detach-role-policy \
    --role-name GitHubActions-CDKDeploy \
    --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/GitHubActions-CDKDeploy-Policy" || echo "No policy to detach"

# Delete the role
aws iam delete-role --role-name GitHubActions-CDKDeploy || echo "No role to delete"

# Delete the policy
aws iam delete-policy --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/GitHubActions-CDKDeploy-Policy" || echo "No policy to delete"

# 2. Create new role and policy for all branches
echo "Creating new role and policy for all branches..."

# Create the IAM role for GitHub Actions
ROLE_NAME="GitHubActions-CDKDeploy-AllBranches"
echo "Creating IAM role: $ROLE_NAME"
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://github-actions-trust-policy-all-branches.json

# Create the IAM policy for GitHub Actions
POLICY_NAME="GitHubActions-CDKDeploy-Policy-AllBranches"
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