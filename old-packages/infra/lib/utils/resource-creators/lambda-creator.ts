import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as _cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseResourceCreator } from './base-resource-creator';
import { StackUtils } from '../stack-utils';

export interface LambdaFunctionProps extends Omit<lambda.FunctionProps, 'functionName'> {
    functionName: string;
}

/**
 * Creates a Lambda function with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 * 3. ARN storage in SSM
 */
export class LambdaCreator extends BaseResourceCreator<lambda.Function> {
    private props: LambdaFunctionProps;

    constructor(scope: Construct, id: string, environment: string, props: LambdaFunctionProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): lambda.Function {
        const { functionName, ...functionProps } = this.props;

        return new lambda.Function(this.scope, this.id, {
            ...functionProps,
            functionName: StackUtils.createResourceName(functionName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'lambda';
    }
}

/**
 * Helper function to create a Lambda function with standard configuration
 */
export function createLambdaFunction(
    scope: Construct,
    id: string,
    environment: string,
    props: LambdaFunctionProps
): lambda.Function {
    return new LambdaCreator(scope, id, environment, props).create();
}
