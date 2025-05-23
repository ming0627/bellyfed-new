/**
 * PostgreSQL Utility
 *
 * This module provides utility functions for interacting with a PostgreSQL database.
 * It includes a connection pool and functions for executing queries and transactions.
 */

import { getEnvironmentName } from './environment.js'

/**
 * PostgreSQL configuration interface
 * Represents the configuration for a PostgreSQL connection
 */
export const PostgresConfig = {
  connectionString: '',
  host: '',
  port: 5432,
  database: '',
  user: '',
  password: '',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

/**
 * Default PostgreSQL configuration
 */
const defaultConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://bellyfed_admin:password@localhost:5432/bellyfed_dev',
  ssl: getEnvironmentName() === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

/**
 * PostgreSQL connection pool
 */
let pool = null

/**
 * Create a PostgreSQL connection pool
 * @param {object} config PostgreSQL configuration
 * @returns {object} PostgreSQL connection pool
 */
export function createPool(config = defaultConfig) {
  try {
    if (typeof window !== 'undefined') {
      console.warn('PostgreSQL operations not available in browser environment')
      return null
    }

    // This will be dynamically imported in Node.js environment
    const poolConfig = {
      ...defaultConfig,
      ...config
    }

    // Return a promise that resolves to the pool
    return import('pg').then(({ Pool }) => {
      return new Pool(poolConfig)
    })
  } catch (error) {
    console.error('Error creating PostgreSQL pool:', error)
    throw error
  }
}

/**
 * Initialize the PostgreSQL connection pool
 * @param {object} config Optional PostgreSQL configuration
 * @returns {Promise<object>} PostgreSQL connection pool
 */
export async function initializePool(config = {}) {
  if (pool) {
    return pool
  }

  try {
    if (typeof window !== 'undefined') {
      console.warn('PostgreSQL operations not available in browser environment')
      return null
    }

    const { Pool } = await import('pg')
    
    const poolConfig = {
      ...defaultConfig,
      ...config
    }

    pool = new Pool(poolConfig)

    // Test the connection
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()

    console.log('PostgreSQL pool initialized successfully')
    return pool
  } catch (error) {
    console.error('Error initializing PostgreSQL pool:', error)
    throw new Error(`Failed to initialize PostgreSQL pool: ${error.message}`)
  }
}

/**
 * Get the current PostgreSQL pool
 * @returns {Promise<object|null>} The PostgreSQL pool or null if not initialized
 */
export async function getPool() {
  if (!pool) {
    return await initializePool()
  }
  return pool
}

/**
 * Execute a query on the PostgreSQL database
 * @param {string} text SQL query text
 * @param {Array} params Query parameters
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<object>} Query result
 */
export async function query(text, params = [], customPool = null) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('PostgreSQL operations not available in browser environment')
    }

    const pgPool = customPool || await getPool()
    
    if (!pgPool) {
      throw new Error('Failed to get PostgreSQL pool')
    }

    const client = await pgPool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error executing PostgreSQL query:', error)
    console.error('Query:', text)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Execute a transaction on the PostgreSQL database
 * @param {Function} callback Function that executes queries within the transaction
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<any>} Result of the callback function
 */
