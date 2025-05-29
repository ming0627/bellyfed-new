// Core types for the application
export type BranchName = string;
export type Environment = string;

// Stack properties interfaces
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { LambdaStack } from './lambda-stack';
import { CentralizedLogging } from './constructs/logging/centralized-logging';

// Base stack properties that all stacks should extend
export interface BaseStackProps extends cdk.StackProps {
    environment: string;
}

// Network stack properties
export interface NetworkStackProps extends BaseStackProps {
    config: any;
    envConfig: any;
}

// Aurora stack properties
export interface AuroraStackProps extends BaseStackProps {
    vpc: ec2.Vpc;
}

// CICD stack properties
export interface CicdStackProps extends BaseStackProps {
    branchName: string;
    cicdRegion: string;
    appRegion: string;
}

// Lambda stack properties
export interface LambdaStackProps extends BaseStackProps {
    vpc: ec2.Vpc;
    dbSecretArn?: string;
    centralizedLogging?: CentralizedLogging;
}

// SSM stack properties
export interface SSMStackProps extends BaseStackProps {
    description?: string;
}

// Shared resources stack properties
export interface SharedResourcesStackProps extends BaseStackProps {
    vpc: ec2.Vpc;
}

// API Gateway stack properties
export interface ApiGatewayStackProps extends BaseStackProps {
    vpc: ec2.Vpc;
    centralizedLogging?: CentralizedLogging;
}

// Cognito stack properties
export interface CognitoStackProps extends BaseStackProps {
    cicdRegion: string;
    authEnvVars?: {
        COGNITO_CLIENT_ID: string;
        COGNITO_USER_POOL_ID: string;
        COGNITO_IDENTITY_POOL_ID: string;
    };
}

// EventBridge stack properties
export interface EventBridgeStackProps extends BaseStackProps {
    lambdaStack: LambdaStack;
}

// Infrastructure monitoring stack properties
export interface InfrastructureMonitoringStackProps extends BaseStackProps {
    eventBusNames?: string[];
    queueNames?: string[];
    apiGatewayRef?: apigateway.RestApi;
    slackWebhookUrl?: string;
}

// CloudFront stack properties
export interface CloudFrontStackProps extends BaseStackProps {
    domainName?: string;
    siteDomainName?: string;
    apiId?: string;
    region?: string;
    userpool?: cognito.UserPool;
    cognitoClient?: cognito.UserPoolClient;
    apiGateway?: apigateway.RestApi;
}

// Frontend CICD stack properties
export interface FrontendCicdStackProps extends BaseStackProps {
    ecsCluster: ecs.Cluster;
    ecsService: ecs.FargateService;
    frontendRepo: string;
    frontendOwner: string;
    frontendBranch: string;
}
