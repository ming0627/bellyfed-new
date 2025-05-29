#!/bin/bash

# This script creates the necessary AWS resources for GitHub Actions to run CDK synthesis
# You must have the AWS CLI installed and configured with admin access

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
GITHUB_REPO="ming0627/bellyfed-infra"

echo "Setting up GitHub Actions CDK Synthesis role for AWS account: $AWS_ACCOUNT_ID"
echo "GitHub repository: $GITHUB_REPO"

# Create a policy document for CDK synthesis
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

# Create a trust policy document for GitHub Actions
cat > cdk-synth-trust-policy.json << EOF
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
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

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

# Create the IAM role for GitHub Actions CDK Synthesis
ROLE_NAME="BellyfedGitHubActionsCdkSynthRole"
echo "Creating IAM role: $ROLE_NAME"
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://cdk-synth-trust-policy.json

# Create the IAM policy for GitHub Actions CDK Synthesis
POLICY_NAME="BellyfedCdkSynthPolicy"
echo "Creating IAM policy: $POLICY_NAME"
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://cdk-synth-policy.json

# Attach the policy to the role
echo "Attaching policy to role"
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/$POLICY_NAME"

# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text)
echo ""
echo "Role setup complete. Use this ARN in your GitHub Actions workflow:"
echo "ROLE_ARN: $ROLE_ARN"
echo ""
echo "Next steps:"
echo "1. Update the PR checks workflow with this role ARN"
echo "2. Push the changes to your repository"
