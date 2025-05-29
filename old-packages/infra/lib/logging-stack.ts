import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CentralizedLogging } from './constructs/logging/centralized-logging.js';
import { CONFIG } from './config.js';

/**
 * Properties for the LoggingStack
 */
export interface LoggingStackProps extends cdk.StackProps {
    /**
     * The environment name (e.g., 'dev', 'test', 'prod')
     */
    environment: string;

    /**
     * Optional Slack webhook URL for notifications
     */
    slackWebhookUrl?: string;
}

/**
 * A stack that provides centralized logging for all Lambda functions and API Gateway endpoints
 *
 * Features:
 * 1. Creates a centralized logging construct
 * 2. Sets up CloudWatch Logs Insights queries
 * 3. Creates a CloudWatch Dashboard for monitoring errors
 * 4. Sets up CloudWatch Alarms for critical error thresholds
 * 5. Configures SNS notifications for error alerts
 */
export class LoggingStack extends cdk.Stack {
    /**
     * The centralized logging construct
     */
    public readonly centralizedLogging: CentralizedLogging;

    /**
     * The SNS topic for error notifications
     */
    public readonly errorNotificationTopic: sns.Topic;

    constructor(scope: Construct, id: string, props: LoggingStackProps) {
        super(scope, id, props);

        // Determine if verbose logging should be enabled based on environment
        const verboseLogging = props.environment === 'dev';

        // Create SNS topic for error notifications
        this.errorNotificationTopic = new sns.Topic(this, 'ErrorNotificationTopic', {
            topicName: `bellyfed-${props.environment}-error-notifications`,
            displayName: `Bellyfed ${props.environment} Error Notifications`,
        });

        // Add Slack webhook subscription if provided
        if (props.slackWebhookUrl) {
            this.errorNotificationTopic.addSubscription(
                new subscriptions.UrlSubscription(props.slackWebhookUrl)
            );
        }

        // Add email subscription for critical errors
        this.errorNotificationTopic.addSubscription(
            new subscriptions.EmailSubscription('alerts@bellyfed.com')
        );

        // Create centralized logging construct
        this.centralizedLogging = new CentralizedLogging(this, 'CentralizedLogging', {
            environment: props.environment,
            alarmsTopic: this.errorNotificationTopic,
            slackWebhookUrl: props.slackWebhookUrl,
            verboseLogging,
            // Set error threshold based on environment
            errorThreshold: props.environment === 'prod' ? 1 : 5,
        });

        // Create a CloudWatch Logs Insights dashboard
        this.createLogsInsightsDashboard(props.environment);

        // Create a custom resource to create alarms for Lambda functions
        // This will run after all Lambda functions have been created
        this.createLambdaAlarms(props.environment);

        // Store the centralized log group ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'CentralizedErrorLogGroupArn', {
            parameterName: `/bellyfed/${props.environment}/logging/centralized-error-log-group-arn`,
            stringValue: this.centralizedLogging.centralizedErrorLogGroup.logGroupArn,
            description: 'ARN of the centralized error log group',
        });

        // Store the error notification topic ARN in SSM Parameter Store
        new ssm.StringParameter(this, 'ErrorNotificationTopicArn', {
            parameterName: `/bellyfed/${props.environment}/logging/error-notification-topic-arn`,
            stringValue: this.errorNotificationTopic.topicArn,
            description: 'ARN of the error notification SNS topic',
        });

        // Create CloudFormation outputs
        new cdk.CfnOutput(this, 'CentralizedErrorLogGroupName', {
            value: this.centralizedLogging.centralizedErrorLogGroup.logGroupName,
            description: 'Name of the centralized error log group',
        });

        new cdk.CfnOutput(this, 'ErrorDashboardName', {
            value: this.centralizedLogging.errorDashboard.dashboardName,
            description: 'Name of the error dashboard',
        });

        new cdk.CfnOutput(this, 'ErrorNotificationTopicArnOutput', {
            value: this.errorNotificationTopic.topicArn,
            description: 'ARN of the error notification SNS topic',
        });
    }

    /**
     * Create a CloudWatch Logs Insights dashboard
     *
     * This implementation creates a simpler dashboard with fewer widgets to improve
     * deployment performance while still providing essential monitoring capabilities.
     */
    private createLogsInsightsDashboard(environment: string): cloudwatch.Dashboard {
        // Create a dashboard with a stable ID to avoid recreation on each deployment
        const dashboardName = `${environment}-bellyfed-logs-insights`;

        const dashboard = new cloudwatch.Dashboard(this, 'LogsInsightsDashboard', {
            dashboardName: dashboardName,
        });

        // Create a text widget with instructions
        const instructionsWidget = new cloudwatch.TextWidget({
            markdown: `# Bellyfed Logs Insights Dashboard (${environment})
## Overview
This dashboard provides pre-configured CloudWatch Logs Insights queries for common error patterns.

## How to Use
1. Click on the query widget below
2. Adjust the time range as needed
3. Click "Run query" to execute the query
4. View the results in the CloudWatch Logs Insights console`,
            width: 24,
            height: 6,
        });

        // Create a single unified query widget for all errors
        // This reduces the number of widgets and improves deployment performance
        const unifiedErrorsQueryWidget = new cloudwatch.LogQueryWidget({
            title: 'All Service Errors',
            width: 24,
            height: 12,
            // Use a single log group pattern that works for both Lambda and API Gateway
            logGroupNames: [`/aws/lambda/${environment}-*`],
            view: cloudwatch.LogQueryVisualizationType.TABLE,
            queryString: `
        fields @timestamp, @message
        | filter @message like /ERROR/ or @message like /Error/ or status >= 400
        | sort @timestamp desc
        | limit 100
      `,
        });

        // Add widgets to the dashboard
        dashboard.addWidgets(instructionsWidget, unifiedErrorsQueryWidget);

        return dashboard;
    }

    /**
     * Create CloudWatch alarms for Lambda functions using SSM parameters
     *
     * This implementation uses a single Lambda function to create alarms for critical
     * Lambda functions only, reducing the number of resources created during deployment.
     */
    private createLambdaAlarms(environment: string): void {
        // Create a Lambda function to create alarms for critical Lambda functions
        const alarmsFunction = new lambda.Function(this, 'AlarmsFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();

        // List of critical Lambda functions that require alarms
        // This avoids having to query SSM for all Lambda functions
        const CRITICAL_FUNCTIONS = [
          // Add only the most critical functions here
          // Format: { functionName: 'dev-function-name', isHighVolume: false }
          { functionName: '${environment}-restaurant-query', isHighVolume: true },
          { functionName: '${environment}-analytics-service', isHighVolume: true }
        ];

        exports.handler = async (event, context) => {
          console.log('Event:', JSON.stringify(event, null, 2));

          const environment = event.ResourceProperties.Environment;
          const topicArn = event.ResourceProperties.TopicArn;

          try {
            // Process each critical function
            for (const { functionName, isHighVolume } of CRITICAL_FUNCTIONS) {
              await createAlarms(functionName, isHighVolume, topicArn);
            }

            return {
              PhysicalResourceId: context.logStreamName,
              Data: {
                Message: 'Successfully created alarms for critical Lambda functions',
              },
            };
          } catch (error: unknown) {
            console.error('Error:', error);
            throw error;
          }
        };

        async function createAlarms(functionName, isHighVolume, topicArn) {
          const logGroupName = \`/aws/lambda/\${functionName}\`;

          // Create error alarm
          const errorThreshold = isHighVolume ? 10 : 5;
          await cloudwatch.putMetricAlarm({
            AlarmName: \`\${functionName}-error-alarm\`,
            AlarmDescription: \`Error rate is high for \${functionName}\`,
            MetricName: 'Errors',
            Namespace: 'AWS/Lambda',
            Dimensions: [
              {
                Name: 'FunctionName',
                Value: functionName,
              },
            ],
            Period: 300, // 5 minutes
            EvaluationPeriods: 1,
            Threshold: errorThreshold,
            ComparisonOperator: 'GreaterThanThreshold',
            Statistic: 'Sum',
            ActionsEnabled: true,
            AlarmActions: [topicArn],
          }).promise();

          console.log(\`Created error alarm for \${functionName}\`);
        }
      `),
            timeout: cdk.Duration.minutes(2),
            memorySize: 128,
        });

        // Add permissions to create CloudWatch alarms
        alarmsFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['cloudwatch:PutMetricAlarm', 'cloudwatch:DeleteAlarms'],
                resources: ['*'],
            })
        );

        // Add permissions to publish to SNS topic
        alarmsFunction.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['sns:Publish'],
                resources: [this.errorNotificationTopic.topicArn],
            })
        );

        // Create a custom resource to trigger the Lambda function
        new cdk.CustomResource(this, 'CreateCriticalLambdaAlarms', {
            serviceToken: alarmsFunction.functionArn,
            properties: {
                Environment: environment,
                TopicArn: this.errorNotificationTopic.topicArn,
                // Add a timestamp to force the custom resource to run on every deployment
                Timestamp: new Date().toISOString(),
            },
        });
    }
}
