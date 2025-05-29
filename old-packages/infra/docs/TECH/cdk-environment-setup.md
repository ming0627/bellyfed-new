# CDK Environment Setup

## Environment Variables for CDK

When running CDK commands, it's important to set the correct environment variables to avoid errors like:

```
Error: Cannot retrieve value from context provider hosted-zone since account/region are not specified at the stack level. Configure "env" with an account and region when you define your stack.
```

## Solution

We've updated the package.json scripts to include the necessary environment variables:

```json
"synth:dev": "CDK_DEFAULT_ACCOUNT=590184067494 CDK_DEFAULT_REGION=ap-southeast-1 cdk synth --context environment=dev"
```

## How to Run CDK Commands

Use the npm scripts to run CDK commands:

```bash
# Synthesize CloudFormation templates
npm run synth:dev
npm run synth:test
npm run synth:qa
npm run synth:prod

# Deploy stacks
npm run cdk:deploy:dev
npm run cdk:deploy:test
npm run cdk:deploy:qa
npm run cdk:deploy:prod
```

## Manual Environment Variables

If you need to run other CDK commands, you can set the environment variables manually:

```bash
export CDK_DEFAULT_ACCOUNT=590184067494
export CDK_DEFAULT_REGION=ap-southeast-1
npx cdk <command> --context environment=<env>
```

## Troubleshooting

If you encounter the "Cannot retrieve value from context provider" error:

1. Make sure you're using the npm scripts that include the environment variables
2. If running commands manually, set the environment variables first
3. Check that the account ID and region are correct
