import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Properties for the SsmResourceExporter construct
 */
export interface SsmResourceExporterProps {
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
 * A construct that exports AWS resources to SSM Parameter Store
 *
 * This construct provides methods to store resource identifiers (ARNs, IDs, etc.)
 * in SSM Parameter Store, allowing other stacks to import these resources without
 * direct CloudFormation exports/imports.
 *
 * Example usage:
 * ```typescript
 * const exporter = new SsmResourceExporter(this, 'ResourceExporter', {
 *   environment: 'dev'
 * });
 *
 * // Export a VPC
 * exporter.exportVpc(vpc);
 *
 * // Export an ALB
 * exporter.exportLoadBalancer(alb);
 * ```
 */
export class SsmResourceExporter extends Construct {
    private readonly environment: string;
    private readonly paramPrefix: string;

    constructor(scope: Construct, id: string, props: SsmResourceExporterProps) {
        super(scope, id);
        this.environment = props.environment;
        this.paramPrefix = props.paramPrefix || 'bellyfed';
    }

    /**
     * Creates an SSM parameter with the given name and value
     * Checks if the parameter already exists to avoid conflicts
     */
    private createParameter(
        resourceType: string,
        resourceName: string,
        paramValue: string,
        description?: string
    ): ssm.StringParameter {
        const paramName = `/${this.paramPrefix}/${this.environment}/${resourceType}/${resourceName}`;

        // Check if parameter already exists in the same stack
        const existingParam = this.node.tryFindChild(`${resourceType}${resourceName}Param`);
        if (existingParam) {
            console.warn(
                `Parameter ${paramName} already exists in this stack. Using existing parameter.`
            );
            return existingParam as ssm.StringParameter;
        }

        try {
            // Try to create the parameter
            return new ssm.StringParameter(this, `${resourceType}${resourceName}Param`, {
                parameterName: paramName,
                stringValue: paramValue,
                description:
                    description ||
                    `${resourceType} ${resourceName} for ${this.environment} environment`,
            });
        } catch (error: unknown) {
            // If there's an error (likely because the parameter already exists in another stack),
            // log a warning and create a parameter with a different logical ID
            console.warn(`Error creating parameter ${paramName}: ${error}`);
            console.warn(`Creating parameter with a different logical ID to avoid conflicts.`);

            return new ssm.StringParameter(
                this,
                `${resourceType}${resourceName}Param${Date.now()}`,
                {
                    parameterName: paramName,
                    stringValue: paramValue,
                    description:
                        description ||
                        `${resourceType} ${resourceName} for ${this.environment} environment`,
                }
            );
        }
    }

    /**
     * Exports a VPC to SSM Parameter Store
     * @param vpc The VPC to export
     * @param resourceName Optional name for the resource (defaults to 'vpc-id')
     * @returns The created SSM parameter
     */
    public exportVpc(vpc: ec2.IVpc, resourceName: string = 'vpc-id'): ssm.StringParameter {
        return this.createParameter(
            'vpc',
            resourceName,
            vpc.vpcId,
            `VPC ID for ${this.environment} environment`
        );
    }

    /**
     * Exports a security group to SSM Parameter Store
     * @param securityGroup The security group to export
     * @param resourceName Name for the resource in SSM
     * @returns The created SSM parameter
     */
    public exportSecurityGroup(
        securityGroup: ec2.ISecurityGroup,
        resourceName: string
    ): ssm.StringParameter {
        return this.createParameter(
            'security-group',
            resourceName,
            securityGroup.securityGroupId,
            `Security Group ID for ${resourceName} in ${this.environment} environment`
        );
    }

    /**
     * Exports an ECS cluster to SSM Parameter Store
     * @param cluster The ECS cluster to export
     * @param resourceName Optional name for the resource (defaults to 'cluster-name')
     * @returns The created SSM parameter
     */
    public exportEcsCluster(
        cluster: ecs.ICluster,
        resourceName: string = 'cluster-name'
    ): ssm.StringParameter {
        return this.createParameter(
            'ecs',
            resourceName,
            cluster.clusterName,
            `ECS Cluster name for ${this.environment} environment`
        );
    }

