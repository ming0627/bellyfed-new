/**
 * Process User Signup Lambda
 *
 * This Lambda is triggered by SQS events containing user registration data.
 * It processes the registration data and stores it in the PostgreSQL database.
 *
 * Changes made:
 * - Modified to use PostgreSQL instead of DynamoDB for storage
 * - Added connection to RDS Data API
 * - Improved error handling and logging
 * - Added circuit breaker pattern
 * - Added idempotent processing
 * - Added detailed logging
 * - Added retry with exponential backoff
 */

import {
    ExecuteStatementCommand,
    ExecuteStatementCommandInput,
    RDSDataClient,
    RDSDataServiceException,
} from '@aws-sdk/client-rds-data';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { SQSHandler, SQSRecord } from 'aws-lambda';

// Initialize AWS clients with retry configuration
const rdsClient = new RDSDataClient({
    maxAttempts: 3, // Retry up to 3 times
    retryMode: 'standard', // Use exponential backoff
});
const ssmClient = new SSMClient({
    maxAttempts: 3,
    retryMode: 'standard',
});

// Circuit breaker state
let circuitOpen = false;
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute

interface SignupEvent {
    event_id: string;
    timestamp: string;
    event_type: string;
    source: string;
    version: string;
    trace_id: string;
    user_id: string;
    status: string;
    payload: {
        email: string;
        username: string;
        nickname?: string;
        sub?: string;
        [key: string]: unknown;
    };
}

// Helper function to implement circuit breaker pattern
function checkCircuitBreaker(): boolean {
    // If circuit is open, check if it's time to try again
    if (circuitOpen) {
        const now = Date.now();
        if (now - lastFailureTime > CIRCUIT_RESET_TIMEOUT) {
            console.log('Circuit breaker: Resetting circuit to half-open state');
            circuitOpen = false;
            failureCount = 0;
            return true;
        }
        return false;
    }
    return true;
}

// Helper function to record failures for circuit breaker
function recordFailure(): void {
    failureCount++;
    lastFailureTime = Date.now();

    if (failureCount >= FAILURE_THRESHOLD) {
        console.log(`Circuit breaker: Opening circuit after ${failureCount} failures`);
        circuitOpen = true;
    }
}

// Helper function to record success for circuit breaker
function recordSuccess(): void {
    if (circuitOpen) {
        console.log('Circuit breaker: Closing circuit after successful operation');
        circuitOpen = false;
    }
    failureCount = 0;
}

