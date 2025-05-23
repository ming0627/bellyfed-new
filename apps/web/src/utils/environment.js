/**
 * Environment Utility
 *
 * This module provides utility functions for environment detection and handling.
 * It helps determine the current environment (development, test, production)
 * and apply environment-specific configurations.
 */

/**
 * Environment type definition
 * Represents the possible environments the application can run in
 */
export const Environment = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
}

/**
 * Default environment configurations
 */
export const environmentConfigs = {
  development: {
    apiUrl: 'https://api-dev.bellyfed.com',
    disableConsole: false,
    enableAnalytics: false,
    enableDebugTools: true,
  },
  test: {
    apiUrl: 'https://api-test.bellyfed.com',
    disableConsole: false,
    enableAnalytics: true,
    enableDebugTools: true,
  },
  production: {
    apiUrl: 'https://api.bellyfed.com',
    disableConsole: true,
    enableAnalytics: true,
    enableDebugTools: false,
  },
}

/**
 * Checks if the application is running in a production environment
 * @returns {boolean} True if the application is running in production, false otherwise
 */
export function isProductionEnvironment() {
  if (typeof window === 'undefined') {
    // During SSR, we can check environment variables
    return process.env.NODE_ENV === 'production'
  }

  // In the browser, check for production domain
  return (
    window.location.hostname.includes('bellyfed.com') ||
    window.location.hostname.includes('app-dev.bellyfed.com') ||
    window.location.hostname.includes('app-test.bellyfed.com')
  )
}

/**
 * Checks if the application is running in local development
 * @returns {boolean} True if the application is running in local development, false otherwise
 */
export function isLocalDevelopment() {
  if (typeof window === 'undefined') {
    // During SSR, we can check environment variables
    return process.env.NODE_ENV === 'development'
  }

  // In the browser, check for localhost or local IP
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.match(/^192\.168\./) !== null
  )
}

/**
 * Gets the current environment name
 * @returns {string} The current environment name
 */
export function getEnvironmentName() {
  // Check for specific hostnames
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('app-test.bellyfed.com')) {
      return Environment.TEST
    }

    if (window.location.hostname.includes('app-dev.bellyfed.com')) {
      return Environment.DEVELOPMENT
    }

    if (
      window.location.hostname.includes('bellyfed.com') &&
      !window.location.hostname.includes('app-dev') &&
      !window.location.hostname.includes('app-test')
    ) {
      return Environment.PRODUCTION
    }
  }

  // Fallback to NODE_ENV
  return process.env.NODE_ENV || Environment.DEVELOPMENT
}

/**
 * Gets the configuration for the current environment
 * @returns {object} The configuration for the current environment
 */
export function getEnvironmentConfig() {
  const environment = getEnvironmentName()
  return environmentConfigs[environment]
}

/**
 * Applies environment-specific configuration
 */
export function applyEnvironmentConfig() {
  if (typeof window === 'undefined') {
    return // Only run in browser
  }

  const environment = getEnvironmentName()
  const config = environmentConfigs[environment]

  // Add environment class to document
  document.documentElement.classList.add(`env-${environment}`)

  // Log environment info
  console.log(`Running in ${environment} environment`)

  // Apply environment-specific settings
  if (config.disableConsole) {
    // Disable console logs in production
    if (window.console) {
      const noop = function () {}
      const methods = ['log', 'debug', 'info']

      methods.forEach((method) => {
        console[method] = noop
      })
    }
  }
}

/**
 * Checks if the application is running in a specific environment
 * @param {string} environment The environment to check for
 * @returns {boolean} True if the application is running in the specified environment, false otherwise
 */
export function isEnvironment(environment) {
  return getEnvironmentName() === environment
}

/**
 * Checks if the application is running in a test environment
 * @returns {boolean} True if the application is running in a test environment, false otherwise
 */
export function isTestEnvironment() {
  return isEnvironment(Environment.TEST)
}

/**
 * Checks if the application is running in a development environment
 * @returns {boolean} True if the application is running in a development environment, false otherwise
 */
export function isDevelopmentEnvironment() {
  return isEnvironment(Environment.DEVELOPMENT)
}

/**
 * Checks if the application is running on the server (SSR)
 * @returns {boolean} True if the application is running on the server, false otherwise
 */
export function isServer() {
  return typeof window === 'undefined'
}

/**
 * Checks if the application is running in the browser
 * @returns {boolean} True if the application is running in the browser, false otherwise
 */
export function isBrowser() {
  return !isServer()
}

/**
 * Gets the current hostname
 * @returns {string} The current hostname or 'unknown' if not available
 */
export function getHostname() {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  }
  return 'unknown'
}

/**
 * Gets the current protocol
 * @returns {string} The current protocol or 'unknown' if not available
 */
export function getProtocol() {
  if (typeof window !== 'undefined') {
    return window.location.protocol
  }
  return 'unknown'
}

/**
 * Gets the current port
 * @returns {string} The current port or 'unknown' if not available
 */
export function getPort() {
  if (typeof window !== 'undefined') {
    return window.location.port || '80'
  }
  return 'unknown'
}

/**
 * Gets the full URL
 * @returns {string} The full URL or 'unknown' if not available
 */
export function getFullUrl() {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return 'unknown'
}

/**
 * Checks if the application is running over HTTPS
 * @returns {boolean} True if the application is running over HTTPS, false otherwise
 */
export function isHttps() {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:'
  }
  return false
}

/**
 * Checks if the application is running in a secure context
 * @returns {boolean} True if the application is running in a secure context, false otherwise
 */
export function isSecureContext() {
  if (typeof window !== 'undefined' && 'isSecureContext' in window) {
    return window.isSecureContext
  }
  return isHttps()
}

/**
 * Gets environment information as an object
 * @returns {object} Environment information
 */
export function getEnvironmentInfo() {
  return {
    environment: getEnvironmentName(),
    isProduction: isProductionEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
    isTest: isTestEnvironment(),
    isServer: isServer(),
    isBrowser: isBrowser(),
    hostname: getHostname(),
    protocol: getProtocol(),
    port: getPort(),
    fullUrl: getFullUrl(),
    isHttps: isHttps(),
    isSecureContext: isSecureContext(),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
}
