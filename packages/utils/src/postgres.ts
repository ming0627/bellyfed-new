/**
 * PostgreSQL Utility
 *
 * This module provides utility functions for interacting with a PostgreSQL database.
 * It includes a connection pool and functions for executing queries and transactions.
 */

import { Pool, PoolClient, QueryResult } from 'pg';

/**
 * PostgreSQL configuration interface
 * Represents the configuration for a PostgreSQL connection
 */
export interface PostgresConfig {
  /**
   * Connection string (takes precedence over individual connection parameters)
   */
  connectionString?: string;

  /**
   * Database host
   */
  host?: string;

  /**
   * Database port
   */
  port?: number;

  /**
   * Database name
   */
  database?: string;

  /**
   * Database user
   */
  user?: string;

  /**
   * Database password
   */
  password?: string;

  /**
   * SSL configuration
   */
  ssl?: boolean | { rejectUnauthorized: boolean };

  /**
   * Maximum number of clients in the pool
   */
  max?: number;

  /**
   * How long a client is allowed to remain idle before being closed
   */
  idleTimeoutMillis?: number;

  /**
   * How long to wait for a connection to become available
   */
  connectionTimeoutMillis?: number;
}

/**
 * Default PostgreSQL configuration
 */
const defaultConfig: PostgresConfig = {
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://bellyfed_admin:password@localhost:5432/bellyfed_dev',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Create a PostgreSQL connection pool
 * @param config PostgreSQL configuration
 * @returns PostgreSQL connection pool
 */
export function createPool(config: PostgresConfig = defaultConfig): Pool {
  return new Pool({
    ...defaultConfig,
    ...config,
  });
}

/**
 * PostgreSQL connection pool
 */
export const pool = createPool();

/**
 * Execute a query on the PostgreSQL database
 * @param text SQL query text
 * @param params Query parameters
 * @param customPool Optional custom connection pool
 * @returns Query result
 */
export async function query(
  text: string,
  params: any[] = [],
  customPool: Pool = pool,
): Promise<QueryResult> {
  const client = await customPool.connect();
  try {
    return await client.query(text, params);
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction on the PostgreSQL database
 * @param callback Function that executes queries within the transaction
 * @param customPool Optional custom connection pool
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  customPool: Pool = pool,
): Promise<T> {
  const client = await customPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error executing transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return a single row
 * @param text SQL query text
 * @param params Query parameters
 * @param customPool Optional custom connection pool
 * @returns Single row or null if not found
 */
export async function queryRow<T = any>(
  text: string,
  params: any[] = [],
  customPool: Pool = pool,
): Promise<T | null> {
  const result = await query(text, params, customPool);
  return result.rows.length > 0 ? (result.rows[0] as T) : null;
}

/**
 * Execute a query and return all rows
 * @param text SQL query text
 * @param params Query parameters
 * @param customPool Optional custom connection pool
 * @returns Array of rows
 */
export async function queryRows<T = any>(
  text: string,
  params: any[] = [],
  customPool: Pool = pool,
): Promise<T[]> {
  const result = await query(text, params, customPool);
  return result.rows as T[];
}

/**
 * Execute a query and return the number of affected rows
 * @param text SQL query text
 * @param params Query parameters
 * @param customPool Optional custom connection pool
 * @returns Number of affected rows
 */
export async function queryCount(
  text: string,
  params: any[] = [],
  customPool: Pool = pool,
): Promise<number> {
  const result = await query(text, params, customPool);
  return result.rowCount || 0;
}

/**
 * Close the PostgreSQL connection pool
 * @param customPool Optional custom connection pool
 */
export async function closePostgresPool(customPool: Pool = pool): Promise<void> {
  await customPool.end();
}

/**
 * Check if the PostgreSQL connection is working
 * @param customPool Optional custom connection pool
 * @returns True if the connection is working, false otherwise
 */
export async function checkConnection(
  customPool: Pool = pool,
): Promise<boolean> {
  try {
    const client = await customPool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking PostgreSQL connection:', error);
    return false;
  }
}
