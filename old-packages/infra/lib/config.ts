import * as process from 'process';

export interface EnvironmentConfigSettings {
    account: string;
    region: string;
    vpc: {
        maxAzs: number;
        natGateways: number;
        vpcCidr: string;
    };
    aurora: {
        minCapacity: number; // Minimum Aurora Capacity Units (ACUs) for Serverless v2 (0 to 128)
        maxCapacity: number; // Maximum Aurora Capacity Units (ACUs) for Serverless v2 (0.5 to 128)
        // Setting minCapacity to 0.5 or higher disables auto-pause functionality
    };
    lambda: {
        memorySize: number;
        timeoutSeconds: number;
    };
    email: {
        fromAddress: string;
        replyToAddress: string;
        sendingAccount: string;
    };
    ecs: {
        cpu: number;
        memoryLimitMiB: number;
        desiredCount: number;
        containerInsights: boolean;
        logRetentionDays: number;
        maxCapacity: number;
        minCapacity: number;
    };
    typesense: {
        cpu: number;
        memoryLimitMiB: number;
        desiredCount: number;
        containerInsights: boolean;
        logRetentionDays: number;
        maxCapacity: number;
        minCapacity: number;
        containerPort: number;
        apiKey: string;
    };
    slackWebhookUrl: string;
    alertEmail?: string; // Optional alert email address for notifications
}

// Default configurations for different environments
const defaultEnvironmentConfigs: Record<string, EnvironmentConfigSettings> = {
    prod: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '',
        region: 'ap-southeast-1',
        vpc: {
            maxAzs: 3,
            natGateways: 3,
            vpcCidr: '10.0.0.0/16',
        },
        aurora: {
            minCapacity: 0.5, // Minimum Aurora Capacity Units (ACUs) for Serverless v2 (0.5 to avoid auto-pause)
            maxCapacity: 1, // Reduced maximum capacity for cost savings
        },
        lambda: {
            memorySize: 256,
            timeoutSeconds: 10,
        },
        email: {
            fromAddress: 'no-reply@bellyfed.com',
            replyToAddress: 'no-reply@bellyfed.com',
            sendingAccount: 'DEVELOPER',
        },
        ecs: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1, // Reduced from 2 to 1 for cost savings
            containerInsights: false, // Disabled for cost savings
            logRetentionDays: 30,
            maxCapacity: 4, // Reduced from 10 to 4 for cost savings
            minCapacity: 1, // Reduced from 2 to 1 for cost savings
        },
        typesense: {
            cpu: 512, // 0.5 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.5 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 30,
            maxCapacity: 2,
            minCapacity: 1,
            containerPort: 8108,
            apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
        },
        slackWebhookUrl: process.env.PROD_SLACK_WEBHOOK_URL || '',
        alertEmail: process.env.PROD_ALERT_EMAIL || '',
    },
    qa: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '',
        region: 'ap-southeast-1',
        vpc: {
            maxAzs: 2,
            natGateways: 2,
            vpcCidr: '10.0.0.0/16',
        },
        aurora: {
            minCapacity: 0.5, // Minimum Aurora Capacity Units (ACUs) for Serverless v2 (0.5 to avoid auto-pause)
            maxCapacity: 1, // Reduced maximum capacity for cost savings
        },
        lambda: {
            memorySize: 192,
            timeoutSeconds: 10,
        },
        email: {
            fromAddress: 'no-reply@bellyfed.com',
            replyToAddress: 'no-reply@bellyfed.com',
            sendingAccount: 'DEVELOPER',
        },
        ecs: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false, // Disabled for cost savings
            logRetentionDays: 14,
            maxCapacity: 2, // Reduced from 4 to 2 for cost savings
            minCapacity: 1,
        },
        typesense: {
            cpu: 512, // 0.5 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.5 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 14,
            maxCapacity: 2,
            minCapacity: 1,
            containerPort: 8108,
            apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
        },
        slackWebhookUrl: process.env.QA_SLACK_WEBHOOK_URL || '',
        alertEmail: process.env.QA_ALERT_EMAIL || '',
    },
    dev: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '',
        region: 'ap-southeast-1',
        vpc: {
            maxAzs: 2,
            natGateways: 1,
            vpcCidr: '10.0.0.0/16',
        },
        aurora: {
            minCapacity: 0.5, // Minimum Aurora Capacity Units (ACUs) for Serverless v2 (0.5 to avoid auto-pause)
            maxCapacity: 1, // Maximum Aurora Capacity Units (ACUs) for Serverless v2
        },
        lambda: {
            memorySize: 128,
            timeoutSeconds: 10,
        },
        email: {
            fromAddress: 'no-reply@bellyfed.com',
            replyToAddress: 'no-reply@bellyfed.com',
            sendingAccount: 'DEVELOPER',
        },
        ecs: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 7,
            maxCapacity: 2,
            minCapacity: 1,
        },
        typesense: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 7,
            maxCapacity: 2,
            minCapacity: 1,
            containerPort: 8108,
            apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
        },
        slackWebhookUrl: process.env.DEV_SLACK_WEBHOOK_URL || '',
        alertEmail: process.env.DEV_ALERT_EMAIL || '',
    },
    test: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '',
        region: 'ap-southeast-1',
        vpc: {
            maxAzs: 2,
            natGateways: 1,
            vpcCidr: '10.0.0.0/16',
        },
        aurora: {
            minCapacity: 0.5, // Minimum Aurora Capacity Units (ACUs) for Serverless v2
            maxCapacity: 1, // Maximum Aurora Capacity Units (ACUs) for Serverless v2
        },
        lambda: {
            memorySize: 128,
            timeoutSeconds: 3,
        },
        email: {
            fromAddress: 'no-reply@bellyfed.com',
            replyToAddress: 'no-reply@bellyfed.com',
            sendingAccount: 'DEVELOPER',
        },
        ecs: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 7,
            maxCapacity: 2,
            minCapacity: 1,
        },
        typesense: {
            cpu: 256, // 0.25 vCPU
            memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
            desiredCount: 1,
            containerInsights: false,
            logRetentionDays: 7,
            maxCapacity: 2,
            minCapacity: 1,
            containerPort: 8108,
            apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
        },
        slackWebhookUrl: process.env.TEST_SLACK_WEBHOOK_URL || '',
        alertEmail: process.env.TEST_ALERT_EMAIL || '',
    },
};

