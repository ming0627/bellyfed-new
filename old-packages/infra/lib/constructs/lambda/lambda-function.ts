import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface LambdaFunctionProps {
    functionName: string;
    handlerPath: string;
    codePath: string;
    environment?: { [key: string]: string };
    memorySize?: number;
    timeout?: cdk.Duration;
}

/**
 * A construct that creates a basic Lambda function with standard configuration
 */
export class LambdaFunction extends Construct {
    public readonly lambdaFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
        super(scope, id);

        this.lambdaFunction = new lambda.Function(this, props.functionName, {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(props.codePath),
            environment: props.environment || {},
            memorySize: props.memorySize || 512,
            timeout: props.timeout || cdk.Duration.seconds(30),
            architecture: lambda.Architecture.ARM_64,
            ephemeralStorageSize: cdk.Size.mebibytes(512),
        });
    }
}
