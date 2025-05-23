/**
 * Database configuration for Bellyfed ECS infrastructure
 * Defines RDS Aurora Serverless v2, Redis ElastiCache, and database security
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface BellyfedDatabaseProps {
  vpc: ec2.IVpc;
  environment: string;
  enableEncryption?: boolean;
  enableBackups?: boolean;
  enableMultiAz?: boolean;
  databaseName?: string;
  masterUsername?: string;
}

export class BellyfedDatabase extends Construct {
  public readonly cluster: rds.DatabaseCluster;
  public readonly redisCluster: elasticache.CfnCacheCluster;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly redisSecret: secretsmanager.Secret;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly redisSecurityGroup: ec2.SecurityGroup;
  public readonly kmsKey?: kms.Key;

  constructor(scope: Construct, id: string, props: BellyfedDatabaseProps) {
    super(scope, id);

    // KMS Key for database encryption
    if (props.enableEncryption !== false) {
      this.kmsKey = new kms.Key(this, 'DatabaseKmsKey', {
        description: `Bellyfed database encryption key for ${props.environment}`,
        enableKeyRotation: true,
        alias: `bellyfed-database-${props.environment}`,
      });
    }

    // Security Groups
    this.createSecurityGroups(props);

    // Database Secret
    this.createDatabaseSecret(props);

    // Aurora Serverless v2 Cluster
    this.createAuroraCluster(props);

    // Redis ElastiCache
    this.createRedisCluster(props);

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'database');
  }

  private createSecurityGroups(props: BellyfedDatabaseProps) {
    // Database Security Group
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Aurora PostgreSQL database',
      allowAllOutbound: false,
    });

    this.databaseSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from VPC'
    );

    // Redis Security Group
    this.redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Redis ElastiCache',
      allowAllOutbound: false,
    });

    this.redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis access from VPC'
    );
  }

  private createDatabaseSecret(props: BellyfedDatabaseProps) {
    // Database credentials secret
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `bellyfed/${props.environment}/database-credentials`,
      description: 'Database credentials for Bellyfed Aurora cluster',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.masterUsername || 'postgres',
          dbname: props.databaseName || 'bellyfed',
          engine: 'postgres',
          host: '', // Will be populated after cluster creation
          port: 5432,
        }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
      encryptionKey: this.kmsKey,
    });

    // Redis auth token secret
    this.redisSecret = new secretsmanager.Secret(this, 'RedisSecret', {
      secretName: `bellyfed/${props.environment}/redis-auth`,
      description: 'Redis authentication token for Bellyfed',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          host: '', // Will be populated after cluster creation
          port: 6379,
        }),
        generateStringKey: 'auth_token',
        excludeCharacters: '"@/\\\'',
        passwordLength: 64,
      },
      encryptionKey: this.kmsKey,
    });
  }

  private createAuroraCluster(props: BellyfedDatabaseProps) {
    // DB Subnet Group
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc: props.vpc,
      description: 'Subnet group for Bellyfed Aurora cluster',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      subnetGroupName: `bellyfed-db-subnet-group-${props.environment}`,
    });

    // Parameter Group
    const parameterGroup = new rds.ParameterGroup(this, 'DatabaseParameterGroup', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      description: 'Parameter group for Bellyfed Aurora PostgreSQL cluster',
      parameters: {
        'shared_preload_libraries': 'pg_stat_statements,pg_hint_plan',
        'log_statement': 'all',
        'log_min_duration_statement': '1000',
        'log_checkpoints': '1',
        'log_connections': '1',
        'log_disconnections': '1',
        'log_lock_waits': '1',
        'log_temp_files': '0',
        'track_activity_query_size': '2048',
        'track_io_timing': '1',
      },
    });

    // Aurora Serverless v2 Cluster
    this.cluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      defaultDatabaseName: props.databaseName || 'bellyfed',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.databaseSecurityGroup],
      subnetGroup,
      parameterGroup,
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: props.environment === 'production' ? 16 : 4,
      backup: {
        retention: props.enableBackups !== false 
          ? cdk.Duration.days(props.environment === 'production' ? 30 : 7)
          : cdk.Duration.days(1),
        preferredWindow: '03:00-04:00',
      },
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      storageEncrypted: props.enableEncryption !== false,
      storageEncryptionKey: this.kmsKey,
      deletionProtection: props.environment === 'production',
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      clusterIdentifier: `bellyfed-cluster-${props.environment}`,
      monitoringInterval: cdk.Duration.seconds(60),
      enablePerformanceInsights: true,
      performanceInsightEncryptionKey: this.kmsKey,
      performanceInsightRetention: rds.PerformanceInsightRetention.DEFAULT,
      cloudwatchLogsExports: ['postgresql'],
      cloudwatchLogsRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    // Add writer instance
    this.cluster.addRotationSingleUser({
      automaticallyAfter: cdk.Duration.days(30),
    });

    // Update secret with cluster endpoint
    new secretsmanager.SecretTargetAttachment(this, 'DatabaseSecretAttachment', {
      secret: this.databaseSecret,
      target: this.cluster,
    });
  }

  private createRedisCluster(props: BellyfedDatabaseProps) {
    // ElastiCache Subnet Group
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for Bellyfed Redis cluster',
      subnetIds: props.vpc.privateSubnets.map(subnet => subnet.subnetId),
      cacheSubnetGroupName: `bellyfed-cache-subnet-group-${props.environment}`,
    });

    // ElastiCache Parameter Group
    const cacheParameterGroup = new elasticache.CfnParameterGroup(this, 'CacheParameterGroup', {
      cacheParameterGroupFamily: 'redis7.x',
      description: 'Parameter group for Bellyfed Redis cluster',
      properties: {
        'maxmemory-policy': 'allkeys-lru',
        'timeout': '300',
        'tcp-keepalive': '300',
        'maxclients': '1000',
      },
    });

    // Redis Cluster
    this.redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: props.environment === 'production' ? 'cache.r7g.large' : 'cache.t4g.micro',
      engine: 'redis',
      engineVersion: '7.0',
      numCacheNodes: 1,
      cacheSubnetGroupName: cacheSubnetGroup.cacheSubnetGroupName,
      vpcSecurityGroupIds: [this.redisSecurityGroup.securityGroupId],
      cacheParameterGroupName: cacheParameterGroup.ref,
      clusterName: `bellyfed-redis-${props.environment}`,
      port: 6379,
      transitEncryptionEnabled: props.enableEncryption !== false,
      atRestEncryptionEnabled: props.enableEncryption !== false,
      authToken: this.redisSecret.secretValueFromJson('auth_token').unsafeUnwrap(),
      snapshotRetentionLimit: props.enableBackups !== false ? 5 : 0,
      snapshotWindow: '03:00-05:00',
      preferredMaintenanceWindow: 'sun:05:00-sun:06:00',
      autoMinorVersionUpgrade: true,
      tags: [
        {
          key: 'Environment',
          value: props.environment,
        },
        {
          key: 'Application',
          value: 'bellyfed',
        },
        {
          key: 'Component',
          value: 'cache',
        },
      ],
    });

    this.redisCluster.addDependency(cacheSubnetGroup);
    this.redisCluster.addDependency(cacheParameterGroup);
  }

  public getDatabaseConnectionString(): string {
    return `postgresql://${this.databaseSecret.secretValueFromJson('username').unsafeUnwrap()}:${this.databaseSecret.secretValueFromJson('password').unsafeUnwrap()}@${this.cluster.clusterEndpoint.hostname}:${this.cluster.clusterEndpoint.port}/${this.databaseSecret.secretValueFromJson('dbname').unsafeUnwrap()}`;
  }

  public getRedisConnectionString(): string {
    return `redis://:${this.redisSecret.secretValueFromJson('auth_token').unsafeUnwrap()}@${this.redisCluster.attrRedisEndpointAddress}:${this.redisCluster.attrRedisEndpointPort}`;
  }

  public grantConnect(grantee: cdk.aws_iam.IGrantable) {
    // Grant RDS connect permissions
    grantee.grantPrincipal.addToPrincipalPolicy(new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ['rds-db:connect'],
      resources: [
        `arn:aws:rds-db:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:dbuser:${this.cluster.clusterIdentifier}/*`,
      ],
    }));

    // Grant secret access
    this.databaseSecret.grantRead(grantee);
    this.redisSecret.grantRead(grantee);

    // Grant KMS permissions
    if (this.kmsKey) {
      this.kmsKey.grantDecrypt(grantee);
    }
  }
}
