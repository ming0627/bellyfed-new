# CI/CD Helper Scripts

This directory contains helper scripts for CI/CD and local development.

## CDK Synth Scripts

- `cdk-synth-helper.sh`: Used for production deployments. Requires valid AWS credentials.
- `cdk-synth-mock.sh`: Used for CI/CD validation. Uses mock AWS credentials and the `--no-lookups` flag to avoid AWS API calls.

## Dependency Management

- `fix-dependencies.sh`: Fixes dependency issues by cleaning npm cache, removing node_modules and package-lock.json, and performing a fresh installation.

## Usage

In CI/CD pipelines:

```bash
npm run synth:mock    # For validation with mock AWS credentials
```

For local development:

```bash
npm run synth         # For actual deployment (requires AWS credentials)
npm run fix:deps      # To fix dependency issues
```

## Troubleshooting

If you encounter errors related to AWS credentials during CDK synth in CI/CD:

1. Use the mock script (`npm run synth:mock`) which doesn't require real AWS credentials
2. For actual deployments, ensure proper AWS credentials are configured

## build-changed.sh

This script is used by the pre-commit hook to only build files that have been changed in the current commit. This significantly speeds up the commit process by avoiding rebuilding the entire project.

### How it works

1. It detects which files are being staged for commit
2. It identifies which functions, packages, or infrastructure files are affected
3. It runs type-check, lint, and build only on the affected components

### Benefits

- Much faster pre-commit checks
- Focused feedback on only the code you're changing
- Still ensures code quality before commit

### Manual Usage

You can also run this script manually:

```bash
npm run build:changed
```

This is useful if you want to check your changes before committing.

## pre-deploy-validate.sh

This script performs validation checks before deploying to an environment. It helps prevent common deployment issues by verifying the environment is ready for deployment.

### How it works

1. It takes an environment name as a parameter (dev, test, qa, prod)
2. It verifies that the environment exists and is properly configured
3. It runs `cdk synth` to validate the CloudFormation templates
4. It checks for any potential issues that might cause deployment failures

### Usage

```bash
npm run pre-deploy <environment>
```

This script is automatically called by the `cdk:deploy:safe` command.

## deploy.sh

This script handles the deployment process for the infrastructure. It's a wrapper around the CDK deploy command that adds additional logging and error handling.

### How it works

1. It takes an environment name and stack name as parameters
2. It sets up the appropriate AWS credentials and context
3. It deploys the specified stack to the specified environment
4. It provides detailed logging of the deployment process

### Usage

```bash
./scripts/deploy.sh <environment> <stack-name>
```

## setup-lambda-dirs.sh

This script sets up the directory structure for Lambda functions. It creates the necessary directories and files for a new Lambda function.

### How it works

1. It creates the function directory with the appropriate structure
2. It sets up the TypeScript configuration
3. It creates template files for the Lambda handler and tests

### Usage

```bash
./scripts/setup-lambda-dirs.sh <function-name>
```

## sync-docs.sh

This script synchronizes documentation from the repository to Confluence. It ensures that documentation is kept up-to-date in the central documentation system.

### How it works

1. It scans the repository for markdown files
2. It converts the markdown to Confluence format
3. It uploads the documentation to the configured Confluence space

### Usage

```bash
./scripts/sync-docs.sh
```

## synth.sh

This script handles the CDK synthesis process for different environments. It ensures that the correct AWS account and region are set for each environment.

### How it works

1. It takes an environment name as a parameter (dev, test, qa, prod)
2. It sets the appropriate AWS account and region environment variables
3. It runs `cdk synth` with the correct context values

### Usage

```bash
./scripts/synth.sh --environment test
```

This script can be called directly or through the npm script:

```bash
ENV=test npm run synth
```

## update-imports.sh

This script updates import statements in TypeScript files to use the correct paths. It's useful when refactoring code or moving files around.

### How it works

1. It scans TypeScript files for import statements
2. It updates the import paths based on the new file structure
3. It ensures that all imports are valid

### Usage

```bash
./scripts/update-imports.sh
```

## update-ssm-parameters.sh

This script updates SSM parameters that already exist in AWS. It's useful when you need to deploy a stack that references existing parameters.

### Usage

```bash
./update-ssm-parameters.sh [environment]
```

Where `environment` is the deployment environment (dev, test, qa, prod). If not provided, it defaults to `dev`.

### What it does

The script updates the following SSM parameters:

1. `/bellyfed/{environment}/route53/hosted-zone-id` - Sets the Route53 hosted zone ID for bellyfed.com
2. `/bellyfed/{environment}/certificate/wildcard-certificate-arn` - Sets the ACM certificate ARN for bellyfed.com

### When to use it

Run this script before deploying the `BellyfedCertificateParametersStack-{environment}` stack if you encounter the following error:

```
Resource handler returned message: "Resource of type 'AWS::SSM::Parameter' with identifier '/bellyfed/{environment}/route53/hosted-zone-id' already exists."
```

This error occurs because CloudFormation cannot create resources that already exist. The script updates the existing parameters so that the stack can be deployed successfully.

## update-all-environments.sh

This script updates SSM parameters for all environments (dev, test, qa, prod). It's useful when you need to update all environments at once.

### Usage

```bash
./update-all-environments.sh
```

### What it does

The script calls `update-ssm-parameters.sh` for each environment (dev, test, qa, prod).

## deploy-certificate-stacks.sh

This script deploys certificate parameters and certificate stacks for a specific environment. It's useful when you need to deploy both stacks at once.

### Usage

```bash
./deploy-certificate-stacks.sh [environment]
```

Where `environment` is the deployment environment (dev, test, qa, prod). If not provided, it defaults to `dev`.

### What it does

1. Updates the SSM parameters using `update-ssm-parameters.sh`
2. Deploys the certificate parameters stack
3. Deploys the certificate stack
