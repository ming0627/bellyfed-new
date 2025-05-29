import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import { CONFIG } from './config.js';
import { LambdaFactory } from './constructs/lambda/lambda-factory';
import { createLambdaLayer } from './utils/resource-creators';
import { CentralizedLogging } from './constructs/logging/centralized-logging';

export interface LambdaStackProps extends cdk.StackProps {
    environment: string;
    dbSecretArn?: string;
    /**
     * Optional centralized logging construct
     * If not provided, the stack will try to import it from SSM Parameter Store
     */
    centralizedLogging?: CentralizedLogging;
}

export class LambdaStack extends cdk.Stack {
    private readonly lambdaFactory: LambdaFactory;
    private readonly handlers: { [key: string]: lambda.Function } = {};
    private readonly middlewareLayer: lambda.LayerVersion;
    public readonly deadLetterQueues: sqs.IQueue[] = [];
    private lambdaRole: iam.Role;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const { environment, dbSecretArn } = props;

        // Create middleware layer
        this.middlewareLayer = createLambdaLayer(this, 'MiddlewareLayer', environment, {
            layerName: CONFIG.lambda.namingPatterns.layer
                .replace('{environment}', environment)
                .replace('{name}', 'middleware'),
            code: lambda.Code.fromAsset(path.join(__dirname, '../src/layers/middleware')),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Common middleware and utilities for Lambda functions',
        });

