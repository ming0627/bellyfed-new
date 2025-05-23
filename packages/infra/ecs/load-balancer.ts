/**
 * Application Load Balancer configuration for Bellyfed ECS services
 * Handles traffic routing, SSL termination, and health checks
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export interface BellyfedLoadBalancerProps {
  vpc: ec2.IVpc;
  frontendService: ecs.FargateService;
  backendService: ecs.FargateService;
  docsService: ecs.FargateService;
  environment: string;
  domainName?: string;
  certificateArn?: string;
  enableWaf?: boolean;
  enableAccessLogs?: boolean;
}

export class BellyfedLoadBalancer extends Construct {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly httpListener: elbv2.ApplicationListener;
  public readonly httpsListener?: elbv2.ApplicationListener;
  public readonly frontendTargetGroup: elbv2.ApplicationTargetGroup;
  public readonly backendTargetGroup: elbv2.ApplicationTargetGroup;
  public readonly docsTargetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: Construct, id: string, props: BellyfedLoadBalancerProps) {
    super(scope, id);

    // Security Group for ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Bellyfed Application Load Balancer',
      allowAllOutbound: true,
    });

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    if (props.certificateArn || props.domainName) {
      albSecurityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(443),
        'Allow HTTPS traffic'
      );
    }

    // Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
      loadBalancerName: `bellyfed-alb-${props.environment}`,
      securityGroup: albSecurityGroup,
      deletionProtection: props.environment === 'production',
    });

    // Enable access logs if requested
    if (props.enableAccessLogs) {
      // Note: In a real implementation, you would create an S3 bucket for access logs
      // this.loadBalancer.logAccessLogs(accessLogsBucket);
    }

    // Target Groups
    this.frontendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'FrontendTargetGroup', {
      vpc: props.vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targetGroupName: `bellyfed-frontend-${props.environment}`,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    this.backendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'BackendTargetGroup', {
      vpc: props.vpc,
      port: 4000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targetGroupName: `bellyfed-backend-${props.environment}`,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
      deregistrationDelay: cdk.Duration.seconds(60),
    });

    this.docsTargetGroup = new elbv2.ApplicationTargetGroup(this, 'DocsTargetGroup', {
      vpc: props.vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targetGroupName: `bellyfed-docs-${props.environment}`,
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // Attach services to target groups
    this.frontendTargetGroup.addTarget(props.frontendService);
    this.backendTargetGroup.addTarget(props.backendService);
    this.docsTargetGroup.addTarget(props.docsService);

    // HTTP Listener
    this.httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/html',
        messageBody: '<h1>404 - Not Found</h1><p>The requested resource was not found.</p>',
      }),
    });

    // HTTPS Listener (if certificate is provided)
    if (props.certificateArn || props.domainName) {
      let certificate: acm.ICertificate;
      
      if (props.certificateArn) {
        certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn);
      } else if (props.domainName) {
        // Create a new certificate (requires manual DNS validation)
        certificate = new acm.Certificate(this, 'Certificate', {
          domainName: props.domainName,
          subjectAlternativeNames: [`*.${props.domainName}`],
          validation: acm.CertificateValidation.fromDns(),
        });
      }

      this.httpsListener = this.loadBalancer.addListener('HttpsListener', {
        port: 443,
        certificates: [certificate!],
        defaultAction: elbv2.ListenerAction.fixedResponse(404, {
          contentType: 'text/html',
          messageBody: '<h1>404 - Not Found</h1><p>The requested resource was not found.</p>',
        }),
      });

      // Redirect HTTP to HTTPS
      this.httpListener.addAction('HttpsRedirect', {
        action: elbv2.ListenerAction.redirect({
          protocol: 'HTTPS',
          port: '443',
          permanent: true,
        }),
      });
    }

    // Configure listener rules
    this.configureListenerRules();

    // WAF (Web Application Firewall)
    if (props.enableWaf) {
      this.createWafConfiguration();
    }

    // Route 53 DNS (if domain is provided)
    if (props.domainName) {
      this.createDnsRecords(props.domainName);
    }

    // Tags
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Application', 'bellyfed');
    cdk.Tags.of(this).add('Component', 'load-balancer');
  }

  private configureListenerRules() {
    const listener = this.httpsListener || this.httpListener;

    // Frontend routes (default)
    listener.addAction('FrontendAction', {
      priority: 100,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/', '/*']),
      ],
      action: elbv2.ListenerAction.forward([this.frontendTargetGroup]),
    });

    // Backend API routes
    listener.addAction('BackendApiAction', {
      priority: 200,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/*', '/trpc/*']),
      ],
      action: elbv2.ListenerAction.forward([this.backendTargetGroup]),
    });

    // Documentation routes
    listener.addAction('DocsAction', {
      priority: 300,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/docs/*']),
      ],
      action: elbv2.ListenerAction.forward([this.docsTargetGroup]),
    });

    // Health check route
    listener.addAction('HealthCheckAction', {
      priority: 400,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/health']),
      ],
      action: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'application/json',
        messageBody: '{"status":"healthy","timestamp":"' + new Date().toISOString() + '"}',
      }),
    });
  }

  private createWafConfiguration() {
    // Create WAF Web ACL
    const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      scope: 'REGIONAL',
      defaultAction: { allow: {} },
      rules: [
        {
          name: 'RateLimitRule',
          priority: 1,
          statement: {
            rateBasedStatement: {
              limit: 2000,
              aggregateKeyType: 'IP',
            },
          },
          action: { block: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRule',
          },
        },
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSetMetric',
          },
        },
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'BellyfedWebAcl',
      },
    });

    // Associate WAF with ALB
    new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: this.loadBalancer.loadBalancerArn,
      webAclArn: webAcl.attrArn,
    });
  }

  private createDnsRecords(domainName: string) {
    // Note: This assumes the hosted zone exists
    // In a real implementation, you might need to create or import the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });

    // Create A record for the domain
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.LoadBalancerTarget(this.loadBalancer)
      ),
    });

    // Create AAAA record for IPv6
    new route53.AaaaRecord(this, 'AliasRecordIPv6', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.LoadBalancerTarget(this.loadBalancer)
      ),
    });
  }
}
