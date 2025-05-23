/**
 * AWS Utility Functions
 *
 * This file provides utility functions for interacting with AWS services
 * through the application's API endpoints. It includes functions for
 * retrieving parameters from SSM Parameter Store and secrets from Secrets Manager.
 */

import { getApiUrl } from './apiConfig.js'

// Cache for SSM parameters and secrets
const ssmCache = new Map()
const secretsCache = new Map()

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000

/**
 * AWS configuration
 */
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  cacheExpirationMs: CACHE_EXPIRATION_MS,
  retryAttempts: 3,
  retryDelay: 1000
}

/**
 * Get a parameter from AWS SSM Parameter Store
 *
 * @param {string} name Parameter name
 * @param {boolean} skipCache Whether to skip the cache and fetch fresh data
 * @returns {Promise<string|null>} Parameter value or null if not found
 */
export async function getSSMParameter(name, skipCache = false) {
  try {
    if (!name || typeof name !== 'string') {
      throw new Error('Parameter name is required and must be a string')
    }

    // Check cache first if not skipping cache
    if (!skipCache) {
      const cached = ssmCache.get(name)
      if (cached && Date.now() - cached.timestamp < awsConfig.cacheExpirationMs) {
        return cached.value
      }
    }

    // Fetch from API
    const apiUrl = getApiUrl()
    const response = await fetch(
      `${apiUrl}/aws/ssm?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch SSM parameter: ${response.statusText}`)
    }

    const data = await response.json()
    const value = data.value || null

    // Cache the result
    if (value !== null) {
      ssmCache.set(name, {
        value,
        timestamp: Date.now()
      })
    }

    return value
  } catch (error) {
    console.error('Error getting SSM parameter:', error)
    throw error
  }
}

/**
 * Get a secret from AWS Secrets Manager
 *
 * @param {string} name Secret name
 * @param {boolean} skipCache Whether to skip the cache and fetch fresh data
 * @returns {Promise<string|null>} Secret value or null if not found
 */
export async function getSecret(name, skipCache = false) {
  try {
    if (!name || typeof name !== 'string') {
      throw new Error('Secret name is required and must be a string')
    }

    // Check cache first if not skipping cache
    if (!skipCache) {
      const cached = secretsCache.get(name)
      if (cached && Date.now() - cached.timestamp < awsConfig.cacheExpirationMs) {
        return cached.value
      }
    }

    // Fetch from API
    const apiUrl = getApiUrl()
    const response = await fetch(
      `${apiUrl}/aws/secrets?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch secret: ${response.statusText}`)
    }

    const data = await response.json()
    const value = data.value || null

    // Cache the result
    if (value !== null) {
      secretsCache.set(name, {
        value,
        timestamp: Date.now()
      })
    }

    return value
  } catch (error) {
    console.error('Error getting secret:', error)
    throw error
  }
}

/**
 * Clear the SSM parameter cache
 * @param {string} name Optional parameter name to clear specific entry
 */
export function clearSSMCache(name = null) {
  if (name) {
    ssmCache.delete(name)
  } else {
    ssmCache.clear()
  }
}

/**
 * Clear the secrets cache
 * @param {string} name Optional secret name to clear specific entry
 */
export function clearSecretsCache(name = null) {
  if (name) {
    secretsCache.delete(name)
  } else {
    secretsCache.clear()
  }
}

/**
 * Clear all AWS caches
 */
export function clearAllCaches() {
  clearSSMCache()
  clearSecretsCache()
}

/**
 * Get multiple parameters from AWS SSM Parameter Store
 *
 * @param {string[]} names Array of parameter names
 * @param {boolean} skipCache Whether to skip the cache and fetch fresh data
 * @returns {Promise<object>} Object mapping parameter names to their values
 */
export async function getMultipleSSMParameters(names, skipCache = false) {
  try {
    if (!Array.isArray(names)) {
      throw new Error('Parameter names must be an array')
    }

    const result = {}
    
    // Use Promise.all to fetch all parameters in parallel
    const values = await Promise.all(
      names.map((name) => getSSMParameter(name, skipCache))
    )
    
    // Map the results to the parameter names
    names.forEach((name, index) => {
      result[name] = values[index]
    })
    
    return result
  } catch (error) {
    console.error('Error getting multiple SSM parameters:', error)
    throw error
  }
}

