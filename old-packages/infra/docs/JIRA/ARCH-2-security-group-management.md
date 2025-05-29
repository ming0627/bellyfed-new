# ARCH-2: Enhance Security Group Management

## Summary

Implement dependency injection for security groups to reduce tight coupling between infrastructure components.

## Description

Currently, Lambda functions and EFS directly reference security groups, creating tight coupling between infrastructure components. This task involves implementing dependency injection for security groups to improve maintainability and flexibility.

## Acceptance Criteria

- [ ] Create interfaces for security group configurations
- [ ] Update stack constructors to accept security group configurations
- [ ] Implement dependency injection for security groups in all relevant stacks
- [ ] Update existing code to use the new approach
- [ ] Add unit tests for the new implementation
- [ ] Update documentation to reflect the new approach

## Technical Details

The implementation should follow this pattern:

```typescript
export interface SecurityGroupConfig {
  serviceSecurityGroup: ec2.ISecurityGroup;
  albSecurityGroup?: ec2.ISecurityGroup;
  efsSecurityGroup?: ec2.ISecurityGroup;
  // Other security-related properties
}

// Then in the Lambda stack:
constructor(scope: Construct, id: string, props: LambdaStackProps & SecurityGroupConfig) {
  super(scope, id, props);

  // Use props.serviceSecurityGroup instead of direct reference
  const lambda = new lambda.Function(this, 'MyFunction', {
    // ...
    securityGroups: [props.serviceSecurityGroup],
  });
}
```

## Benefits

- Reduced coupling between infrastructure components
- Clearer security boundaries
- Improved testability through dependency injection
- More explicit dependencies
- Easier to refactor security group configurations

## Priority

High

## Estimated Story Points

8

## Dependencies

None - can be implemented independently of other tasks

## Attachments

- [Typesense Decoupling Improvements](../TODO/typesense-decoupling-improvements.md)
