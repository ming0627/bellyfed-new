import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { BaseResourceCreator } from './base-resource-creator';
import { StackUtils } from '../stack-utils';

export interface ApiGatewayProps extends Omit<apigateway.RestApiProps, 'restApiName'> {
    apiName: string;
}

/**
 * Creates an API Gateway with standardized configuration:
 * 1. Standard naming convention
 * 2. Standard tags
 * 3. ARN storage in SSM
 */
export class ApiGatewayCreator extends BaseResourceCreator<apigateway.RestApi> {
    private props: ApiGatewayProps;

    constructor(scope: Construct, id: string, environment: string, props: ApiGatewayProps) {
        super(scope, id, environment);
        this.props = props;
    }

    protected createResource(): apigateway.RestApi {
        const { apiName, ...apiProps } = this.props;

        return new apigateway.RestApi(this.scope, this.id, {
            ...apiProps,
            restApiName: StackUtils.createResourceName(apiName, this.environment),
        });
    }

    protected getResourceType(): string {
        return 'api-gateway';
    }
}

/**
 * Helper function to create an API Gateway with standard configuration
 */
export function createApiGateway(
    scope: Construct,
    id: string,
    environment: string,
    props: ApiGatewayProps
): apigateway.RestApi {
    return new ApiGatewayCreator(scope, id, environment, props).create();
}
