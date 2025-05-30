import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface CertificateStackProps extends cdk.StackProps {
    environment: string;
    domainName: string;
}

/**
 * Stack for creating and validating ACM certificates
 * This stack should be deployed separately before other stacks that depend on certificates
 */
export class CertificateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CertificateStackProps) {
        super(scope, id, props);

        // Import existing Route53 hosted zone
        const _hostedZone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            'ImportedHostedZone',
            {
                hostedZoneId: 'Z05895961O4U27Y58ZXM1',
                zoneName: props.domainName,
            }
        );

        // Import the certificate ARN from the CloudFormation exports created by the parameters stack
        // This decouples the CloudFormation exports from the certificate creation
        let wildcardCertificate: acm.ICertificate;

        // Always use the hardcoded ARN to avoid any dependency issues
        // This ensures the certificate stack doesn't depend on the parameters stack
        console.log('Using hardcoded certificate ARN to avoid dependency issues.');
        wildcardCertificate = acm.Certificate.fromCertificateArn(
            this,
            'ImportedWildcardCertificate',
            'arn:aws:acm:ap-southeast-1:590184067494:certificate/bff2c8db-03a5-45a6-890e-b6dd7cecad7a'
        );

        // We'll skip creating SSM parameters since they're causing issues
        // Instead, we'll rely on CloudFormation exports
        console.log(`Using CloudFormation exports for certificate ARNs instead of SSM parameters`);

        // Use the same certificate for API
        const apiCertificate = wildcardCertificate;

        // We'll skip creating SSM parameters for API certificate as well
        // CloudFormation exports will be used instead

        // Output certificate ARNs without exports
        // The exports are now handled by the parameters stack
        new cdk.CfnOutput(this, 'WildcardCertificateArnOutput', {
            value: wildcardCertificate.certificateArn,
            description: 'Wildcard Certificate ARN',
        });

        new cdk.CfnOutput(this, 'ApiCertificateArnOutput', {
            value: apiCertificate.certificateArn,
            description: 'API Certificate ARN',
        });

        // No hosted zone output since we're using DNS validation
    }
}
