import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { BaseStackProps } from './types.js';

export interface CertificateParametersStackProps extends BaseStackProps {
    /**
     * The ARN of the ACM certificate for CloudFront (must be in us-east-1)
     */
    certificateArn?: string;

    /**
     * The ID of the Route53 hosted zone
     */
    hostedZoneId?: string;

    /**
     * The domain name
     */
    domainName: string;
}

/**
 * Stack that stores certificate and hosted zone parameters in SSM Parameter Store
 * This allows the CloudFront stack to retrieve these values during deployment
 * without requiring them to be passed as context values each time.
 */
export class CertificateParametersStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CertificateParametersStackProps) {
        super(scope, id, {
            ...props,
            // Enable cross-region references
            crossRegionReferences: true,
        });

        // Add tags to all resources in this stack
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Component', 'certificate-parameters');

        // Always use the hardcoded certificate ARN for the existing certificate
        // This decouples the CloudFormation exports from the certificate creation
        const certificateArn =
            'arn:aws:acm:ap-southeast-1:590184067494:certificate/bff2c8db-03a5-45a6-890e-b6dd7cecad7a';

        // Use the specific hosted zone ID
        const hostedZoneId = 'Z05895961O4U27Y58ZXM1';

        // For certificate ARN, we'll just use the value directly in outputs
        // since the parameter might already exist in SSM
        if (certificateArn) {
            // No need to create the parameter, just reference it in outputs
            // We'll handle updating the parameter outside of CDK
        }

        // For hosted zone ID, we'll just use the value directly in outputs
        // since the parameter already exists in SSM
        if (hostedZoneId) {
            // No need to create the parameter, just reference it in outputs
            // We'll handle updating the parameter outside of CDK
        }

        // Outputs with exports for all certificate ARNs
        // These exports are used by other stacks
        if (certificateArn) {
            // Export the certificate ARN for general use
            new cdk.CfnOutput(this, 'CertificateArnOutput', {
                value: certificateArn,
                description: 'ACM Certificate ARN',
                exportName: `${props.environment}-certificate-arn`,
            });

            // Export the wildcard certificate ARN
            new cdk.CfnOutput(this, 'WildcardCertificateArnOutput', {
                value: certificateArn,
                description: 'Wildcard Certificate ARN',
                exportName: `${props.environment}-wildcard-certificate-arn`,
            });

            // Export the API certificate ARN (using the same certificate)
            new cdk.CfnOutput(this, 'ApiCertificateArnOutput', {
                value: certificateArn,
                description: 'API Certificate ARN',
                exportName: `${props.environment}-api-certificate-arn`,
            });

            // Store in SSM Parameter Store
            // Create the parameter directly without checking if it exists
            // This avoids the validation error when the parameter doesn't exist
            new ssm.StringParameter(this, 'CertificateArnParameter', {
                parameterName: `/bellyfed/${props.environment}/certificate/certificate-arn`,
                stringValue: certificateArn,
                description: `Certificate ARN for ${props.domainName}`,
            });

            // Store wildcard certificate ARN in SSM
            new ssm.StringParameter(this, 'WildcardCertificateArnParameter', {
                parameterName: `/bellyfed/${props.environment}/certificate/wildcard-certificate-arn`,
                stringValue: certificateArn,
                description: `Wildcard Certificate ARN for ${props.domainName}`,
            });

            // Store API certificate ARN in SSM
            new ssm.StringParameter(this, 'ApiCertificateArnParameter', {
                parameterName: `/bellyfed/${props.environment}/certificate/api-certificate-arn`,
                stringValue: certificateArn,
                description: `API Certificate ARN for ${props.domainName}`,
            });
        }

        if (hostedZoneId) {
            new cdk.CfnOutput(this, 'HostedZoneIdOutput', {
                value: hostedZoneId,
                description: 'Route53 Hosted Zone ID',
                exportName: `${props.environment}-hosted-zone-id`,
            });

            // Store in SSM Parameter Store
            // Create the parameter directly without checking if it exists
            // This avoids the validation error when the parameter doesn't exist
            new ssm.StringParameter(this, 'HostedZoneIdParameter', {
                parameterName: `/bellyfed/${props.environment}/route53/hosted-zone-id`,
                stringValue: hostedZoneId,
                description: `Route53 Hosted Zone ID for ${props.domainName}`,
            });
        }
    }
}
