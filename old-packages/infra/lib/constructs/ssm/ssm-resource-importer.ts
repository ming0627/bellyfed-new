import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Properties for the SsmResourceImporter construct
 */
export interface SsmResourceImporterProps {
    /**
     * The environment name (e.g., dev, staging, prod)
     */
    environment: string;

    /**
     * Optional prefix for SSM parameter names
     * @default 'bellyfed'
     */
    paramPrefix?: string;
}

/**
 * A construct that imports AWS resources from SSM Parameter Store
 *
 * This construct provides methods to import resources using identifiers
 * stored in SSM Parameter Store, allowing stacks to reference resources
 * without direct CloudFormation exports/imports.
 *
 * Example usage:
 * ```typescript
 * const importer = new SsmResourceImporter(this, 'ResourceImporter', {
 *   environment: 'dev'
 * });
 *
 * // Import a VPC
 * const vpc = importer.importVpc();
 *
 * // Import an ALB
 * const alb = importer.importLoadBalancer();
 * ```
 */
export class SsmResourceImporter extends Construct {
    private readonly environment: string;
    private readonly paramPrefix: string;

    constructor(scope: Construct, id: string, props: SsmResourceImporterProps) {
        super(scope, id);
        this.environment = props.environment;
        this.paramPrefix = props.paramPrefix || 'bellyfed';
    }

    /**
     * Gets a parameter value from SSM Parameter Store
     */
    private getParameterValue(resourceType: string, resourceName: string): string {
        const paramName = `/${this.paramPrefix}/${this.environment}/${resourceType}/${resourceName}`;

        return ssm.StringParameter.valueForStringParameter(this, paramName);
    }

    /**
     * Imports a VPC from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'vpc-id')
     * @returns The imported VPC
     */
    public importVpc(resourceName: string = 'vpc-id'): ec2.IVpc {
        const vpcId = this.getParameterValue('vpc', resourceName);

        return ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
            vpcId: vpcId,
            // We don't need to specify availability zones or subnet IDs
            // since we're only using the VPC ID for most operations
            availabilityZones: cdk.Fn.getAzs(),
        });
    }

    /**
     * Imports a security group from SSM Parameter Store
     * @param resourceName Name for the resource in SSM
     * @returns The imported security group
     */
    public importSecurityGroup(resourceName: string): ec2.ISecurityGroup {
        const securityGroupId = this.getParameterValue('security-group', resourceName);

        return ec2.SecurityGroup.fromSecurityGroupId(
            this,
            `Imported${resourceName}SecurityGroup`,
            securityGroupId
        );
    }

    /**
     * Imports an ECS cluster from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'cluster-name')
     * @param vpc Optional VPC to associate with the cluster
     * @returns The imported ECS cluster
     */
    public importEcsCluster(resourceName: string = 'cluster-name', vpc?: ec2.IVpc): ecs.ICluster {
        const clusterName = this.getParameterValue('ecs', resourceName);

        // Create a default VPC if none is provided
        const clusterVpc = vpc || ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

        return ecs.Cluster.fromClusterAttributes(this, 'ImportedCluster', {
            clusterName: clusterName,
            vpc: clusterVpc,
            securityGroups: [],
        });
    }

    /**
     * Imports an Application Load Balancer from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'load-balancer-arn')
     * @param vpc Optional VPC to associate with the ALB
     * @param securityGroupId Optional security group ID for the ALB
     * @returns The imported ALB
     */
    public importLoadBalancer(
        resourceName: string = 'load-balancer-arn',
        vpc?: ec2.IVpc,
        securityGroupId?: string
    ): elbv2.IApplicationLoadBalancer {
        const loadBalancerArn = this.getParameterValue('alb', resourceName);

        // If we have a security group ID, use it, otherwise try to get it from SSM
        const sgId =
            securityGroupId || this.getParameterValue('security-group', 'alb-security-group');

        return elbv2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(
            this,
            'ImportedALB',
            {
                loadBalancerArn: loadBalancerArn,
                securityGroupId: sgId,
                vpc: vpc,
            }
        );
    }

    /**
     * Imports an ALB listener from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'listener-arn')
     * @param securityGroup Optional security group for the listener
     * @returns The imported listener
     */
    public importListener(
        resourceName: string = 'listener-arn',
        securityGroup?: ec2.ISecurityGroup
    ): elbv2.IApplicationListener {
        const listenerArn = this.getParameterValue('alb', resourceName);

        // If no security group is provided, create a dummy one
        // This is needed because the securityGroup property is required
        const listenerSecurityGroup =
            securityGroup ||
            ec2.SecurityGroup.fromSecurityGroupId(
                this,
                'DummyListenerSecurityGroup',
                this.getParameterValue('security-group', 'alb-security-group')
            );

        return elbv2.ApplicationListener.fromApplicationListenerAttributes(
            this,
            'ImportedListener',
            {
                listenerArn: listenerArn,
                securityGroup: listenerSecurityGroup,
            }
        );
    }

    /**
     * Imports an ALB target group from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'target-group-arn')
     * @returns The imported target group
     */
    public importTargetGroup(
        resourceName: string = 'target-group-arn'
    ): elbv2.IApplicationTargetGroup {
        const targetGroupArn = this.getParameterValue('alb', resourceName);

        return elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(this, 'ImportedTargetGroup', {
            targetGroupArn: targetGroupArn,
        });
    }

    /**
     * Imports an ECR repository from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'repository-uri')
     * @returns The imported ECR repository
     */
    public importEcrRepository(resourceName: string = 'repository-uri'): ecr.IRepository {
        const repositoryUri = this.getParameterValue('ecr', resourceName);

        // Extract repository name from URI
        // Format: {account}.dkr.ecr.{region}.amazonaws.com/{name}
        const repositoryName = repositoryUri.split('/').pop() || '';

        return ecr.Repository.fromRepositoryName(this, 'ImportedRepository', repositoryName);
    }

    /**
     * Imports an IAM role from SSM Parameter Store
     * @param resourceName Name for the resource in SSM
     * @param mutable Whether the role can be modified
     * @returns The imported IAM role
     */
    public importRole(resourceName: string, mutable: boolean = false): iam.IRole {
        const roleArn = this.getParameterValue('iam', resourceName);

        return iam.Role.fromRoleArn(this, `Imported${resourceName}Role`, roleArn, { mutable });
    }

    /**
     * Imports a CloudWatch log group from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'log-group-name')
     * @returns The imported log group
     */
    public importLogGroup(resourceName: string = 'log-group-name'): logs.ILogGroup {
        const logGroupName = this.getParameterValue('logs', resourceName);

        return logs.LogGroup.fromLogGroupName(this, 'ImportedLogGroup', logGroupName);
    }

    /**
     * Imports an ECS service from SSM Parameter Store
     * @param resourceName Optional name for the resource (defaults to 'service-name')
     * @param cluster The ECS cluster the service belongs to
     * @returns The imported ECS service
     */
    public importEcsService(
        resourceName: string = 'service-name',
        cluster: ecs.ICluster
    ): ecs.IService {
        const serviceName = this.getParameterValue('ecs', resourceName);

        return ecs.FargateService.fromFargateServiceAttributes(this, 'ImportedService', {
            serviceName: serviceName,
            cluster: cluster,
        });
    }
}
