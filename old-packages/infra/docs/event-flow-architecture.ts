/**
 * Event Flow Architecture Documentation
 *
 * This file serves as the central documentation for all event flows in the Bellyfed system.
 * It provides a comprehensive overview of event sources, processing patterns, and best practices.
 */

/**
 * 1. Event Sources
 * ---------------
 * a) Cognito Events
 *    - User Signup
 *    - User Confirmation
 *    - User Login
 *    - Password Change
 *
 * b) API Gateway Events
 *    - REST API calls
 *    - WebSocket connections
 *
 * c) Application Events
 *    - User actions
 *    - System events
 *
 * 2. Event Bus (EventBridge)
 * --------------------------
 * - Default event bus for AWS service events
 * - Custom event buses for application events
 * - Event patterns for routing
 *
 * 3. Event Targets
 * ---------------
 * a) Primary Targets
 *    - SQS Queues (for buffering and decoupling)
 *    - Lambda Functions (for processing)
 *    - SNS Topics (for fanout)
 *
 * b) Secondary Targets
 *    - DynamoDB (for persistence)
 *    - CloudWatch (for monitoring)
 *
 * 4. Dead Letter Queues (DLQ)
 * --------------------------
 * - Each SQS queue has its own DLQ
 * - Retry policy: 3 attempts before moving to DLQ
 * - 14-day message retention in DLQ
 *
 * 5. Monitoring
 * ------------
 * - CloudWatch Dashboards
 * - Alarms for DLQ messages
 * - Lambda error tracking
 * - SQS queue metrics
 */

interface QueueConfig {
    main: string;
    dlq: string;
}

interface EventFlowPattern {
    source: string;
    flow: string;
    queues: QueueConfig;
    lambda: string;
    table?: string;
    destination?: string;
}

interface RetryPolicy {
    maxAttempts: number;
    backoff: string;
    maxDelay: string;
}

interface DLQStrategy {
    retention: string;
    alerting: string;
    processing: string;
}

interface ErrorHandlingConfig {
    retryPolicy: RetryPolicy;
    dlqStrategy: DLQStrategy;
}

interface AlertConfig {
    dlqMessages: string;
    processingDelay: string;
    errorRate: string;
}

interface MonitoringConfig {
    metrics: string[];
    alerts: AlertConfig;
}

/**
 * Defines the standard event flow patterns in the system.
 * Use these patterns when implementing new event flows to maintain consistency.
 */
export const EventFlowPatterns: Record<string, EventFlowPattern> = {
    UserSignup: {
        source: 'Cognito',
        flow: 'Cognito → EventBridge → SQS → Lambda → DynamoDB',
        queues: {
            main: '${environment}-user-signup-queue',
            dlq: '${environment}-user-signup-dlq',
        },
        lambda: 'ProcessUserSignup',
        table: 'Users',
    },
    DataImport: {
        source: 'API Gateway',
        flow: 'API Gateway → EventBridge → SQS → Lambda → DynamoDB',
        queues: {
            main: '${environment}-import-queue',
            dlq: '${environment}-import-dlq',
        },
        lambda: 'ImportProcessor',
        table: 'Various',
    },
    Analytics: {
        source: 'Application',
        flow: 'Application → EventBridge → SQS → Lambda → Analytics Store',
        queues: {
            main: '${environment}-analytics-queue',
            dlq: '${environment}-analytics-dlq',
        },
        lambda: 'AnalyticsProcessor',
        destination: 'Analytics Store',
    },
};

/**
 * Standard error handling configuration for all event flows.
 * This ensures consistent error handling across the system.
 */
export const ErrorHandling: ErrorHandlingConfig = {
    retryPolicy: {
        maxAttempts: 3,
        backoff: 'exponential',
        maxDelay: '5 minutes',
    },
    dlqStrategy: {
        retention: '14 days',
        alerting: 'CloudWatch Alarm',
        processing: 'Manual review and replay',
    },
};

/**
 * Standard monitoring configuration for all event flows.
 * This ensures consistent monitoring and alerting across the system.
 */
export const MonitoringStrategy: MonitoringConfig = {
    metrics: [
        'SQS Queue Length',
        'DLQ Message Count',
        'Lambda Errors',
        'Processing Latency',
        'Event Success Rate',
    ],
    alerts: {
        dlqMessages: 'Any messages in DLQ',
        processingDelay: '> 5 minutes',
        errorRate: '> 1% of total events',
    },
};

/**
 * Helper function to get queue names for a specific event flow and environment
 */
export function getQueueNames(
    flowName: keyof typeof EventFlowPatterns,
    environment: string
): QueueConfig {
    const pattern = EventFlowPatterns[flowName];
    return {
        main: pattern.queues.main.replace('${environment}', environment),
        dlq: pattern.queues.dlq.replace('${environment}', environment),
    };
}

/**
 * Helper function to validate an event flow implementation
 */
export function validateEventFlow(
    flowName: keyof typeof EventFlowPatterns,
    implementation: Partial<EventFlowPattern>
): boolean {
    const pattern = EventFlowPatterns[flowName];

    // Basic validation of required components
    const hasRequiredComponents =
        implementation.source === pattern.source &&
        implementation.lambda === pattern.lambda &&
        implementation.queues?.main?.includes(pattern.queues.main) &&
        implementation.queues?.dlq?.includes(pattern.queues.dlq);

    if (!hasRequiredComponents) {
        console.error(`Event flow ${flowName} does not match the standard pattern`);
        return false;
    }

    return true;
}
