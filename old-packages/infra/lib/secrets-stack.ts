import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { BaseStackProps } from './types.js';

export interface SecretsStackProps extends BaseStackProps {
    // Additional properties if needed
}

/**
 * Stack for managing application secrets in a consolidated manner
 * Uses a single secret with JSON structure to store multiple key-value pairs
 * This approach reduces costs and simplifies management
 */
export class SecretsStack extends cdk.Stack {
    public readonly appSecret: secretsmanager.Secret;
    public readonly secretArn: string;

    constructor(scope: Construct, id: string, props: SecretsStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Secrets');

        // Create a consolidated secret only for manually-managed secrets like API keys
        // This keeps things simple by not trying to sync with Aurora's automatically managed secrets
        // Aurora will continue to manage its own secret separately

        // Create a consolidated secret only for manually-managed secrets
        this.appSecret = new secretsmanager.Secret(this, 'AppSecrets', {
            secretName: `bellyfed-${environment}-app-secrets`,
            description: `Consolidated application secrets for Bellyfed ${environment} environment`,
            // Create a JSON object with the secrets that need to be manually managed
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    // Third-party API keys that need manual configuration
                    GOOGLE_MAPS_API_KEY: '', // Will be populated manually

                    // Any other manually managed secrets can go here
                }),
                generateStringKey: 'JWT_SECRET', // Generate a secure JWT_SECRET automatically
            },
        });

        this.secretArn = this.appSecret.secretArn;

        // Output the ARN for reference (without export)
        new cdk.CfnOutput(this, 'AppSecretsArn', {
            value: this.secretArn,
            description: `ARN for consolidated application secrets`,
        });

        // Create an SSM parameter pointing to the secret ARN for easy discovery
        new ssm.StringParameter(this, 'AppSecretsArnParam', {
            parameterName: `/bellyfed/${environment}/secrets/app-secrets-arn`,
            stringValue: this.secretArn,
            description: `ARN for consolidated application secrets`,
        });

        // For backward compatibility, create SSM parameters for specific secrets
        // This helps existing code find the appropriate secrets

        // For manually managed secrets in the consolidated secret
        this.createCompatibilityParameter('google-maps-api-key', environment);
        this.createCompatibilityParameter('jwt-secret', environment);

        // For the database URL, we'll still use the compatibility parameter
        // But we'll point it to the consolidated secret for now to maintain compatibility
        // Later, we can update it to point to Aurora's secret directly
        this.createCompatibilityParameter('database-url', environment);
    }

    /**
     * Create or update SSM parameters for secrets
     * Points to the consolidated secret ARN for manually managed secrets
     *
     * These parameters allow code to find secrets in the consolidated secret
     * The actual secret values are stored in a JSON object in Secrets Manager
     *
     * To access a specific key from the consolidated secret in application code:
     * 1. Get the secret ARN from the SSM parameter
     * 2. Get the secret value from Secrets Manager using the ARN
     * 3. Parse the JSON and access the specific key
     */
    private createCompatibilityParameter(secretKey: string, environment: string): void {
        const paramName = `/bellyfed/${environment}/secrets/${secretKey}-secret-arn`;

        // Use AWS CDK's AwsCustomResource to update the parameter
        // This is a simpler approach that doesn't require a separate Lambda function
        new cr.AwsCustomResource(this, `${secretKey}SecretArnParamCustomResource`, {
            onCreate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: paramName,
                    Value: this.secretArn,
                    Type: 'String',
                    Description: `ARN for ${secretKey} secret`,
                    Overwrite: true,
                },
                physicalResourceId: cr.PhysicalResourceId.of(
                    `${paramName}-${Date.now().toString()}`
                ),
            },
            onUpdate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: paramName,
                    Value: this.secretArn,
                    Type: 'String',
                    Description: `ARN for ${secretKey} secret`,
                    Overwrite: true,
                },
                physicalResourceId: cr.PhysicalResourceId.of(
                    `${paramName}-${Date.now().toString()}`
                ),
            },
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });

        console.log(
            `Created/updated parameter ${paramName} to point to ${this.secretArn} using AWS custom resource`
        );
    }
}
