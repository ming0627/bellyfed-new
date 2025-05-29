# Typesense CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Typesense service in the Bellyfed platform.

## Overview

The Typesense service is deployed as an ECS Fargate task and is managed through an automated CI/CD pipeline. This pipeline ensures that changes to the infrastructure code are automatically tested and deployed to the appropriate environments.

## CI/CD Architecture

![Typesense CI/CD Architecture](../../ARCHITECTURE/typesense/images/typesense-cicd-architecture.png)

The CI/CD pipeline for Typesense consists of the following components:

1. **Source Stage**: Code is pulled from the GitHub repository
2. **Build Stage**: Infrastructure code is built and tested
3. **Deploy Stage**: Infrastructure is deployed to the target environment

## Pipeline Configuration

The Typesense CI/CD pipeline is defined in `lib/typesense/typesense-cicd-stack.ts` and is part of the overall infrastructure CI/CD pipeline.

### Source Stage

The source stage pulls code from the GitHub repository:

```typescript
const sourceOutput = new codepipeline.Artifact();
const sourceAction = new codepipeline_actions.GitHubSourceAction({
    actionName: 'GitHub',
    owner: CONFIG.github.owner,
    repo: CONFIG.github.repo,
    branch: props.branchName,
    output: sourceOutput,
    oauthToken: cdk.SecretValue.secretsManager('github-token'),
});
```

### Build Stage

The build stage compiles and tests the infrastructure code:

```typescript
const buildOutput = new codepipeline.Artifact();
const buildAction = new codepipeline_actions.CodeBuildAction({
    actionName: 'BuildAndTest',
    project: buildProject,
    input: sourceOutput,
    outputs: [buildOutput],
});
```

### Deploy Stage

The deploy stage deploys the infrastructure to the target environment:

```typescript
const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
    actionName: 'DeployTypesense',
    stackName: `BellyfedTypesenseStack-${props.environment}`,
    templatePath: buildOutput.atPath('typesense-stack.template.json'),
    adminPermissions: true,
});
```

## Deployment Process

When changes are pushed to the repository, the CI/CD pipeline automatically:

1. **Pulls the latest code** from the GitHub repository
2. **Builds and tests** the infrastructure code
3. **Synthesizes CloudFormation templates** for the Typesense stacks
4. **Deploys the infrastructure** to the target environment

### Environment-Specific Deployments

The pipeline is configured to deploy to different environments based on the branch:

- **develop branch** → Development environment
- **test branch** → Testing environment
- **staging branch** → Staging environment
- **master branch** → Production environment

## Typesense Stack Deployment Order

The Typesense stacks are deployed in the following order:

1. **TypesenseInfrastructureStack**: Sets up the ECS cluster, security groups, and networking
2. **TypesenseServiceStack**: Deploys the Typesense container service
3. **TypesenseLambdaStack**: Deploys the Lambda functions for data synchronization and search

This order ensures that dependencies are properly resolved during deployment.

## Manual Deployment

If needed, you can manually deploy the Typesense stacks using the AWS CDK CLI:

```bash
# Deploy the infrastructure stack
npx cdk deploy BellyfedTypesenseInfraStack-${ENVIRONMENT}

# Deploy the service stack
npx cdk deploy BellyfedTypesenseServiceStack-${ENVIRONMENT}

# Deploy the Lambda stack
npx cdk deploy BellyfedTypesenseLambdaStack-${ENVIRONMENT}
```

## Rollback Process

If a deployment fails or causes issues, the pipeline automatically rolls back to the previous stable state. You can also manually roll back using the AWS Management Console or CLI:

```bash
# Roll back to a previous version
aws cloudformation rollback-stack --stack-name BellyfedTypesenseStack-${ENVIRONMENT}
```

## Monitoring Deployments

You can monitor the status of deployments through:

1. **AWS CodePipeline Console**: View the pipeline execution status
2. **AWS CloudFormation Console**: View stack creation/update status
3. **AWS CloudWatch Logs**: View deployment logs

## Deployment Notifications

The pipeline is configured to send notifications for deployment events:

- **Successful deployments**: Notification to the development team
- **Failed deployments**: Alert to the operations team

Notifications are sent via:

- Slack (using AWS Chatbot)
- Email (using Amazon SNS)

## Deployment Approvals

For production deployments, a manual approval step is required:

```typescript
const approvalAction = new codepipeline_actions.ManualApprovalAction({
    actionName: 'Approve',
    notificationTopic: approvalTopic,
    additionalInformation: 'Please review and approve the deployment to production',
});
```

## Deployment Strategies

The Typesense service uses the following deployment strategies:

### Blue/Green Deployment

For the Typesense service, we use a blue/green deployment strategy:

1. A new task definition is created with the updated configuration
2. New tasks are started with the new task definition
3. Traffic is gradually shifted to the new tasks
4. Once the new tasks are healthy, the old tasks are terminated

This ensures zero-downtime deployments and easy rollback if issues are detected.

### Canary Deployments

For critical environments (staging and production), we use canary deployments:

1. Deploy to a small percentage of the fleet (10%)
2. Monitor for any issues
3. Gradually increase the percentage (25%, 50%, 100%)
4. Roll back if issues are detected

## Integration with Frontend CI/CD

The Typesense CI/CD pipeline is integrated with the frontend CI/CD pipeline:

1. The Typesense service is deployed first
2. Once successful, the frontend deployment is triggered
3. The frontend is updated to use the new Typesense service

This ensures that the frontend always uses a compatible version of the Typesense service.

## Security Considerations

The CI/CD pipeline implements the following security measures:

1. **IAM Roles**: Least privilege principle for pipeline execution
2. **Secrets Management**: Sensitive information stored in AWS Secrets Manager
3. **Artifact Encryption**: Pipeline artifacts are encrypted at rest
4. **VPC Endpoints**: Pipeline components communicate through private VPC endpoints

## Troubleshooting

### Common Issues

1. **Pipeline Failure**: Check the CodeBuild logs for error messages
2. **Deployment Failure**: Check the CloudFormation events for stack creation/update failures
3. **Service Unavailability**: Check the ECS service events and container logs

### Resolution Steps

1. **Fix code issues**: Address any issues in the infrastructure code
2. **Manual deployment**: If needed, deploy manually to bypass the pipeline
3. **Rollback**: If issues persist, roll back to the previous stable version

## Resources

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [ECS Deployment Strategies](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-types.html)
