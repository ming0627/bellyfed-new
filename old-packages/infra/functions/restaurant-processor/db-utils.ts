/**
 * Database Utility Functions for Restaurant Processor Lambda
 *
 * This module provides database connection and query execution functions
 * for the restaurant processor Lambda function.
 */

import { Pool, QueryResult } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Initialize SecretsManager client
const secretsManagerClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Database connection pool
let pool: Pool | null = null;

/**
 * Database credentials interface
 */
interface DbCredentials {
    host: string;
    port: number;
    dbname: string;
    username: string;
    password: string;
}

/**
 * Get database credentials from Secrets Manager
 */
async function getDbCredentials(): Promise<DbCredentials> {
    const secretName = process.env.DB_SECRET_NAME;

    if (!secretName) {
        throw new Error('DB_SECRET_NAME environment variable is not set');
    }

    try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await secretsManagerClient.send(command);

        if (!response.SecretString) {
            throw new Error('Secret string is empty');
        }

        return JSON.parse(response.SecretString) as DbCredentials;
    } catch (error: unknown) {
        console.error('Error retrieving database credentials:', error);
        throw error;
    }
}

/**
 * Get database connection pool
 */
async function getPool(): Promise<Pool> {
    if (pool) {
        return pool;
    }

    try {
        // If using environment variables directly
        if (process.env.DATABASE_URL) {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl:
                    process.env.NODE_ENV === 'production'
                        ? { rejectUnauthorized: false }
                        : undefined,
            });
            return pool;
        }

        // If using Secrets Manager
        const credentials = await getDbCredentials();

        pool = new Pool({
            host: credentials.host,
            port: credentials.port,
            database: credentials.dbname,
            user: credentials.username,
            password: credentials.password,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });

        return pool;
    } catch (error: unknown) {
        console.error('Error creating database pool:', error);
        throw error;
    }
}

/**
 * Execute a database query
 */
export async function executeQuery(text: string, params: unknown[] = []): Promise<QueryResult> {
    const pool = await getPool();

    try {
        console.log('Executing query:', {
            text,
            params: params.map((p) => (typeof p === 'object' ? '[Object]' : p)),
        });
        const result = await pool.query(text, params);
        console.log('Query result:', { rowCount: result.rowCount });
        return result;
    } catch (error: unknown) {
        console.error('Error executing query:', error);
        throw error;
    }
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
