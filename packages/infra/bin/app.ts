#!/usr/bin/env node

/**
 * AWS CDK App for Bellyfed Infrastructure
 * Entry point for deploying ECS infrastructure
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECSStack } from '../stacks/ecs-stack.js';

const app = new cdk.App();

// Get environment configuration
const environment = app.node.tryGetContext('environment') || 'development';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Environment-specific configuration
const envConfig = {
  development: {
    enableAutoScaling: false,
    enableLogging: true,
    domainName: undefined,
    certificateArn: undefined,
  },
  staging: {
    enableAutoScaling: true,
    enableLogging: true,
    domainName: 'staging.bellyfed.com',
    certificateArn: undefined, // Set this for staging
  },
  production: {
    enableAutoScaling: true,
    enableLogging: true,
    domainName: 'bellyfed.com',
    certificateArn: undefined, // Set this for production
  },
};

const config = envConfig[environment as keyof typeof envConfig] || envConfig.development;

// Create ECS Stack
new ECSStack(app, `BellyfedECS-${environment}`, {
  env: {
    account,
    region,
  },
  environment,
  ...config,
  description: `Bellyfed ECS Infrastructure for ${environment} environment`,
  tags: {
    Environment: environment,
    Application: 'bellyfed',
    Stack: 'ECS',
    ManagedBy: 'CDK',
  },
});

// Add stack-level tags
cdk.Tags.of(app).add('Application', 'bellyfed');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');
