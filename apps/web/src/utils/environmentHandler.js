/**
 * Environment Handler Utility
 *
 * This module provides functions for setting up the application environment.
 * It's designed to be called once at application startup to configure
 * environment-specific settings and handle common issues like hydration errors.
 */

import { getEnvironmentName, isProductionEnvironment } from './environment.js'

/**
 * Environment setup options
 */
export const defaultEnvironmentSetupOptions = {
  /**
   * Whether to suppress hydration warnings
   * @default true
   */
  suppressHydrationWarnings: true,

  /**
   * Whether to add environment classes to the HTML element
   * @default true
   */
  addEnvironmentClasses: true,

  /**
   * Whether to suppress hydration errors in the console
   * @default true
   */
  suppressHydrationErrors: true,

  /**
   * Whether to log environment information
   * @default true
   */
  logEnvironmentInfo: true,

  /**
   * Custom environment classes to add to the HTML element
   * Key is the environment name, value is the class name
   * @default { production: 'production', development: 'local-dev', test: 'test-env' }
   */
  environmentClasses: {
    production: 'production',
    development: 'local-dev',
    test: 'test-env',
  },
}

/**
 * Sets up the application environment
 * Call this once at application startup
 * 
 * @param {object} options Environment setup options
 */
export function setupEnvironment(options = {}) {
  // Skip if not in browser
  if (typeof window === 'undefined') return

  // Skip if already initialized
  if (window.__BELLYFED_ENV_INITIALIZED) return

  // Merge options with defaults
  const mergedOptions = {
    ...defaultEnvironmentSetupOptions,
    ...options,
    environmentClasses: {
      ...defaultEnvironmentSetupOptions.environmentClasses,
      ...(options?.environmentClasses || {}),
    },
  }

  // Get environment information
  const environment = getEnvironmentName()
  const isProduction = isProductionEnvironment()

  // Add environment classes to HTML element
  if (mergedOptions.addEnvironmentClasses) {
    addEnvironmentClasses(environment, mergedOptions.environmentClasses)
  }

  // Set up hydration error handling
  if (mergedOptions.suppressHydrationWarnings) {
    suppressHydrationWarnings()
  }

  if (mergedOptions.suppressHydrationErrors) {
    suppressHydrationErrors()
  }

  // Log environment information
  if (mergedOptions.logEnvironmentInfo) {
    logEnvironmentInfo(environment, isProduction)
  }

  // Mark as initialized
  window.__BELLYFED_ENV_INITIALIZED = true
}

/**
 * Add environment classes to the HTML element
 * 
 * @param {string} environment The current environment
 * @param {object} environmentClasses Map of environment names to class names
 */
export function addEnvironmentClasses(environment, environmentClasses) {
  if (typeof document === 'undefined') return

  // Add environment-specific class
  const className = environmentClasses[environment] || `env-${environment}`
  document.documentElement.classList.add(className)

  // Also add the environment name as a class
  document.documentElement.classList.add(`env-${environment}`)
}

/**
 * Suppress Next.js hydration warnings
 */
export function suppressHydrationWarnings() {
  if (typeof window === 'undefined') return

  try {
    // Set the Next.js flag to suppress hydration warnings
    window.__NEXT_SUPPRESS_HYDRATION_WARNING = true
  } catch (error) {
    // If something goes wrong, log it and continue
    console.warn('Failed to suppress hydration warnings:', error)
  }
}

/**
 * Suppress hydration errors in the console
 */
export function suppressHydrationErrors() {
  if (typeof window === 'undefined') return

  try {
    // Store the original console.error function
    const originalConsoleError = console.error

    // Replace console.error with a function that filters hydration errors
    console.error = function (...args) {
      // Convert arguments to a string for easier filtering
      const errorString = args.join(' ')

      // Check if the error is a hydration error
      if (
        errorString.includes('Hydration failed') ||
        errorString.includes('hydration') ||
        errorString.includes('did not match') ||
        errorString.includes('Warning: Text content did not match')
      ) {
        // Suppress hydration errors
        return
      }

      // Pass through other errors
      originalConsoleError.apply(console, args)
    }
  } catch (error) {
    // If something goes wrong, log it and continue
    console.warn('Failed to set up hydration error suppression:', error)
  }
}

