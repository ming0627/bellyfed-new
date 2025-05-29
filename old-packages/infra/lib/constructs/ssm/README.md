# SSM Resource Exporter and Importer

This directory contains constructs for exporting and importing AWS resources using SSM Parameter Store. These constructs help decouple stacks by storing resource identifiers (ARNs, IDs, etc.) in SSM Parameter Store, allowing other stacks to import these resources without direct CloudFormation exports/imports.

## SsmResourceExporter

The `SsmResourceExporter` construct provides methods to store resource identifiers in SSM Parameter Store.

### Usage

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

## SsmResourceImporter

The `SsmResourceImporter` construct provides methods to import resources using identifiers stored in SSM Parameter Store.

### Usage

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

## Benefits

1. **Decoupled Stacks**: Stacks can be deployed independently without direct dependencies.
2. **Simplified Rollbacks**: If a stack deployment fails, it doesn't affect other stacks.
3. **Easier Updates**: Resources can be updated without affecting dependent stacks.
4. **Improved Discoverability**: SSM parameters provide a central registry of resources.
5. **Consistent Naming**: Parameters follow a consistent naming pattern.

## Parameter Naming Pattern

Parameters are stored using the following pattern:

```
/bellyfed/{environment}/{resource-type}/{resource-name}
```

For example:

- `/bellyfed/dev/vpc/vpc-id`
- `/bellyfed/dev/ecs/cluster-name`
- `/bellyfed/dev/iam/execution-role`

## Example: Decoupled ECS Infrastructure and Service Stacks

1. **Infrastructure Stack**: Creates VPC, ALB, ECS Cluster, etc. and exports them to SSM.
2. **Service Stack**: Imports resources from SSM and creates ECS Service and Task Definition.

This approach allows you to:

- Deploy the infrastructure stack once and reuse it for multiple services.
- Update services independently without affecting the infrastructure.
- Roll back service deployments without affecting the infrastructure.
