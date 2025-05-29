# CICD Deployment Cheatsheet

This document provides a guide for deploying changes to the CICD stack in the Bellyfed infrastructure.

## When to Use This Guide

Use this guide when you've made changes to:

- `lib/cicd-stack.ts`
- `lib/bootstrap-stack.ts` (when it affects CICD)
- Any other files that directly impact the CICD pipeline

## Prerequisites

- AWS CLI configured with appropriate credentials
- CDK CLI installed (`npm install -g aws-cdk`)
- Node.js and npm installed
- Access to the AWS account where the stacks are deployed

## Deployment Process

### 1. Create a New Branch

Always start by creating a new branch from the latest `develop` branch:

```bash
git checkout develop
git pull origin develop --rebase
git checkout -b feature/your-cicd-changes
```

### 2. Make Your Changes

Make the necessary changes to the CICD stack files.

### 3. Test Your Changes Locally

Before deploying, test your changes locally using CDK synth:

```bash
# Synthesize the CICD stack for the dev environment
cdk synth BellyfedCicdStack-dev --context environment=dev
```

Review the generated CloudFormation template to ensure your changes are correctly reflected.

### 4. Deploy the CICD Stack

Deploy the CICD stack directly using the `--exclusively` flag to avoid deploying dependent stacks:

```bash
# Deploy only the CICD stack for the dev environment
cdk deploy BellyfedCicdStack-dev --context environment=dev --exclusively
```

### 5. Verify the Deployment

After deployment, verify that your changes have been applied correctly:

1. Check the AWS CloudFormation console to ensure the stack was updated successfully
2. Monitor the CICD pipeline in the AWS CodePipeline console to ensure it's working as expected
3. If your changes affect specific CodeBuild projects, check their configurations in the AWS CodeBuild console

### 6. Troubleshooting Common Issues

#### Permission Issues

If you encounter permission issues during deployment:

```
AccessDeniedException: User is not authorized to perform: [action] on resource: [resource]
```

- Check the IAM policies in the CICD stack
- Ensure the appropriate permissions are added to the relevant roles
- Use the `addToRolePolicy` method to add missing permissions

#### Syntax Errors in Shell Commands

If you encounter syntax errors in shell commands:

```
Syntax error: end of file unexpected (expecting "done")
```

- Ensure shell commands are properly formatted
- Use explicit newlines and proper indentation
- Test complex shell scripts locally before adding them to the CICD stack

#### Deployment Failures

If the deployment fails:

```
Stack [stack-name] failed: [error-message]
```

- Check the CloudFormation events in the AWS console for detailed error messages
- Fix the issues and try deploying again
- If necessary, manually delete resources that are in a failed state

### 7. Deploying to Other Environments

To deploy to other environments (e.g., staging, prod):

```bash
# Deploy to staging
cdk deploy BellyfedCicdStack-staging --context environment=staging --exclusively

# Deploy to prod
cdk deploy BellyfedCicdStack-prod --context environment=prod --exclusively
```

## Best Practices

1. **Always test locally first**: Use `cdk synth` to verify your changes before deploying.
2. **Use the `--exclusively` flag**: This prevents deploying dependent stacks that might not be ready.
3. **Monitor the deployment**: Watch the deployment process to catch any issues early.
4. **Document your changes**: Update relevant documentation when making significant changes.
5. **Create a PR**: Always create a pull request for review before merging changes to the main branches.

## Example: Adding Permissions to a CodeBuild Project

```typescript
// Add permissions to a CodeBuild project
myCodeBuildProject.addToRolePolicy(
    new iam.PolicyStatement({
        actions: ['service:Action1', 'service:Action2'],
        resources: ['*'], // Or specific resource ARNs
    })
);
```

## Example: Fixing Shell Script Syntax

```typescript
// Good shell script syntax for CodeBuild
const commands = [
    'echo "Starting process"',
    'variable=$(aws command)',
    'echo "Variable value: $variable"',
    'while [ "$variable" = "value" ]',
    'do',
    '  echo "Processing..."',
    '  sleep 30',
    '  variable=$(aws command)',
    'done',
    'echo "Process completed"',
];
```

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html)