// Helper function to process a single record with retries
async function processRecord(
    record: SQSRecord,
    dbConfig: { secretArn: string; dbName: string; clusterArn: string }
): Promise<void> {
    const { secretArn, dbName, clusterArn } = dbConfig;
    const MAX_RETRIES = 3;
    const BASE_DELAY = 200; // ms

    // Check if circuit breaker allows processing
    if (!checkCircuitBreaker()) {
        console.log('Circuit breaker open, skipping processing');
        throw new Error('Circuit breaker open');
    }

    try {
        // Parse the event
        const signupEvent = JSON.parse(record.body) as SignupEvent;
        const eventId = signupEvent.event_id;
        const traceId = signupEvent.trace_id;

        console.log(`Processing signup [Event ID: ${eventId}, Trace ID: ${traceId}]`, {
            userId: signupEvent.user_id,
            email: signupEvent.payload.email,
            source: signupEvent.source,
        });

        // Extract user data
        const { payload, user_id, timestamp } = signupEvent;
        const { email, username, sub, nickname } = payload;

        // Format name from available attributes
        const name =
            payload.name ||
            (payload.given_name && payload.family_name
                ? `${payload.given_name} ${payload.family_name}`
                : username);

        // Check if user already exists (idempotent processing)
        const userExists = await checkUserExists(user_id, sub || user_id, dbConfig);
        if (userExists) {
            console.log(
                `User already exists in database, skipping insertion [User ID: ${user_id}, Cognito ID: ${sub || user_id}]`
            );
            recordSuccess();
            return;
        }

        // Insert into PostgreSQL with retries
        let retryCount = 0;
        let lastError;

        while (retryCount < MAX_RETRIES) {
            try {
                const commandInput: ExecuteStatementCommandInput = {
                    secretArn,
                    database: dbName,
                    resourceArn: clusterArn,
                    sql: `
                        INSERT INTO users (
                            id,
                            cognito_id,
                            email,
                            name,
                            nickname,
                            phone,
                            email_verified,
                            profile_image_url,
                            bio,
                            location,
                            preferences,
                            created_at,
                            updated_at
                        )
                        VALUES (
                            :id,
                            :cognito_id,
                            :email,
                            :name,
                            :nickname,
                            :phone,
                            :email_verified,
                            :profile_image_url,
                            :bio,
                            :location,
                            :preferences,
                            :created_at,
                            :updated_at
                        )
                        ON CONFLICT (cognito_id) DO NOTHING
                    `,
                    parameters: [
                        { name: 'id', value: { stringValue: user_id as string } },
                        { name: 'cognito_id', value: { stringValue: (sub || user_id) as string } },
                        { name: 'email', value: { stringValue: email as string } },
                        { name: 'name', value: { stringValue: (name as string) || '' } },
                        {
                            name: 'nickname',
                            value: { stringValue: ((nickname || username) as string) || '' },
                        },
                        {
                            name: 'phone',
                            value: { stringValue: (payload.phone_number as string) || '' },
                        },
                        {
                            name: 'email_verified',
                            value: { booleanValue: payload.email_verified === 'true' },
                        },
                        {
                            name: 'profile_image_url',
                            value: { stringValue: (payload.picture as string) || '' },
                        },
                        { name: 'bio', value: { stringValue: '' } },
                        { name: 'location', value: { stringValue: '' } },
                        { name: 'preferences', value: { stringValue: '{}' } },
                        { name: 'created_at', value: { stringValue: timestamp as string } },
                        { name: 'updated_at', value: { stringValue: timestamp as string } },
                    ],
                    includeResultMetadata: true,
                };

                await rdsClient.send(new ExecuteStatementCommand(commandInput));

                console.log(
                    `Successfully stored user in PostgreSQL [User ID: ${user_id}, Email: ${email}]`
                );
                recordSuccess();
                return;
            } catch (error: unknown) {
                lastError = error;
                retryCount++;

                if (retryCount < MAX_RETRIES) {
                    // Exponential backoff with jitter
                    const delay = Math.floor(
                        BASE_DELAY * Math.pow(2, retryCount) * (0.5 + Math.random() * 0.5)
                    );
                    console.log(
                        `Retry ${retryCount}/${MAX_RETRIES} after ${delay}ms for user ${user_id}`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        // If we get here, all retries failed
        recordFailure();
        throw lastError;
    } catch (error: unknown) {
        recordFailure();
        console.error('Error processing user signup:', error);

        // Determine if error is retriable
        const isRetriable =
            error instanceof RDSDataServiceException &&
            (error.name === 'ServiceUnavailableException' ||
                error.name === 'InternalServerErrorException' ||
                error.name === 'ThrottlingException');

        if (isRetriable) {
            throw error; // Let SQS handle retry through DLQ
        } else {
            // For non-retriable errors, log and move on
            console.error('Non-retriable error, skipping record:', error);
        }
    }
}

// Helper function to check if user already exists
async function checkUserExists(
    userId: string,
    cognitoId: string,
    dbConfig: { secretArn: string; dbName: string; clusterArn: string }
): Promise<boolean> {
    const { secretArn, dbName, clusterArn } = dbConfig;

    try {
        const commandInput: ExecuteStatementCommandInput = {
            secretArn,
            database: dbName,
            resourceArn: clusterArn,
            sql: `
                SELECT COUNT(*) as count
                FROM users
                WHERE id = :id OR cognito_id = :cognito_id
            `,
            parameters: [
                { name: 'id', value: { stringValue: userId as string } },
                { name: 'cognito_id', value: { stringValue: cognitoId as string } },
            ],
            includeResultMetadata: true,
        };

        const result = await rdsClient.send(new ExecuteStatementCommand(commandInput));

        if (result.records && result.records.length > 0) {
            const count = parseInt(result.records[0][0].longValue?.toString() || '0');
            return count > 0;
        }

        return false;
    } catch (error: unknown) {
        console.error('Error checking if user exists:', error);
        return false; // Assume user doesn't exist if check fails
    }
}

export const handler: SQSHandler = async (event) => {
    // Get environment variables
    const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
    const DB_SECRET_SSM_PATH =
        process.env.DB_SECRET_SSM_PATH || `/bellyfed/${ENVIRONMENT}/db/secret`;
    const DB_NAME_SSM_PATH = process.env.DB_NAME_SSM_PATH || `/bellyfed/${ENVIRONMENT}/db/name`;
    const DB_CLUSTER_ARN_SSM_PATH =
        process.env.DB_CLUSTER_ARN_SSM_PATH || `/bellyfed/${ENVIRONMENT}/db/cluster-arn`;

    console.log(`Processing ${event.Records.length} user signup events`);

    try {
        // Fetch database configuration from SSM
        const [dbSecretArnResponse, dbNameResponse, dbClusterArnResponse] = await Promise.all([
            ssmClient.send(new GetParameterCommand({ Name: DB_SECRET_SSM_PATH })),
            ssmClient.send(new GetParameterCommand({ Name: DB_NAME_SSM_PATH })),
            ssmClient.send(new GetParameterCommand({ Name: DB_CLUSTER_ARN_SSM_PATH })),
        ]);

        const dbSecretArn = dbSecretArnResponse.Parameter?.Value;
        const dbName = dbNameResponse.Parameter?.Value;
        const dbClusterArn = dbClusterArnResponse.Parameter?.Value;

        if (!dbSecretArn || !dbName || !dbClusterArn) {
            throw new Error('Database configuration parameters are missing');
        }

        const dbConfig = { secretArn: dbSecretArn, dbName, clusterArn: dbClusterArn };

        // Process records in parallel with a limit of 5 concurrent operations
        const results = [];
        for (let i = 0; i < event.Records.length; i += 5) {
            const batch = event.Records.slice(i, i + 5);
            const batchResults = await Promise.allSettled(
                batch.map((record) => processRecord(record, dbConfig))
            );
            results.push(...batchResults);
        }

        // Check for any failures
        const failures = results.filter((r) => r.status === 'rejected');
        if (failures.length > 0) {
            console.error(`${failures.length} records failed processing`);

            // If all records failed, throw an error to trigger SQS retry
            if (failures.length === event.Records.length) {
                throw new Error('All records failed processing');
            }
        }

        console.log(
            `Successfully processed ${results.length - failures.length} out of ${results.length} records`
        );
    } catch (error: unknown) {
        console.error('Error in handler:', error);
        throw error; // Let SQS handle retry
    }
};
