import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { BaseResourceCreator } from './base-resource-creator';
import { StackUtils } from '../stack-utils';

export interface LambdaLayerProps extends Omit<lambda.LayerVersionProps, 'layerVersionName'> {
    layerName: string;
}

/**
 * Creates a Lambda layer with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 * 3. ARN storage in SSM
 */
export class LambdaLayerCreator extends BaseResourceCreator<lambda.LayerVersion> {
    private props: LambdaLayerProps;

    constructor(scope: Construct, id: string, environment: string, props: LambdaLayerProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): lambda.LayerVersion {
        const { layerName, ...layerProps } = this.props;

        return new lambda.LayerVersion(this.scope, this.id, {
            ...layerProps,
            layerVersionName: StackUtils.createResourceName(layerName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'lambda-layer';
    }
}

/**
 * Helper function to create a Lambda layer with standard configuration
 */
export function createLambdaLayer(
    scope: Construct,
    id: string,
    environment: string,
    props: LambdaLayerProps
): lambda.LayerVersion {
    return new LambdaLayerCreator(scope, id, environment, props).create();
}