        // Try to import centralized logging from SSM Parameter Store if not provided
        let centralizedLogging = props.centralizedLogging;
        if (!centralizedLogging) {
            try {
                const centralizedLogGroupArn = ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${environment}/logging/centralized-error-log-group-arn`
                );

                // Create a log group from the ARN
                const centralizedLogGroup = cdk.aws_logs.LogGroup.fromLogGroupArn(
                    this,
                    'ImportedCentralizedLogGroup',
                    centralizedLogGroupArn
                );

                // Create a minimal CentralizedLogging construct with just the log group
                centralizedLogging = new CentralizedLogging(this, 'ImportedCentralizedLogging', {
                    environment,
                    existingLogGroup: centralizedLogGroup,
                });

                console.log(
                    `Successfully imported centralized logging from SSM for ${environment} environment`
                );
            } catch (error: unknown) {
                console.warn(
                    `Warning: Could not import centralized logging from SSM. Error: ${error}`
                );
            }
        }

        // Create Lambda factory with centralized logging
        this.lambdaFactory = new LambdaFactory(
            this,
            'LambdaFactory',
            environment,
            undefined, // No DLQ topic reference
            centralizedLogging // Pass centralized logging to Lambda factory
        );

        // Create all Lambda functions
        this.createAllLambdas(environment, dbSecretArn);

        // Add event sources after all Lambdas are created
        this.lambdaFactory.addEventSources();

        // Create SSM parameters for Lambda function ARNs
        Object.entries(this.handlers).forEach(([name, func]) => {
            new ssm.StringParameter(this, `${name}ArnParam`, {
                parameterName: CONFIG.ssm.lambdaPathPattern
                    .replace('{environment}', environment)
                    .replace('{lambda-name}', func.functionName),
                stringValue: func.functionArn,
                description: `ARN for ${func.functionName} Lambda function`,
                simpleName: false,
            });
        });

        // Grant SQS permissions
        this.grantSqsPermissions(environment);
    }

    private createAllLambdas(environment: string, dbSecretArn?: string): void {
        // Default environment variables for all Lambda functions
        const defaultEnvironment = {
            ENVIRONMENT: environment,
            REGION: this.region,
            ACCOUNT_ID: this.account,
            ...CONFIG.lambda.defaultEnvironmentVars,
            VERIFICATION_URL_BASE:
                environment === 'dev'
                    ? CONFIG.app.urlBases.verification.dev
                    : CONFIG.app.urlBases.verification.default,
            RESET_PASSWORD_URL_BASE:
                environment === 'dev'
                    ? CONFIG.app.urlBases.resetPassword.dev
                    : CONFIG.app.urlBases.resetPassword.default,
            USER_EVENT_BUS: CONFIG.eventBridge.eventBusNames.user.replace(
                '{environment}',
                environment
            ),
            AUTH_EVENT_BUS: CONFIG.eventBridge.eventBusNames.auth.replace(
                '{environment}',
                environment
            ),
            SYSTEM_EVENT_BUS: CONFIG.eventBridge.eventBusNames.system.replace(
                '{environment}',
                environment
            ),
            ANALYTICS_EVENT_BUS: CONFIG.eventBridge.eventBusNames.analytics.replace(
                '{environment}',
                environment
            ),
            DB_NAME_SSM_PATH: CONFIG.ssm.dbNamePath.replace('{environment}', environment),
            DB_HOST_SSM_PATH: CONFIG.ssm.dbHostPath.replace('{environment}', environment),
            DB_PORT_SSM_PATH: CONFIG.ssm.dbPortPath.replace('{environment}', environment),
            DB_SECRET_SSM_PATH: `/bellyfed/${environment}/db/secret`,
        };

        // Create Common Lambda Role with access to Aurora PostgreSQL, SSM, and EventBridge
        this.lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            roleName: CONFIG.lambda.namingPatterns.role.replace('{environment}', environment),
        });

        // Grant permissions to use all EventBridge event buses
        this.lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['events:PutEvents'],
                resources: [
                    `arn:aws:events:${this.region}:${this.account}:event-bus/${CONFIG.eventBridge.eventBusNames.user.replace('{environment}', environment)}`,
                    `arn:aws:events:${this.region}:${this.account}:event-bus/${CONFIG.eventBridge.eventBusNames.auth.replace('{environment}', environment)}`,
                    `arn:aws:events:${this.region}:${this.account}:event-bus/${CONFIG.eventBridge.eventBusNames.system.replace('{environment}', environment)}`,
                    `arn:aws:events:${this.region}:${this.account}:event-bus/${CONFIG.eventBridge.eventBusNames.analytics.replace('{environment}', environment)}`,
                    `arn:aws:events:${this.region}:${this.account}:event-bus/default`,
                ],
            })
        );

        // Grant permissions to access SSM parameters
        const paramPrefix = CONFIG.app.namingPatterns.paramPrefix;

        this.lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['ssm:GetParameter', 'ssm:GetParameters'],
                resources: [
                    `arn:aws:ssm:${this.region}:${this.account}:parameter/${paramPrefix}/${environment}/*`,
                ],
            })
        );

        // Grant permissions to access the database secret if provided
        if (dbSecretArn) {
            this.lambdaRole.addToPolicy(
                new iam.PolicyStatement({
                    actions: ['secretsmanager:GetSecretValue'],
                    resources: [dbSecretArn],
                })
            );
        }

        // Restaurant Query Lambda - This is a high-volume Lambda
        const restaurantQuery = this.lambdaFactory.createLambda({
            name: 'restaurant-query',
            codePath: path.join(__dirname, '../functions/restaurant-query/dist'),
            environment: defaultEnvironment,
            // Mark as high-volume to optimize logging and reduce costs
            isHighVolume: true,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            restaurantQuery.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['restaurantQuery'] = restaurantQuery.lambdaFunction;

        // Analytics Service Lambda - This is a high-volume Lambda
        const analyticsService = this.lambdaFactory.createLambda({
            name: 'analytics-service',
            codePath: path.join(__dirname, '../functions/analytics-service/dist'),
            environment: {
                ...defaultEnvironment,
                ANALYTICS_TABLE: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${environment}/dynamodb/analytics-table-name`
                ),
                SESSIONS_TABLE: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${environment}/dynamodb/sessions-table-name`
                ),
                CACHE_TABLE: ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${environment}/dynamodb/cache-table-name`
                ),
            },
            // Mark as high-volume to optimize logging and reduce costs
            isHighVolume: true,
        });

        // Add DynamoDB permissions
        analyticsService.lambdaFunction.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query',
                    'dynamodb:Scan',
                    'dynamodb:BatchWriteItem',
                    'dynamodb:BatchGetItem',
                ],
                resources: [
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-analytics-${environment}`,
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-analytics-${environment}/index/*`,
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-sessions-${environment}`,
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-cache-${environment}`,
                ],
            })
        );

        this.handlers['analyticsService'] = analyticsService.lambdaFunction;

        // Menu Query Lambda has been removed as part of the migration to Next.js Server Actions with Prisma

        // Review Query Lambda
        const reviewQuery = this.lambdaFactory.createLambda({
            name: 'review-query',
            codePath: path.join(__dirname, '../functions/review-query/dist'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            reviewQuery.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['reviewQuery'] = reviewQuery.lambdaFunction;

        // Write Processor Lambda
        const writeProcessor = this.lambdaFactory.createLambda({
            name: 'write-processor',
            codePath: path.join(__dirname, '../functions/write-processor/dist'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API write permissions
        if (dbSecretArn) {
            writeProcessor.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'rds-data:ExecuteStatement',
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:RollbackTransaction',
                    ],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['writeProcessor'] = writeProcessor.lambdaFunction;

        // User Query Lambda has been removed as part of the migration to Next.js Server Actions with Prisma

        // User Profile Lambda
        const userProfile = this.lambdaFactory.createLambda({
            name: 'user-profile',
            codePath: path.join(__dirname, '../functions/user-profile'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            userProfile.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'rds-data:ExecuteStatement',
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:RollbackTransaction',
                    ],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['userProfile'] = userProfile.lambdaFunction;

        // Establishment Writer Lambda
        const establishmentWriter = this.lambdaFactory.createLambda({
            name: 'establishment-writer',
            codePath: path.join(__dirname, '../functions/establishment-writer/dist'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            establishmentWriter.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'rds-data:ExecuteStatement',
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:RollbackTransaction',
                    ],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['establishmentWriter'] = establishmentWriter.lambdaFunction;

        // Analytics Processor Lambda
        const analyticsProcessor = this.lambdaFactory.createLambda({
            name: 'analytics-processor',
            codePath: path.join(__dirname, '../functions/analytics-processor/dist'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            analyticsProcessor.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['analyticsProcessor'] = analyticsProcessor.lambdaFunction;

        // Reviews Lambda
        const reviews = this.lambdaFactory.createLambda({
            name: 'reviews',
            codePath: path.join(__dirname, '../functions/reviews'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            reviews.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'rds-data:ExecuteStatement',
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:RollbackTransaction',
                    ],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['reviews'] = reviews.lambdaFunction;

        // Rankings Lambda
        const rankings = this.lambdaFactory.createLambda({
            name: 'rankings',
            codePath: path.join(__dirname, '../functions/rankings'),
            environment: defaultEnvironment,
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            rankings.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'rds-data:ExecuteStatement',
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:RollbackTransaction',
                    ],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['rankings'] = rankings.lambdaFunction;

        // Process User Signup Lambda
        const processUserSignup = this.lambdaFactory.createLambda({
            name: 'process-user-signup',
            codePath: path.join(__dirname, '../functions/process-user-signup/dist'),
            environment: {
                ...defaultEnvironment,
                DB_CLUSTER_ARN_SSM_PATH: `/bellyfed/${environment}/db/aurora-cluster-arn`,
            },
        });

        // Add RDS Data API permissions
        if (dbSecretArn) {
            processUserSignup.lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['rds-data:ExecuteStatement', 'rds-data:BatchExecuteStatement'],
                    resources: ['*'], // Scope down to specific Aurora cluster when ARN is available
                })
            );
        }

        this.handlers['processUserSignup'] = processUserSignup.lambdaFunction;

        // Sample Logging Lambda has been removed as it was only for demonstration purposes

        // DB Schema Lambda is now defined in its own stack (DbSchemaStack)
    }

    private grantSqsPermissions(environment: string): void {
        // Create a new user signup queue
        const userSignupQueue = new sqs.Queue(this, 'UserSignupQueue', {
            queueName: CONFIG.lambda.queues.userSignup.name.replace('{environment}', environment),
            visibilityTimeout: cdk.Duration.seconds(
                CONFIG.lambda.queues.userSignup.visibilityTimeoutSeconds
            ),
            retentionPeriod: cdk.Duration.days(CONFIG.lambda.queues.userSignup.retentionPeriodDays),
        });

        // Store the queue ARN in SSM
        new ssm.StringParameter(this, 'UserSignupQueueArnParam', {
            parameterName: CONFIG.ssm.sqsPathPattern
                .replace('{environment}', environment)
                .replace('{queue-name}', CONFIG.sqs.queueNames.userSignup),
            stringValue: userSignupQueue.queueArn,
            description: `ARN for the user signup queue in ${environment} environment`,
        });

        // Connect the queue to the Lambda function
        if (this.handlers['processUserSignup']) {
            // Grant permissions for user signup processor
            userSignupQueue.grantConsumeMessages(this.handlers['processUserSignup']);
            this.handlers['processUserSignup'].addEventSource(
                new SqsEventSource(userSignupQueue, {
                    batchSize: 1,
                    maxBatchingWindow: cdk.Duration.seconds(0),
                })
            );
            console.log('Successfully connected process-user-signup Lambda to user signup queue');
        } else {
            console.log(
                'Could not connect process-user-signup Lambda to user signup queue. processUserSignup Lambda not found.'
            );
        }
    }

    public getHandler(handlerId: string): lambda.Function | undefined {
        return this.handlers[handlerId];
    }
}
