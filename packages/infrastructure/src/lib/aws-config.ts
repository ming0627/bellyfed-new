/**
 * AWS Configuration Library
 * 
 * Centralized AWS service configuration and client initialization.
 * Provides consistent configuration across all infrastructure components.
 * 
 * Features:
 * - Environment-based configuration
 * - Service client initialization
 * - Connection pooling and optimization
 * - Error handling and retry logic
 * - Security best practices
 */

import { 
  DynamoDBClient, 
  DynamoDBClientConfig 
} from '@aws-sdk/client-dynamodb'
import { 
  S3Client, 
  S3ClientConfig 
} from '@aws-sdk/client-s3'
import { 
  EventBridgeClient, 
  EventBridgeClientConfig 
} from '@aws-sdk/client-eventbridge'
import { 
  SQSClient, 
  SQSClientConfig 
} from '@aws-sdk/client-sqs'
import { 
  CognitoIdentityProviderClient, 
  CognitoIdentityProviderClientConfig 
} from '@aws-sdk/client-cognito-identity-provider'
import { 
  SecretsManagerClient, 
  SecretsManagerClientConfig 
} from '@aws-sdk/client-secrets-manager'
import { 
  CloudWatchClient, 
  CloudWatchClientConfig 
} from '@aws-sdk/client-cloudwatch'

// Environment configuration
export interface EnvironmentConfig {
  region: string
  stage: string
  accountId: string
  cognitoUserPoolId: string
  cognitoClientId: string
  dynamodbTablePrefix: string
  s3BucketPrefix: string
  eventBridgeSource: string
  sqsQueuePrefix: string
}

// AWS service configuration
export interface AWSServiceConfig {
  region: string
  maxAttempts: number
  requestTimeout: number
  connectionTimeout: number
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const requiredEnvVars = [
    'AWS_REGION',
    'STAGE',
    'AWS_ACCOUNT_ID',
    'COGNITO_USER_POOL_ID',
    'COGNITO_CLIENT_ID'
  ]

  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }

  return {
    region: process.env.AWS_REGION!,
    stage: process.env.STAGE!,
    accountId: process.env.AWS_ACCOUNT_ID!,
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID!,
    cognitoClientId: process.env.COGNITO_CLIENT_ID!,
    dynamodbTablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'bellyfed',
    s3BucketPrefix: process.env.S3_BUCKET_PREFIX || 'bellyfed',
    eventBridgeSource: process.env.EVENTBRIDGE_SOURCE || 'bellyfed.app',
    sqsQueuePrefix: process.env.SQS_QUEUE_PREFIX || 'bellyfed'
  }
}

/**
 * Get base AWS service configuration
 */
export function getAWSServiceConfig(): AWSServiceConfig {
  return {
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: parseInt(process.env.AWS_MAX_ATTEMPTS || '3'),
    requestTimeout: parseInt(process.env.AWS_REQUEST_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.AWS_CONNECTION_TIMEOUT || '5000')
  }
}

/**
 * Create DynamoDB client with optimized configuration
 */
export function createDynamoDBClient(): DynamoDBClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: DynamoDBClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new DynamoDBClient(clientConfig)
}

/**
 * Create S3 client with optimized configuration
 */
export function createS3Client(): S3Client {
  const config = getAWSServiceConfig()
  
  const clientConfig: S3ClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    },
    forcePathStyle: process.env.NODE_ENV === 'development'
  }

  return new S3Client(clientConfig)
}

/**
 * Create EventBridge client with optimized configuration
 */
export function createEventBridgeClient(): EventBridgeClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: EventBridgeClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new EventBridgeClient(clientConfig)
}

/**
 * Create SQS client with optimized configuration
 */
export function createSQSClient(): SQSClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: SQSClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new SQSClient(clientConfig)
}

/**
 * Create Cognito Identity Provider client with optimized configuration
 */
export function createCognitoClient(): CognitoIdentityProviderClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: CognitoIdentityProviderClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new CognitoIdentityProviderClient(clientConfig)
}

/**
 * Create Secrets Manager client with optimized configuration
 */
export function createSecretsManagerClient(): SecretsManagerClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: SecretsManagerClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new SecretsManagerClient(clientConfig)
}

/**
 * Create CloudWatch client with optimized configuration
 */
export function createCloudWatchClient(): CloudWatchClient {
  const config = getAWSServiceConfig()
  
  const clientConfig: CloudWatchClientConfig = {
    region: config.region,
    maxAttempts: config.maxAttempts,
    requestHandler: {
      requestTimeout: config.requestTimeout,
      connectionTimeout: config.connectionTimeout
    }
  }

  return new CloudWatchClient(clientConfig)
}

/**
 * Get table name with environment prefix
 */
export function getTableName(tableName: string): string {
  const envConfig = getEnvironmentConfig()
  return `${envConfig.dynamodbTablePrefix}-${envConfig.stage}-${tableName}`
}

/**
 * Get S3 bucket name with environment prefix
 */
export function getBucketName(bucketName: string): string {
  const envConfig = getEnvironmentConfig()
  return `${envConfig.s3BucketPrefix}-${envConfig.stage}-${bucketName}`
}

/**
 * Get SQS queue name with environment prefix
 */
export function getQueueName(queueName: string): string {
  const envConfig = getEnvironmentConfig()
  return `${envConfig.sqsQueuePrefix}-${envConfig.stage}-${queueName}`
}

/**
 * Get EventBridge event source
 */
export function getEventSource(): string {
  const envConfig = getEnvironmentConfig()
  return `${envConfig.eventBridgeSource}.${envConfig.stage}`
}

/**
 * Validate AWS credentials and permissions
 */
export async function validateAWSCredentials(): Promise<boolean> {
  try {
    const dynamoClient = createDynamoDBClient()
    await dynamoClient.send({ input: {} } as any) // Simple operation to test credentials
    return true
  } catch (error) {
    console.error('AWS credentials validation failed:', error)
    return false
  }
}

/**
 * Get AWS service endpoints for local development
 */
export function getLocalEndpoints(): Record<string, string> {
  if (process.env.NODE_ENV !== 'development') {
    return {}
  }

  return {
    dynamodb: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    s3: process.env.S3_ENDPOINT || 'http://localhost:9000',
    eventbridge: process.env.EVENTBRIDGE_ENDPOINT || 'http://localhost:4566',
    sqs: process.env.SQS_ENDPOINT || 'http://localhost:4566'
  }
}

/**
 * Create all AWS service clients
 */
export function createAWSClients() {
  return {
    dynamodb: createDynamoDBClient(),
    s3: createS3Client(),
    eventbridge: createEventBridgeClient(),
    sqs: createSQSClient(),
    cognito: createCognitoClient(),
    secretsManager: createSecretsManagerClient(),
    cloudwatch: createCloudWatchClient()
  }
}

/**
 * Default export with all configuration functions
 */
export default {
  getEnvironmentConfig,
  getAWSServiceConfig,
  createDynamoDBClient,
  createS3Client,
  createEventBridgeClient,
  createSQSClient,
  createCognitoClient,
  createSecretsManagerClient,
  createCloudWatchClient,
  getTableName,
  getBucketName,
  getQueueName,
  getEventSource,
  validateAWSCredentials,
  getLocalEndpoints,
  createAWSClients
}
