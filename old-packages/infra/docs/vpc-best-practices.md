# VPC and Network Stack Best Practices

## Overview

This document outlines best practices for working with VPCs and Network Stacks in AWS CDK to avoid common issues and ensure smooth deployments.

## Best Practices

### 1. Always Disable `restrictDefaultSecurityGroup` for VPCs

When creating a VPC using AWS CDK, always set `restrictDefaultSecurityGroup: false` to avoid issues with the custom resource that restricts the default security group:

```typescript
const vpc = new ec2.Vpc(this, 'MyVpc', {
    ipAddresses: ec2.IpAddresses.cidr('172.16.0.0/16'),
    maxAzs: 2,
    natGateways: 1,
    restrictDefaultSecurityGroup: false, // Important: Always set this to false
    subnetConfiguration: [
        // Subnet configuration...
    ],
});
```

This setting prevents the creation of a custom resource that can cause issues with stack updates and deletions.

### 2. Use Explicit CIDR Ranges for Subnets

Always use explicit CIDR ranges for subnets to avoid conflicts:

```typescript
subnetConfiguration: [
    {
        cidrMask: 24,
        name: 'PublicSubnet',
        subnetType: ec2.SubnetType.PUBLIC,
        reserved: false,
        mapPublicIpOnLaunch: true,
    },
    {
        cidrMask: 24,
        name: 'PrivateSubnet',
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        reserved: false,
    },
    {
        cidrMask: 24,
        name: 'IsolatedSubnet',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        reserved: false,
    },
],
```

### 3. Be Careful with Stack Dependencies

When creating stacks that depend on a VPC, be aware of the dependencies between stacks. If a stack depends on a VPC, it will prevent the VPC stack from being deleted.

### 4. Test Stack Deletion

Before deploying to production, test the deletion of stacks to ensure they can be properly cleaned up.

### 5. Use Resource Tagging

Tag all resources with appropriate tags to make it easier to identify which resources belong to which stacks:

```typescript
cdk.Tags.of(vpc).add('Stack', 'NetworkStack');
cdk.Tags.of(vpc).add('Environment', 'dev');
```

### 6. Monitor CloudFormation Events

Set up monitoring for CloudFormation events to catch issues early.

## Common Issues and Solutions

### Issue: Stack Deletion Fails Due to Dependencies

**Solution**: Identify the dependent stacks using the AWS CLI:

```bash
aws cloudformation list-exports | grep -i "StackName"
aws cloudformation list-imports --export-name "ExportName"
```

### Issue: Custom Resource Failures

**Solution**: Disable custom resources that might cause issues, such as the `restrictDefaultSecurityGroup` custom resource.

### Issue: VPC Deletion Fails Due to Resources

**Solution**: Ensure all resources in the VPC are deleted before attempting to delete the VPC.

## Conclusion

Following these best practices will help avoid common issues with VPCs and Network Stacks in AWS CDK and ensure smooth deployments and stack deletions.
