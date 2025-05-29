import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface SSMStackProps extends cdk.StackProps {
    environment: string;
    description?: string;
}

/**
 * A separate stack for SSM parameters to avoid circular dependencies
 * Stores various configuration parameters including ARNs of secrets.
 */
export class SSMStack extends cdk.Stack {
    // Public property to easily access the parameter name if needed elsewhere
    public readonly googleMapsApiKeySecretArnParamName: string;

    constructor(scope: Construct, id: string, props: SSMStackProps) {
        super(scope, id, props);

        const { environment } = props;
        const paramPrefix = 'bellyfed'; // Keep consistent prefix

        // Parameter Prefix
        new ssm.StringParameter(this, 'ParameterPrefix', {
            parameterName: `/${paramPrefix}/${environment}/parameter-prefix`,
            stringValue: paramPrefix,
            description: `Parameter prefix for ${environment} environment`,
        });

        // Placeholder parameters for Aurora PostgreSQL
        new ssm.StringParameter(this, 'DatabaseHostParameter', {
            parameterName: `/${paramPrefix}/${environment}/db/host`,
            stringValue: `placeholder-${environment}.cluster-abcdef.${cdk.Fn.ref('AWS::Region')}.rds.amazonaws.com`,
            description: `Host for RDS Aurora in ${environment} environment`,
        });
        new ssm.StringParameter(this, 'DatabasePortParameter', {
            parameterName: `/${paramPrefix}/${environment}/db/port`,
            stringValue: '5432',
            description: `Port for RDS Aurora in ${environment} environment`,
        });
        new ssm.StringParameter(this, 'DatabaseNameParameter', {
            parameterName: `/${paramPrefix}/${environment}/db/name`,
            stringValue: `bellyfed_${environment}`,
            description: `Database name for RDS Aurora in ${environment} environment`,
        });

        // --- Add Parameter for Google Maps API Key Secret ARN ---
        this.googleMapsApiKeySecretArnParamName = `/${paramPrefix}/${environment}/secrets/google-maps-api-key-secret-arn`;

        // Note: We're not creating or updating this parameter here anymore
        // The SecretsStack is now responsible for creating and updating all secret-related parameters
        // This avoids conflicts and ensures parameters are always pointing to the correct secret ARN

        console.log(
            `Google Maps API Key Secret ARN parameter will be managed by SecretsStack: ${this.googleMapsApiKeySecretArnParamName}`
        );

        // Add other non-secret parameters here as needed
    }
}
