import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export interface ApiStackProps extends cdk.StackProps {
    environment: string;
    vpc: ec2.Vpc;
    database: rds.DatabaseCluster;
    dbSecret: secretsmanager.Secret;
    userPool: cognito.UserPool;
    userTable: dynamodb.Table;
    hostedZone: route53.IHostedZone;
    domainName: string;
}

export class ApiStack extends cdk.Stack {
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        // Create API Gateway
        this.api = new apigateway.RestApi(this, 'BellyfedApi', {
            restApiName: `bellyfed-api-${props.environment}`,
            description: `Bellyfed API for ${props.environment} environment`,
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'X-Amz-User-Agent',
                ],
                allowCredentials: true,
            },
            deployOptions: {
                stageName: props.environment,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
            },
        });

        // Create custom domain for API
        const apiDomainName = `api-${props.environment === 'prod' ? '' : props.environment + '.'}${props.domainName}`;

        // Create certificate for API domain
        const apiCertificate = new acm.Certificate(this, 'ApiCertificate', {
            domainName: apiDomainName,
            validation: acm.CertificateValidation.fromDns(props.hostedZone),
        });

        // Create custom domain for API Gateway
        const apiDomain = new apigateway.DomainName(this, 'ApiDomain', {
            domainName: apiDomainName,
            certificate: apiCertificate,
            endpointType: apigateway.EndpointType.REGIONAL,
        });

        // Map API Gateway stage to custom domain
        new apigateway.BasePathMapping(this, 'ApiPathMapping', {
            domainName: apiDomain,
            restApi: this.api,
            stage: this.api.deploymentStage,
        });

        // Create DNS record for API domain
        new route53.ARecord(this, 'ApiDnsRecord', {
            zone: props.hostedZone,
            recordName: apiDomainName,
            target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(apiDomain)),
        });

        // Create Cognito Authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'BellyfedAuthorizer', {
            cognitoUserPools: [props.userPool],
        });

        // Create Lambda execution role with permissions to access RDS
        const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaVPCAccessExecutionRole'
                ),
            ],
        });

        // Grant Lambda role access to RDS Data API
        props.dbSecret.grantRead(lambdaExecutionRole);
        lambdaExecutionRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'rds-data:ExecuteStatement',
                    'rds-data:BatchExecuteStatement',
                    'rds-data:BeginTransaction',
                    'rds-data:CommitTransaction',
                    'rds-data:RollbackTransaction',
                ],
                resources: [props.database.clusterArn],
            })
        );

        // Grant Lambda role access to DynamoDB
        props.userTable.grantReadWriteData(lambdaExecutionRole);

        // Create Lambda functions
        const userProfileLambda = new lambda.Function(this, 'UserProfileFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/user-profile')),
            environment: {
                ENVIRONMENT: props.environment,
                USER_TABLE: props.userTable.tableName,
                DB_SECRET_ARN: props.dbSecret.secretArn,
                DB_CLUSTER_ARN: props.database.clusterArn,
                DB_NAME: 'bellyfed',
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            role: lambdaExecutionRole,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        const reviewsLambda = new lambda.Function(this, 'ReviewsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/reviews')),
            environment: {
                ENVIRONMENT: props.environment,
                DB_SECRET_ARN: props.dbSecret.secretArn,
                DB_CLUSTER_ARN: props.database.clusterArn,
                DB_NAME: 'bellyfed',
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            role: lambdaExecutionRole,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        const rankingsLambda = new lambda.Function(this, 'RankingsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../functions/rankings')),
            environment: {
                ENVIRONMENT: props.environment,
                DB_SECRET_ARN: props.dbSecret.secretArn,
                DB_CLUSTER_ARN: props.database.clusterArn,
                DB_NAME: 'bellyfed',
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            role: lambdaExecutionRole,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        // Create API resources and methods
        const usersResource = this.api.root.addResource('users');
        const currentUserResource = usersResource.addResource('current');
        const followersResource = currentUserResource.addResource('followers');
        const followingResource = currentUserResource.addResource('following');
        const followResource = usersResource.addResource('follow');
        const unfollowResource = usersResource.addResource('unfollow');

        // User profile endpoints
        currentUserResource.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        currentUserResource.addMethod('PUT', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        followersResource.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        followingResource.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        followResource.addMethod('POST', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        unfollowResource.addMethod('DELETE', new apigateway.LambdaIntegration(userProfileLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        // Reviews endpoints
        const reviewsResource = this.api.root.addResource('reviews');
        const reviewByIdResource = reviewsResource.addResource('{id}');
        const userReviewsResource = usersResource.addResource('{userId}').addResource('reviews');

        reviewsResource.addMethod('GET', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        reviewsResource.addMethod('POST', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        reviewByIdResource.addMethod('GET', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        reviewByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        reviewByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        userReviewsResource.addMethod('GET', new apigateway.LambdaIntegration(reviewsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        // Rankings endpoints
        const rankingsResource = this.api.root.addResource('rankings');
        const myRankingsResource = rankingsResource.addResource('my');
        const myRankingByDishResource = myRankingsResource.addResource('{dishSlug}');
        const localRankingsResource = rankingsResource
            .addResource('local')
            .addResource('{dishSlug}');
        const globalRankingsResource = rankingsResource
            .addResource('global')
            .addResource('{dishSlug}');

        myRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        myRankingByDishResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        myRankingByDishResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(rankingsLambda),
            {
                authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
            }
        );

        myRankingByDishResource.addMethod('PUT', new apigateway.LambdaIntegration(rankingsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        myRankingByDishResource.addMethod(
            'DELETE',
            new apigateway.LambdaIntegration(rankingsLambda),
            {
                authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
            }
        );

        localRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        globalRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        // Output the API URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.url,
            description: 'URL of the API Gateway',
        });

        // Output the custom domain URL
        new cdk.CfnOutput(this, 'ApiCustomDomainUrl', {
            value: `https://${apiDomainName}`,
            description: 'Custom domain URL of the API Gateway',
        });
    }
}
