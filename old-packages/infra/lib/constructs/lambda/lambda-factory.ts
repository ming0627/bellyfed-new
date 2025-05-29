import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { LambdaWithRetry } from './lambda-with-retry';
import { CONFIG } from '../../config';
import { CentralizedLogging } from '../logging/centralized-logging';

export interface EventSourceConfig {
    type: 'sqs';
    queueArn: string;
    batchSize?: number;
    maxBatchingWindow?: cdk.Duration;
}

export interface LambdaConfig {
    name: string;
    codePath: string;
    environment: { [key: string]: string };
    handlerPath?: string;
    memorySize?: number;
    timeout?: cdk.Duration;
    maxRetries?: number;
    eventSources?: EventSourceConfig[];
    /**
     * Whether to enable verbose logging for this Lambda function
     * @default true for dev environment, false for others
     */
    verboseLogging?: boolean;
    /**
     * Lambda layers to attach to the function
     */
    layers?: lambda.ILayerVersion[];
    /**
     * Whether this is a high-volume Lambda function that should use log sampling
     * High-volume functions will have more restrictive logging to reduce costs
     * @default false
     */
    isHighVolume?: boolean;
}

export class LambdaFactory extends Construct {
    private readonly environment: string;
    private readonly centralizedDLQTopic?: sns.ITopic;
    private readonly lambdas: Map<string, LambdaWithRetry> = new Map();
    private readonly eventSources: Map<string, EventSourceConfig[]> = new Map();
    private readonly centralizedLogging?: CentralizedLogging;

    // Default configurations from centralized config
    private static readonly DEFAULT_MEMORY_SIZE = CONFIG.lambda.defaultMemorySize;
    private static readonly DEFAULT_TIMEOUT = cdk.Duration.seconds(CONFIG.lambda.defaultTimeout);
    private static readonly DEFAULT_MAX_RETRIES = CONFIG.lambda.defaultMaxRetries;
    private static readonly DEFAULT_HANDLER = CONFIG.lambda.defaultHandler;

    constructor(
        scope: Construct,
        id: string,
        environment: string,
        centralizedDLQTopic?: sns.ITopic,
        centralizedLogging?: CentralizedLogging
    ) {
        super(scope, id);
        this.environment = environment;
        this.centralizedDLQTopic = centralizedDLQTopic;
        this.centralizedLogging = centralizedLogging;

        // If no centralized logging is provided, try to get it from SSM Parameter Store
        if (!this.centralizedLogging) {
            try {
                const centralizedLogGroupArn = ssm.StringParameter.valueForStringParameter(
                    this,
                    `/bellyfed/${environment}/logging/centralized-error-log-group-arn`
                );

                // Create a log group from the ARN
                const centralizedLogGroup = logs.LogGroup.fromLogGroupArn(
                    this,
                    'ImportedCentralizedLogGroup',
                    centralizedLogGroupArn
                );

                // Create a minimal CentralizedLogging construct with just the log group
                this.centralizedLogging = new CentralizedLogging(
                    this,
                    'ImportedCentralizedLogging',
                    {
                        environment,
                        // Use the imported log group
                        existingLogGroup: centralizedLogGroup,
                    }
                );
            } catch (error: unknown) {
                // Log a warning but continue without centralized logging
                console.warn(
                    `Warning: Could not import centralized logging from SSM. Error: ${error}`
                );
            }
        }
    }

    public createLambda(config: LambdaConfig): LambdaWithRetry {
        // Store event sources for later
        if (config.eventSources) {
            this.eventSources.set(config.name, config.eventSources);
        }

        // Determine if verbose logging should be enabled
        const verboseLogging = config.verboseLogging ?? this.environment === 'dev';

        // Create the Lambda function with a stable logical ID
        const lambdaConstruct = new LambdaWithRetry(this, `${config.name}Lambda`, {
            functionName: `${this.environment}-${config.name}`,
            handlerPath: config.handlerPath ?? LambdaFactory.DEFAULT_HANDLER,
            codePath: config.codePath,
            environment: {
                ...config.environment,
                ENVIRONMENT: this.environment,
                // Add logging configuration
                LOG_LEVEL: verboseLogging ? 'debug' : 'info',
                ENABLE_VERBOSE_LOGGING: verboseLogging ? 'true' : 'false',
            },
            memorySize: config.memorySize ?? LambdaFactory.DEFAULT_MEMORY_SIZE,
            timeout: config.timeout ?? LambdaFactory.DEFAULT_TIMEOUT,
            maxRetries: config.maxRetries ?? LambdaFactory.DEFAULT_MAX_RETRIES,
            centralizedSNSTopic: this.centralizedDLQTopic, // This is now optional
            environmentName: this.environment,
            layers: config.layers || [],
        });

        // Apply centralized logging if available
        if (this.centralizedLogging) {
            try {
                // Get logging configuration from centralized logging
                const isHighVolume = config.isHighVolume || false;
                const loggingConfig = this.centralizedLogging.getLoggingConfig(isHighVolume);

                // Apply logging configuration to Lambda function
                lambdaConstruct.lambdaFunction.addEnvironment('LOG_LEVEL', loggingConfig.logLevel);
                lambdaConstruct.lambdaFunction.addEnvironment(
                    'ENABLE_VERBOSE_LOGGING',
                    loggingConfig.enableVerboseLogging
                );

                // Store the function name and log group name in SSM Parameter Store for later alarm creation
                // This breaks the circular dependency by deferring alarm creation
                new ssm.StringParameter(this, `${config.name}LoggingConfig`, {
                    parameterName: `/bellyfed/${this.environment}/logging/lambda/${config.name}`,
                    stringValue: JSON.stringify({
                        functionName: lambdaConstruct.lambdaFunction.functionName,
                        logGroupName: lambdaConstruct.lambdaFunction.logGroup.logGroupName,
                        isHighVolume: isHighVolume,
                    }),
                    description: `Logging configuration for ${config.name} Lambda function`,
                });

                if (isHighVolume) {
                    console.log(
                        `Applied centralized logging config to ${config.name} with high-volume optimization`
                    );
                } else {
                    console.log(`Applied centralized logging config to ${config.name}`);
                }
            } catch (error: unknown) {
                // Log a warning but continue without centralized logging
                console.warn(
                    `Warning: Could not apply centralized logging to ${config.name}. Error: ${error}`
                );
            }
        }

        this.lambdas.set(config.name, lambdaConstruct);
        return lambdaConstruct;
    }

    public addEventSources(): void {
        // Add event sources after all Lambdas are created
        for (const [name, lambda] of this.lambdas.entries()) {
            // First add the retry queue event source
            lambda.addEventSource();

            // Then add any additional event sources
            const eventSources = this.eventSources.get(name);
            if (eventSources) {
                for (const source of eventSources) {
                    if (source.type === 'sqs') {
                        const queue = sqs.Queue.fromQueueArn(this, `${name}Queue`, source.queueArn);
                        lambda.lambdaFunction.addEventSource(
                            new SqsEventSource(queue, {
                                batchSize: source.batchSize || 1,
                                maxBatchingWindow:
                                    source.maxBatchingWindow || cdk.Duration.seconds(0),
                            })
                        );
                    }
                }
            }
        }
    }

    public getLambda(name: string): LambdaWithRetry | undefined {
        return this.lambdas.get(name);
    }

    public getAllLambdas(): Map<string, LambdaWithRetry> {
        return this.lambdas;
    }
}
