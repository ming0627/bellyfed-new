/**
 * API Configuration Utilities
 *
 * This file provides utility functions for API configuration and URL generation.
 * It centralizes the API URL configuration logic used across the application.
 */

import { getEnvironmentName } from './environment.js'

/**
 * API configuration object
 */
export const apiConfig = {
  environments: {
    development: {
      api: 'http://localhost:3001/api',
      db: 'http://localhost:3001/api/database',
      rankings: 'http://localhost:3001/api/rankings',
      auth: 'http://localhost:3001/api/auth',
      media: 'http://localhost:3001/api/media',
      analytics: 'http://localhost:3001/api/analytics'
    },
    test: {
      api: 'https://api-test.bellyfed.com/v1',
      db: 'https://api-test.bellyfed.com/v1/db',
      rankings: 'https://api-test.bellyfed.com/v1/rankings',
      auth: 'https://api-test.bellyfed.com/v1/auth',
      media: 'https://api-test.bellyfed.com/v1/media',
      analytics: 'https://api-test.bellyfed.com/v1/analytics'
    },
    production: {
      api: 'https://api.bellyfed.com/v1',
      db: 'https://api.bellyfed.com/v1/db',
      rankings: 'https://api.bellyfed.com/v1/rankings',
      auth: 'https://api.bellyfed.com/v1/auth',
      media: 'https://api.bellyfed.com/v1/media',
      analytics: 'https://api.bellyfed.com/v1/analytics'
    }
  },
  defaultTimeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}

/**
 * Determines which environment to use for API calls
 * Available environments: development, test, production
 * @returns {string} The API environment
 */
export const getApiEnvironment = () => {
  const envMap = {
    development: 'development',
    test: 'test',
    production: 'production'
  }
  
  const nodeEnv = getEnvironmentName()
  return process.env.API_ENV || envMap[nodeEnv] || 'development'
}

/**
 * Determines whether to use AWS API or local API
 * - true: Use AWS API endpoints (api-dev.bellyfed.com, etc.)
 * - false: Use local API endpoints (localhost:3001)
 * @returns {boolean} Whether to use AWS API
 */
export const useAwsApi = () => {
  return (
    process.env.USE_AWS_API === 'true' || 
    process.env.NODE_ENV === 'production' ||
    getEnvironmentName() === 'production'
  )
}

/**
 * Gets the base API URL based on current configuration
 * @returns {string} The base API URL
 */
export const getApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.api
  }
  
  return config.api
}

/**
 * Gets the database API URL based on current configuration
 * @returns {string} The database API URL
 */
export const getDbApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.db
  }
  
  return config.db
}

/**
 * Gets the rankings API URL based on current configuration
 * @returns {string} The rankings API URL
 */
export const getRankingsApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.rankings
  }
  
  return config.rankings
}

/**
 * Gets the authentication API URL based on current configuration
 * @returns {string} The authentication API URL
 */
export const getAuthApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.auth
  }
  
  return config.auth
}

/**
 * Gets the media API URL based on current configuration
 * @returns {string} The media API URL
 */
export const getMediaApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.media
  }
  
  return config.media
}

/**
 * Gets the analytics API URL based on current configuration
 * @returns {string} The analytics API URL
 */
export const getAnalyticsApiUrl = () => {
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    console.warn(`Unknown API environment: ${environment}, falling back to development`)
    return apiConfig.environments.development.analytics
  }
  
  return config.analytics
}

/**
 * Gets the API key from environment variables
 * @returns {string} The API key or an empty string if not found
 */
export const getApiKey = () => {
  return process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || ''
}

/**
 * Determines the appropriate API URL based on the path
 * @param {string} path The API path
 * @returns {string} The full API URL
 */
