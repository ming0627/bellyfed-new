import * as cdk from 'aws-cdk-lib';
import { IResource } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct, IConstruct } from 'constructs';
import { GlobalTaggingUtils } from './global-tagging-utils';

/**
 * Utility functions for stack and resource operations.
 *
 * This file provides common utilities used across the CDK stacks:
 * 1. Resource naming: Creates standardized names for AWS resources
 * 2. Parameter management: Creates and manages SSM parameters
 * 3. Role creation: Helper functions for IAM role creation
 * 4. ARN storage: Stores resource ARNs in SSM for cross-stack references
 *
 * Usage:
 * ```typescript
 * // Create resource name
 * const name = StackUtils.createResourceName('my-table', 'staging');
 * // staging-my-table
 *
 * // Store ARN in SSM
 * StackUtils.storeArn(scope, table, 'MyTable', 'staging', 'dynamodb');
 * // Creates: /bellyfed/staging/dynamodb/MyTable
 * ```
 */
export class StackUtils {
    /**
     * Creates a resource name with environment prefix
     */
    static createResourceName(baseName: string, environment: string): string {
        // For historical reasons, environment was used to prefix resource names
        // Now we just return the baseName directly, but keeping the parameter for compatibility
        return environment ? `${baseName}` : `${baseName}`;
    }

    /**
     * Creates a parameter name with environment prefix and resource type
     * @param baseName - The base name of the resource
     * @param environment - The environment (e.g., dev, staging, prod)
     * @param resourceType - The type of resource (e.g., dynamodb, lambda)
     * @param scope - Optional CDK construct to determine stack name context
     * @returns A standardized SSM parameter name in the format /{prefix}/{environment}/{resourceType}/{baseName}
     */
    static createParameterName(
        baseName: string,
        environment: string,
        resourceType: string,
        scope?: Construct
    ): string {
        return formatParameterName(environment, resourceType, baseName, scope);
    }

    /**
     * Store a resource's ARN in SSM Parameter Store
     * @param scope - The CDK construct scope
     * @param resource - The AWS resource to store ARN for
     * @param name - The base name of the resource
     * @param environment - The environment (e.g., dev, staging, prod)
     * @param resourceType - The type of resource (e.g., dynamodb, lambda)
     */
    static storeArn(
        scope: Construct,
        resource: IResource & IConstruct,
        name: string,
        environment: string,
        resourceType: string
    ): void {
        const parameterName = this.createParameterName(name, environment, resourceType, scope);
        const arn =
            (resource as any).tableArn ||
            (resource as any).functionArn ||
            (resource as any).queueArn ||
            (resource as any).topicArn;
        if (!arn) {
            throw new Error(`Could not find ARN for resource ${name}`);
        }
        new ssm.StringParameter(scope, `${name}ArnParameter`, {
            parameterName,
            stringValue: arn,
            description: `ARN for ${name} in ${environment} environment`,
        });
    }

    /**
     * Gets a Lambda function from its ARN stored in SSM
     */
    static getLambdaFromSSM(scope: Construct, id: string, parameterName: string): lambda.IFunction {
        const functionArn = ssm.StringParameter.fromStringParameterName(
            scope,
            `${id}ArnParameter`,
            parameterName
        ).stringValue;
        return lambda.Function.fromFunctionAttributes(scope, id, {
            functionArn,
            sameEnvironment: true,
            role: undefined,
        });
    }

    /**
     * Creates a Lambda execution role with basic permissions
     */
    static createLambdaRole(scope: Construct, id: string, environment: string): iam.Role {
        const role = new iam.Role(scope, id, {
            roleName: this.createResourceName(id, environment),
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: `Execution role for ${id} Lambda function`,
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
            ],
        });

        // Add SSM permissions
        role.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
                resources: [
                    `arn:aws:ssm:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:parameter/bellyfed/${environment}/*`,
                ],
            })
        );

        // Let GlobalTaggingUtils handle the tags
        const taggingUtils = GlobalTaggingUtils.getInstance();
        if (taggingUtils) {
            taggingUtils.applyTags(role as IConstruct);
        }

        return role;
    }
}

/**
 * Formats a parameter name in a consistent way for SSM parameters.
 *
 * @example
 * ```typescript
 * // Creates: /bellyfed/staging/dynamodb/MyTable
 * const paramName = formatParameterName('staging', 'dynamodb', 'MyTable');
 * ```
 *
 * @param environment The environment name (e.g., dev, staging, prod)
 * @param resourceType The type of resource (e.g., dynamodb, lambda, api)
 * @param baseName The base name of the resource
 * @param scope Optional CDK construct to determine stack name context (not used anymore)
 * @returns A standardized SSM parameter name in the format /bellyfed/{environment}/{resourceType}/{baseName}
 */
export function formatParameterName(
    environment: string,
    resourceType: string,
    baseName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scope?: Construct // Kept for backward compatibility
): string {
    // Always use 'bellyfed' prefix for all resources
    return `/bellyfed/${environment}/${resourceType}/${baseName}`;
}

export * from './stack-utils';
