# Deployment Best Practices

This document outlines best practices to prevent deployment errors in the Bellyfed infrastructure.

## Common Deployment Issues

1. **TypeScript Compilation Errors**: Errors that only appear during deployment
2. **Version Mismatches**: Different AWS CDK versions between local and deployment environments
3. **Missing Dependencies**: Required resources not being available at deployment time
4. **Circular Dependencies**: Stacks that depend on each other in a circular manner
5. **Invalid CloudFormation Templates**: Templates that don't pass CloudFormation validation

## Prevention Strategies

### 1. Use the Pre-Deployment Validation Script

Always run the pre-deployment validation script before deploying:

```bash
npm run pre-deploy dev  # For dev environment
npm run pre-deploy qa   # For QA environment
npm run pre-deploy prod # For production environment
```

Or use the safe deployment commands:

```bash
npm run cdk:deploy:dev:safe
npm run cdk:deploy:qa:safe
npm run cdk:deploy:prod:safe
```

### 2. Understand AWS CDK Version Compatibility

- Always check the AWS CDK version compatibility with your code
- Be aware of breaking changes in AWS CDK versions
- Pin dependencies to exact versions in package.json

### 3. Proper Stack Dependencies

- Use `stack.addDependency()` to ensure stacks are deployed in the correct order
- Make sure exported values are available before they are imported
- Use `Fn.importValue()` with try/catch blocks for more resilient imports

### 4. Certificate Validation Best Practices

- When using ACM certificates, prefer DNS validation
- Don't specify `validationMethod` when using `CertificateValidation.fromDns()` or `CertificateValidation.fromDnsMultiZone()`
- Always create DNS records for certificate validation

### 5. CloudFormation Limits

- Be aware of CloudFormation resource limits
- Split large stacks into smaller ones
- Use nested stacks for complex architectures

### 6. CI/CD Pipeline Validation

- Always include validation steps in your CI/CD pipeline
- Run `cdk synth` and validate templates before deployment
- Use the GitHub workflow for pre-deployment validation

## Troubleshooting Deployment Errors

### TypeScript Errors

If you encounter TypeScript errors during deployment:

1. Check the error message for the specific file and line number
2. Verify that the property or method exists in the current AWS CDK version
3. Check for typos or incorrect property names
4. Run `npx tsc --noEmit --strict` locally to catch errors before deployment

### CloudFormation Errors

For CloudFormation deployment errors:

1. Check the CloudFormation console for detailed error messages
2. Look for resource limits or quota issues
3. Verify that all required IAM permissions are in place
4. Check for circular dependencies between resources

## Recommended Workflow

1. Make changes to infrastructure code
2. Run local validation: `npm run pre-deploy dev`
3. Fix any issues found during validation
4. Create a pull request and let the GitHub workflow validate
5. Once approved, deploy using the safe deployment command: `npm run cdk:deploy:dev:safe`
6. Monitor the deployment in the AWS CloudFormation console
