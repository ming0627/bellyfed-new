import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { createApiGateway } from './utils/resource-creators';
import { formatParameterName } from './utils/stack-utils';
import { CONFIG } from './config.js';
import { CentralizedLogging } from './constructs/logging/centralized-logging';

export interface APIGatewayStackProps extends cdk.StackProps {
    environment: string;
    /**
     * Optional centralized logging construct
     * If not provided, the stack will try to import it from SSM Parameter Store
     */
    centralizedLogging?: CentralizedLogging;
}

export class ApiGatewayStack extends cdk.Stack {
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: APIGatewayStackProps) {
        super(scope, id, props);

        // Temporarily disable Route53 hosted zone lookup
        // const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        //     domainName: 'bellyfed.com',
        // });

        // Create CloudWatch Logs role for API Gateway
        const apiGatewayLoggingRole = new iam.Role(
            this,
            `${props.environment}-api-gateway-logging-role`,
            {
                assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
                managedPolicies: [
                    iam.ManagedPolicy.fromAwsManagedPolicyName(
                        'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
                    ),
                ],
            }
        );

        // Set up API Gateway account settings to use the logging role
        const apiGatewayAccount = new apigateway.CfnAccount(
            this,
            `${props.environment}-api-gateway-account`,
            {
                cloudWatchRoleArn: apiGatewayLoggingRole.roleArn,
            }
        );

        // We'll use the centralized logging configuration instead of creating a separate log group here
        // The log group will be created by the CentralizedLogging construct

        // Create API Gateway using centralized configuration
        this.api = createApiGateway(this, 'BellyfedApi', props.environment, {
            apiName: `${props.environment}-${CONFIG.app.namingPatterns.resourcePrefix}-api`,
            description: 'Bellyfed API Gateway for restaurant discovery and recommendations',
            deployOptions: {
                stageName: CONFIG.apiGateway.stageName,
                loggingLevel: apigateway.MethodLoggingLevel.ERROR,
                dataTraceEnabled: false,
                metricsEnabled: true,
                // We'll configure access logs through the centralized logging construct
                // instead of here, so we're removing the accessLogDestination and accessLogFormat
                variables: {
                    api_version: CONFIG.apiGateway.stageName,
                    api_environment: props.environment,
                },
            },
            defaultCorsPreflightOptions: {
                allowOrigins: this.getAllowedOrigins(props.environment),
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowHeaders: ['X-Api-Key', 'Authorization', 'X-Price-Range', 'X-Cuisine-Type'],
                allowCredentials: true,
                exposeHeaders: [
                    'X-RateLimit-Limit',
                    'X-RateLimit-Remaining',
                    'X-RateLimit-Reset',
                    'X-Total-Count',
                ],
            },
            endpointTypes: [apigateway.EndpointType.REGIONAL],
            apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
            // Custom domain configuration - enabled based on config
            ...(CONFIG.apiGateway.customDomain.enabled
                ? {
                      domainName: {
                          domainName: CONFIG.app.namingPatterns.apiDomainPattern.replace(
                              '{environment}',
                              props.environment
                          ),
                          // Import existing certificate from SSM Parameter Store
                          certificate: cdk.aws_certificatemanager.Certificate.fromCertificateArn(
                              this,
                              `${props.environment}-api-cert-import`,
                              ssm.StringParameter.valueForStringParameter(
                                  this,
                                  CONFIG.ssm.apiCertificateArnPath.replace(
                                      '{environment}',
                                      props.environment
                                  )
                              )
                          ),
                          endpointType: apigateway.EndpointType.REGIONAL,
                          securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
                      },
                  }
                : {}),
            minCompressionSize: cdk.Size.kibibytes(1),
            cloudWatchRole: true,
        });

        // Base path mapping - only created if custom domain is enabled
        if (CONFIG.apiGateway.customDomain.enabled && this.api.domainName) {
            new apigateway.BasePathMapping(this, `${props.environment}-base-path-mapping`, {
                domainName: this.api.domainName,
                restApi: this.api,
                stage: this.api.deploymentStage,
                basePath: CONFIG.apiGateway.customDomain.basePath,
            });
        }

        // Temporarily disable Route53 record creation
        // new route53.ARecord(this, `${props.environment}-api-record`, {
        //     zone: hostedZone,
        //     recordName: `api-${props.environment}.bellyfed.com`,
        //     target: route53.RecordTarget.fromAlias(new targets.ApiGateway(this.api)),
        // });

        // Ensure that the API Gateway stage depends on the account settings
        this.api.deploymentStage.node.addDependency(apiGatewayAccount);

        // Create usage plan with centralized configuration
        const plan = this.api.addUsagePlan(
            `${props.environment}-${CONFIG.app.namingPatterns.resourcePrefix}-usage-plan`,
            {
                name: `${props.environment}-${CONFIG.app.namingPatterns.resourcePrefix}-usage-plan`,
                throttle: {
                    rateLimit: CONFIG.apiGateway.throttling.rateLimit,
                    burstLimit: CONFIG.apiGateway.throttling.burstLimit,
                },
                quota: {
                    limit: CONFIG.apiGateway.quota.limit,
                    period: apigateway.Period[
                        CONFIG.apiGateway.quota.period as keyof typeof apigateway.Period
                    ],
                },
            }
        );

        // Create API key using centralized configuration
        const apiKey = this.api.addApiKey(
            `${props.environment}-${CONFIG.app.namingPatterns.resourcePrefix}-api-key`,
            {
                apiKeyName: `${props.environment}-${CONFIG.app.namingPatterns.resourcePrefix}-api-key`,
                description: `API Key for ${CONFIG.app.namingPatterns.resourcePrefix} frontend API communication - ${props.environment}`,
            }
        );

        // Associate API key with usage plan
        plan.addApiKey(apiKey);
        plan.addApiStage({
            stage: this.api.deploymentStage,
        });

        // Create a custom resource to get the API key value
        const getApiKeyValue = new cr.AwsCustomResource(
            this,
            `${props.environment}-get-bellyfed-api-key`,
            {
                onCreate: {
                    service: 'APIGateway',
                    action: 'getApiKey',
                    parameters: {
                        apiKey: apiKey.keyId,
                        includeValue: true,
                    },
                    physicalResourceId: cr.PhysicalResourceId.of(apiKey.keyId),
                },
                policy: cr.AwsCustomResourcePolicy.fromStatements([
                    new iam.PolicyStatement({
                        actions: ['apigateway:GET'],
                        resources: [`arn:aws:apigateway:${this.region}::/apikeys/${apiKey.keyId}`],
                    }),
                ]),
            }
        );

        // Store API key in SSM Parameter Store
        new ssm.StringParameter(this, 'ApiKeyParameter', {
            parameterName: formatParameterName(
                props.environment,
                'gateway',
                `${props.environment}-bellyfed-api-key`,
                this
            ),
            stringValue: getApiKeyValue.getResponseField('value'),
            description: `API Key for Bellyfed frontend API communication - ${props.environment}`,
            dataType: ssm.ParameterDataType.TEXT,
        });

        // Restaurant Query Lambda Integration
        const restaurantQueryLambdaArn = ssm.StringParameter.valueForStringParameter(
            this,
            `/bellyfed/${props.environment}/lambda/${props.environment}-restaurant-query`
        );

        // Create direct integration for read operations
        const restaurantQueryLambda = lambda.Function.fromFunctionAttributes(
            this,
            'RestaurantQueryLambda',
            {
                functionArn: restaurantQueryLambdaArn,
                sameEnvironment: true,
            }
        );

        // Create a single permission for restaurant query Lambda with wildcard source ARN
        restaurantQueryLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Menu Query Lambda has been removed as part of the migration to Next.js Server Actions with Prisma

        const reviewQueryLambda = lambda.Function.fromFunctionAttributes(
            this,
            'ReviewQueryLambda',
            {
                functionArn: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${props.environment}/lambda/${props.environment}-review-query`
                ),
                sameEnvironment: true,
            }
        );
        reviewQueryLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        const writeProcessorLambda = lambda.Function.fromFunctionAttributes(
            this,
            'WriteProcessorLambda',
            {
                functionArn: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${props.environment}/lambda/${props.environment}-write-processor`
                ),
                sameEnvironment: true,
            }
        );
        // Consolidate write operations under a single permission with method-specific patterns
        writeProcessorLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Analytics Service Lambda
        const analyticsServiceLambda = lambda.Function.fromFunctionAttributes(
            this,
            'AnalyticsServiceLambda',
            {
                functionArn: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${props.environment}/lambda/${props.environment}-analytics-service`
                ),
                sameEnvironment: true,
            }
        );
        analyticsServiceLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // User Query Lambda has been removed as part of the migration to Next.js Server Actions with Prisma

        // User Profile Lambda
        const userProfileLambda = lambda.Function.fromFunctionAttributes(
            this,
            'UserProfileLambda',
            {
                functionArn: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${props.environment}/lambda/${props.environment}-user-profile`
                ),
                sameEnvironment: true,
            }
        );
        userProfileLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Reviews Lambda
        const reviewsLambda = lambda.Function.fromFunctionAttributes(this, 'ReviewsLambda', {
            functionArn: ssm.StringParameter.valueForStringParameter(
                this,
                `/bellyfed/${props.environment}/lambda/${props.environment}-reviews`
            ),
            sameEnvironment: true,
        });
        reviewsLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Rankings Lambda
        const rankingsLambda = lambda.Function.fromFunctionAttributes(this, 'RankingsLambda', {
            functionArn: ssm.StringParameter.valueForStringParameter(
                this,
                `/bellyfed/${props.environment}/lambda/${props.environment}-rankings`
            ),
            sameEnvironment: true,
        });
        rankingsLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Create lambda for establishment operations
        const establishmentWriterLambda = lambda.Function.fromFunctionAttributes(
            this,
            'EstablishmentWriterLambda',
            {
                functionArn: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${props.environment}/lambda/${props.environment}-establishment-writer`
                ),
                sameEnvironment: true,
            }
        );

        // Direct integration for GET operations
        const restaurantResource = this.api.root.addResource('restaurants');
        restaurantResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(restaurantQueryLambda),
            { apiKeyRequired: true }
        );

        // Add list endpoint
        const listResource = restaurantResource.addResource('list');
        listResource.addMethod('GET', new apigateway.LambdaIntegration(restaurantQueryLambda), {
            apiKeyRequired: true,
        });

        // Add restaurant detail endpoint
        const restaurantDetailResource = restaurantResource.addResource('{id}');
        restaurantDetailResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(restaurantQueryLambda),
            { apiKeyRequired: true }
        );

        // Add menu endpoints - Now handled by Next.js Server Actions with Prisma
        const menuResource = this.api.root.addResource('menus');
        const menuDetailResource = menuResource.addResource('{id}');

        // Add review endpoints
        const reviewResource = this.api.root.addResource('reviews');
        reviewResource.addMethod('GET', new apigateway.LambdaIntegration(reviewQueryLambda), {
            apiKeyRequired: true,
        });
        const reviewDetailResource = reviewResource.addResource('{id}');
        reviewDetailResource.addMethod('GET', new apigateway.LambdaIntegration(reviewQueryLambda), {
            apiKeyRequired: true,
        });
        // DELETE method for reviews will be added later with a consistent approach

        // Add analytics endpoints
        const analyticsResource = this.api.root.addResource('analytics');

        // Track view endpoint
        const trackViewResource = analyticsResource.addResource('track-view');
        trackViewResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Track engagement endpoint
        const trackEngagementResource = analyticsResource.addResource('track-engagement');
        trackEngagementResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Get analytics endpoint
        const getAnalyticsResource = analyticsResource.addResource('get-analytics');
        getAnalyticsResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Get trending endpoint
        const getTrendingResource = analyticsResource.addResource('get-trending');
        getTrendingResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Cache endpoints
        const cacheResource = this.api.root.addResource('cache');

        // Cache data endpoint
        const cacheDataResource = cacheResource.addResource('cache-data');
        cacheDataResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Get cached data endpoint
        const getCachedDataResource = cacheResource.addResource('get-cached-data');
        getCachedDataResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(analyticsServiceLambda),
            { apiKeyRequired: true }
        );

        // Add user endpoints
        const userResource = this.api.root.addResource('users');

        // GET /users/current - Get current user
        const currentUserResource = userResource.addResource('current');
        currentUserResource.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda), {
            apiKeyRequired: true,
        });
        currentUserResource.addMethod('PUT', new apigateway.LambdaIntegration(userProfileLambda), {
            apiKeyRequired: true,
        });

        // GET /users/search - Search users - Now handled by Next.js Server Actions with Prisma
        const _searchResource = userResource.addResource('search');

        // GET /users/{id} - Get user by ID - Now handled by Next.js Server Actions with Prisma
        const userDetailResource = userResource.addResource('{id}');
        userDetailResource.addMethod(
            'PUT',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            { apiKeyRequired: true }
        );

        // User followers/following endpoints
        const currentUserFollowersResource = currentUserResource.addResource('followers');
        currentUserFollowersResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(userProfileLambda),
            { apiKeyRequired: true }
        );

        const currentUserFollowingResource = currentUserResource.addResource('following');
        currentUserFollowingResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(userProfileLambda),
            { apiKeyRequired: true }
        );

        // User followers/following endpoints - Now handled by Next.js Server Actions with Prisma
        const _userFollowersResource = userDetailResource.addResource('followers');
        const _userFollowingResource = userDetailResource.addResource('following');

        // Follow/unfollow endpoints
        const followResource = userResource.addResource('follow');
        followResource.addMethod('POST', new apigateway.LambdaIntegration(userProfileLambda), {
            apiKeyRequired: true,
            operationName: 'FollowUser',
        });

        const unfollowResource = userResource.addResource('unfollow');
        // Use addMethod instead of creating a custom Method
        unfollowResource.addMethod('DELETE', new apigateway.LambdaIntegration(userProfileLambda), {
            apiKeyRequired: true,
            operationName: 'UnfollowUserProfile',
            methodResponses: [
                {
                    statusCode: '200',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL,
                    },
                },
            ],
        });

        // User preferences endpoints
        const preferencesResource = currentUserResource.addResource('preferences');
        // GET endpoint now handled by Next.js Server Actions with Prisma
        preferencesResource.addMethod(
            'PUT',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            { apiKeyRequired: true }
        );

        // Add write endpoints for reviews
        reviewResource.addMethod('POST', new apigateway.LambdaIntegration(reviewsLambda), {
            apiKeyRequired: true,
            operationName: 'CreateReview',
        });
        reviewDetailResource.addMethod('PUT', new apigateway.LambdaIntegration(reviewsLambda), {
            apiKeyRequired: true,
            operationName: 'UpdateReview',
        });
        // Use addMethod instead of creating a custom Method
        reviewDetailResource.addMethod('DELETE', new apigateway.LambdaIntegration(reviewsLambda), {
            apiKeyRequired: true,
            operationName: 'DeleteReviewLambda',
            methodResponses: [
                {
                    statusCode: '200',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL,
                    },
                },
            ],
        });

        // Add user reviews endpoint - Use a different approach to avoid path variable conflict
        // Instead of using {userId}, use a specific path to avoid conflict with {id}
        const userReviewsResource = userResource.addResource('by-user').addResource('reviews');
        userReviewsResource.addMethod('GET', new apigateway.LambdaIntegration(reviewsLambda), {
            apiKeyRequired: true,
        });

        // Add write endpoints for restaurants
        restaurantResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            {
                apiKeyRequired: true,
                operationName: 'CreateRestaurant',
            }
        );
        restaurantDetailResource.addMethod(
            'PUT',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            {
                apiKeyRequired: true,
                operationName: 'UpdateRestaurant',
            }
        );
        // Use addMethod instead of creating a custom Method
        restaurantDetailResource.addMethod(
            'DELETE',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            {
                apiKeyRequired: true,
                operationName: 'DeleteRestaurantProcessor',
                methodResponses: [
                    {
                        statusCode: '200',
                        responseModels: {
                            'application/json': apigateway.Model.EMPTY_MODEL,
                        },
                    },
                ],
            }
        );

        // Add write endpoints for menus
        menuResource.addMethod('POST', new apigateway.LambdaIntegration(writeProcessorLambda), {
            apiKeyRequired: true,
            operationName: 'CreateMenu',
        });
        menuDetailResource.addMethod(
            'PUT',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            {
                apiKeyRequired: true,
                operationName: 'UpdateMenu',
            }
        );
        // Use addMethod instead of creating a custom Method
        menuDetailResource.addMethod(
            'DELETE',
            new apigateway.LambdaIntegration(writeProcessorLambda),
            {
                apiKeyRequired: true,
                operationName: 'DeleteMenuProcessor',
                methodResponses: [
                    {
                        statusCode: '200',
                        responseModels: {
                            'application/json': apigateway.Model.EMPTY_MODEL,
                        },
                    },
                ],
            }
        );

        // Add establishments endpoint with API key requirement
        const establishmentsResource = restaurantResource.addResource('establishments');
        establishmentsResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(establishmentWriterLambda),
            {
                apiKeyRequired: true,
                authorizationType: apigateway.AuthorizationType.NONE,
            }
        );

        // Add rankings endpoints
        const rankingsResource = this.api.root.addResource('rankings');

        // My rankings endpoints
        const myRankingsResource = rankingsResource.addResource('my');
        myRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            apiKeyRequired: true,
        });

        // My ranking by dish endpoints
        const myRankingByDishResource = myRankingsResource.addResource('{dishSlug}');
        myRankingByDishResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            apiKeyRequired: true,
        });
        myRankingByDishResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(rankingsLambda),
            { apiKeyRequired: true }
        );
        myRankingByDishResource.addMethod('PUT', new apigateway.LambdaIntegration(rankingsLambda), {
            apiKeyRequired: true,
        });
        // Use addMethod instead of creating a custom Method
        myRankingByDishResource.addMethod(
            'DELETE',
            new apigateway.LambdaIntegration(rankingsLambda),
            {
                apiKeyRequired: true,
                operationName: 'DeleteMyRanking',
                methodResponses: [
                    {
                        statusCode: '200',
                        responseModels: {
                            'application/json': apigateway.Model.EMPTY_MODEL,
                        },
                    },
                ],
            }
        );

        // Local rankings endpoints
        const localRankingsResource = rankingsResource
            .addResource('local')
            .addResource('{dishSlug}');
        localRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            apiKeyRequired: true,
        });

        // Global rankings endpoints
        const globalRankingsResource = rankingsResource
            .addResource('global')
            .addResource('{dishSlug}');
        globalRankingsResource.addMethod('GET', new apigateway.LambdaIntegration(rankingsLambda), {
            apiKeyRequired: true,
        });

        // Create a single permission for establishment-writer Lambda with wildcard source ARN
        establishmentWriterLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // DB Schema Lambda
        const dbSchemaLambda = lambda.Function.fromFunctionAttributes(this, 'DbSchemaLambda', {
            functionArn: ssm.StringParameter.valueForStringParameter(
                this,
                `/bellyfed/${props.environment}/lambda/db-schema-function-arn`
            ),
            sameEnvironment: true,
        });
        dbSchemaLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        // Add admin endpoints
        const adminResource = this.api.root.addResource('admin');

        // Add schema endpoint
        const schemaResource = adminResource.addResource('schema');
        schemaResource.addMethod('POST', new apigateway.LambdaIntegration(dbSchemaLambda), {
            apiKeyRequired: true,
            authorizationType: apigateway.AuthorizationType.NONE,
        });

        // Sample Logging Lambda has been removed as it was only for demonstration purposes

        // Enhanced WAF configuration
        const webAcl = new waf.CfnWebACL(this, `${props.environment}-bellyfed-api-waf`, {
            defaultAction: { block: {} }, // Change default action to block
            scope: 'REGIONAL',
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: `${props.environment}-bellyfed-api-waf-metrics`,
                sampledRequestsEnabled: true,
            },
            rules: [
                {
                    name: `${props.environment}-bellyfed-rate-limit`,
                    priority: 1,
                    statement: {
                        rateBasedStatement: {
                            limit: props.environment === 'prod' ? 2000 : 1000,
                            aggregateKeyType: 'IP',
                        },
                    },
                    action: { block: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: `${props.environment}-bellyfed-rate-limit-rule`,
                        sampledRequestsEnabled: true,
                    },
                },
                {
                    name: `${props.environment}-bellyfed-aws-managed-rules`,
                    priority: 2,
                    overrideAction: { none: {} },
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: 'AWS',
                            name: 'AWSManagedRulesCommonRuleSet',
                        },
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: `${props.environment}-bellyfed-aws-managed-rules-metric`,
                        sampledRequestsEnabled: true,
                    },
                },
                {
                    name: `${props.environment}-bellyfed-sql-injection`,
                    priority: 4,
                    overrideAction: { none: {} },
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: 'AWS',
                            name: 'AWSManagedRulesSQLiRuleSet',
                        },
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: `${props.environment}-bellyfed-sql-injection-metric`,
                        sampledRequestsEnabled: true,
                    },
                },
                {
                    name: `${props.environment}-bellyfed-bad-inputs`,
                    priority: 5,
                    overrideAction: { none: {} },
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: 'AWS',
                            name: 'AWSManagedRulesKnownBadInputsRuleSet',
                        },
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: `${props.environment}-bellyfed-bad-inputs-metric`,
                        sampledRequestsEnabled: true,
                    },
                },
                {
                    name: `${props.environment}-bellyfed-geo-block`,
                    priority: 6,
                    statement: {
                        geoMatchStatement: {
                            countryCodes: ['MY', 'SG'], // Allow only Malaysia and Singapore
                        },
                    },
                    action: { allow: {} },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: `${props.environment}-bellyfed-geo-block-metric`,
                        sampledRequestsEnabled: true,
                    },
                },
            ],
        });

        // Associate WAF WebACL with API Gateway
        new waf.CfnWebACLAssociation(this, `${props.environment}-bellyfed-api-waf-association`, {
            resourceArn: this.api.deploymentStage.stageArn,
            webAclArn: webAcl.attrArn,
        });

        // Temporarily disable Route53 record creation
        // new route53.ARecord(this, 'ApiDnsRecord', {
        //     zone: hostedZone,
        //     recordName: `api-${props.environment}`,
        //     target: route53.RecordTarget.fromAlias(
        //         new targets.ApiGatewayDomain(this.api.domainName!)
        //     ),
        // });

        // Apply centralized logging if available
        // The main API is considered high-traffic, so we'll use sampling to reduce costs
        const isHighTrafficApi = true;

        try {
            // First try to use the provided centralized logging construct
            if (props.centralizedLogging) {
                props.centralizedLogging.applyApiGatewayLogging(this.api, isHighTrafficApi);
                console.log(
                    `Applied centralized logging to API Gateway ${this.api.restApiName} with high-traffic optimization`
                );
            } else {
                // If not provided, try to import from SSM Parameter Store
                try {
                    const centralizedLogGroupArn = ssm.StringParameter.valueForStringParameter(
                        this,
                        `/bellyfed/${props.environment}/logging/centralized-error-log-group-arn`
                    );

                    // Create a log group from the ARN
                    const centralizedLogGroup = cdk.aws_logs.LogGroup.fromLogGroupArn(
                        this,
                        'ImportedCentralizedLogGroup',
                        centralizedLogGroupArn
                    );

                    // Create a minimal CentralizedLogging construct with just the log group
                    const centralizedLogging = new CentralizedLogging(
                        this,
                        'ImportedCentralizedLogging',
                        {
                            environment: props.environment,
                            existingLogGroup: centralizedLogGroup,
                        }
                    );

                    // Apply logging to API Gateway with high-traffic optimization
                    centralizedLogging.applyApiGatewayLogging(this.api, isHighTrafficApi);
                    console.log(
                        `Applied imported centralized logging to API Gateway ${this.api.restApiName} with high-traffic optimization`
                    );
                } catch (importError) {
                    // If import fails, create a new centralized logging construct
                    console.log(
                        `Could not import centralized logging from SSM. Creating a new instance. Error: ${importError}`
                    );

                    // Determine log retention based on environment
                    let logRetention: cdk.aws_logs.RetentionDays;
                    switch (props.environment) {
                        case 'prod':
                            logRetention = cdk.aws_logs.RetentionDays.ONE_MONTH; // 30 days for prod
                            break;
                        case 'test':
                        case 'qa':
                            logRetention = cdk.aws_logs.RetentionDays.TWO_WEEKS; // 14 days for test/qa
                            break;
                        default:
                            logRetention = cdk.aws_logs.RetentionDays.ONE_WEEK; // 7 days for dev
                    }

                    // Create a new centralized logging construct
                    const newCentralizedLogging = new CentralizedLogging(
                        this,
                        'NewCentralizedLogging',
                        {
                            environment: props.environment,
                            logRetentionDays: logRetention,
                            verboseLogging: props.environment === 'dev', // Enable verbose logging only in dev
                        }
                    );

                    // Apply logging to API Gateway with high-traffic optimization
                    newCentralizedLogging.applyApiGatewayLogging(this.api, isHighTrafficApi);
                    console.log(
                        `Created and applied new centralized logging to API Gateway ${this.api.restApiName}`
                    );
                }
            }
        } catch (error: unknown) {
            console.warn(
                `Warning: Could not apply centralized logging to API Gateway. Error: ${error}`
            );
        }

        // Output the API URLs
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.url,
            description: `Bellyfed API Gateway URL for ${props.environment}`,
        });

        new cdk.CfnOutput(this, 'CustomDomainUrl', {
            value: `https://api-${props.environment}.bellyfed.com`,
            description: `Custom domain URL for ${props.environment}`,
        });
    }

    private getAllowedOrigins(environment: string): string[] {
        const origins: Record<string, string[]> = {
            dev: ['http://localhost:3000', 'http://localhost:8080'],
            staging: ['https://staging.app.bellyfed.com'],
            prod: ['https://app.bellyfed.com'],
            qa: ['https://qa.app.bellyfed.com'],
            test: ['https://test.app.bellyfed.com'],
        };

        // Default to allowing only the environment subdomain if not in predefined list
        return origins[environment] || [`https://${environment}.app.bellyfed.com`];
    }
}
