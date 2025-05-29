#!/usr/bin/env node

/**
 * This script updates AWS SDK dependencies in all Lambda function package.json files
 * to use compatible versions that work with the CDK application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the AWS SDK versions to use
const awsSdkVersions = {
    '@aws-sdk/client-cloudwatch': '^3.410.0',
    '@aws-sdk/client-dynamodb': '^3.410.0',
    '@aws-sdk/client-eventbridge': '^3.410.0',
    '@aws-sdk/client-lambda': '^3.410.0',
    '@aws-sdk/client-secrets-manager': '^3.410.0',
    '@aws-sdk/client-sns': '^3.410.0',
    '@aws-sdk/client-sqs': '^3.410.0',
    '@aws-sdk/client-ssm': '^3.410.0',
    '@aws-sdk/lib-dynamodb': '^3.410.0',
    '@aws-sdk/client-rds': '^3.410.0',
    '@aws-sdk/client-s3': '^3.410.0',
    '@aws-sdk/client-cognito-identity-provider': '^3.410.0',
    '@aws-sdk/client-cognito-identity': '^3.410.0',
    '@aws-sdk/client-sts': '^3.410.0',
    '@aws-sdk/client-cloudformation': '^3.410.0',
    '@aws-sdk/client-ec2': '^3.410.0',
    '@aws-sdk/client-ecs': '^3.410.0',
    '@aws-sdk/client-ecr': '^3.410.0',
    '@aws-sdk/client-apigateway': '^3.410.0',
    '@aws-sdk/client-cloudfront': '^3.410.0',
    '@aws-sdk/client-route53': '^3.410.0',
    '@aws-sdk/client-acm': '^3.410.0',
    '@aws-sdk/client-iam': '^3.410.0',
    '@aws-sdk/client-kms': '^3.410.0',
    '@aws-sdk/client-wafv2': '^3.410.0',
    '@aws-sdk/client-cloudwatch-logs': '^3.410.0',
    '@aws-sdk/core': '^3.410.0',
    '@aws-sdk/types': '^3.410.0',
    '@aws-sdk/util-dynamodb': '^3.410.0',
};

// Find all package.json files in the functions directory
const functionsDir = path.join(__dirname, '..', 'functions');
const packageJsonFiles = [];

function findPackageJsonFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findPackageJsonFiles(filePath);
        } else if (file === 'package.json') {
            packageJsonFiles.push(filePath);
        }
    }
}

findPackageJsonFiles(functionsDir);

console.log(`Found ${packageJsonFiles.length} package.json files in the functions directory.`);

// Update AWS SDK dependencies in each package.json file
let updatedCount = 0;

for (const packageJsonFile of packageJsonFiles) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
        let updated = false;

        // Update dependencies
        if (packageJson.dependencies) {
            for (const [dependency, version] of Object.entries(awsSdkVersions)) {
                if (packageJson.dependencies[dependency]) {
                    packageJson.dependencies[dependency] = version;
                    updated = true;
                }
            }
        }

        // Update devDependencies
        if (packageJson.devDependencies) {
            for (const [dependency, version] of Object.entries(awsSdkVersions)) {
                if (packageJson.devDependencies[dependency]) {
                    packageJson.devDependencies[dependency] = version;
                    updated = true;
                }
            }
        }

        if (updated) {
            fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
            updatedCount++;
            console.log(`Updated AWS SDK dependencies in ${packageJsonFile}`);
        }
    } catch (error) {
        console.error(`Error updating ${packageJsonFile}:`, error);
    }
}

console.log(`Updated AWS SDK dependencies in ${updatedCount} package.json files.`);

// Make the script executable
try {
    execSync(`chmod +x ${__filename}`);
    console.log(`Made ${__filename} executable.`);
} catch (error) {
    console.error(`Error making ${__filename} executable:`, error);
}

console.log('Done!');
