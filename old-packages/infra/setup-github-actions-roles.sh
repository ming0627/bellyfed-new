#!/bin/bash

# This script creates the necessary AWS IAM roles for GitHub Actions workflows
# You must have the AWS CLI installed and configured with admin access

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
BACKEND_REPO="ming0627/bellyfed-infra"
FRONTEND_REPO="ming0627/bellyfed"

echo "Setting up GitHub Actions roles for AWS account: $AWS_ACCOUNT_ID"
echo "Backend repository: $BACKEND_REPO"
echo "Frontend repository: $FRONTEND_REPO"

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

# Create trust policy documents for each repository
create_trust_policy() {
    local repo=$1
    local filename=$2
    
    cat > "$filename" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${repo}:*"
        }
      }
    }
  ]
}
EOF
}

# Create backend trust policy
create_trust_policy "$BACKEND_REPO" "backend-trust-policy.json"

# Create frontend trust policy
create_trust_policy "$FRONTEND_REPO" "frontend-trust-policy.json"

# Create policy documents for different permission sets

# 1. CDK Synthesis Policy (read-only)
cat > cdk-synth-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:GetTemplate",
        "cloudformation:ListStackResources",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeRouteTables",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeNatGateways",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "ecr:DescribeRepositories",
        "ecs:DescribeClusters",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeListeners",
        "acm:ListCertificates",
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# 2. CDK Deployment Policy (full access)
cat > cdk-deploy-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "iam:PassRole",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "lambda:*",
        "apigateway:*",
        "ec2:*",
        "sts:AssumeRole",
        "ssm:*",
        "dynamodb:*",
        "logs:*",
        "codepipeline:*",
        "codebuild:*",
        "codecommit:*",
        "ecr:*",
        "sns:*",
        "sqs:*",
        "events:*",
        "elasticloadbalancing:*",
        "cognito-idp:*",
        "route53:*",
        "acm:*",
        "cloudwatch:*",
        "ecs:*",
        "application-autoscaling:*",
        "rds:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# 3. Frontend Deployment Policy (ECR and ECS access)
cat > frontend-deploy-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecs:DescribeClusters",
        "ecs:DescribeServices",
        "ecs:UpdateService",
        "ecs:ListServices",
        "ecs:ListTasks",
        "ecs:DescribeTasks",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Function to create a role and attach a policy
create_role_with_policy() {
    local role_name=$1
    local trust_policy_file=$2
    local policy_name=$3
    local policy_file=$4
    
    echo "Creating IAM role: $role_name"
    aws iam create-role \
        --role-name $role_name \
        --assume-role-policy-document file://$trust_policy_file
    
    echo "Creating IAM policy: $policy_name"
    policy_arn=$(aws iam create-policy \
        --policy-name $policy_name \
        --policy-document file://$policy_file \
        --query 'Policy.Arn' --output text)
    
    echo "Attaching policy to role"
    aws iam attach-role-policy \
        --role-name $role_name \
        --policy-arn $policy_arn
    
    # Get the role ARN
    role_arn=$(aws iam get-role --role-name $role_name --query "Role.Arn" --output text)
    echo "Role ARN: $role_arn"
    
    return 0
}

# Create roles for backend workflows
echo "Creating roles for backend workflows..."

# 1. CDK Synthesis Role (for PR checks)
create_role_with_policy \
    "BellyfedGitHubActionsCdkSynthRole" \
    "backend-trust-policy.json" \
    "BellyfedCdkSynthPolicy" \
    "cdk-synth-policy.json"

# 2. CDK Deployment Role (for deployments)
create_role_with_policy \
    "BellyfedGitHubActionsCdkDeployRole" \
    "backend-trust-policy.json" \
    "BellyfedCdkDeployPolicy" \
    "cdk-deploy-policy.json"

# Create role for frontend workflows
echo "Creating role for frontend workflows..."

# 3. Frontend Deployment Role
create_role_with_policy \
    "BellyfedGitHubActionsFrontendDeployRole" \
    "frontend-trust-policy.json" \
    "BellyfedFrontendDeployPolicy" \
    "frontend-deploy-policy.json"

echo ""
echo "Role setup complete. Use these ARNs in your GitHub Actions workflows:"
echo ""
echo "Backend CDK Synthesis Role (for PR checks):"
echo "arn:aws:iam::$AWS_ACCOUNT_ID:role/BellyfedGitHubActionsCdkSynthRole"
echo ""
echo "Backend CDK Deployment Role (for deployments):"
echo "arn:aws:iam::$AWS_ACCOUNT_ID:role/BellyfedGitHubActionsCdkDeployRole"
echo ""
echo "Frontend Deployment Role:"
echo "arn:aws:iam::$AWS_ACCOUNT_ID:role/BellyfedGitHubActionsFrontendDeployRole"
echo ""
echo "Next steps:"
echo "1. Update your GitHub Actions workflows to use these roles"
echo "2. Remove any AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets from your repositories"
