/**
 * Core infrastructure types for the Bellyfed application
 */

// Core types for the application
export type BranchName = string;
export type Environment = string;

// Stack properties interfaces
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

// Forward declarations for circular dependencies
export class LambdaStack extends cdk.Stack {}
export class CentralizedLogging {}

/**
 * Base stack properties that all stacks should extend
 */
export interface BaseStackProps extends cdk.StackProps {
  /**
   * Deployment environment (e.g., 'dev', 'staging', 'prod')
   */
  environment: string;
}

/**
 * Network stack properties
 */
export interface NetworkStackProps extends BaseStackProps {
  /**
   * Global configuration
   */
  config: any;
  
  /**
   * Environment-specific configuration
   */
  envConfig: any;
}

/**
 * Aurora stack properties
 */
export interface AuroraStackProps extends BaseStackProps {
  /**
   * VPC where Aurora will be deployed
   */
  vpc: ec2.Vpc;
}

/**
 * CICD stack properties
 */
export interface CicdStackProps extends BaseStackProps {
  /**
   * Git branch name
   */
  branchName: string;
  
  /**
   * Region where CICD resources are deployed
   */
  cicdRegion: string;
  
  /**
   * Region where application resources are deployed
   */
  appRegion: string;
}

/**
 * Lambda stack properties
 */
export interface LambdaStackProps extends BaseStackProps {
  /**
   * VPC where Lambda functions will be deployed
   */
  vpc: ec2.Vpc;
  
  /**
   * ARN of the database secret
   */
  dbSecretArn?: string;
  
  /**
   * Centralized logging construct
   */
  centralizedLogging?: CentralizedLogging;
}

/**
 * SSM stack properties
 */
export interface SSMStackProps extends BaseStackProps {
  /**
   * Description of the SSM parameters
   */
  description?: string;
}

/**
 * Shared resources stack properties
 */
export interface SharedResourcesStackProps extends BaseStackProps {
  /**
   * VPC where shared resources will be deployed
   */
  vpc: ec2.Vpc;
}

/**
 * API Gateway stack properties
 */
export interface ApiGatewayStackProps extends BaseStackProps {
  /**
   * VPC where API Gateway will be deployed
   */
  vpc: ec2.Vpc;
  
  /**
   * Centralized logging construct
   */
  centralizedLogging?: CentralizedLogging;
}

/**
 * Cognito stack properties
 */
export interface CognitoStackProps extends BaseStackProps {
  /**
   * Region where CICD resources are deployed
   */
  cicdRegion: string;
  
  /**
   * Authentication environment variables
   */
  authEnvVars?: {
    COGNITO_CLIENT_ID: string;
    COGNITO_USER_POOL_ID: string;
    COGNITO_IDENTITY_POOL_ID: string;
  };
}

/**
 * EventBridge stack properties
 */
export interface EventBridgeStackProps extends BaseStackProps {
  /**
   * Lambda stack reference
   */
  lambdaStack: LambdaStack;
}

/**
 * Infrastructure monitoring stack properties
 */
export interface InfrastructureMonitoringStackProps extends BaseStackProps {
  /**
   * Event bus names to monitor
   */
  eventBusNames?: string[];
  
  /**
   * Queue names to monitor
   */
  queueNames?: string[];
  
  /**
   * API Gateway reference
   */
  apiGatewayRef?: apigateway.RestApi;
  
  /**
   * Slack webhook URL for notifications
   */
  slackWebhookUrl?: string;
}

/**
 * CloudFront stack properties
 */
export interface CloudFrontStackProps extends BaseStackProps {
  /**
   * Domain name
   */
  domainName?: string;
  
  /**
   * Site domain name
   */
  siteDomainName?: string;
  
  /**
   * API ID
   */
  apiId?: string;
  
  /**
   * Region
   */
  region?: string;
  
  /**
   * Cognito user pool
   */
  userpool?: cognito.UserPool;
  
  /**
   * Cognito client
   */
  cognitoClient?: cognito.UserPoolClient;
  
  /**
   * API Gateway
   */
  apiGateway?: apigateway.RestApi;
}

/**
 * Frontend CICD stack properties
 */
export interface FrontendCicdStackProps extends BaseStackProps {
  /**
   * ECS cluster
   */
  ecsCluster: ecs.Cluster;
  
  /**
   * ECS service
   */
  ecsService: ecs.FargateService;
  
  /**
   * Frontend repository name
   */
  frontendRepo: string;
  
  /**
   * Frontend repository owner
   */
  frontendOwner: string;
  
  /**
   * Frontend branch name
   */
  frontendBranch: string;
}