/**
 * Log environment information
 * 
 * @param {string} environment The current environment
 * @param {boolean} isProduction Whether the application is running in production
 */
export function logEnvironmentInfo(environment, isProduction) {
  if (typeof console === 'undefined') return

  console.log(`🌍 Running in ${environment} environment`)
  console.log(`🏭 Production mode: ${isProduction ? 'Yes' : 'No'}`)

  if (typeof window !== 'undefined') {
    console.log(`🌐 Hostname: ${window.location.hostname}`)
    console.log(`📱 User Agent: ${navigator.userAgent}`)
    console.log(`🔗 URL: ${window.location.href}`)
  }

  if (typeof process !== 'undefined' && process.env) {
    console.log(`⚙️ NODE_ENV: ${process.env.NODE_ENV}`)
  }
}

/**
 * Reset environment setup
 * This is mainly useful for testing
 */
export function resetEnvironmentSetup() {
  if (typeof window === 'undefined') return

  // Reset initialization flag
  window.__BELLYFED_ENV_INITIALIZED = false

  // Remove environment classes
  const environment = getEnvironmentName()
  const classesToRemove = [
    'production',
    'local-dev', 
    'test-env',
    `env-${environment}`,
    'env-production',
    'env-development',
    'env-test'
  ]

  classesToRemove.forEach(className => {
    document.documentElement.classList.remove(className)
  })
}

/**
 * Check if environment has been initialized
 * 
 * @returns {boolean} True if the environment has been initialized, false otherwise
 */
export function isEnvironmentInitialized() {
  if (typeof window === 'undefined') return false
  return !!window.__BELLYFED_ENV_INITIALIZED
}

/**
 * Get environment setup status
 * 
 * @returns {object} Environment setup status information
 */
export function getEnvironmentSetupStatus() {
  return {
    isInitialized: isEnvironmentInitialized(),
    environment: getEnvironmentName(),
    isProduction: isProductionEnvironment(),
    hasHydrationWarningsSuppressed: typeof window !== 'undefined' && !!window.__NEXT_SUPPRESS_HYDRATION_WARNING,
    timestamp: new Date().toISOString()
  }
}

/**
 * Configure environment for development
 * Enables debug tools and verbose logging
 */
export function setupDevelopmentEnvironment() {
  setupEnvironment({
    logEnvironmentInfo: true,
    suppressHydrationWarnings: false,
    suppressHydrationErrors: false,
    addEnvironmentClasses: true
  })

  // Add development-specific configurations
  if (typeof window !== 'undefined') {
    // Enable React DevTools
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}
    
    // Add development indicator
    document.documentElement.classList.add('development-mode')
    
    console.log('🔧 Development environment configured')
  }
}

/**
 * Configure environment for production
 * Optimizes for performance and security
 */
export function setupProductionEnvironment() {
  setupEnvironment({
    logEnvironmentInfo: false,
    suppressHydrationWarnings: true,
    suppressHydrationErrors: true,
    addEnvironmentClasses: true
  })

  // Add production-specific configurations
  if (typeof window !== 'undefined') {
    // Remove development indicators
    document.documentElement.classList.remove('development-mode')
    
    // Disable right-click context menu in production (optional)
    // document.addEventListener('contextmenu', e => e.preventDefault())
    
    console.log('🚀 Production environment configured')
  }
}

/**
 * Auto-configure environment based on current environment
 */
export function autoConfigureEnvironment() {
  const environment = getEnvironmentName()
  
  switch (environment) {
    case 'development':
      setupDevelopmentEnvironment()
      break
    case 'production':
      setupProductionEnvironment()
      break
    case 'test':
      setupEnvironment({
        logEnvironmentInfo: false,
        suppressHydrationWarnings: true,
        suppressHydrationErrors: true
      })
      break
    default:
      setupEnvironment()
  }
}
