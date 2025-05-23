/**
 * Database Utilities
 *
 * This module provides functions for interacting with the PostgreSQL database.
 * It includes functions for executing queries and transactions.
 */

import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';

/**
 * Query Result interface
 * Represents the result of a database query
 */
export interface QueryResult {
  rows: any[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

/**
 * Database configuration interface
 * Represents the configuration for a database connection
 */
export interface DbConfig {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
  connectionString?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Database connection pool
let pool: Pool | null = null;

/**
 * Initialize the database connection pool
 * @param config Optional database configuration to override environment variables
 * @returns The database connection pool
 */
export async function initializePool(config?: DbConfig): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    // Get database credentials from environment variables
    const dbConfig: DbConfig = {
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
      ...config, // Override with provided config if any
    };

    // Alternative: use DATABASE_URL if available
    const connectionString = process.env.DATABASE_URL || config?.connectionString;

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
            max: dbConfig.max || 20, // Maximum number of clients in the pool
            idleTimeoutMillis: dbConfig.idleTimeoutMillis || 30000, // How long a client is allowed to remain idle before being closed
            connectionTimeoutMillis: dbConfig.connectionTimeoutMillis || 2000, // How long to wait for a connection to become available
          },
    );

    // Set up error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

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
 * @param text SQL query
 * @param params Query parameters
 * @returns Query result
 */
export async function executeQuery(
  text: string,
  params: any[] = [],
): Promise<QueryResult> {
  try {
    const dbPool = pool || await initializePool();

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
 * @param callback Function that executes queries in a transaction
 * @returns Result of the callback function
 */
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient | null = null;

  try {
    const dbPool = pool || await initializePool();

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
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
        // Still throw the original error
      }
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

/**
 * Close the database connection pool
 * This should be called when the application is shutting down
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

/**
 * Execute multiple queries in a batch
 * @param queries Array of query objects with text and params
 * @returns Array of query results
 */
export async function executeBatchQueries(
  queries: Array<{ text: string; params?: any[] }>,
): Promise<QueryResult[]> {
  try {
    const results: QueryResult[] = [];
    
    for (const query of queries) {
      const result = await executeQuery(query.text, query.params || []);
      results.push(result);
    }
    
    return results;
  } catch (error: unknown) {
    console.error('Error executing batch queries:', error);
    throw error;
  }
}

/**
 * Execute a query and return a single row
 * @param text SQL query
 * @param params Query parameters
 * @returns Single row or null if not found
 */
export async function executeQuerySingleRow<T = any>(
  text: string,
  params: any[] = [],
): Promise<T | null> {
  try {
    const result = await executeQuery(text, params);
    return result.rows.length > 0 ? result.rows[0] as T : null;
  } catch (error: unknown) {
    console.error('Error executing query for single row:', error);
    throw error;
  }
}

/**
 * Execute a query and return all rows
 * @param text SQL query
 * @param params Query parameters
 * @returns Array of rows
 */
export async function executeQueryRows<T = any>(
  text: string,
  params: any[] = [],
): Promise<T[]> {
  try {
    const result = await executeQuery(text, params);
    return result.rows as T[];
  } catch (error: unknown) {
    console.error('Error executing query for rows:', error);
    throw error;
  }
}
