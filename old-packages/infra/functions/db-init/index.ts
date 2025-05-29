import { Logger } from '@aws-lambda-powertools/logger';
import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const logger = new Logger({ serviceName: 'db-init' });
const secretsClient = new SecretsManagerClient();
const rdsClient = new RDSDataClient();
const ssmClient = new SSMClient();

/**
 * Handler for database initialization Lambda
 * This Lambda will initialize the database schema during deployment
 */
export const handler = async (event: unknown): Promise<Record<string, unknown>> => {
    logger.info('DB initialization Lambda triggered with event', { event });

    try {
        // Get database connection parameters from SSM and Secrets Manager
        const dbSecretArnParam = await ssmClient.send(
            new GetParameterCommand({
                Name: process.env.DB_SECRET_SSM_PATH,
            })
        );

        const dbSecretArn = dbSecretArnParam.Parameter?.Value;

        const dbHostParam = await ssmClient.send(
            new GetParameterCommand({
                Name: process.env.DB_HOST_SSM_PATH,
            })
        );

        const dbHost = dbHostParam.Parameter?.Value;

        const dbPortParam = await ssmClient.send(
            new GetParameterCommand({
                Name: process.env.DB_PORT_SSM_PATH,
            })
        );

        const dbPort = dbPortParam.Parameter?.Value;

        const dbNameParam = await ssmClient.send(
            new GetParameterCommand({
                Name: process.env.DB_NAME_SSM_PATH,
            })
        );

        const dbName = dbNameParam.Parameter?.Value;

        logger.info('Database connection parameters retrieved', {
            dbHost,
            dbPort,
            dbName,
        });

        // Get database credentials
        const secretResponse = await secretsClient.send(
            new GetSecretValueCommand({
                SecretId: dbSecretArn || '',
            })
        );

        const secretString = secretResponse.SecretString;

        if (!secretString) {
            throw new Error('Unable to retrieve database credentials');
        }

        // Parse secret string but don't assign to unused variable
        JSON.parse(secretString);

        // Execute initialization SQL
        const createTablesResult = await rdsClient.send(
            new ExecuteStatementCommand({
                secretArn: dbSecretArn,
                database: dbName,
                resourceArn: `arn:aws:rds:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:cluster:postgres-cluster-${process.env.ENVIRONMENT}`,
                sql: `
          -- Create tables if they don't exist
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            cognito_id VARCHAR(128) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            email_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS restaurants (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            cuisine_type VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER REFERENCES restaurants(id),
            user_id VARCHAR(36) REFERENCES users(id),
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `,
                includeResultMetadata: true,
            })
        );

        logger.info('Database tables initialized successfully', { createTablesResult });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database initialized successfully',
                timestamp: new Date().toISOString(),
            }),
        };
    } catch (error: unknown) {
        logger.error('Error initializing database', { error });

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error initializing database',
                error: error instanceof Error ? error.message : String(error),
            }),
        };
    }
};