export const getApiUrlForPath = (path) => {
  if (!path || typeof path !== 'string') {
    return getApiUrl()
  }
  
  // Database operations
  if (path.startsWith('db/') || path.startsWith('database/')) {
    return getDbApiUrl()
  }
  // Rankings operations
  else if (path.startsWith('rankings/')) {
    return getRankingsApiUrl()
  }
  // Authentication operations
  else if (path.startsWith('auth/')) {
    return getAuthApiUrl()
  }
  // Media operations
  else if (path.startsWith('media/') || path.startsWith('upload/')) {
    return getMediaApiUrl()
  }
  // Analytics operations
  else if (path.startsWith('analytics/')) {
    return getAnalyticsApiUrl()
  }
  // Default API operations
  return getApiUrl()
}

/**
 * Builds a complete API URL with the given path
 * @param {string} path The API path
 * @returns {string} The complete API URL
 */
export const buildApiUrl = (path) => {
  const baseUrl = getApiUrlForPath(path)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return `${baseUrl}/${cleanPath}`
}

/**
 * Gets API configuration for the current environment
 * @returns {object} API configuration object
 */
export const getApiConfig = () => {
  const environment = getApiEnvironment()
  
  return {
    environment,
    useAwsApi: useAwsApi(),
    baseUrl: getApiUrl(),
    dbUrl: getDbApiUrl(),
    rankingsUrl: getRankingsApiUrl(),
    authUrl: getAuthApiUrl(),
    mediaUrl: getMediaApiUrl(),
    analyticsUrl: getAnalyticsApiUrl(),
    apiKey: getApiKey(),
    timeout: apiConfig.defaultTimeout,
    retryAttempts: apiConfig.retryAttempts,
    retryDelay: apiConfig.retryDelay
  }
}

/**
 * Gets default headers for API requests
 * @returns {object} Default headers object
 */
export const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  
  const apiKey = getApiKey()
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }
  
  return headers
}

/**
 * Creates a fetch configuration object with default settings
 * @param {object} options Additional fetch options
 * @returns {object} Fetch configuration object
 */
export const createFetchConfig = (options = {}) => {
  return {
    headers: {
      ...getDefaultHeaders(),
      ...options.headers
    },
    timeout: options.timeout || apiConfig.defaultTimeout,
    ...options
  }
}

/**
 * Validates API configuration
 * @returns {object} Validation result
 */
export const validateApiConfig = () => {
  const errors = []
  const environment = getApiEnvironment()
  const config = apiConfig.environments[environment]
  
  if (!config) {
    errors.push(`Invalid environment: ${environment}`)
  } else {
    // Check if all required URLs are configured
    const requiredUrls = ['api', 'db', 'rankings', 'auth', 'media', 'analytics']
    requiredUrls.forEach(key => {
      if (!config[key]) {
        errors.push(`Missing ${key} URL for environment: ${environment}`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    environment,
    config: config || null
  }
}

/**
 * Gets API health check URLs for all services
 * @returns {object} Health check URLs
 */
export const getHealthCheckUrls = () => {
  return {
    api: `${getApiUrl()}/health`,
    db: `${getDbApiUrl()}/health`,
    rankings: `${getRankingsApiUrl()}/health`,
    auth: `${getAuthApiUrl()}/health`,
    media: `${getMediaApiUrl()}/health`,
    analytics: `${getAnalyticsApiUrl()}/health`
  }
}

/**
 * Checks if the current environment supports a specific feature
 * @param {string} feature The feature to check
 * @returns {boolean} Whether the feature is supported
 */
export const isFeatureEnabled = (feature) => {
  const environment = getApiEnvironment()
  
  const featureFlags = {
    development: {
      analytics: true,
      debugging: true,
      mockData: true,
      rateLimiting: false
    },
    test: {
      analytics: true,
      debugging: true,
      mockData: false,
      rateLimiting: true
    },
    production: {
      analytics: true,
      debugging: false,
      mockData: false,
      rateLimiting: true
    }
  }
  
  return featureFlags[environment]?.[feature] || false
}

/**
 * Gets the API version for the current environment
 * @returns {string} API version
 */
export const getApiVersion = () => {
  const environment = getApiEnvironment()
  
  const versions = {
    development: 'v1-dev',
    test: 'v1-test',
    production: 'v1'
  }
  
  return versions[environment] || 'v1'
}
