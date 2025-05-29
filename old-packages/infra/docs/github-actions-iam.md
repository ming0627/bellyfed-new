# GitHub Actions IAM Permissions

This document outlines the IAM permissions required for GitHub Actions to deploy and manage the Bellyfed infrastructure.

## IAM Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:DescribeStacks",
                "cloudformation:ListStacks",
                "cloudformation:DescribeStackEvents",
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DeleteStack",
                "cloudformation:ListStackResources",
                "cloudformation:DescribeStackResource",
                "cloudformation:GetTemplateSummary",
                "cloudformation:ValidateTemplate",
                "cloudformation:GetTemplate"
            ],
            "Resource": [
                "arn:aws:cloudformation:*:*:stack/BellyfedCicdStack-*/*",
                "arn:aws:cloudformation:*:*:stack/CDKToolkit/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:GetBucketLocation"
            ],
            "Resource": ["arn:aws:s3:::cdk-*/*", "arn:aws:s3:::cdk-*"]
        },
        {
            "Effect": "Allow",
            "Action": [
                "codepipeline:StartPipelineExecution",
                "codepipeline:StopPipelineExecution",
                "codepipeline:ListPipelineExecutions"
            ],
            "Resource": "arn:aws:codepipeline:*:*:bellyfed-pipeline-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRolePolicy"
            ],
            "Resource": ["arn:aws:iam::*:role/bellyfed-*", "arn:aws:iam::*:role/cdk-*"]
        },
        {
            "Effect": "Allow",
            "Action": ["ssm:GetParameter", "ssm:PutParameter", "ssm:DeleteParameter"],
            "Resource": "arn:aws:ssm:*:*:parameter/bellyfed/*"
        },
        {
            "Effect": "Allow",
            "Action": ["kms:Decrypt", "kms:Encrypt", "kms:CreateGrant"],
            "Resource": "arn:aws:kms:*:*:key/*"
        }
    ]
}
```

## Setting Up the IAM Role

1. Create a new IAM role in your AWS account:

    ```bash
    aws iam create-role --role-name github-actions-bellyfed --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
          },
          "Action": "sts:AssumeRoleWithWebIdentity",
          "Condition": {
            "StringLike": {
              "token.actions.githubusercontent.com:sub": "repo:<GITHUB_ORG>/<REPO_NAME>:*"
            }
          }
        }
      ]
    }'
    ```

2. Create the policy and attach it to the role:
    ```bash
    aws iam put-role-policy --role-name github-actions-bellyfed --policy-name github-actions-policy --policy-document file://github-actions-policy.json
    ```

## GitHub Repository Setup

1. Add the following secrets to your GitHub repository:

    - `AWS_ROLE_ARN`: The ARN of the IAM role created above
    - `AWS_REGION`: The AWS region where your infrastructure is deployed

2. Update the GitHub Actions workflows to use OIDC authentication:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
      role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
      aws-region: ${{ secrets.AWS_REGION }}
      mask-aws-account-id: true
```

## Permission Breakdown

The policy grants the following permissions:

1. **CloudFormation Permissions**

    - Manage CDK stacks and resources
    - View stack events and resources
    - Validate templates

2. **S3 Permissions**

    - Access CDK assets and artifacts
    - Manage deployment artifacts

3. **CodePipeline Permissions**

    - Start and stop pipeline executions
    - List pipeline execution status

4. **IAM Permissions**

    - Manage service roles for CDK resources
    - Pass roles to AWS services

5. **SSM Permissions**

    - Manage SSM parameters used by the infrastructure

6. **KMS Permissions**
    - Encrypt/decrypt secrets and artifacts
    - Create grants for AWS services

## Security Considerations

1. The permissions are scoped to resources with specific prefixes:

    - `bellyfed-*`
    - `cdk-*`

2. KMS permissions are required for:

    - Encrypting pipeline artifacts
    - Accessing encrypted SSM parameters
    - Managing service-linked encryption

3. The role trust policy uses OIDC federation, which:

    - Eliminates the need for long-term credentials
    - Provides automatic credential rotation
    - Restricts access to specific GitHub repositories

4. Resource names are prefixed to prevent unauthorized access to other resources in the account.

## Monitoring and Auditing

1. Enable CloudTrail logging to audit all API calls made using these permissions

2. Set up CloudWatch alarms for:

    - Failed pipeline executions
    - Failed stack deployments
    - IAM role or policy modifications

3. Regularly review the permissions and remove any unused ones

4. Monitor GitHub Actions workflow logs for any permission-related issues
