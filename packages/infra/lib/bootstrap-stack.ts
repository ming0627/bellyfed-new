import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';

export interface BootstrapStackProps extends cdk.StackProps {
    environment: string;
    branchName?: string; // Added to support branch-specific configuration
}

/**
 * Stack that creates foundational resources for the application.
 * This stack should be deployed first, before any other stacks.
 */
export class BootstrapStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: BootstrapStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'Bootstrap');

        // Create ECR repositories
        this.createEcrRepositories(environment);

        // Create deployment coordinator resources
        this.createDeploymentCoordinatorResources(environment);

        // Create IAM roles for deployment
        this.createDeploymentRoles(environment);

        // Create deploy-infra-stack parameter
        this.createDeployInfraStackParameter(environment);
    }

    /**
     * Creates ECR repositories for the application
     * @param environment The environment name
     */
    private createEcrRepositories(environment: string): void {
        // Create main application repository
        const mainRepository = new ecr.Repository(this, 'MainRepository', {
            repositoryName: CONFIG.ecr.repositoryNamePattern.replace('{environment}', environment),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            lifecycleRules: [
                {
                    maxImageCount: 10,
                    description: 'Keep only the 10 most recent images',
                },
            ],
            imageScanOnPush: true,
            imageTagMutability: ecr.TagMutability.MUTABLE, // Changed to MUTABLE to allow updating the 'latest' tag
        });

        // Store repository URI in SSM
        new ssm.StringParameter(this, 'MainRepositoryUri', {
            parameterName: `/bellyfed/${environment}/ecr/main-repository-uri`,
            stringValue: mainRepository.repositoryUri,
            description: 'URI of the main ECR repository',
        });

        // Output
        new cdk.CfnOutput(this, 'MainRepositoryUriOutput', {
            value: mainRepository.repositoryUri,
            description: 'URI of the main ECR repository',
        });
    }

    /**
     * Creates resources for the deployment coordinator
     * @param environment The environment name
     */
    private createDeploymentCoordinatorResources(environment: string): void {
        // Create DynamoDB table for deployment coordination
        const deploymentTable = new dynamodb.Table(this, 'DeploymentCoordinatorTable', {
            tableName: `bellyfed-${environment}-deployment-coordinator`,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'timestamp',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand capacity for cost optimization
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Safe to destroy as this is just a coordination table
            pointInTimeRecovery: true, // Enable point-in-time recovery for data safety
            timeToLiveAttribute: 'ttl', // Enable TTL for automatic cleanup
        });

        // Create S3 bucket for deployment artifacts
        const deploymentBucket = new s3.Bucket(this, 'DeploymentArtifactsBucket', {
            bucketName: `bellyfed-${environment}-deployment-artifacts-${this.account}`,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            autoDeleteObjects: false,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        // Store resource ARNs in SSM
        new ssm.StringParameter(this, 'DeploymentTableArn', {
            parameterName: `/bellyfed/${environment}/deployment-coordinator/table-arn`,
            stringValue: deploymentTable.tableArn,
            description: 'ARN of the deployment coordinator DynamoDB table',
        });

        new ssm.StringParameter(this, 'DeploymentBucketArn', {
            parameterName: `/bellyfed/${environment}/deployment-coordinator/bucket-arn`,
            stringValue: deploymentBucket.bucketArn,
            description: 'ARN of the deployment artifacts S3 bucket',
        });

        // Outputs
        new cdk.CfnOutput(this, 'DeploymentTableArnOutput', {
            value: deploymentTable.tableArn,
            description: 'ARN of the deployment coordinator DynamoDB table',
        });

        new cdk.CfnOutput(this, 'DeploymentBucketArnOutput', {
            value: deploymentBucket.bucketArn,
            description: 'ARN of the deployment artifacts S3 bucket',
        });
    }

    /**
     * Creates the deploy-infra-stack parameter
     * @param environment The environment name
     */
    private createDeployInfraStackParameter(environment: string): void {
        // For the deploy-infra-stack parameter, we'll use a simpler approach
        const deployInfraStackParamName = `/bellyfed/${environment}/deployment/deploy-infra-stack`;

        // Create the parameter
        new ssm.StringParameter(this, `DeployInfraStackParam-${environment}`, {
            parameterName: deployInfraStackParamName,
            stringValue: 'true',
            description: 'Whether to deploy the infrastructure stack',
        });
    }

    /**
     * Creates IAM roles for deployment
     * @param environment The environment name
     */
    private createDeploymentRoles(environment: string): void {
        // Create a role for the deployment coordinator
        const deploymentCoordinatorRole = new iam.Role(this, 'DeploymentCoordinatorRole', {
            roleName: `bellyfed-${environment}-deployment-coordinator-role`,
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for the deployment coordinator Lambda function',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AWSLambdaBasicExecutionRole'
                ),
            ],
        });

        // Grant permissions to the deployment coordinator role
        deploymentCoordinatorRole.addToPolicy(
            new iam.PolicyStatement({
                actions: [
                    'dynamodb:PutItem',
                    'dynamodb:GetItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query',
                    'dynamodb:Scan',
                ],
                resources: [
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-${environment}-deployment-coordinator`,
                    `arn:aws:dynamodb:${this.region}:${this.account}:table/bellyfed-${environment}-deployment-coordinator/index/*`,
                ],
            })
        );

        // Store role ARN in SSM
        new ssm.StringParameter(this, 'DeploymentCoordinatorRoleArn', {
            parameterName: `/bellyfed/${environment}/deployment-coordinator/role-arn`,
            stringValue: deploymentCoordinatorRole.roleArn,
            description: 'ARN of the deployment coordinator IAM role',
        });

        // Output
        new cdk.CfnOutput(this, 'DeploymentCoordinatorRoleArnOutput', {
            value: deploymentCoordinatorRole.roleArn,
            description: 'ARN of the deployment coordinator IAM role',
        });
    }

    /**
     * Adds CDK deployment policies to a CodeBuild project
     * @param project The CodeBuild project to add policies to
     */
    public static addCdkDeploymentPolicies(project: codebuild.PipelineProject): void {
        // Add CloudFormation, S3, IAM, Lambda, API Gateway, Events, SQS, SSM, and STS permissions
        project.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'cloudformation:*',
                    's3:*',
                    'iam:*',
                    'lambda:*',
                    'apigateway:*',
                    'events:*',
                    'sqs:*',
                    'ssm:GetParameter',
                    'ssm:GetParameters',
                    'ssm:GetParametersByPath',
                    'ssm:PutParameter',
                    'sts:AssumeRole',
                    'dynamodb:*', // Add DynamoDB permissions for deployment coordinator
                ],
                resources: ['*'],
            })
        );

        // Add specific permissions for ECS and ECR
        project.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecs:*',
                    'ecr:*',
                    'ec2:*',
                    'elasticloadbalancing:*',
                    'logs:*',
                    'events:*', // Add EventBridge permissions for deployment coordinator
                    'codebuild:StartBuild', // Add permission to start CodeBuild projects
                    'codebuild:BatchGetBuilds', // Add permission to get build status
                ],
                resources: ['*'],
            })
        );

        // Add ECR permissions for managing repositories and images
        project.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecr:CreateRepository',
                    'ecr:DescribeRepositories',
                    'ecr:GetRepositoryPolicy',
                    'ecr:SetRepositoryPolicy',
                    'ecr:DeleteRepository',
                    'ecr:InitiateLayerUpload',
                    'ecr:UploadLayerPart',
                    'ecr:CompleteLayerUpload',
                    'ecr:PutImage',
                    'ecr:BatchCheckLayerAvailability',
                    'ecr:GetDownloadUrlForLayer',
                    'ecr:BatchGetImage',
                    'ecr:GetAuthorizationToken',
                ],
                resources: ['*'],
            })
        );

        // Add ECS permissions for managing services and tasks
        project.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'ecs:DescribeServices',
                    'ecs:UpdateService',
                    'ecs:DescribeTaskDefinition',
                    'ecs:RegisterTaskDefinition',
                    'ecs:ListTasks',
                    'ecs:DescribeTasks',
                ],
                resources: ['*'],
            })
        );
    }
}
