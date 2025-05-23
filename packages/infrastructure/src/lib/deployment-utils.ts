/**
 * Deployment Utilities Library
 * 
 * Utilities for infrastructure deployment, configuration management,
 * and environment setup for the Bellyfed application.
 * 
 * Features:
 * - Environment configuration validation
 * - Resource naming conventions
 * - Deployment helpers
 * - Configuration management
 * - Health checks and validation
 */

import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation'
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm'
import { SecretsManagerClient, GetSecretValueCommand, CreateSecretCommand } from '@aws-sdk/client-secrets-manager'

// Types
export interface DeploymentConfig {
  stage: string
  region: string
  accountId: string
  projectName: string
  version: string
  deploymentId: string
  timestamp: string
}

export interface ResourceNames {
  tables: Record<string, string>
  buckets: Record<string, string>
  queues: Record<string, string>
  functions: Record<string, string>
  apis: Record<string, string>
}

export interface EnvironmentVariables {
  [key: string]: string
}

export interface DeploymentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Generate deployment configuration
 */
export function generateDeploymentConfig(
  stage: string,
  region: string,
  accountId: string,
  version?: string
): DeploymentConfig {
  return {
    stage,
    region,
    accountId,
    projectName: 'bellyfed',
    version: version || process.env.npm_package_version || '1.0.0',
    deploymentId: generateDeploymentId(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Generate unique deployment ID
 */
export function generateDeploymentId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

/**
 * Generate resource names following naming conventions
 */
export function generateResourceNames(config: DeploymentConfig): ResourceNames {
  const prefix = `${config.projectName}-${config.stage}`
  
  return {
    tables: {
      users: `${prefix}-users`,
      restaurants: `${prefix}-restaurants`,
      dishes: `${prefix}-dishes`,
      reviews: `${prefix}-reviews`,
      analytics: `${prefix}-analytics`,
      images: `${prefix}-images`,
      sessions: `${prefix}-sessions`
    },
    buckets: {
      uploads: `${prefix}-uploads-${config.accountId}`,
      processed: `${prefix}-processed-${config.accountId}`,
      static: `${prefix}-static-${config.accountId}`,
      backups: `${prefix}-backups-${config.accountId}`
    },
    queues: {
      imageProcessing: `${prefix}-image-processing`,
      analytics: `${prefix}-analytics`,
      notifications: `${prefix}-notifications`,
      deadLetter: `${prefix}-dead-letter`
    },
    functions: {
      api: `${prefix}-api`,
      imageProcessor: `${prefix}-image-processor`,
      analyticsProcessor: `${prefix}-analytics-processor`,
      notificationSender: `${prefix}-notification-sender`,
      cognitoTriggers: `${prefix}-cognito-triggers`
    },
    apis: {
      main: `${prefix}-api`,
      admin: `${prefix}-admin-api`
    }
  }
}

/**
 * Generate environment variables for deployment
 */
export function generateEnvironmentVariables(
  config: DeploymentConfig,
  resourceNames: ResourceNames,
  additionalVars: EnvironmentVariables = {}
): EnvironmentVariables {
  return {
    // Basic configuration
    NODE_ENV: config.stage === 'prod' ? 'production' : 'development',
    STAGE: config.stage,
    AWS_REGION: config.region,
    AWS_ACCOUNT_ID: config.accountId,
    PROJECT_NAME: config.projectName,
    VERSION: config.version,
    DEPLOYMENT_ID: config.deploymentId,
    
    // DynamoDB tables
    USERS_TABLE: resourceNames.tables.users,
    RESTAURANTS_TABLE: resourceNames.tables.restaurants,
    DISHES_TABLE: resourceNames.tables.dishes,
    REVIEWS_TABLE: resourceNames.tables.reviews,
    ANALYTICS_TABLE: resourceNames.tables.analytics,
    IMAGES_TABLE: resourceNames.tables.images,
    SESSIONS_TABLE: resourceNames.tables.sessions,
    
    // S3 buckets
    UPLOADS_BUCKET: resourceNames.buckets.uploads,
    PROCESSED_BUCKET: resourceNames.buckets.processed,
    STATIC_BUCKET: resourceNames.buckets.static,
    BACKUPS_BUCKET: resourceNames.buckets.backups,
    
    // SQS queues
    IMAGE_PROCESSING_QUEUE: resourceNames.queues.imageProcessing,
    ANALYTICS_QUEUE: resourceNames.queues.analytics,
    NOTIFICATIONS_QUEUE: resourceNames.queues.notifications,
    DEAD_LETTER_QUEUE: resourceNames.queues.deadLetter,
    
    // Lambda functions
    API_FUNCTION: resourceNames.functions.api,
    IMAGE_PROCESSOR_FUNCTION: resourceNames.functions.imageProcessor,
    ANALYTICS_PROCESSOR_FUNCTION: resourceNames.functions.analyticsProcessor,
    
    // API Gateway
    API_GATEWAY_NAME: resourceNames.apis.main,
    
    // EventBridge
    EVENTBRIDGE_SOURCE: `${config.projectName}.${config.stage}`,
    
    // Additional variables
    ...additionalVars
  }
}

/**
 * Validate deployment configuration
 */
export function validateDeploymentConfig(config: DeploymentConfig): DeploymentValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate required fields
  if (!config.stage) {
    errors.push('Stage is required')
  }
  
  if (!config.region) {
    errors.push('Region is required')
  }
  
  if (!config.accountId) {
    errors.push('Account ID is required')
  }
  
  // Validate stage naming
  const validStages = ['dev', 'staging', 'prod']
  if (!validStages.includes(config.stage)) {
    warnings.push(`Stage '${config.stage}' is not a standard stage name. Consider using: ${validStages.join(', ')}`)
  }
  
  // Validate region format
  const regionPattern = /^[a-z]{2}-[a-z]+-\d+$/
  if (!regionPattern.test(config.region)) {
    errors.push('Invalid region format')
  }
  
  // Validate account ID format
  const accountIdPattern = /^\d{12}$/
  if (!accountIdPattern.test(config.accountId)) {
    errors.push('Invalid AWS account ID format')
  }
  
  // Validate version format
  const versionPattern = /^\d+\.\d+\.\d+/
  if (!versionPattern.test(config.version)) {
    warnings.push('Version does not follow semantic versioning format')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Store deployment configuration in Parameter Store
 */
export async function storeDeploymentConfig(
  config: DeploymentConfig,
  resourceNames: ResourceNames,
  envVars: EnvironmentVariables
): Promise<void> {
  const ssmClient = new SSMClient({ region: config.region })
  
  const parameterPrefix = `/${config.projectName}/${config.stage}`
  
  // Store deployment metadata
  await ssmClient.send(new PutParameterCommand({
    Name: `${parameterPrefix}/deployment/config`,
    Value: JSON.stringify(config),
    Type: 'String',
    Overwrite: true,
    Description: `Deployment configuration for ${config.projectName} ${config.stage}`
  }))
  
  // Store resource names
  await ssmClient.send(new PutParameterCommand({
    Name: `${parameterPrefix}/deployment/resources`,
    Value: JSON.stringify(resourceNames),
    Type: 'String',
    Overwrite: true,
    Description: `Resource names for ${config.projectName} ${config.stage}`
  }))
  
  // Store environment variables
  for (const [key, value] of Object.entries(envVars)) {
    await ssmClient.send(new PutParameterCommand({
      Name: `${parameterPrefix}/env/${key}`,
      Value: value,
      Type: 'String',
      Overwrite: true,
      Description: `Environment variable for ${config.projectName} ${config.stage}`
    }))
  }
}

/**
 * Retrieve deployment configuration from Parameter Store
 */
export async function retrieveDeploymentConfig(
  projectName: string,
  stage: string,
  region: string
): Promise<{ config: DeploymentConfig; resourceNames: ResourceNames; envVars: EnvironmentVariables }> {
  const ssmClient = new SSMClient({ region })
  
  const parameterPrefix = `/${projectName}/${stage}`
  
  // Retrieve deployment config
  const configResponse = await ssmClient.send(new GetParameterCommand({
    Name: `${parameterPrefix}/deployment/config`
  }))
  
  const config: DeploymentConfig = JSON.parse(configResponse.Parameter?.Value || '{}')
  
  // Retrieve resource names
  const resourcesResponse = await ssmClient.send(new GetParameterCommand({
    Name: `${parameterPrefix}/deployment/resources`
  }))
  
  const resourceNames: ResourceNames = JSON.parse(resourcesResponse.Parameter?.Value || '{}')
  
  // Note: Environment variables would typically be retrieved individually
  // This is a simplified version
  const envVars: EnvironmentVariables = {}
  
  return { config, resourceNames, envVars }
}

/**
 * Check if stack exists in CloudFormation
 */
export async function checkStackExists(stackName: string, region: string): Promise<boolean> {
  const cfClient = new CloudFormationClient({ region })
  
  try {
    await cfClient.send(new DescribeStacksCommand({
      StackName: stackName
    }))
    return true
  } catch (error: any) {
    if (error.name === 'ValidationError' && error.message.includes('does not exist')) {
      return false
    }
    throw error
  }
}

/**
 * Generate CloudFormation stack name
 */
export function generateStackName(config: DeploymentConfig, component?: string): string {
  const baseName = `${config.projectName}-${config.stage}`
  return component ? `${baseName}-${component}` : baseName
}

/**
 * Validate required AWS permissions
 */
export async function validateAWSPermissions(region: string): Promise<DeploymentValidation> {
  const errors: string[] = []
  const warnings: string[] = []
  
  // This would typically test various AWS operations
  // For now, we'll do basic validation
  
  try {
    // Test CloudFormation access
    const cfClient = new CloudFormationClient({ region })
    await cfClient.send(new DescribeStacksCommand({}))
  } catch (error: any) {
    if (error.name === 'AccessDenied') {
      errors.push('Insufficient CloudFormation permissions')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generate deployment summary
 */
export function generateDeploymentSummary(
  config: DeploymentConfig,
  resourceNames: ResourceNames,
  validation: DeploymentValidation
): string {
  const summary = [
    `Deployment Summary for ${config.projectName}`,
    `Stage: ${config.stage}`,
    `Region: ${config.region}`,
    `Version: ${config.version}`,
    `Deployment ID: ${config.deploymentId}`,
    `Timestamp: ${config.timestamp}`,
    '',
    'Resources:',
    `- Tables: ${Object.keys(resourceNames.tables).length}`,
    `- Buckets: ${Object.keys(resourceNames.buckets).length}`,
    `- Queues: ${Object.keys(resourceNames.queues).length}`,
    `- Functions: ${Object.keys(resourceNames.functions).length}`,
    '',
    'Validation:',
    `- Valid: ${validation.isValid}`,
    `- Errors: ${validation.errors.length}`,
    `- Warnings: ${validation.warnings.length}`
  ]
  
  if (validation.errors.length > 0) {
    summary.push('', 'Errors:')
    validation.errors.forEach(error => summary.push(`- ${error}`))
  }
  
  if (validation.warnings.length > 0) {
    summary.push('', 'Warnings:')
    validation.warnings.forEach(warning => summary.push(`- ${warning}`))
  }
  
  return summary.join('\n')
}

/**
 * Default export with all utility functions
 */
export default {
  generateDeploymentConfig,
  generateDeploymentId,
  generateResourceNames,
  generateEnvironmentVariables,
  validateDeploymentConfig,
  storeDeploymentConfig,
  retrieveDeploymentConfig,
  checkStackExists,
  generateStackName,
  validateAWSPermissions,
  generateDeploymentSummary
}
