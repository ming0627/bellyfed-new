import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
    environment: string;
}

export class MonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MonitoringStackProps) {
        super(scope, id, props);

        const { environment } = props;

        // Create stable names using uniqueId
        const stackId = cdk.Names.uniqueId(this);
        const dashboardName = `${stackId}-${environment}-import-monitoring`;
        const metricsNamespace = `Bellyfed/${stackId}/${environment}/Import`;

        // Create the dashboard with stable name
        const dashboard = new cloudwatch.Dashboard(this, 'ImportMonitoringDashboard', {
            dashboardName,
        });

        // Define common props for metrics with stable namespace
        const metricProps = {
            namespace: metricsNamespace,
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
        };

        // Create widgets for each table
        const tables = [
            'bellyfed-restaurants',
            'bellyfed-reviews',
            'bellyfed-users',
            'bellyfed-metadata',
        ];

        // Success/Failure Rate Widget
        const successFailureWidget = new cloudwatch.GraphWidget({
            title: 'Import Success/Failure Rate',
            width: 24,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: tables.map(
                (table) =>
                    new cloudwatch.Metric({
                        ...metricProps,
                        metricName: 'ImportSuccess',
                        dimensionsMap: { Table: table },
                        color: '#2ca02c',
                        label: `${table} Success`,
                    })
            ),
            right: tables.map(
                (table) =>
                    new cloudwatch.Metric({
                        ...metricProps,
                        metricName: 'ImportFailure',
                        dimensionsMap: { Table: table },
                        color: '#d62728',
                        label: `${table} Failure`,
                    })
            ),
        });

        // Import Progress Widget
        const importProgressWidget = new cloudwatch.GraphWidget({
            title: 'Cumulative Import Progress',
            width: 24,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: true,
            left: tables.map((table) =>
                new cloudwatch.Metric({
                    ...metricProps,
                    metricName: 'ImportSuccess',
                    dimensionsMap: { Table: table },
                    label: table,
                }).with({
                    statistic: 'Sum',
                    period: cdk.Duration.minutes(5),
                })
            ),
        });

        // Lambda Errors Widget with function name from SSM
        let importProcessorFunctionName;
        try {
            // Try to get the function name from SSM Parameter Store
            importProcessorFunctionName = cdk.aws_ssm.StringParameter.valueForStringParameter(
                this,
                `/bellyfed/${environment}/lambda/import-processor-function-name`
            );
        } catch (error: unknown) {
            // Fallback to a default name if parameter doesn't exist
            console.warn(
                `Warning: Could not get import processor function name from SSM. Error: ${error}`
            );
            importProcessorFunctionName = `bellyfed-import-processor-${environment}`;
        }

        const lambdaErrorsWidget = new cloudwatch.GraphWidget({
            title: 'Lambda Errors',
            width: 12,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: [
                new cloudwatch.Metric({
                    namespace: 'AWS/Lambda',
                    metricName: 'Errors',
                    dimensionsMap: {
                        FunctionName: importProcessorFunctionName,
                    },
                    statistic: 'Sum',
                    period: cdk.Duration.minutes(1),
                }),
            ],
        });

        // SQS DLQ Messages Widget with queue name from SSM
        let importDlqName;
        try {
            // Try to get the DLQ name from SSM Parameter Store
            const dlqArn = cdk.aws_ssm.StringParameter.valueForStringParameter(
                this,
                `/bellyfed/${environment}/sqs/import-dlq-arn`
            );
            // Extract queue name from ARN (arn:aws:sqs:region:account:queuename)
            importDlqName = dlqArn.split(':').pop();
        } catch (error: unknown) {
            // Fallback to a default name if parameter doesn't exist
            console.warn(`Warning: Could not get import DLQ name from SSM. Error: ${error}`);
            importDlqName = `bellyfed-import-dlq-${environment}`;
        }

        const dlqMessagesWidget = new cloudwatch.GraphWidget({
            title: 'DLQ Messages',
            width: 12,
            height: 6,
            view: cloudwatch.GraphWidgetView.TIME_SERIES,
            stacked: false,
            left: [
                new cloudwatch.Metric({
                    namespace: 'AWS/SQS',
                    metricName: 'ApproximateNumberOfMessagesVisible',
                    dimensionsMap: {
                        QueueName: importDlqName || `${environment}-import-dlq`,
                    },
                    statistic: 'Maximum',
                    period: cdk.Duration.minutes(1),
                }),
            ],
        });

        // Create text widget for instructions
        const instructionsWidget = new cloudwatch.TextWidget({
            markdown: `# Import Monitoring Dashboard
## Metrics Explanation
* **Success/Failure Rate**: Shows successful and failed imports per table
* **Cumulative Progress**: Total successful imports per table over time
* **Lambda Errors**: Error count from the DynamoDB import function
* **DLQ Messages**: Number of messages in Dead Letter Queue

## Troubleshooting
1. High failure rate? Check Lambda logs
2. Messages in DLQ? Check message attributes for error details
3. No progress? Verify import script is running
4. Lambda errors? Check CloudWatch logs for error details`,
            width: 24,
            height: 8,
        });

        // Add all widgets to dashboard
        dashboard.addWidgets(
            instructionsWidget,
            successFailureWidget,
            importProgressWidget,
            new cloudwatch.Row(lambdaErrorsWidget, dlqMessagesWidget)
        );

        // Add CloudFormation outputs without exports
        new cdk.CfnOutput(this, 'DashboardName', {
            value: dashboard.dashboardName,
            description: 'Name of the Import Monitoring Dashboard',
        });

        new cdk.CfnOutput(this, 'DashboardURL', {
            // Use Fn.select to get region in a stable way
            value: cdk.Fn.join('', [
                'https://',
                cdk.Fn.select(3, cdk.Fn.split(':', cdk.Stack.of(this).stackId)),
                '.console.aws.amazon.com/cloudwatch/home?region=',
                cdk.Fn.select(3, cdk.Fn.split(':', cdk.Stack.of(this).stackId)),
                '#dashboards:name=',
                dashboard.dashboardName,
            ]),
            description: 'URL of the Import Monitoring Dashboard',
        });

        // Store dashboard name in SSM Parameter Store for cross-stack references
        new cdk.aws_ssm.StringParameter(this, 'DashboardNameParameter', {
            parameterName: `/bellyfed/${environment}/monitoring/dashboard-name`,
            stringValue: dashboard.dashboardName,
            description: `Name of the Import Monitoring Dashboard for ${environment} environment`,
        });
    }
}
