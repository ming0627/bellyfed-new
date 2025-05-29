/**
 * Database Utilities for User Account Processor
 *
 * This module provides utilities for connecting to the database and executing queries.
 */

import { Pool, QueryResult } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Initialize SecretsManager client
const secretsManagerClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Create a connection pool
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
 * Get a database connection pool
 */
async function getPool(): Promise<Pool> {
    if (pool) {
        return pool;
    }

    try {
        const credentials = await getDbCredentials();

        pool = new Pool({
            host: credentials.host,
            port: credentials.port,
            database: credentials.dbname,
            user: credentials.username,
            password: credentials.password,
            ssl: {
                rejectUnauthorized: false,
            },
            max: 5, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
            connectionTimeoutMillis: 10000, // How long to wait for a connection to become available
        });

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            pool = null;
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
        return await pool.query(text, params);
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
