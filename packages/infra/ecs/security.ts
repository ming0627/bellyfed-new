/**
 * Security configurations for Bellyfed ECS infrastructure
 * Includes IAM roles, security groups, and security policies
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface BellyfedSecurityProps {
  vpc: ec2.IVpc;
  environment: string;
  enableEncryption?: boolean;
  enableSecretsManager?: boolean;
}

export class BellyfedSecurity extends Construct {
  public readonly ecsSecurityGroup: ec2.SecurityGroup;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly taskExecutionRole: iam.Role;
  public readonly frontendTaskRole: iam.Role;
  public readonly backendTaskRole: iam.Role;
  public readonly docsTaskRole: iam.Role;
  public readonly kmsKey?: kms.Key;

  constructor(scope: Construct, id: string, props: BellyfedSecurityProps) {
    super(scope, id);

    // KMS Key for encryption
    if (props.enableEncryption) {
      this.kmsKey = new kms.Key(this, 'BellyfedKmsKey', {
        description: `Bellyfed encryption key for ${props.environment}`,
        enableKeyRotation: true,
        alias: `bellyfed-${props.environment}`,
      });
    }

    // Security Groups
    this.createSecurityGroups(props);

    // IAM Roles
    this.createIamRoles(props);

    // Secrets Manager (if enabled)
    if (props.enableSecretsManager) {
      this.createSecrets(props);
    }

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'security');
  }

  private createSecurityGroups(props: BellyfedSecurityProps) {
    // ALB Security Group
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from internet'
    );

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from internet'
    );

    // ECS Security Group
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for ECS services',
      allowAllOutbound: true,
    });

    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow traffic from ALB'
    );

    // Allow ECS services to communicate with each other
    this.ecsSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.allTraffic(),
      'Allow inter-service communication'
    );

    // Database Security Group
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for database access',
      allowAllOutbound: false,
    });

    this.databaseSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from ECS'
    );

    this.databaseSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow Redis access from ECS'
    );
  }

  private createIamRoles(props: BellyfedSecurityProps) {
    // Task Execution Role (used by ECS to pull images and write logs)
    this.taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ECS Task Execution Role for Bellyfed',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Add permissions for SSM parameters and Secrets Manager
    this.taskExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssm:GetParameters',
        'ssm:GetParameter',
        'ssm:GetParametersByPath',
        'secretsmanager:GetSecretValue',
        'kms:Decrypt',
      ],
      resources: ['*'],
    }));

    // Frontend Task Role
    this.frontendTaskRole = new iam.Role(this, 'FrontendTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for frontend service',
    });

    this.frontendTaskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    // Backend Task Role
    this.backendTaskRole = new iam.Role(this, 'BackendTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for backend service',
    });

    this.backendTaskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        'ses:SendEmail',
        'ses:SendRawEmail',
        'cognito-idp:*',
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
      ],
      resources: ['*'],
    }));

    // Docs Task Role
    this.docsTaskRole = new iam.Role(this, 'DocsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for documentation service',
    });

    this.docsTaskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    // Add KMS permissions if encryption is enabled
    if (this.kmsKey) {
      const kmsPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Decrypt',
          'kms:DescribeKey',
        ],
        resources: [this.kmsKey.keyArn],
      });

      this.taskExecutionRole.addToPolicy(kmsPolicy);
      this.frontendTaskRole.addToPolicy(kmsPolicy);
      this.backendTaskRole.addToPolicy(kmsPolicy);
      this.docsTaskRole.addToPolicy(kmsPolicy);
    }
  }

  private createSecrets(props: BellyfedSecurityProps) {
    // Database URL secret
    new secretsmanager.Secret(this, 'DatabaseUrlSecret', {
      secretName: `bellyfed/${props.environment}/database-url`,
      description: 'Database connection URL for Bellyfed',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
      encryptionKey: this.kmsKey,
    });

    // JWT Secret
    new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: `bellyfed/${props.environment}/jwt-secret`,
      description: 'JWT signing secret for Bellyfed',
      generateSecretString: {
        passwordLength: 64,
        excludeCharacters: '"@/\\',
      },
      encryptionKey: this.kmsKey,
    });

    // Redis URL secret
    new secretsmanager.Secret(this, 'RedisUrlSecret', {
      secretName: `bellyfed/${props.environment}/redis-url`,
      description: 'Redis connection URL for Bellyfed',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ host: 'redis.bellyfed.com' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
      encryptionKey: this.kmsKey,
    });

    // API Keys secret
    new secretsmanager.Secret(this, 'ApiKeysSecret', {
      secretName: `bellyfed/${props.environment}/api-keys`,
      description: 'Third-party API keys for Bellyfed',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          openai: '',
          google_maps: '',
          stripe: '',
        }),
        generateStringKey: 'random',
        excludeCharacters: '"@/\\',
      },
      encryptionKey: this.kmsKey,
    });
  }

  public addS3BucketAccess(bucketArn: string) {
    const s3Policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      resources: [bucketArn, `${bucketArn}/*`],
    });

    this.backendTaskRole.addToPolicy(s3Policy);
  }

  public addRdsAccess(rdsArn: string) {
    const rdsPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'rds-db:connect',
      ],
      resources: [rdsArn],
    });

    this.backendTaskRole.addToPolicy(rdsPolicy);
  }
}
