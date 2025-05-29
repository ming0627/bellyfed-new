// Typesense utility functions for integration with NextJS application

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { TypesenseParameterStore } from './typesense-parameter-store';

/**
 * Add Typesense environment variables to a container
 * @param scope The CDK construct scope
 * @param container The ECS container to add environment variables to
 * @param environment The environment name (e.g., 'dev', 'prod')
 */
export function addTypesenseEnvironmentVariables(
    scope: Construct,
    container: ecs.ContainerDefinition,
    environment: string
): void {
    try {
        // Use the TypesenseParameterStore to get parameters
        const paramStore = new TypesenseParameterStore(scope, environment);
        const typesenseEndpointParam = paramStore.getEndpoint();
        const typesenseApiKeyParam = paramStore.getApiKey();

        // Add environment variables to the container
        // Instead of parsing the URL, which doesn't work with CloudFormation tokens,
        // we'll use the SSM parameters directly
        container.addEnvironment('TYPESENSE_ENDPOINT', typesenseEndpointParam.stringValue);
        container.addEnvironment('TYPESENSE_API_KEY', typesenseApiKeyParam.stringValue);

        // Add a note that the application will need to parse the endpoint URL at runtime
        console.log(
            'Added Typesense environment variables to container. The application will need to parse the endpoint URL at runtime.'
        );
    } catch (error: unknown) {
        console.warn(`Error adding Typesense environment variables: ${error}`);
        console.warn('Typesense integration may not work correctly.');
    }
}

/**
 * Add Typesense permissions to a task role
 * @param taskRole The IAM role to add permissions to
 * @param environment The environment name (e.g., 'dev', 'prod')
 */
export function addTypesensePermissions(taskRole: iam.IRole, environment: string): void {
    // Add permissions to read Typesense parameters from SSM
    if (taskRole instanceof iam.Role) {
        taskRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['ssm:GetParameter', 'ssm:GetParameters'],
                resources: [`arn:aws:ssm:*:*:parameter/bellyfed/${environment}/typesense/*`],
            })
        );
    } else {
        // For imported roles (IRole), we can't modify the policy directly
        console.warn(
            'Cannot add Typesense permissions to imported role. Make sure the role has the necessary permissions.'
        );
    }
}

/**
 * Create SSM parameters for Typesense client configuration
 * @param scope The CDK construct scope
 * @param id The construct ID
 * @param environment The environment name (e.g., 'dev', 'prod')
 * @param host The Typesense host
 * @param port The Typesense port
 * @param protocol The Typesense protocol (http or https)
 * @param apiKey The Typesense API key
 */
export function createTypesenseClientParameters(
    scope: Construct,
    id: string,
    environment: string,
    host: string,
    port: number,
    protocol: string,
    apiKey: string
): void {
    // Create SSM parameters for Typesense client configuration
    new ssm.StringParameter(scope, `${id}TypesenseHostParam`, {
        parameterName: `/bellyfed/${environment}/typesense/client/host`,
        stringValue: host,
        description: 'Typesense host for client configuration',
    });

    new ssm.StringParameter(scope, `${id}TypesensePortParam`, {
        parameterName: `/bellyfed/${environment}/typesense/client/port`,
        stringValue: port.toString(),
        description: 'Typesense port for client configuration',
    });

    new ssm.StringParameter(scope, `${id}TypesenseProtocolParam`, {
        parameterName: `/bellyfed/${environment}/typesense/client/protocol`,
        stringValue: protocol,
        description: 'Typesense protocol for client configuration',
    });

    new ssm.StringParameter(scope, `${id}TypesenseApiKeyParam`, {
        parameterName: `/bellyfed/${environment}/typesense/client/api-key`,
        stringValue: apiKey,
        description: 'Typesense API key for client configuration',
    });
}

/**
 * Create a CloudFormation output for Typesense client configuration
 * @param stack The CDK stack
 * @param environment The environment name (e.g., 'dev', 'prod')
 * @param host The Typesense host
 * @param port The Typesense port
 * @param protocol The Typesense protocol (http or https)
 */
export function createTypesenseClientOutput(
    stack: cdk.Stack,
    environment: string,
    host: string,
    port: number,
    protocol: string
): void {
    // Create CloudFormation output for Typesense client configuration
    new cdk.CfnOutput(stack, 'TypesenseClientConfig', {
        value: JSON.stringify({
            host,
            port,
            protocol,
            environment,
        }),
        description: 'Typesense client configuration',
        exportName: `Typesense-${environment}-ClientConfig`,
    });
}
