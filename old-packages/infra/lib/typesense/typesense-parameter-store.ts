// TypesenseParameterStore class
// Provides a centralized way to access Typesense-related SSM parameters

import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Configuration interface for Typesense
 */
export interface TypesenseConfiguration {
    endpoint: string;
    apiKey: string;
    host?: string;
    port?: number;
    protocol?: string;
}

/**
 * Interface for Typesense service
 */
export interface ITypesenseService {
    readonly endpoint: string;
    readonly apiKey: string;
    readonly securityGroup: any; // Using any for now, will be properly typed in implementation
}

/**
 * Security configuration for Typesense
 */
export interface TypesenseSecurityConfig {
    serviceSecurityGroup: any; // Using any for now, will be properly typed in implementation
}

/**
 * Class to handle parameter store interactions for Typesense
 */
export class TypesenseParameterStore {
    constructor(
        private _scope: Construct,
        private _environment: string
    ) {}

    // Getters for private properties
    get scope(): Construct {
        return this._scope;
    }

    get environment(): string {
        return this.environment;
    }

    /**
     * Get the Typesense endpoint parameter
     */
    getEndpoint(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseEndpointParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/endpoint`,
            }
        );
    }

    /**
     * Get the Typesense API key parameter
     */
    getApiKey(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseApiKeyParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/api-key`,
            }
        );
    }

    /**
     * Get the Typesense host parameter for client configuration
     */
    getClientHost(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseClientHostParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/client/host`,
            }
        );
    }

    /**
     * Get the Typesense port parameter for client configuration
     */
    getClientPort(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseClientPortParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/client/port`,
            }
        );
    }

    /**
     * Get the Typesense protocol parameter for client configuration
     */
    getClientProtocol(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseClientProtocolParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/client/protocol`,
            }
        );
    }

    /**
     * Get the Typesense API key parameter for client configuration
     */
    getClientApiKey(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseClientApiKeyParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/client/api-key`,
            }
        );
    }
}

/**
 * Get Typesense configuration from parameter store
 * @param scope The CDK construct scope
 * @param environment The environment name (e.g., 'dev', 'prod')
 * @returns TypesenseConfiguration object
 */
export function getTypesenseConfiguration(
    scope: Construct,
    environment: string
): TypesenseConfiguration {
    try {
        const paramStore = new TypesenseParameterStore(scope, environment);
        return {
            endpoint: paramStore.getEndpoint().stringValue,
            apiKey: paramStore.getApiKey().stringValue,
        };
    } catch (error: unknown) {
        console.warn(`Error getting Typesense configuration: ${error}`);
        return {
            endpoint: '',
            apiKey: '',
        };
    }
}

/**
 * Get Typesense client configuration from parameter store
 * @param scope The CDK construct scope
 * @param environment The environment name (e.g., 'dev', 'prod')
 * @returns TypesenseConfiguration object with client-specific properties
 */
export function getTypesenseClientConfiguration(
    scope: Construct,
    environment: string
): TypesenseConfiguration {
    try {
        const paramStore = new TypesenseParameterStore(scope, environment);
        return {
            endpoint: '', // Not used for client configuration
            apiKey: paramStore.getClientApiKey().stringValue,
            host: paramStore.getClientHost().stringValue,
            port: parseInt(paramStore.getClientPort().stringValue),
            protocol: paramStore.getClientProtocol().stringValue,
        };
    } catch (error: unknown) {
        console.warn(`Error getting Typesense client configuration: ${error}`);
        return {
            endpoint: '',
            apiKey: '',
            host: 'localhost',
            port: 8108,
            protocol: 'http',
        };
    }
}
