import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { CONFIG } from './config.js';

interface CognitoStackProps extends cdk.StackProps {
    cicdRegion: string;
    environment: string;
    authEnvVars?: {
        COGNITO_CLIENT_ID: string;
        COGNITO_USER_POOL_ID: string;
        COGNITO_IDENTITY_POOL_ID: string;
    };
}

export class CognitoStack extends cdk.Stack {
    // Expose Cognito resources as public properties
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;
    public readonly identityPool: cognito.CfnIdentityPool;

    constructor(scope: Construct, id: string, props: CognitoStackProps) {
        super(scope, id, {
            ...props,
            env: {
                account: props.env?.account,
                region: CONFIG.cicdRegion,
            },
            // Add termination protection to prevent accidental deletion
            terminationProtection: true,
        });

        // Add a custom IAM policy to handle resource creation failures gracefully
        const resourcePolicy = new iam.ManagedPolicy(this, 'ResourcePolicy', {
            managedPolicyName: `${id}-resource-policy`,
            description: 'Policy to handle resource creation failures gracefully',
        });
        resourcePolicy.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['cloudformation:*'],
                resources: ['*'],
            })
        );

        const { environment } = props;

        // Get environment variables for Lambda, including Cognito parameters if available
        const lambdaEnvVars: Record<string, string> = {
            USER_EVENT_BUS: `bellyfed-domain-user-${environment}`,
            ENVIRONMENT: environment,
            ...(props.authEnvVars || {}),
        };

        // Create the post confirmation Lambda function
        const postConfirmationLambda = new lambda.Function(
            this,
            `CognitoPostConfirmation-${environment}`,
            {
                runtime: lambda.Runtime.NODEJS_20_X,
                handler: 'index.handler',
                code: lambda.Code.fromAsset(
                    path.join(__dirname, '../functions/cognito-post-confirmation/dist')
                ),
                environment: lambdaEnvVars,
                description:
                    'Processes Cognito post-confirmation events and publishes to EventBridge',
            }
        );

        // Create the custom message Lambda function
        const customMessageEnvVars: Record<string, string> = {
            REGION: this.region,
            ENVIRONMENT: environment,
            AUTH_QUEUE_URL: `https://sqs.${this.region}.amazonaws.com/${this.account}/${environment}-auth-event-queue`,
            DLQ_URL: `https://sqs.${this.region}.amazonaws.com/${this.account}/${environment}-auth-event-dlq`,
            VERIFICATION_URL_BASE:
                environment === 'prod'
                    ? 'https://app.bellyfed.com'
                    : `https://app-${environment}.bellyfed.com`,
            RESET_PASSWORD_URL_BASE:
                environment === 'prod'
                    ? 'https://app.bellyfed.com'
                    : `https://app-${environment}.bellyfed.com`,
            ENABLE_CUSTOM_MESSAGE_LOGGING: 'true',
            ...(props.authEnvVars || {}),
        };

        const customMessageLambda = new lambda.Function(
            this,
            `CognitoCustomMessage-${environment}`,
            {
                runtime: lambda.Runtime.NODEJS_20_X,
                handler: 'index.handler',
                code: lambda.Code.fromAsset(
                    path.join(__dirname, '../functions/cognito-custom-message/dist')
                ),
                environment: customMessageEnvVars,
                description:
                    'Customizes Cognito email messages for verification, password reset, etc.',
            }
        );

        // Grant permission to publish to EventBridge
        postConfirmationLambda.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['events:PutEvents'],
                resources: [
                    `arn:aws:events:${this.region}:${this.account}:event-bus/bellyfed-domain-user-${environment}`,
                ],
            })
        );

        // Grant permission to send messages to SQS
        customMessageLambda.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['sqs:SendMessage'],
                resources: [
                    `arn:aws:sqs:${this.region}:${this.account}:${environment}-auth-event-queue`,
                    `arn:aws:sqs:${this.region}:${this.account}:${environment}-auth-event-dlq`,
                ],
            })
        );

        // Skip SES email configuration for development to avoid email verification requirements
        // We'll use the default Cognito email sender instead

        // Create User Pool with dynamic naming and version suffix
        this.userPool = new cognito.UserPool(this, `BellyfedUserPool-${environment}`, {
            userPoolName: `bellyfed-user-pool-${environment}`,
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
                givenName: {
                    required: false,
                    mutable: true,
                },
                familyName: {
                    required: false,
                    mutable: true,
                },
                phoneNumber: {
                    required: false,
                    mutable: true,
                },
            },
            passwordPolicy: {
                minLength: 10,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            lambdaTriggers: {
                postConfirmation: postConfirmationLambda,
                customMessage: customMessageLambda,
            },
        });

        // Skip custom email configuration for development
        // We'll use the default Cognito email sender instead

        // Create User Pool Client with version suffix
        const userPoolClientName = `bellyfed-user-pool-client-${environment}`;
        this.userPoolClient = new cognito.UserPoolClient(
            this,
            `BellyfedUserPoolClient-${environment}`,
            {
                userPool: this.userPool,
                userPoolClientName: userPoolClientName,
                generateSecret: false,
                authFlows: {
                    adminUserPassword: true,
                    userPassword: true,
                    userSrp: true,
                },
            }
        );

        // Create Identity Pool with version suffix
        this.identityPool = new cognito.CfnIdentityPool(
            this,
            `BellyfedIdentityPool-${environment}`,
            {
                identityPoolName: `bellyfed-identity-pool-${environment}`,
                allowUnauthenticatedIdentities: false,
                cognitoIdentityProviders: [
                    {
                        clientId: this.userPoolClient.userPoolClientId,
                        providerName: this.userPool.userPoolProviderName,
                    },
                ],
            }
        );

        // Note: SSM parameters are now stored in a separate CognitoParametersStack

        // Output the User Pool ID and Client ID
        new cdk.CfnOutput(this, `UserPoolId-${environment}`, {
            value: this.userPool.userPoolId,
            description: `The ID of the User Pool for ${environment}`,
        });

        new cdk.CfnOutput(this, `UserPoolClientId-${environment}`, {
            value: this.userPoolClient.userPoolClientId,
            description: `The ID of the User Pool Client for ${environment}`,
        });

        new cdk.CfnOutput(this, `IdentityPoolId-${environment}`, {
            value: this.identityPool.ref,
            description: `The ID of the Identity Pool for ${environment}`,
        });
    }
}
