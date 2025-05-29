# Bellyfed Certificate Stacks

This document provides information about the certificate stacks in the Bellyfed infrastructure.

## Overview

The Bellyfed infrastructure uses two stacks for managing certificates and Route53 hosted zones:

1. **BellyfedCertificateParametersStack-{environment}**: Stores certificate ARNs and hosted zone IDs in SSM Parameter Store
2. **BellyfedCertificateStack-{environment}**: Creates and validates ACM certificates

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- CDK CLI installed

### Deployment Steps

1. Update the SSM parameters:

    ```bash
    ./scripts/update-ssm-parameters.sh [environment]
    ```

2. Deploy the certificate parameters stack:

    ```bash
    npx cdk deploy BellyfedCertificateParametersStack-[environment] --context environment=[environment] --require-approval never
    ```

3. Deploy the certificate stack:
    ```bash
    npx cdk deploy BellyfedCertificateStack-[environment] --context environment=[environment] --require-approval never
    ```

Alternatively, you can use the combined deployment script:

```bash
./scripts/deploy-certificate-stacks.sh [environment]
```

### GitHub Actions Workflows

You can also use the GitHub Actions workflows to deploy the stacks:

1. **Update SSM Parameters**: Use the `Update SSM Parameters` workflow to update the SSM parameters
2. **Deploy Certificate Stacks**: Use the `Deploy Certificate Stacks` workflow to deploy both stacks

## Troubleshooting

### "Resource already exists" Error

If you encounter the following error:

```
Resource handler returned message: "Resource of type 'AWS::SSM::Parameter' with identifier '/bellyfed/{environment}/route53/hosted-zone-id' already exists."
```

Run the `update-ssm-parameters.sh` script before deploying the stack:

```bash
./scripts/update-ssm-parameters.sh [environment]
```

### Bootstrap Error

If you encounter bootstrap-related errors, run the following commands:

```bash
npx cdk bootstrap aws://590184067494/ap-southeast-1 --context environment=[environment]
npx cdk bootstrap aws://590184067494/us-east-1 --context environment=[environment]
```

## SSM Parameters

The following SSM parameters are used by the certificate stacks:

- `/bellyfed/{environment}/route53/hosted-zone-id`: Route53 hosted zone ID for bellyfed.com
- `/bellyfed/{environment}/certificate/wildcard-certificate-arn`: ACM certificate ARN for bellyfed.com

These parameters are used by other stacks that need to reference the hosted zone or certificate.
