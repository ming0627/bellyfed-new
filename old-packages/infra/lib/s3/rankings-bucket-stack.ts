import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { BaseStackProps } from '../types.js';

export interface RankingsBucketStackProps extends BaseStackProps {
    // Additional properties if needed
}

/**
 * Stack for S3 bucket used to store ranking photos in the Bellyfed application.
 *
 * This stack creates and manages the following:
 * 1. S3 bucket for storing ranking photos
 *    - CORS configuration for frontend uploads
 *    - Bucket policy for security
 *    - Lifecycle rules for cost optimization
 *
 * The bucket name and ARN are stored in SSM Parameter Store for access by other resources.
 */
export class RankingsBucketStack extends cdk.Stack {
    public readonly bucket: s3.Bucket;
    public readonly bucketName: string;
    public readonly bucketArn: string;

    constructor(scope: Construct, id: string, props: RankingsBucketStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'RankingsBucket');

        // Create S3 bucket for ranking photos
        this.bucket = new s3.Bucket(this, 'RankingsBucket', {
            bucketName: `bellyfed-rankings-${environment}-${this.account}`.toLowerCase(),
            cors: [
                {
                    allowedHeaders: ['*'],
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.DELETE,
                    ],
                    allowedOrigins: [
                        `https://app-${environment}.bellyfed.com`,
                        'https://bellyfed.com',
                        'https://www.bellyfed.com',
                        ...(environment !== 'prod' ? ['http://localhost:3000'] : []),
                    ],
                    exposedHeaders: ['ETag'],
                    maxAge: 3000,
                },
            ],
            lifecycleRules: [
                {
                    // Transition objects to Infrequent Access after 30 days
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(30),
                        },
                    ],
                    // We don't want to expire objects automatically
                },
            ],
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
            publicReadAccess: true, // Allow public read access for photos
            removalPolicy:
                environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod', // Only auto-delete objects in non-prod environments
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
        });

        // Store bucket properties
        this.bucketName = this.bucket.bucketName;
        this.bucketArn = this.bucket.bucketArn;

        // Store bucket name and ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'BucketNameParam', {
            parameterName: `/bellyfed/${environment}/s3/rankings-bucket-name`,
            stringValue: this.bucketName,
            description: `S3 bucket name for ranking photos in ${environment} environment`,
        });

        new ssm.StringParameter(this, 'BucketArnParam', {
            parameterName: `/bellyfed/${environment}/s3/rankings-bucket-arn`,
            stringValue: this.bucketArn,
            description: `S3 bucket ARN for ranking photos in ${environment} environment`,
        });

        // Create IAM policy for accessing the bucket
        const _bucketPolicy = new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['s3:GetObject'],
                    resources: [`${this.bucketArn}/*`],
                    principals: [new iam.AnyPrincipal()],
                }),
            ],
        });

        // Apply the bucket policy
        new s3.BucketPolicy(this, 'BucketPolicy', {
            bucket: this.bucket,
        }).document.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject'],
                resources: [`${this.bucketArn}/*`],
                principals: [new iam.AnyPrincipal()],
            })
        );

        // Create IAM role for ECS tasks to access the bucket
        const ecsTaskRole = new iam.Role(this, 'EcsTaskRoleForRankings', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: `Role for ECS tasks to access rankings bucket in ${environment} environment`,
        });

        // Add permissions for ECS tasks to read and write to the bucket
        ecsTaskRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
                resources: [this.bucketArn, `${this.bucketArn}/*`],
            })
        );

        // Store the ECS task role ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'EcsTaskRoleArnParam', {
            parameterName: `/bellyfed/${environment}/s3/rankings-bucket-task-role-arn`,
            stringValue: ecsTaskRole.roleArn,
            description: `ARN for ECS task role to access rankings bucket in ${environment} environment`,
        });

        // Output bucket name and ARN
        new cdk.CfnOutput(this, 'RankingsBucketName', {
            value: this.bucketName,
            description: `S3 bucket name for ranking photos in ${environment} environment`,
        });

        new cdk.CfnOutput(this, 'RankingsBucketArn', {
            value: this.bucketArn,
            description: `S3 bucket ARN for ranking photos in ${environment} environment`,
        });
    }
}