// Updated to trigger CICD workflow - Fix webhook configuration
export const CONFIG = {
    cicdRegion: 'ap-southeast-1', // CI/CD region
    region: 'ap-southeast-1', // Region for application resources
    bootstrap: {
        // Bootstrap-specific configurations
    },
    app: {
        // Application-specific configurations
        // URL bases for different environments
        urlBases: {
            verification: {
                dev: 'http://localhost:3000',
                default: 'https://app.bellyfed.com',
            },
            resetPassword: {
                dev: 'http://localhost:3000',
                default: 'https://app.bellyfed.com',
            },
            api: {
                dev: 'https://api-dev.bellyfed.com',
                test: 'https://api-test.bellyfed.com',
                staging: 'https://api-staging.bellyfed.com',
                prod: 'https://api.bellyfed.com',
            },
        },
        // Naming patterns
        namingPatterns: {
            // Parameter store prefix
            paramPrefix: 'bellyfed',
            // Resource name prefixes
            resourcePrefix: 'bellyfed',
            // Domain name patterns
            apiDomainPattern: 'api-{environment}.bellyfed.com',
        },
    },
    // Authentication configuration (Cognito)
    auth: {
        // SSM parameter paths
        ssmPaths: {
            userPoolId: '/{paramPrefix}/{environment}/cognito/user-pool-id',
            userPoolClientId: '/{paramPrefix}/{environment}/cognito/user-pool-client-id',
            identityPoolId: '/{paramPrefix}/{environment}/cognito/identity-pool-id',
        },
        // Resource naming patterns
        namingPatterns: {
            userPool: 'bellyfed-user-pool-{environment}',
            userPoolClient: 'bellyfed-user-pool-client-{environment}',
            identityPool: 'bellyfed-identity-pool-{environment}',
        },
    },
    github: {
        owner: 'ming0627',
        repo: 'bellyfed',
        oauthSecretName: 'github-oauth-token',
    },
    frontend: {
        owner: 'ming0627',
        repo: 'bellyfed',
        branchMapping: {
            dev: 'develop',
            staging: 'staging',
            prod: 'main',
        },
        // Domain name patterns
        domainPattern: 'app-{environment}.bellyfed.com',
        // Security and caching settings for ECS Fargate
        security: {
            // Content Security Policy
            contentSecurityPolicy:
                "default-src 'self'; img-src 'self' data: https://* blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com; connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://*.execute-api.*.amazonaws.com https://*.bellyfed.com; font-src 'self' data: https://stackpath.bootstrapcdn.com https://fonts.gstatic.com; frame-ancestors 'none'; object-src 'none';",
            // Cache durations
            strictTransportSecurityMaxAge: 63072000, // 2 years in seconds
        },
    },
    // ECR repository configuration
    ecr: {
        // Repository naming patterns
        repositoryNamePattern: 'bellyfed-{environment}-app',
    },
    // Route53 and ACM configuration
    route53: {
        // Hosted zone ID for bellyfed.com
        hostedZoneId: 'Z05895961O4U27Y58ZXM1',
        // Certificate ARN for *.bellyfed.com
        certificateArn:
            'arn:aws:acm:ap-southeast-1:590184067494:certificate/bff2c8db-03a5-45a6-890e-b6dd7cecad7a',
    },
    // ECS service configuration
    ecs: {
        // Naming patterns
        namingPatterns: {
            cluster: 'bellyfed-{environment}',
            service: 'bellyfed-{environment}-app',
            taskDefinition: 'bellyfed-{environment}-app',
            container: 'bellyfed-{environment}-container',
            logGroup: '/aws/ecs/bellyfed-{environment}',
            executionRole: 'bellyfed-{environment}-execution-role',
            taskRole: 'bellyfed-{environment}-task-role',
            targetGroup: 'bellyfed-{environment}-tg',
            loadBalancer: 'bellyfed-{environment}',
            accessLogsBucket: 'bellyfed-alb-logs-{environment}-{account}',
        },
        // Container configuration
        container: {
            port: 3000,
            healthCheck: {
                command: ['CMD-SHELL', 'wget -q --spider http://localhost:3000/health || exit 1'],
                interval: 30, // seconds
                timeout: 5, // seconds
                retries: 3,
                startPeriod: 120, // seconds
            },
            // Default environment variables
            defaultEnvironmentVars: {
                NODE_ENV: 'production',
                PORT: '3000',
            },
        },
        // Auto scaling configuration
        scaling: {
            cpuTargetUtilizationPercent: 70,
            memoryTargetUtilizationPercent: 70,
            scaleInCooldown: 60, // seconds
            scaleOutCooldown: 60, // seconds
            requestsPerTarget: 1000,
        },
    },
    // Typesense service configuration
    typesense: {
        // Naming patterns
        namingPatterns: {
            service: 'bellyfed-typesense-{environment}',
            taskDefinition: 'bellyfed-typesense-{environment}',
            container: 'TypesenseContainer',
            logGroup: '/aws/ecs/typesense-{environment}',
        },
        // Docker Hub image
        dockerHubImage: 'typesense/typesense:28.0',
        // Container configuration
        container: {
            port: 8108,
            imageUri: 'typesense/typesense:28.0',
            healthCheck: {
                command: [
                    'CMD-SHELL',
                    'exit 0', // Use a simple health check that always succeeds to prevent task cycling
                ],
                interval: 30, // seconds
                timeout: 5, // seconds
                retries: 3,
                startPeriod: 60, // seconds - reduced since we're using a simple health check
            },
            environment: {
                TYPESENSE_DATA_DIR: '/data',
                TYPESENSE_ENABLE_CORS: 'true',
                ECS_ENABLE_CONTAINER_METADATA: 'true',
                PLATFORM: 'linux/amd64',
            },
        },
        // Auto scaling configuration
        scaling: {
            cpuTargetUtilizationPercent: 70,
            memoryTargetUtilizationPercent: 70,
            scaleInCooldown: 60, // seconds
            scaleOutCooldown: 60, // seconds
        },
    },
    // Health check configuration
    healthCheck: {
        // ALB target group health check
        targetGroup: {
            path: '/health',
            interval: 30, // seconds
            timeout: 10, // seconds
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 3,
            healthyHttpCodes: '200-299',
        },
    },
    // API Gateway configuration
    apiGateway: {
        stageName: 'v1',
        throttling: {
            rateLimit: 10,
            burstLimit: 20,
        },
        quota: {
            limit: 10000,
            period: 'DAY',
        },
        // Custom domain configuration
        customDomain: {
            enabled: false, // Set to true when ready to use custom domains
            basePath: 'v1',
        },
    },
    // SQS configuration
    sqs: {
        // Queue name prefix
        queueNamePrefix: 'bellyfed',
        // Default visibility timeout
        defaultVisibilityTimeout: 5 * 60, // 5 minutes in seconds
        // Default retention period
        defaultRetentionPeriod: 14, // 14 days
        // Standard queue names
        queueNames: {
            import: 'import-queue',
            write: 'write-queue',
            analytics: 'analytics-queue',
            authEvent: 'auth-event-queue',
            query: 'query-queue',
            userSignup: 'user-signup-queue',
        },
    },
    // DynamoDB configuration
    dynamodb: {
        // Table name suffixes
        tableNames: [
            'FoodEstablishment',
            'MenuItem',
            'Review',
            'Schedule',
            'User',
            'Interaction',
            'Ranking',
        ],
        // Batch operations
        batchSize: 25, // DynamoDB BatchWrite limit is 25 items
        // Retry settings
        maxRetries: 3,
        retryDelayMs: 1000,
    },
    // Event bus configuration
    eventBridge: {
        // Event bus name patterns
        eventBusNames: {
            user: 'bellyfed-domain-user-{environment}',
            auth: 'bellyfed-domain-auth-{environment}',
            system: 'bellyfed-infra-system-{environment}',
            analytics: 'bellyfed-analytics-{environment}',
        },
    },
    // Lambda defaults
    lambda: {
        defaultMemorySize: 128,
        defaultTimeout: 15, // seconds
        defaultMaxRetries: 3,
        defaultHandler: 'index.handler',
        // Default retention periods
        dlqRetentionDays: 14,
        retryQueueRetentionDays: 7,
        // Default environment variables
        defaultEnvironmentVars: {
            LOG_LEVEL: 'info',
            NODE_OPTIONS: '--enable-source-maps',
        },
        // Lambda function naming patterns
        namingPatterns: {
            function: 'bellyfed-{environment}-{name}',
            layer: 'bellyfed-{environment}-{name}-layer',
            role: 'bellyfed-{environment}-lambda-role',
        },
        // Queue configurations
        queues: {
            userSignup: {
                name: 'bellyfed-user-signup-queue-{environment}',
                visibilityTimeoutSeconds: 300,
                retentionPeriodDays: 14,
            },
        },
        // Default environment variables for all Lambda functions
        defaultEnvironment: {
            LOG_LEVEL: 'info',
            NODE_OPTIONS: '--enable-source-maps',
            VERIFICATION_URL_BASE: 'https://app.bellyfed.com',
            RESET_PASSWORD_URL_BASE: 'https://app.bellyfed.com',
        },
    },
    // SSM Parameter paths
    ssm: {
        hostedZoneIdPath: '/bellyfed/{environment}/route53/hosted-zone-id',
        certificateArnPath: '/bellyfed/{environment}/certificate/wildcard-certificate-arn',
        apiCertificateArnPath: '/bellyfed/{environment}/certificate/api-certificate-arn',
        // Database paths
        dbHostPath: '/bellyfed/{environment}/db/host',
        dbPortPath: '/bellyfed/{environment}/db/port',
        dbNamePath: '/bellyfed/{environment}/db/name',
        // SQS paths
        sqsPathPattern: '/bellyfed/{environment}/sqs/{queue-name}-arn',
        // Lambda paths
        lambdaPathPattern: '/bellyfed/{environment}/lambda/{lambda-name}',
        // Auth paths
        authUrlPath: '/bellyfed/{environment}/auth/url',
        authAudiencePath: '/bellyfed/{environment}/auth/audience',
        authClientIdPath: '/bellyfed/{environment}/auth/client-id',
    },
    // Cache durations
    cache: {
        defaultDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    // Formatting patterns for consistent logging and responses
    formatting: {
        // Duration formatting for logs and responses
        duration: {
            toFixed: 2, // Number of decimal places for duration values
            unit: 'ms', // Unit for duration values
            format: (durationMs: number) => `${durationMs.toFixed(2)}ms`,
        },
        // Date formatting
        date: {
            iso: true, // Use ISO format for dates
            dateOnly: 'YYYY-MM-DD', // Format for date-only strings
            isoFormat: () => new Date().toISOString(),
            dateOnlyFormat: () => new Date().toISOString().split('T')[0],
        },
        // Response formatting
        response: {
            includeRequestId: true, // Include request ID in responses
            includeTimestamp: true, // Include timestamp in responses
        },
    },
    // Query parameters defaults and limits
    query: {
        pagination: {
            defaultLimit: 12,
            maxLimit: 50,
            defaultOffset: 0,
        },
        // Common query parameter names
        paramNames: {
            limit: 'limit',
            offset: 'offset',
            nextToken: 'nextToken',
            searchTerm: 'q',
            city: 'city',
            cuisineType: 'cuisine_type',
            minRating: 'minRating',
            maxPrice: 'maxPrice',
        },
    },
    // Analytics event types and sources
    analytics: {
        eventTypes: {
            restaurantGet: 'RESTAURANT_GET',
            restaurantsListed: 'RESTAURANTS_LISTED',
            restaurantsSearched: 'RESTAURANTS_SEARCHED',
            menuViewed: 'MENU_VIEWED',
            menuItemViewed: 'MENU_ITEM_VIEWED',
            userEngagement: 'USER_ENGAGEMENT',
            pageView: 'PAGE_VIEW',
        },
        sources: {
            restaurantQuery: 'restaurant-query',
            rdsRestaurantQuery: 'rds-restaurant-query',
            menuQuery: 'menu-query',
            analyticsService: 'analytics-service',
        },
        maxRetries: 3,
    },
    // Common HTTP headers
    http: {
        headers: {
            cors: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Content-Type': 'application/json',
            },
            security: {
                'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
        },
        statusCodes: {
            ok: 200,
            created: 201,
            badRequest: 400,
            unauthorized: 401,
            forbidden: 403,
            notFound: 404,
            serverError: 500,
        },
    },
    // Database operations
    database: {
        // RDS operations
        rds: {
            // Common SQL queries
            queries: {
                getRestaurantById: `
                    SELECT * FROM restaurants
                    WHERE restaurant_id = :id
                `,
                listRestaurants: `
                    SELECT * FROM restaurants
                    {WHERE_CLAUSE}
                    ORDER BY name LIMIT :limit OFFSET :offset
                `,
                countRestaurants: `
                    SELECT COUNT(*) as total FROM restaurants
                    {WHERE_CLAUSE}
                `,
                searchRestaurants: `
                    SELECT * FROM restaurants
                    WHERE
                        name ILIKE :searchTerm OR
                        :searchTerm = ANY(cuisine_type) OR
                        address ILIKE :searchTerm OR
                        city ILIKE :searchTerm
                    ORDER BY name
                    LIMIT :limit OFFSET :offset
                `,
            },
        },
        // DynamoDB operations
        dynamodb: {
            // Common expression attribute names
            expressionAttributeNames: {
                count: '#count',
                lastUpdated: '#lastUpdated',
                deviceTypes: '#deviceTypes',
                device: '#device',
            },
            // TTL values
            ttl: {
                analytics: 90 * 24 * 60 * 60, // 90 days in seconds
                session: 7 * 24 * 60 * 60, // 7 days in seconds
            },
        },
    },
    // Common utility functions
    utils: {
        // Performance measurement
        measureTime: (startTime: [number, number]): number => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            return seconds * 1000 + nanoseconds / 1000000;
        },
        // Generate a unique ID
        generateId: (): string => {
            return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        },
        // Get today's date in YYYY-MM-DD format
        getToday: (): string => {
            return new Date().toISOString().split('T')[0];
        },
    },
    defaultEnvironmentConfigs,

    // Get environment config based on environment name
    getEnvironmentConfig: (environmentName: string): EnvironmentConfigSettings => {
        // First check if this is a standard environment
        if (defaultEnvironmentConfigs[environmentName]) {
            return defaultEnvironmentConfigs[environmentName];
        }

        // For custom environments, use the dev configuration as a base
        // This can be extended with more sophisticated logic if needed
        return {
            ...defaultEnvironmentConfigs['dev'],
            slackWebhookUrl: process.env.DEV_SLACK_WEBHOOK_URL || '',
            alertEmail: process.env.DEV_ALERT_EMAIL || '',
            // Use minimal ECS resources for custom environments
            ecs: {
                cpu: 256, // 0.25 vCPU
                memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
                desiredCount: 1,
                containerInsights: false,
                logRetentionDays: 7,
                maxCapacity: 2,
                minCapacity: 1,
            },
            // Add Typesense configuration for custom environments
            typesense: {
                cpu: 256, // 0.25 vCPU
                memoryLimitMiB: 1024, // 1GB - valid combination with 0.25 vCPU for Fargate
                desiredCount: 1,
                containerInsights: false,
                logRetentionDays: 7,
                maxCapacity: 2,
                minCapacity: 1,
                containerPort: 8108,
                apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
            },
        };
    },
} as const;