    /**
     * Exports an Application Load Balancer to SSM Parameter Store
     * @param alb The ALB to export
     * @param resourceName Optional name for the resource (defaults to 'load-balancer-arn')
     * @returns The created SSM parameter
     */
    public exportLoadBalancer(
        alb: elbv2.IApplicationLoadBalancer,
        resourceName: string = 'load-balancer-arn'
    ): ssm.StringParameter {
        return this.createParameter(
            'alb',
            resourceName,
            alb.loadBalancerArn,
            `ALB ARN for ${this.environment} environment`
        );
    }

    /**
     * Exports an ALB listener to SSM Parameter Store
     * @param listener The listener to export
     * @param resourceName Optional name for the resource (defaults to 'listener-arn')
     * @returns The created SSM parameter
     */
    public exportListener(
        listener: elbv2.IApplicationListener,
        resourceName: string = 'listener-arn'
    ): ssm.StringParameter {
        return this.createParameter(
            'alb',
            resourceName,
            listener.listenerArn,
            `ALB Listener ARN for ${this.environment} environment`
        );
    }

    /**
     * Exports an ALB target group to SSM Parameter Store
     * @param targetGroup The target group to export
     * @param resourceName Optional name for the resource (defaults to 'target-group-arn')
     * @returns The created SSM parameter
     */
    public exportTargetGroup(
        targetGroup: elbv2.IApplicationTargetGroup,
        resourceName: string = 'target-group-arn'
    ): ssm.StringParameter {
        return this.createParameter(
            'alb',
            resourceName,
            targetGroup.targetGroupArn,
            `ALB Target Group ARN for ${this.environment} environment`
        );
    }

    /**
     * Exports an ECR repository to SSM Parameter Store
     * @param repository The ECR repository to export
     * @param resourceName Optional name for the resource (defaults to 'repository-uri')
     * @returns The created SSM parameter
     */
    public exportEcrRepository(
        repository: ecr.IRepository,
        resourceName: string = 'repository-uri'
    ): ssm.StringParameter {
        return this.createParameter(
            'ecr',
            resourceName,
            repository.repositoryUri,
            `ECR Repository URI for ${this.environment} environment`
        );
    }

    /**
     * Exports an IAM role to SSM Parameter Store
     * @param role The IAM role to export
     * @param resourceName Name for the resource in SSM
     * @returns The created SSM parameter
     */
    public exportRole(role: iam.IRole, resourceName: string): ssm.StringParameter {
        return this.createParameter(
            'iam',
            resourceName,
            role.roleArn,
            `IAM Role ARN for ${resourceName} in ${this.environment} environment`
        );
    }

    /**
     * Exports a CloudWatch log group to SSM Parameter Store
     * @param logGroup The log group to export
     * @param resourceName Optional name for the resource (defaults to 'log-group-name')
     * @returns The created SSM parameter
     */
    public exportLogGroup(
        logGroup: logs.ILogGroup,
        resourceName: string = 'log-group-name'
    ): ssm.StringParameter {
        return this.createParameter(
            'logs',
            resourceName,
            logGroup.logGroupName,
            `CloudWatch Log Group name for ${this.environment} environment`
        );
    }

    /**
     * Exports a task definition to SSM Parameter Store
     * @param taskDefinition The task definition to export
     * @param resourceName Optional name for the resource (defaults to 'task-definition-arn')
     * @returns The created SSM parameter
     */
    public exportTaskDefinition(
        taskDefinition: ecs.TaskDefinition,
        resourceName: string = 'task-definition-arn'
    ): ssm.StringParameter {
        return this.createParameter(
            'ecs',
            resourceName,
            taskDefinition.taskDefinitionArn,
            `ECS Task Definition ARN for ${this.environment} environment`
        );
    }

    /**
     * Exports an ECS service to SSM Parameter Store
     * @param service The ECS service to export
     * @param resourceName Optional name for the resource (defaults to 'service-name')
     * @returns The created SSM parameter
     */
    public exportEcsService(
        service: ecs.IService,
        resourceName: string = 'service-name'
    ): ssm.StringParameter {
        return this.createParameter(
            'ecs',
            resourceName,
            service.serviceName,
            `ECS Service name for ${this.environment} environment`
        );
    }
}