export async function transaction(callback, customPool = null) {
  if (typeof window !== 'undefined') {
    throw new Error('PostgreSQL operations not available in browser environment')
  }

  let client = null

  try {
    const pgPool = customPool || await getPool()
    
    if (!pgPool) {
      throw new Error('Failed to get PostgreSQL pool')
    }

    client = await pgPool.connect()
    
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    
    return result
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Error rolling back PostgreSQL transaction:', rollbackError)
      }
    }
    
    console.error('Error executing PostgreSQL transaction:', error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

/**
 * Execute multiple queries in a single transaction
 * @param {Array} queries Array of query objects with text and params
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<Array>} Array of query results
 */
export async function batchQuery(queries, customPool = null) {
  return await transaction(async (client) => {
    const results = []
    
    for (const queryObj of queries) {
      const { text, params = [] } = queryObj
      const result = await client.query(text, params)
      results.push(result)
    }
    
    return results
  }, customPool)
}

/**
 * Check if the PostgreSQL connection is working
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<boolean>} True if the connection is working, false otherwise
 */
export async function checkConnection(customPool = null) {
  try {
    if (typeof window !== 'undefined') {
      return false
    }

    const pgPool = customPool || await getPool()
    
    if (!pgPool) {
      return false
    }

    const client = await pgPool.connect()
    try {
      await client.query('SELECT 1')
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error checking PostgreSQL connection:', error)
    return false
  }
}

/**
 * Get PostgreSQL database information
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<object>} Database information
 */
export async function getDatabaseInfo(customPool = null) {
  try {
    const result = await query(`
      SELECT 
        version() as version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `, [], customPool)
    
    return result.rows[0] || {}
  } catch (error) {
    console.error('Error getting PostgreSQL database info:', error)
    return {}
  }
}

/**
 * Get PostgreSQL connection statistics
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<object>} Connection statistics
 */
export async function getConnectionStats(customPool = null) {
  try {
    const pgPool = customPool || await getPool()
    
    if (!pgPool) {
      return {
        totalCount: 0,
        idleCount: 0,
        waitingCount: 0
      }
    }

    return {
      totalCount: pgPool.totalCount,
      idleCount: pgPool.idleCount,
      waitingCount: pgPool.waitingCount
    }
  } catch (error) {
    console.error('Error getting PostgreSQL connection stats:', error)
    return {
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
      error: error.message
    }
  }
}

/**
 * Close the PostgreSQL connection pool
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<void>}
 */
export async function closePool(customPool = null) {
  try {
    const pgPool = customPool || pool
    
    if (pgPool) {
      await pgPool.end()
      
      if (pgPool === pool) {
        pool = null
      }
      
      console.log('PostgreSQL pool closed successfully')
    }
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error)
    throw error
  }
}

/**
 * Execute a query with automatic retry logic
 * @param {string} text SQL query text
 * @param {Array} params Query parameters
 * @param {number} maxRetries Maximum number of retries
 * @param {number} retryDelay Delay between retries in milliseconds
 * @param {object} customPool Optional custom connection pool
 * @returns {Promise<object>} Query result
 */
export async function queryWithRetry(text, params = [], maxRetries = 3, retryDelay = 1000, customPool = null) {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await query(text, params, customPool)
    } catch (error) {
      lastError = error
      console.warn(`PostgreSQL query attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  throw lastError
}

/**
 * Create a PostgreSQL health check function
 * @param {object} customPool Optional custom connection pool
 * @returns {Function} Health check function
 */
export function createHealthCheck(customPool = null) {
  return async () => {
    try {
      const isConnected = await checkConnection(customPool)
      const stats = await getConnectionStats(customPool)
      const dbInfo = await getDatabaseInfo(customPool)
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        details: {
          isConnected,
          connectionStats: stats,
          databaseInfo: dbInfo,
          environment: getEnvironmentName()
        },
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

/**
 * Validate PostgreSQL configuration
 * @param {object} config PostgreSQL configuration to validate
 * @returns {object} Validation result
 */
export function validateConfig(config = {}) {
  const errors = []
  
  try {
    const pgConfig = {
      ...defaultConfig,
      ...config
    }
    
    if (!pgConfig.connectionString) {
      if (!pgConfig.host) errors.push('PostgreSQL host is required')
      if (!pgConfig.database) errors.push('PostgreSQL database name is required')
      if (!pgConfig.user) errors.push('PostgreSQL user is required')
      if (!pgConfig.password) errors.push('PostgreSQL password is required')
    }
    
    if (pgConfig.port && (pgConfig.port < 1 || pgConfig.port > 65535)) {
      errors.push('PostgreSQL port must be between 1 and 65535')
    }
    
    if (pgConfig.max && pgConfig.max < 1) {
      errors.push('PostgreSQL pool max connections must be at least 1')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      config: pgConfig
    }
  } catch (error) {
    console.error('Error validating PostgreSQL config:', error)
    return {
      isValid: false,
      errors: ['Configuration validation error'],
      config: null
    }
  }
}

/**
 * Export the default pool for backward compatibility
 */
export { pool as defaultPool }
