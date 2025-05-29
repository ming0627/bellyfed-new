import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface DeploymentConfigStackProps extends cdk.StackProps {
    environment: string;
    /**
     * Whether to deploy the infrastructure stack
     * @default true
     */
    deployInfraStack?: boolean;
}

/**
 * A stack that manages deployment configuration parameters in SSM
 * This allows controlling which stacks are deployed during CI/CD pipeline runs
 */
export class DeploymentConfigStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DeploymentConfigStackProps) {
        super(scope, id, props);

        const { environment, deployInfraStack = true } = props;

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'DeploymentConfig');

        // Parameter name for controlling infrastructure stack deployment
        const parameterName = `/bellyfed/${environment}/deployment/deploy-infra-stack`;

        // Check if the parameter already exists
        let existingParameter: ssm.IStringParameter | undefined;
        try {
            // Try to import the existing parameter
            existingParameter = ssm.StringParameter.fromStringParameterAttributes(
                this,
                `ImportedDeployInfraStackParam-${environment}`,
                {
                    parameterName: parameterName,
                }
            );
            console.log(`Parameter ${parameterName} already exists. Will update it.`);

            // Create a new parameter with the same name to update the value
            // This will replace the existing parameter
            new ssm.StringParameter(
                this,
                `DeploymentConfigStack-${environment}-DeployInfraStackParam`,
                {
                    parameterName: parameterName,
                    stringValue: deployInfraStack.toString(),
                    description: `Whether to deploy the infrastructure stack for ${environment} environment`,
                }
            );
        } catch (error: unknown) {
            console.log(`Parameter ${parameterName} does not exist. Creating it.`);

            // Create the parameter with a unique logical ID
            new ssm.StringParameter(
                this,
                `DeploymentConfigStack-${environment}-DeployInfraStackParam`,
                {
                    parameterName: parameterName,
                    stringValue: deployInfraStack.toString(),
                    description: `Whether to deploy the infrastructure stack for ${environment} environment`,
                }
            );
        }

        // Output the parameter name
        new cdk.CfnOutput(this, 'DeployInfraStackParamName', {
            value: `/bellyfed/${environment}/deployment/deploy-infra-stack`,
            description: 'SSM parameter name for controlling infrastructure stack deployment',
        });
    }
}
