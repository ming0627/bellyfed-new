# SSM-Based Stack Decoupling

This document explains the SSM-based approach for decoupling stacks in the Bellyfed infrastructure.

## Overview

The SSM-based decoupling approach uses AWS Systems Manager (SSM) Parameter Store to store resource identifiers (ARNs, IDs, etc.) instead of using CloudFormation exports/imports. This approach provides several benefits:

1. **Complete Decoupling**: Stacks no longer have direct dependencies on each other.
2. **Simplified Rollbacks**: If a stack deployment fails, it doesn't affect other stacks.
3. **Easier Updates**: Resources can be updated without affecting dependent stacks.
4. **Improved Discoverability**: SSM parameters provide a central registry of resources.
5. **Consistent Naming**: Parameters follow a consistent naming pattern.
6. **CI/CD Integration**: The CI/CD pipeline can selectively deploy stacks based on SSM parameters.

## Components

### SsmResourceExporter

The `SsmResourceExporter` construct provides methods to store resource identifiers in SSM Parameter Store.

```typescript
import { SsmResourceExporter } from '../constructs/ssm';

// Create an exporter in your stack
const resourceExporter = new SsmResourceExporter(this, 'ResourceExporter', {
    environment: 'dev',
});

// Export resources
resourceExporter.exportVpc(vpc);
resourceExporter.exportEcsCluster(cluster);
resourceExporter.exportEcrRepository(repository);
resourceExporter.exportRole(executionRole, 'execution-role');
resourceExporter.exportRole(taskRole, 'task-role');
resourceExporter.exportSecurityGroup(albSecurityGroup, 'alb-security-group');
resourceExporter.exportSecurityGroup(serviceSecurityGroup, 'service-security-group');
resourceExporter.exportLoadBalancer(loadBalancer);
resourceExporter.exportListener(listener);
resourceExporter.exportTargetGroup(targetGroup);
resourceExporter.exportLogGroup(logGroup);
resourceExporter.exportTaskDefinition(taskDefinition);
resourceExporter.exportEcsService(service);
```

### SsmResourceImporter

The `SsmResourceImporter` construct provides methods to import resources using identifiers stored in SSM Parameter Store.

```typescript
import { SsmResourceImporter } from '../constructs/ssm';

// Create an importer in your stack
const resourceImporter = new SsmResourceImporter(this, 'ResourceImporter', {
    environment: 'dev',
});

// Import resources
const vpc = resourceImporter.importVpc();
const cluster = resourceImporter.importEcsCluster('cluster-name', vpc);
const repository = resourceImporter.importEcrRepository();
const executionRole = resourceImporter.importRole('execution-role');
const taskRole = resourceImporter.importRole('task-role');
const albSecurityGroup = resourceImporter.importSecurityGroup('alb-security-group');
const serviceSecurityGroup = resourceImporter.importSecurityGroup('service-security-group');
const targetGroup = resourceImporter.importTargetGroup();
const logGroup = resourceImporter.importLogGroup();
```

### DeploymentConfigStack

The `DeploymentConfigStack` manages deployment configuration parameters in SSM Parameter Store. It allows controlling which stacks are deployed during CI/CD pipeline runs.

```typescript
// Create Deployment Config Stack
const deploymentConfigProps = {
    env: stackEnv,
    environment: environmentContext,
    // Get value from context if available, default to true
    deployInfraStack: app.node.tryGetContext('deploy-infra-stack') !== 'false',
};

const deploymentConfigStack = createStack(
    new DeploymentConfigStack(
        app,
        `BellyfedDeploymentConfigStack-${environmentContext}`,
        deploymentConfigProps
    )
);
```

## Parameter Naming Pattern

Parameters are stored using the following pattern:

```
/bellyfed/{environment}/{resource-type}/{resource-name}
```

For example:

- `/bellyfed/dev/vpc/vpc-id`
- `/bellyfed/dev/ecs/cluster-name`
- `/bellyfed/dev/iam/execution-role`

## Usage Patterns

### Infrastructure Stack

The infrastructure stack creates resources and exports them to SSM Parameter Store:

