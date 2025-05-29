// lib/network-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CONFIG } from './config.js';
import { EnvironmentConfig } from './environmentConfig.js';
import { BranchName } from './types.js';

// Define a new interface that extends StackProps to include config
interface NetworkStackProps extends cdk.StackProps {
    config: typeof CONFIG;
    environment: string;
    envConfig: EnvironmentConfig;
}

export class NetworkStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: NetworkStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Initialize EnvironmentConfig with the environment from props
        const envConfig = EnvironmentConfig.getInstance(environment as BranchName);

        // Create a VPC with public, private, and isolated subnets
        // Use explicit CIDR ranges for each subnet type to avoid conflicts
        // This ensures that subnet CIDR blocks don't overlap across different stacks

        // Define VPC with explicit subnet configurations
        // Use a completely different CIDR range to avoid conflicts with existing VPC
        this.vpc = new ec2.Vpc(this, `ServerlessVpc-${environment}`, {
            ipAddresses: ec2.IpAddresses.cidr('172.16.0.0/16'), // Use 172.16.0.0/16 instead of 10.0.0.0/16
            maxAzs: envConfig.getConfig().vpc.maxAzs,
            natGateways: envConfig.getConfig().vpc.natGateways,
            // Disable the custom resource that restricts the default security group
            // This is needed for local deployments where we don't have the necessary permissions
            restrictDefaultSecurityGroup: false,
            // Use explicit subnet configuration with reserved CIDR ranges
            subnetConfiguration: [
                {
                    // Public subnets will use 172.16.0.0/24, 172.16.1.0/24, etc.
                    // This is a completely different range from the existing 10.0.0.0/16 VPC
                    cidrMask: 24,
                    name: `PublicSubnet-${environment}`,
                    subnetType: ec2.SubnetType.PUBLIC,
                    reserved: false,
                    mapPublicIpOnLaunch: true,
                },
                {
                    // Private subnets will use 172.16.2.0/24, 172.16.3.0/24, etc.
                    // This is a completely different range from the existing 10.0.0.0/16 VPC
                    cidrMask: 24,
                    name: `PrivateSubnet-${environment}`,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    reserved: false,
                },
                {
                    // Isolated subnets will use 172.16.4.0/24, 172.16.5.0/24, etc.
                    // This is a completely different range from the existing 10.0.0.0/16 VPC
                    cidrMask: 24,
                    name: `IsolatedSubnet-${environment}`,
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    reserved: false,
                },
            ],
        });

        // Output VPC and Subnet IDs
        new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });
        new cdk.CfnOutput(this, 'PublicSubnetIds', {
            value: this.vpc.publicSubnets.map((subnet) => subnet.subnetId).join(','),
        });
        new cdk.CfnOutput(this, 'PrivateSubnetIds', {
            value: this.vpc.privateSubnets.map((subnet) => subnet.subnetId).join(','),
        });
        new cdk.CfnOutput(this, 'IsolatedSubnetIds', {
            value: this.vpc.isolatedSubnets.map((subnet) => subnet.subnetId).join(','),
        });
    }
}
