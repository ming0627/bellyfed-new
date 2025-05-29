import { Pool } from 'pg';

// Create a PostgreSQL connection pool
export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://bellyfed_admin:password@localhost:5432/bellyfed_dev',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

/**
 * Execute a query on the PostgreSQL database
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export async function query(text: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction on the PostgreSQL database
 * @param callback Function that executes queries within the transaction
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (client: unknown) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
