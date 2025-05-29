import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface CognitoParametersStackProps extends cdk.StackProps {
    environment: string;
    userPoolId: string;
    userPoolClientId: string;
    identityPoolId: string;
}

/**
 * A separate stack for storing Cognito IDs in SSM Parameter Store
 * This approach avoids using custom resources that can cause deployment issues
 */
export class CognitoParametersStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CognitoParametersStackProps) {
        super(scope, id, props);

        const { environment, userPoolId, userPoolClientId, identityPoolId } = props;

        // Store User Pool ID in SSM Parameter Store with version suffix
        new ssm.StringParameter(this, `UserPoolIdParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/cognito/user-pool-id`,
            stringValue: userPoolId,
            description: `User Pool ID for ${environment} environment`,
        });

        // Store User Pool Client ID in SSM Parameter Store with version suffix
        new ssm.StringParameter(this, `UserPoolClientIdParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/cognito/user-pool-client-id`,
            stringValue: userPoolClientId,
            description: `User Pool Client ID for ${environment} environment`,
        });

        // Store Identity Pool ID in SSM Parameter Store with version suffix
        new ssm.StringParameter(this, `IdentityPoolIdParam-${environment}`, {
            parameterName: `/bellyfed/${environment}/cognito/identity-pool-id`,
            stringValue: identityPoolId,
            description: `Identity Pool ID for ${environment} environment`,
        });

        // Output the parameter paths for reference with version suffix
        new cdk.CfnOutput(this, `UserPoolIdParamPath-${environment}`, {
            value: `/bellyfed/${environment}/cognito/user-pool-id`,
            description: `SSM Parameter path for User Pool ID (${environment})`,
        });

        new cdk.CfnOutput(this, `UserPoolClientIdParamPath-${environment}`, {
            value: `/bellyfed/${environment}/cognito/user-pool-client-id`,
            description: `SSM Parameter path for User Pool Client ID (${environment})`,
        });

        new cdk.CfnOutput(this, `IdentityPoolIdParamPath-${environment}`, {
            value: `/bellyfed/${environment}/cognito/identity-pool-id`,
            description: `SSM Parameter path for Identity Pool ID (${environment})`,
        });
    }
}
