/**
 * SSM Parameter Manager
 *
 * This utility provides a centralized way to manage SSM parameters across the application.
 * It handles parameter creation, retrieval, and error handling in a consistent manner.
 */

import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Parameter type enum
 */
export enum ParameterType {
    STRING = 'String',
    STRING_LIST = 'StringList',
    SECURE_STRING = 'SecureString',

    // Keep old names for backward compatibility
    _STRING = 'String',
    _STRING_LIST = 'StringList',
    _SECURE_STRING = 'SecureString',
}

/**
 * Interface for parameter options
 */
export interface ParameterOptions {
    description?: string;
    type?: ParameterType;
    // allowOverride is not supported in StringParameterProps
    // allowOverride?: boolean;
}

/**
 * SSM Parameter Manager class
 */
export class SsmParameterManager {
    private readonly scope: Construct;
    private readonly environment: string;
    private readonly paramPrefix: string;
    private readonly paramCache: Map<string, ssm.IStringParameter> = new Map();

    /**
     * Constructor
     * @param scope CDK construct scope
     * @param environment Environment name (e.g., 'dev', 'test', 'prod')
     * @param paramPrefix Parameter prefix (default: 'bellyfed')
     */
    constructor(scope: Construct, environment: string, paramPrefix: string = 'bellyfed') {
        this.scope = scope;
        this.environment = environment;
        this.paramPrefix = paramPrefix;
    }

    /**
     * Get the full parameter name with prefix and environment
     * @param paramName Parameter name
     * @returns Full parameter name
     */
    public getFullParameterName(paramName: string): string {
        // Handle cases where the parameter name already includes the prefix and environment
        if (paramName.startsWith(`/${this.paramPrefix}/${this.environment}/`)) {
            return paramName;
        }

        // Handle cases where the parameter name already starts with a slash
        if (paramName.startsWith('/')) {
            return paramName;
        }

        // Standard case: add prefix and environment
        return `/${this.paramPrefix}/${this.environment}/${paramName}`;
    }

    /**
     * Create a new SSM parameter
     * @param paramName Parameter name (without prefix and environment)
     * @param value Parameter value
     * @param options Parameter options
     * @returns Created parameter
     */
    public createParameter(
        paramName: string,
        value: string,
        options: ParameterOptions = {}
    ): ssm.StringParameter {
        const fullParamName = this.getFullParameterName(paramName);
        const constructId = this.getConstructId(paramName);

        try {
            const parameter = new ssm.StringParameter(this.scope, constructId, {
                parameterName: fullParamName,
                stringValue: value,
                description: options.description || `Parameter for ${paramName}`,
                type:
                    options.type === ParameterType.SECURE_STRING
                        ? ssm.ParameterType.SECURE_STRING
                        : options.type === ParameterType.STRING_LIST
                          ? ssm.ParameterType.STRING_LIST
                          : ssm.ParameterType.STRING,
                // allowOverride is not supported in StringParameterProps
                // We'll handle overrides manually if needed
            });

            // Cache the parameter for future use
            this.paramCache.set(fullParamName, parameter);

            return parameter;
        } catch (error: unknown) {
            console.warn(`Error creating parameter ${fullParamName}: ${error}`);
            throw error;
        }
    }

    /**
     * Get an existing SSM parameter
     * @param paramName Parameter name (without prefix and environment)
     * @param required Whether the parameter is required (throws error if not found)
     * @param defaultValue Default value to use if parameter not found and not required
     * @returns Parameter or undefined if not found and not required
     */
    public getParameter(
        paramName: string,
        required: boolean = true,
        defaultValue?: string
    ): ssm.IStringParameter | undefined {
        const fullParamName = this.getFullParameterName(paramName);

        // Check if parameter is already cached
        if (this.paramCache.has(fullParamName)) {
            return this.paramCache.get(fullParamName);
        }

        try {
            // Try to get the parameter
            const constructId = this.getConstructId(paramName);
            const parameter = ssm.StringParameter.fromStringParameterAttributes(
                this.scope,
                constructId,
                {
                    parameterName: fullParamName,
                }
            );

            // Cache the parameter for future use
            this.paramCache.set(fullParamName, parameter);

            return parameter;
        } catch (error: unknown) {
            if (required) {
                console.error(`Required parameter ${fullParamName} not found: ${error}`);
                throw new Error(`Required parameter ${fullParamName} not found`);
            } else if (defaultValue !== undefined) {
                // Create the parameter with the default value if it doesn't exist
                console.warn(`Parameter ${fullParamName} not found, creating with default value`);
                return this.createParameter(paramName, defaultValue);
            } else {
                console.warn(`Parameter ${fullParamName} not found, returning undefined`);
                return undefined;
            }
        }
    }

    /**
     * Get parameter value as string
     * @param paramName Parameter name (without prefix and environment)
     * @param required Whether the parameter is required (throws error if not found)
     * @param defaultValue Default value to use if parameter not found and not required
     * @returns Parameter value or undefined if not found and not required
     */
    public getParameterValue(
        paramName: string,
        required: boolean = true,
        defaultValue?: string
    ): string | undefined {
        const parameter = this.getParameter(paramName, required, defaultValue);
        return parameter?.stringValue;
    }

    /**
     * Create a construct ID from a parameter name
     * @param paramName Parameter name
     * @returns Construct ID
     */
    private getConstructId(paramName: string): string {
        // Replace non-alphanumeric characters with dashes
        const sanitized = paramName.replace(/[^a-zA-Z0-9]/g, '-');
        // Add a random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        // Ensure the ID starts with a letter
        return `Param${sanitized}-${randomSuffix}`;
    }
}
