import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export interface GoogleMapsStackProps extends cdk.StackProps {
    environment: string;
    dbSecretArn: string;
    dbClusterArn: string;
    dbName: string;
}

export class GoogleMapsStack extends cdk.Stack {
    public readonly googleMapsLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: GoogleMapsStackProps) {
        super(scope, id, props);

        const { environment, dbSecretArn, dbClusterArn, dbName } = props;

        // Create a secret for the Google Maps API key
        const googleMapsApiKeySecret = new secretsmanager.Secret(this, 'GoogleMapsApiKeySecret', {
            secretName: `/bellyfed/${environment}/google-maps-api-key`,
            description: `Google Maps API key for ${environment} environment`,
        });

        // Create a log group for the Lambda function
        const logGroup = new logs.LogGroup(this, 'GoogleMapsLambdaLogGroup', {
            logGroupName: `/aws/lambda/bellyfed-${environment}-google-maps-integration`,
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Create the Lambda function
        this.googleMapsLambda = new lambda.Function(this, 'GoogleMapsLambda', {
            functionName: `bellyfed-${environment}-google-maps-integration`,
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(
                path.join(__dirname, '../functions/google-maps-integration')
            ),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                DB_SECRET_ARN: dbSecretArn,
                DB_CLUSTER_ARN: dbClusterArn,
                DB_NAME: dbName,
                GOOGLE_MAPS_API_KEY_SECRET_NAME: googleMapsApiKeySecret.secretName,
            },
            logGroup,
        });

        // Grant the Lambda function permission to access the database
        this.googleMapsLambda.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                resources: [dbClusterArn],
            })
        );

        // Grant the Lambda function permission to access the database secret
        this.googleMapsLambda.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['secretsmanager:GetSecretValue'],
                resources: [dbSecretArn, googleMapsApiKeySecret.secretArn],
            })
        );

        // Store the Lambda function ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'GoogleMapsLambdaArnParam', {
            parameterName: `/bellyfed/${environment}/lambda/google-maps-integration-arn`,
            stringValue: this.googleMapsLambda.functionArn,
            description: `ARN for Google Maps integration Lambda function in ${environment} environment`,
        });
    }
}
