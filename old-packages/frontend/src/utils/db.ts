/**
 * Database utility functions
 *
 * This module provides functions for interacting with the PostgreSQL database
 */

import { Pool, PoolClient } from 'pg';

// Define the QueryResult type for compatibility
export interface QueryResult {
  rows: any[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

// Database connection pool
let pool: Pool | null = null;

/**
 * Initialize the database connection pool
 */
async function initializePool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    // Get database credentials from environment variables
    const dbConfig = {
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
    };

    // Alternative: use DATABASE_URL if available
    const connectionString = process.env.DATABASE_URL;

    // Create the pool with the configuration
    pool = new Pool(
      connectionString
        ? {
            connectionString,
            ssl:
              process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : undefined,
          }
        : {
            ...dbConfig,
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
            connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
          },
    );

    // Test the connection
    const client = await pool.connect();
    client.release();

    console.log('Database connection pool initialized');
    return pool;
  } catch (error: unknown) {
    console.error('Error initializing database connection pool:', error);

    // Log error but don't fall back to mock implementation
    console.warn(
      'Failed to initialize database pool. Please check your database configuration.',
    );

    throw error;
  }
}

/**
 * Execute a database query
 *
 * @param text SQL query
 * @param params Query parameters
 * @returns Query result
 */
export async function executeQuery(
  text: string,
  params: any[] = [],
): Promise<QueryResult> {
  try {
    const dbPool = await initializePool();

    if (!dbPool) {
      throw new Error('Failed to initialize database pool');
    }

    const result = await dbPool.query(text, params);
    return result as unknown as QueryResult;
  } catch (error: unknown) {
    console.error('Error executing query:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a database query in a transaction
 *
 * @param callback Function that executes queries in a transaction
 * @returns Result of the callback function
 */
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient | null = null;

  try {
    const dbPool = await initializePool();

    if (!dbPool) {
      throw new Error('Failed to initialize database pool');
    }

    client = await dbPool.connect();

    // Begin transaction
    await client.query('BEGIN');

    // Execute callback
    const result = await callback(client);

    // Commit transaction
    await client.query('COMMIT');

    return result;
  } catch (error: unknown) {
    // Rollback transaction on error
    if (client) {
      await client.query('ROLLBACK');
    }

    console.error('Error executing transaction:', error);
    throw error;
  } finally {
    // Release client back to the pool
    if (client) {
      client.release();
    }
  }
}
