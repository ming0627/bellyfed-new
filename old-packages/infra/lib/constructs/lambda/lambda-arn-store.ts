import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface LambdaArnStoreProps {
    lambdas: { [key: string]: lambda.Function };
    environment: string;
}

/**
 * A construct that stores Lambda ARNs in SSM Parameter Store after all Lambdas are created
 */
export class LambdaArnStore extends Construct {
    constructor(scope: Construct, id: string, props: LambdaArnStoreProps) {
        super(scope, id);

        // Store all Lambda ARNs after they are created
        Object.entries(props.lambdas).forEach(([name, func]) => {
            const parameterName = `/bellyfed/${props.environment}/lambda/${func.functionName}`;

            // Create SSM parameter with explicit name
            new ssm.StringParameter(this, `${name}ArnParameter`, {
                parameterName,
                stringValue: func.functionArn,
                description: `ARN for ${func.functionName} Lambda function`,

                tier: ssm.ParameterTier.STANDARD,
                allowedPattern: '.*',
                simpleName: false,
            });
        });
    }
}
