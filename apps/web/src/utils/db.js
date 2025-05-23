/**
 * Database Utilities
 *
 * This module provides functions for interacting with the PostgreSQL database.
 * It includes functions for executing queries and transactions.
 */

import { getEnvironmentName } from './environment.js'

/**
 * Database configuration interface
 * Represents the configuration for a database connection
 */
export const DbConfig = {
  user: '',
  password: '',
  host: '',
  port: 5432,
  database: '',
  connectionString: '',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

/**
 * Query Result interface
 * Represents the result of a database query
 */
export const QueryResult = {
  rows: [],
  rowCount: 0,
  command: '',
  oid: 0,
  fields: []
}

// Database connection pool reference
let pool = null

/**
 * Get default database configuration from environment variables
 * @returns {object} Database configuration object
 */
export function getDefaultDbConfig() {
  const environment = getEnvironmentName()
  
  return {
    user: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'bellyfed_admin',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || `bellyfed_${environment}`,
    connectionString: process.env.DATABASE_URL,
    ssl: environment === 'production' ? { rejectUnauthorized: false } : undefined,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
  }
}

/**
 * Initialize the database connection pool
 * @param {object} config Optional database configuration to override environment variables
 * @returns {Promise<object>} The database connection pool
 */
export async function initializePool(config = {}) {
  if (pool) {
    return pool
  }

  try {
    // For browser environment, return a mock pool
    if (typeof window !== 'undefined') {
      console.warn('Database operations not available in browser environment')
      return null
    }

    // Dynamic import for Node.js only
    const { Pool } = await import('pg')
    
    // Get database configuration
    const dbConfig = {
      ...getDefaultDbConfig(),
      ...config
    }

    // Create the pool with the configuration
    if (dbConfig.connectionString) {
      pool = new Pool({
        connectionString: dbConfig.connectionString,
        ssl: dbConfig.ssl,
        max: dbConfig.max,
        idleTimeoutMillis: dbConfig.idleTimeoutMillis,
        connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
      })
    } else {
      pool = new Pool({
        user: dbConfig.user,
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        ssl: dbConfig.ssl,
        max: dbConfig.max,
        idleTimeoutMillis: dbConfig.idleTimeoutMillis,
        connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
      })
    }

    // Test the connection
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()

    console.log('Database pool initialized successfully')
    return pool
  } catch (error) {
    console.error('Error initializing database pool:', error)
    throw new Error(`Failed to initialize database pool: ${error.message}`)
  }
}

/**
 * Get the current database pool
 * @returns {Promise<object|null>} The database pool or null if not initialized
 */
export async function getPool() {
  if (!pool) {
    return await initializePool()
  }
  return pool
}

/**
 * Execute a database query
 * @param {string} text SQL query
 * @param {Array} params Query parameters
 * @returns {Promise<object>} Query result
 */
export async function executeQuery(text, params = []) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Database operations not available in browser environment')
    }

    const dbPool = await getPool()
    
    if (!dbPool) {
      throw new Error('Failed to get database pool')
    }

    const result = await dbPool.query(text, params)
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command,
      oid: result.oid,
      fields: result.fields
    }
  } catch (error) {
    console.error('Error executing query:', error)
    console.error('Query:', text)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Execute a database transaction
 * @param {Function} callback Function that executes queries within the transaction
 * @returns {Promise<any>} Result of the callback function
 */
export async function executeTransaction(callback) {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations not available in browser environment')
  }

  let client = null

  try {
    const dbPool = await getPool()
    
    if (!dbPool) {
      throw new Error('Failed to get database pool')
    }

    client = await dbPool.connect()

    // Begin transaction
    await client.query('BEGIN')

    // Execute callback with client
    const result = await callback(client)

    // Commit transaction
    await client.query('COMMIT')

    return result
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError)
      }
    }

    console.error('Error executing transaction:', error)
    throw error
  } finally {
    // Release client back to the pool
    if (client) {
      client.release()
    }
  }
}

/**
 * Check if the database connection is working
 * @returns {Promise<boolean>} True if the connection is working, false otherwise
 */
export async function checkConnection() {
  try {
    if (typeof window !== 'undefined') {
      return false
    }

    const dbPool = await getPool()
    
    if (!dbPool) {
      return false
    }

    const client = await dbPool.connect()
    try {
      await client.query('SELECT 1')
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error checking database connection:', error)
    return false
  }
}

/**
 * Close the database connection pool
 * @returns {Promise<void>}
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.end()
      pool = null
      console.log('Database pool closed successfully')
    } catch (error) {
      console.error('Error closing database pool:', error)
      throw error
    }
  }
}

/**
 * Get database connection status
 * @returns {Promise<object>} Connection status information
 */
export async function getConnectionStatus() {
  try {
    const isConnected = await checkConnection()
    const dbPool = await getPool()
    
    return {
      isConnected,
      hasPool: !!dbPool,
      poolInfo: dbPool ? {
        totalCount: dbPool.totalCount,
        idleCount: dbPool.idleCount,
        waitingCount: dbPool.waitingCount
      } : null,
      environment: getEnvironmentName(),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting connection status:', error)
    return {
      isConnected: false,
      hasPool: false,
      poolInfo: null,
      error: error.message,
      environment: getEnvironmentName(),
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Execute a query with automatic retry logic
 * @param {string} text SQL query
 * @param {Array} params Query parameters
 * @param {number} maxRetries Maximum number of retries
 * @param {number} retryDelay Delay between retries in milliseconds
 * @returns {Promise<object>} Query result
 */
export async function executeQueryWithRetry(text, params = [], maxRetries = 3, retryDelay = 1000) {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeQuery(text, params)
    } catch (error) {
      lastError = error
      console.warn(`Query attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  throw lastError
}

/**
 * Validate database configuration
 * @param {object} config Database configuration to validate
 * @returns {object} Validation result
 */
export function validateDbConfig(config = {}) {
  const errors = []
  
  try {
    const dbConfig = {
      ...getDefaultDbConfig(),
      ...config
    }
    
    if (!dbConfig.connectionString) {
      if (!dbConfig.host) errors.push('Database host is required')
      if (!dbConfig.database) errors.push('Database name is required')
      if (!dbConfig.user) errors.push('Database user is required')
      if (!dbConfig.password) errors.push('Database password is required')
    }
    
    if (dbConfig.port && (dbConfig.port < 1 || dbConfig.port > 65535)) {
      errors.push('Database port must be between 1 and 65535')
    }
    
    if (dbConfig.max && dbConfig.max < 1) {
      errors.push('Pool max connections must be at least 1')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      config: dbConfig
    }
  } catch (error) {
    console.error('Error validating database config:', error)
    return {
      isValid: false,
      errors: ['Configuration validation error'],
      config: null
    }
  }
}

/**
 * Create a database health check function
 * @returns {Function} Health check function
 */
export function createHealthCheck() {
  return async () => {
    try {
      const status = await getConnectionStatus()
      
      return {
        status: status.isConnected ? 'healthy' : 'unhealthy',
        details: status,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}
