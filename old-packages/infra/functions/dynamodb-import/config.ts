// Import configuration from the main config file
import { CONFIG } from '../../lib/config';

// Get environment from environment variable
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

// Export configuration for the DynamoDB import function
export const FUNCTION_CONFIG = {
    // DynamoDB batch size
    BATCH_SIZE: CONFIG.dynamodb.batchSize,

    // Retry settings
    MAX_RETRIES: CONFIG.dynamodb.maxRetries,
    RETRY_DELAY_MS: CONFIG.dynamodb.retryDelayMs,

    // Table names with environment suffix
    ALLOWED_TABLES: CONFIG.dynamodb.tableNames.map((tableName) => `${tableName}-${ENVIRONMENT}`),

    // CloudWatch namespace
    CLOUDWATCH_NAMESPACE: `Bellyfed/${ENVIRONMENT}/Import`,
};
