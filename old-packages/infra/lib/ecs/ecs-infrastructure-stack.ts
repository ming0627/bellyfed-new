// Main ECS Infrastructure Stack
// Creates VPC, ALB, ECS Cluster, ECR Repository, IAM Roles, CloudWatch components
// This stack provides the foundational infrastructure for ECS services.

import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CONFIG } from '../config.js';
import { SsmResourceExporter } from '../constructs/ssm';

export interface EcsInfrastructureStackProps extends cdk.StackProps {
    environment: string;
    // VPC configuration - can be either a VPC ID or a VPC object
    // Both can be provided for redundancy - vpc will be used first if available
    vpcId?: string;
    vpc?: ec2.IVpc;
    // Domain/Cert related props for ALB Listener and DNS
    domainName: string;
    siteDomainName: string;
    // ECR repository name
    ecrRepositoryName: string;
    // Port the application container listens on (used for SG rules and TG health check)
    containerPort: number;
    // Health check path for the target group
    healthCheckPath?: string; // Optional, defaults to '/'
    // Secret ARNs for the task
    secretArns?: Record<string, string>;
}

export class EcsInfrastructureStack extends cdk.Stack {
    public readonly vpc: ec2.IVpc; // Use IVpc for flexibility (can be imported or created)
    public readonly cluster: ecs.Cluster;
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    public readonly listener: elbv2.ApplicationListener;
    public readonly targetGroup: elbv2.ApplicationTargetGroup;
    public readonly repository: ecr.Repository;
    public readonly executionRole: iam.Role;
    public readonly taskRole: iam.Role;
    public readonly logGroup: logs.LogGroup;
    public readonly serviceSecurityGroup: ec2.SecurityGroup;
    public readonly albSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: EcsInfrastructureStackProps) {
        super(scope, id, props);

        // Add tags to all resources
        cdk.Tags.of(this).add('Environment', props.environment);
        cdk.Tags.of(this).add('Application', 'Bellyfed');
        cdk.Tags.of(this).add('Stack', 'ECS-Infrastructure');

        // Create SSM Resource Exporter for storing resource ARNs in SSM
        const resourceExporter = new SsmResourceExporter(this, 'ResourceExporter', {
            environment: props.environment,
        });

        // Always use the provided VPC from NetworkStack
        // This ensures we don't create multiple VPCs with conflicting CIDR ranges
        console.log('EcsInfrastructureStack: VPC parameter check:');
        console.log(`- props.vpc: ${props.vpc ? 'Provided' : 'Not provided'}`);
        console.log(`- props.vpc type: ${props.vpc ? typeof props.vpc : 'N/A'}`);
        console.log(`- props.vpc instanceof ec2.Vpc: ${props.vpc instanceof ec2.Vpc}`);
        console.log(`- props.vpcId: ${props.vpcId ? props.vpcId : 'Not provided'}`);

        if (props.vpc) {
            // Use the VPC object directly if provided
            console.log('Using provided VPC object directly');
            this.vpc = props.vpc;
        } else if (props.vpcId) {
            // Look up the VPC by ID if provided
            console.log(`Looking up VPC by ID: ${props.vpcId}`);
            this.vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', { vpcId: props.vpcId });
        } else {
            console.error('No VPC or VPC ID provided to EcsInfrastructureStack');
            throw new Error(
                'Either vpc or vpcId must be provided to EcsInfrastructureStack. Please pass the VPC from NetworkStack.'
            );
        }

        // Create ECS Cluster
        this.cluster = new ecs.Cluster(this, 'Cluster', {
            vpc: this.vpc,
            clusterName: CONFIG.ecs.namingPatterns.cluster.replace(
                '{environment}',
                props.environment
            ),
            containerInsights: true,
            enableFargateCapacityProviders: true,
        });

        // Set up security groups
        this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for ALB',
            allowAllOutbound: true,
        });

        this.serviceSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for ECS Service',
            allowAllOutbound: true,
        });

        // Allow ALB to access ECS service on container port
        this.serviceSecurityGroup.addIngressRule(
            this.albSecurityGroup,
            ec2.Port.tcp(props.containerPort),
            'Allow traffic from ALB to container port'
        );

        // Add a rule to allow communication within the VPC for service discovery
        // This enables services like Typesense to be discovered by the NextJS application
        this.serviceSecurityGroup.addIngressRule(
            ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
            ec2.Port.allTcp(),
            'Allow all TCP traffic from within the VPC for service discovery'
        );

        // Allow ALB to receive traffic from the internet
        this.albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP traffic from the internet'
        );

        this.albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'Allow HTTPS traffic from the internet'
        );

        // Create CloudWatch Log Group
        this.logGroup = new logs.LogGroup(this, 'LogGroup', {
            logGroupName: CONFIG.ecs.namingPatterns.logGroup.replace(
                '{environment}',
                props.environment
            ),
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust as needed for prod
        });

        // Create ALB with access logs bucket
        const accessLogsBucket = new s3.Bucket(this, 'AccessLogsBucket', {
            bucketName: CONFIG.ecs.namingPatterns.accessLogsBucket
                .replace('{environment}', props.environment)
                .replace('{account}', this.account)
                .toLowerCase(), // Ensure lowercase
            lifecycleRules: [
                {
                    expiration: cdk.Duration.days(90),
                },
            ],
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust as needed for prod
            autoDeleteObjects: true, // Adjust as needed for prod
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
            vpc: this.vpc,
            internetFacing: true,
            securityGroup: this.albSecurityGroup,
            loadBalancerName: CONFIG.ecs.namingPatterns.loadBalancer.replace(
                '{environment}',
                props.environment
            ),
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        });

        // Configure access logs only if we have a valid region
        // This prevents the "Region is required" validation error during synthesis
        if (this.region && this.region.length > 0 && !cdk.Token.isUnresolved(this.region)) {
            this.loadBalancer.logAccessLogs(accessLogsBucket, 'alb-logs');
        } else {
            console.warn('Region not available or unresolved - ALB access logging disabled');
        }

        // --- Import Certificate ARN and Hosted Zone ID from SSM or CloudFormation exports --- //
        // Get certificate ARN and hosted zone ID from CONFIG
        const importedCertArn = CONFIG.route53.certificateArn;
        const importedHostedZoneId = CONFIG.route53.hostedZoneId;

        console.log(`Using certificate ARN from CONFIG: ${importedCertArn}`);
        console.log(`Using hosted zone ID from CONFIG: ${importedHostedZoneId}`);

        // Create HTTPS listener using imported values
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: importedHostedZoneId,
            zoneName: props.domainName, // Use the provided domain name
        });
        const certificate = acm.Certificate.fromCertificateArn(
            this,
            'Certificate',
            importedCertArn
        );

        this.listener = this.loadBalancer.addListener('HttpsListener', {
            port: 443,
            protocol: elbv2.ApplicationProtocol.HTTPS,
            certificates: [certificate],
            sslPolicy: elbv2.SslPolicy.RECOMMENDED,
        });

        // Add HTTP listener that redirects to HTTPS (always create this listener)
        this.loadBalancer.addListener('HttpListener', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            defaultAction: elbv2.ListenerAction.redirect({
                protocol: 'HTTPS',
                port: '443',
                permanent: true,
            }),
        });

        // Add Route53 DNS record
        new route53.ARecord(this, 'AliasRecord', {
            zone: hostedZone,
            recordName: props.siteDomainName, // e.g., app-dev.bellyfed.com
            target: route53.RecordTarget.fromAlias(
                new targets.LoadBalancerTarget(this.loadBalancer)
            ),
        });

        // Create target group - Health check path updated to '/'
        const healthCheckPath = props.healthCheckPath ?? CONFIG.healthCheck.targetGroup.path;
        this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
            vpc: this.vpc,
            port: props.containerPort,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targetType: elbv2.TargetType.IP,
            healthCheck: {
                path: healthCheckPath,
                interval: cdk.Duration.seconds(CONFIG.healthCheck.targetGroup.interval),
                timeout: cdk.Duration.seconds(CONFIG.healthCheck.targetGroup.timeout),
                healthyThresholdCount: CONFIG.healthCheck.targetGroup.healthyThresholdCount,
                unhealthyThresholdCount: CONFIG.healthCheck.targetGroup.unhealthyThresholdCount,
                healthyHttpCodes: CONFIG.healthCheck.targetGroup.healthyHttpCodes,
            },
            // Use a generated name to avoid conflicts if stack is recreated
            targetGroupName: CONFIG.ecs.namingPatterns.targetGroup.replace(
                '{environment}',
                props.environment
            ),
        });

        // Attach target group to the primary (HTTPS) listener
        this.listener.addAction('DefaultAction', {
            action: elbv2.ListenerAction.forward([this.targetGroup]),
        });
        // The redirecting HTTP listener does not need the target group attached.

        // Create execution role for the task (needed by service stack)
        this.executionRole = new iam.Role(this, 'ExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: CONFIG.ecs.namingPatterns.executionRole.replace(
                '{environment}',
                props.environment
            ),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AmazonECSTaskExecutionRolePolicy'
                ),
            ],
            // Permissions for secrets will be added in the Service Stack
        });

        // If secretArns are provided, add permissions to access them
        if (
            props.secretArns &&
            typeof props.secretArns === 'object' &&
            Object.keys(props.secretArns).length > 0
        ) {
            const secretArnValues: string[] = Object.values(props.secretArns);

            // Log the secrets for debugging (only ARNs, not values)
            console.log(
                `Adding permissions for ${secretArnValues.length} secrets to execution role`
            );

            // Add permissions to access secrets
            this.executionRole.addToPolicy(
                new iam.PolicyStatement({
                    actions: ['secretsmanager:GetSecretValue', 'ssm:GetParameters'],
                    resources: secretArnValues,
                })
            );

            // Store the mapping in SSM for future reference
            new ssm.StringParameter(this, 'SecretArnMappingParam', {
                parameterName: `/bellyfed/${props.environment}/ecs/secret-arn-mapping`,
                stringValue: JSON.stringify(props.secretArns),
                description: `Secret ARNs mapping for ECS in ${props.environment} environment`,
            });
        } else {
            console.log('No secret ARNs provided for ECS infrastructure stack');
        }

        // Create task role for the container
        this.taskRole = new iam.Role(this, 'TaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: CONFIG.ecs.namingPatterns.taskRole.replace(
                '{environment}',
                props.environment
            ),
        });

        // Add base permissions - specific permissions can be added in Service Stack or here if common
        this.taskRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess')
        );
        // Add other common policies if needed, e.g., S3 access

        // Create or import the ECR repository
        // This functionality was previously in the DeploymentCoordinatorStack
        const repositoryName = props.ecrRepositoryName || `bellyfed-${props.environment}`;
        try {
            // Try to import an existing repository
            this.repository = ecr.Repository.fromRepositoryName(
                this,
                'ImportedRepository',
                repositoryName
            ) as ecr.Repository;
            console.log(`Using existing ECR repository: ${repositoryName}`);
        } catch (error: unknown) {
            // If the repository doesn't exist, create a new one
            this.repository = new ecr.Repository(this, 'Repository', {
                repositoryName: repositoryName,
                removalPolicy: cdk.RemovalPolicy.RETAIN,
                lifecycleRules: [
                    {
                        maxImageCount: 5,
                        description: 'Only keep the 5 most recent images',
                    },
                ],
                imageScanOnPush: true,
                imageTagMutability: ecr.TagMutability.MUTABLE, // Set to MUTABLE to allow updating the 'latest' tag
            });
            console.log(`Created new ECR repository: ${repositoryName}`);
        }

        // Export the repository URI to SSM
        new ssm.StringParameter(this, 'RepositoryUriParameter', {
            parameterName: `/bellyfed/${props.environment}/ecr/repository-uri`,
            stringValue: this.repository.repositoryUri,
            description: `ECR Repository URI for ${props.environment} environment`,
        });

        // --- Store infrastructure outputs in SSM Parameter Store using the ResourceExporter ---
        // Export VPC
        resourceExporter.exportVpc(this.vpc);

        // Export ECS Cluster
        resourceExporter.exportEcsCluster(this.cluster);

        // Export IAM Roles
        resourceExporter.exportRole(this.executionRole, 'execution-role');
        resourceExporter.exportRole(this.taskRole, 'task-role');

        // Export Security Groups
        resourceExporter.exportSecurityGroup(this.albSecurityGroup, 'alb-security-group');
        resourceExporter.exportSecurityGroup(this.serviceSecurityGroup, 'service-security-group');

        // Export ALB components
        resourceExporter.exportLoadBalancer(this.loadBalancer);
        resourceExporter.exportListener(this.listener);
        resourceExporter.exportTargetGroup(this.targetGroup);

        // Export Log Group
        resourceExporter.exportLogGroup(this.logGroup);

        // --- Stack outputs for cross-stack references (without exports) ---
        new cdk.CfnOutput(this, 'VpcIdOutput', {
            // Ensure unique Output ID
            value: this.vpc.vpcId,
            description: 'The ID of the VPC',
        });

        new cdk.CfnOutput(this, 'ClusterNameOutput', {
            value: this.cluster.clusterName,
            description: 'The name of the ECS cluster',
        });

        new cdk.CfnOutput(this, 'ClusterArnOutput', {
            // Export ARN too
            value: this.cluster.clusterArn,
            description: 'The ARN of the ECS cluster',
        });

        new cdk.CfnOutput(this, 'LoadBalancerDNSOutput', {
            value: this.loadBalancer.loadBalancerDnsName,
            description: 'The DNS name of the load balancer',
        });

        new cdk.CfnOutput(this, 'ExecutionRoleArnOutput', {
            value: this.executionRole.roleArn,
            description: 'ARN of the ECS Execution Role',
        });

        new cdk.CfnOutput(this, 'TaskRoleArnOutput', {
            value: this.taskRole.roleArn,
            description: 'ARN of the ECS Task Role',
        });

        new cdk.CfnOutput(this, 'AlbSecurityGroupIdOutput', {
            value: this.albSecurityGroup.securityGroupId,
            description: 'ID of the ALB Security Group',
        });

        new cdk.CfnOutput(this, 'ServiceSecurityGroupIdOutput', {
            value: this.serviceSecurityGroup.securityGroupId,
            description: 'ID of the ECS Service Security Group',
        });

        new cdk.CfnOutput(this, 'ListenerArnOutput', {
            value: this.listener.listenerArn, // Export primary listener ARN
            description: 'ARN of the primary ALB Listener',
        });

        new cdk.CfnOutput(this, 'TargetGroupArnOutput', {
            value: this.targetGroup.targetGroupArn,
            description: 'ARN of the ALB Target Group',
        });

        new cdk.CfnOutput(this, 'LogGroupNameOutput', {
            value: this.logGroup.logGroupName,
            description: 'Name of the CloudWatch Log Group',
        });

        new cdk.CfnOutput(this, 'RepositoryUriOutput', {
            value: this.repository.repositoryUri,
            description: 'URI of the ECR Repository',
        });
    }
}
