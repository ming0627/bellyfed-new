/**
 * Storage configuration for Bellyfed ECS infrastructure
 * Defines EFS file systems, S3 buckets, and storage policies
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface BellyfedStorageProps {
  vpc: ec2.IVpc;
  environment: string;
  enableEncryption?: boolean;
  enableBackups?: boolean;
  enableVersioning?: boolean;
}

export class BellyfedStorage extends Construct {
  public readonly fileSystem: efs.FileSystem;
  public readonly logsAccessPoint: efs.AccessPoint;
  public readonly uploadsAccessPoint: efs.AccessPoint;
  public readonly staticAssetsBucket: s3.Bucket;
  public readonly uploadsBucket: s3.Bucket;
  public readonly backupsBucket: s3.Bucket;
  public readonly kmsKey?: kms.Key;

  constructor(scope: Construct, id: string, props: BellyfedStorageProps) {
    super(scope, id);

    // KMS Key for encryption
    if (props.enableEncryption !== false) {
      this.kmsKey = new kms.Key(this, 'StorageKmsKey', {
        description: `Bellyfed storage encryption key for ${props.environment}`,
        enableKeyRotation: true,
        alias: `bellyfed-storage-${props.environment}`,
      });
    }

    // EFS File System
    this.createEfsFileSystem(props);

    // S3 Buckets
    this.createS3Buckets(props);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'storage');
  }

  private createEfsFileSystem(props: BellyfedStorageProps) {
    // EFS File System
    this.fileSystem = new efs.FileSystem(this, 'FileSystem', {
      vpc: props.vpc,
      fileSystemName: `bellyfed-efs-${props.environment}`,
      encrypted: props.enableEncryption !== false,
      kmsKey: this.kmsKey,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      enableBackups: props.enableBackups !== false,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Security Group for EFS
    const efsSecurityGroup = new ec2.SecurityGroup(this, 'EfsSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for EFS file system',
      allowAllOutbound: false,
    });

    efsSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(2049),
      'Allow NFS access from VPC'
    );

    // Mount targets in private subnets
    props.vpc.privateSubnets.forEach((subnet, index) => {
      new efs.MountTarget(this, `MountTarget${index}`, {
        fileSystem: this.fileSystem,
        subnet,
        securityGroup: efsSecurityGroup,
      });
    });

    // Access Points
    this.logsAccessPoint = new efs.AccessPoint(this, 'LogsAccessPoint', {
      fileSystem: this.fileSystem,
      path: '/logs',
      creationInfo: {
        ownerUid: 1001,
        ownerGid: 1001,
        permissions: '755',
      },
      posixUser: {
        uid: 1001,
        gid: 1001,
      },
    });

    this.uploadsAccessPoint = new efs.AccessPoint(this, 'UploadsAccessPoint', {
      fileSystem: this.fileSystem,
      path: '/uploads',
      creationInfo: {
        ownerUid: 1001,
        ownerGid: 1001,
        permissions: '755',
      },
      posixUser: {
        uid: 1001,
        gid: 1001,
      },
    });
  }

  private createS3Buckets(props: BellyfedStorageProps) {
    // Static Assets Bucket
    this.staticAssetsBucket = new s3.Bucket(this, 'StaticAssetsBucket', {
      bucketName: `bellyfed-static-assets-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: props.enableVersioning !== false,
      encryption: props.enableEncryption !== false 
        ? s3.BucketEncryption.KMS 
        : s3.BucketEncryption.S3_MANAGED,
      encryptionKey: this.kmsKey,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Uploads Bucket
    this.uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `bellyfed-uploads-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: props.enableVersioning !== false,
      encryption: props.enableEncryption !== false 
        ? s3.BucketEncryption.KMS 
        : s3.BucketEncryption.S3_MANAGED,
      encryptionKey: this.kmsKey,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], // Should be restricted to your domain in production
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteUploads',
          enabled: true,
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(7),
        },
      ],
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Backups Bucket
    this.backupsBucket = new s3.Bucket(this, 'BackupsBucket', {
      bucketName: `bellyfed-backups-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'TransitionToGlacier',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
        {
          id: 'DeleteOldBackups',
          enabled: true,
          expiration: cdk.Duration.days(365),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Bucket notifications (for processing uploads)
    // Note: In a real implementation, you might add Lambda functions or SQS queues
    // to process uploaded files
  }

  public createStoragePolicy(taskRole: iam.Role) {
    // EFS permissions
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
        'elasticfilesystem:ClientRootAccess',
      ],
      resources: [this.fileSystem.fileSystemArn],
    }));

    // S3 permissions for uploads bucket
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      resources: [
        this.uploadsBucket.bucketArn,
        `${this.uploadsBucket.bucketArn}/*`,
      ],
    }));

    // S3 permissions for static assets bucket
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:ListBucket',
      ],
      resources: [
        this.staticAssetsBucket.bucketArn,
        `${this.staticAssetsBucket.bucketArn}/*`,
      ],
    }));

    // KMS permissions
    if (this.kmsKey) {
      taskRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Decrypt',
          'kms:Encrypt',
          'kms:ReEncrypt*',
          'kms:GenerateDataKey*',
          'kms:DescribeKey',
        ],
        resources: [this.kmsKey.keyArn],
      }));
    }
  }

  public getStorageOutputs() {
    return {
      fileSystemId: this.fileSystem.fileSystemId,
      logsAccessPointId: this.logsAccessPoint.accessPointId,
      uploadsAccessPointId: this.uploadsAccessPoint.accessPointId,
      staticAssetsBucketName: this.staticAssetsBucket.bucketName,
      uploadsBucketName: this.uploadsBucket.bucketName,
      backupsBucketName: this.backupsBucket.bucketName,
    };
  }
}