```typescript
// Create SSM Resource Exporter for storing resource ARNs in SSM
const resourceExporter = new SsmResourceExporter(this, 'ResourceExporter', {
    environment: props.environment,
});

// Create resources...

// Export resources to SSM
resourceExporter.exportVpc(this.vpc);
resourceExporter.exportEcsCluster(this.cluster);
// ... export other resources
```

### Service Stack

The service stack imports resources from SSM Parameter Store and creates services:

```typescript
// Create SSM Resource Importer for importing resources from SSM
const resourceImporter = new SsmResourceImporter(this, 'ResourceImporter', {
    environment: props.environment,
});

// Import resources
const vpc = resourceImporter.importVpc();
const cluster = resourceImporter.importEcsCluster('cluster-name', vpc);
// ... import other resources

// Create services using imported resources
```

### CI/CD Integration

The CI/CD pipeline can conditionally deploy stacks based on SSM parameters:

```bash
# Determine if we should deploy the infrastructure stack
DEPLOY_INFRA_STACK=$(aws ssm get-parameter --name "/bellyfed/dev/deployment/deploy-infra-stack" --query "Parameter.Value" --output text || echo "true")
echo "Deploy infrastructure stack: $DEPLOY_INFRA_STACK"

if [ "$DEPLOY_INFRA_STACK" = "false" ]; then
  echo "Skipping infrastructure stack deployment"
  # Deploy with infrastructure stack excluded
  cdk deploy --require-approval never --context environment="dev" --exclude "*EcsInfraStack*" --exclude "*FrontendCicdStack*" "*"
else
  echo "Deploying full infrastructure stack"
  # Deploy normally with all stacks
  cdk deploy --require-approval never --context environment="dev" --exclude "*FrontendCicdStack*" "*"
fi
```

## Controlling Deployments

To control which stacks are deployed, you can update the SSM parameter:

```bash
# To skip deploying the infrastructure stack in the next deployment
aws ssm put-parameter --name "/bellyfed/dev/deployment/deploy-infra-stack" --value "false" --type "String" --overwrite

# To deploy the infrastructure stack in the next deployment
aws ssm put-parameter --name "/bellyfed/dev/deployment/deploy-infra-stack" --value "true" --type "String" --overwrite
```

## Error Handling

When importing resources from SSM Parameter Store, it's important to handle errors gracefully:

```typescript
try {
    // Try to import resources from SSM Parameter Store
    const vpc = resourceImporter.importVpc();
    const cluster = resourceImporter.importEcsCluster('cluster-name', vpc);
    // ... import other resources
} catch (error) {
    console.error('Failed to import resources from SSM Parameter Store', error);
    throw new Error(
        'Failed to import required resources. Make sure all required SSM parameters exist.'
    );
}
```

## Best Practices

1. **Use Consistent Naming**: Follow the established naming pattern for SSM parameters.
2. **Export All Resources**: Export all resources that might be needed by other stacks.
3. **Handle Errors**: Include error handling when importing resources.
4. **Document Parameters**: Document the SSM parameters used by each stack.
5. **Use the DeploymentConfigStack**: Use the DeploymentConfigStack to control which stacks are deployed.
6. **Test Both Approaches**: Test both the direct deployment and import approaches.

## Troubleshooting

### Missing Parameters

If a parameter is missing, the `SsmResourceImporter` will throw an error. You can check if a parameter exists using the AWS CLI:

```bash
aws ssm get-parameter --name "/bellyfed/dev/vpc/vpc-id"
```

### Parameter Versions

SSM parameters are versioned. If you need to revert to a previous version, you can use the AWS CLI:

```bash
aws ssm get-parameter-history --name "/bellyfed/dev/vpc/vpc-id"
aws ssm put-parameter --name "/bellyfed/dev/vpc/vpc-id" --value "previous-value" --type "String" --overwrite
```

### Deployment Issues

If you encounter deployment issues, check the CloudFormation events and CloudWatch logs. You can also check the SSM parameters:

```bash
aws ssm get-parameters-by-path --path "/bellyfed/dev" --recursive
```