/**
 * Get multiple secrets from AWS Secrets Manager
 *
 * @param {string[]} names Array of secret names
 * @param {boolean} skipCache Whether to skip the cache and fetch fresh data
 * @returns {Promise<object>} Object mapping secret names to their values
 */
export async function getMultipleSecrets(names, skipCache = false) {
  try {
    if (!Array.isArray(names)) {
      throw new Error('Secret names must be an array')
    }

    const result = {}
    
    // Use Promise.all to fetch all secrets in parallel
    const values = await Promise.all(
      names.map((name) => getSecret(name, skipCache))
    )
    
    // Map the results to the secret names
    names.forEach((name, index) => {
      result[name] = values[index]
    })
    
    return result
  } catch (error) {
    console.error('Error getting multiple secrets:', error)
    throw error
  }
}

/**
 * Get AWS configuration from environment variables and SSM parameters
 * @param {string[]} parameterNames Array of SSM parameter names to fetch
 * @returns {Promise<object>} Configuration object
 */
export async function getAWSConfig(parameterNames = []) {
  try {
    const config = {
      region: awsConfig.region,
      environment: process.env.NODE_ENV || 'development'
    }

    if (parameterNames.length > 0) {
      const parameters = await getMultipleSSMParameters(parameterNames)
      config.parameters = parameters
    }

    return config
  } catch (error) {
    console.error('Error getting AWS config:', error)
    return {
      region: awsConfig.region,
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    }
  }
}

/**
 * Send a message to AWS SQS queue
 * @param {string} queueUrl SQS queue URL
 * @param {object} message Message to send
 * @param {object} options Additional options
 * @returns {Promise<object>} SQS send message result
 */
export async function sendSQSMessage(queueUrl, message, options = {}) {
  try {
    if (!queueUrl || !message) {
      throw new Error('Queue URL and message are required')
    }

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/aws/sqs/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        queueUrl,
        message,
        ...options
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to send SQS message: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending SQS message:', error)
    throw error
  }
}

/**
 * Publish a message to AWS SNS topic
 * @param {string} topicArn SNS topic ARN
 * @param {string} message Message to publish
 * @param {object} options Additional options
 * @returns {Promise<object>} SNS publish result
 */
export async function publishSNSMessage(topicArn, message, options = {}) {
  try {
    if (!topicArn || !message) {
      throw new Error('Topic ARN and message are required')
    }

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/aws/sns/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        topicArn,
        message,
        ...options
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to publish SNS message: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error publishing SNS message:', error)
    throw error
  }
}

/**
 * Upload a file to AWS S3
 * @param {string} bucketName S3 bucket name
 * @param {string} key S3 object key
 * @param {File|Blob} file File to upload
 * @param {object} options Additional options
 * @returns {Promise<object>} S3 upload result
 */
export async function uploadToS3(bucketName, key, file, options = {}) {
  try {
    if (!bucketName || !key || !file) {
      throw new Error('Bucket name, key, and file are required')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucketName', bucketName)
    formData.append('key', key)
    
    // Add additional options to form data
    Object.entries(options).forEach(([optionKey, value]) => {
      formData.append(optionKey, value)
    })

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/aws/s3/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

/**
 * Get cache statistics
 * @returns {object} Cache statistics
 */
export function getCacheStats() {
  return {
    ssm: {
      size: ssmCache.size,
      keys: Array.from(ssmCache.keys())
    },
    secrets: {
      size: secretsCache.size,
      keys: Array.from(secretsCache.keys())
    },
    cacheExpirationMs: awsConfig.cacheExpirationMs
  }
}

/**
 * Check AWS service health
 * @returns {Promise<object>} Health check result
 */
export async function checkAWSHealth() {
  try {
    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/aws/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`AWS health check failed: ${response.statusText}`)
    }

    const healthData = await response.json()
    
    return {
      status: 'healthy',
      details: healthData,
      cacheStats: getCacheStats(),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error checking AWS health:', error)
    return {
      status: 'unhealthy',
      error: error.message,
      cacheStats: getCacheStats(),
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn Function to retry
 * @param {number} maxRetries Maximum number of retries
 * @param {number} baseDelay Base delay in milliseconds
 * @returns {Promise<any>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = awsConfig.retryAttempts, baseDelay = awsConfig.retryDelay) {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.warn(`AWS operation attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}
