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
export type Environment = 'development' | 'test' | 'production';

/**
 * Environment configuration interface
 * Represents the configuration for an environment
 */
export interface EnvironmentConfig {
  apiUrl: string;
  disableConsole: boolean;
  enableAnalytics: boolean;
  enableDebugTools: boolean;
}

/**
 * Default environment configurations
 */
export const environmentConfigs: Record<Environment, EnvironmentConfig> = {
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
};

/**
 * Checks if the application is running in a production environment
 * @returns True if the application is running in production, false otherwise
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') {
    // During SSR, we can check environment variables
    return process.env.NODE_ENV === 'production';
  }

  // In the browser, check for production domain
  return (
    window.location.hostname.includes('bellyfed.com') ||
    window.location.hostname.includes('app-dev.bellyfed.com') ||
    window.location.hostname.includes('app-test.bellyfed.com')
  );
}

/**
 * Checks if the application is running in local development
 * @returns True if the application is running in local development, false otherwise
 */
export function isLocalDevelopment(): boolean {
  if (typeof window === 'undefined') {
    // During SSR, we can check environment variables
    return process.env.NODE_ENV === 'development';
  }

  // In the browser, check for localhost or local IP
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.match(/^192\.168\./) !== null
  );
}

/**
 * Gets the current environment name
 * @returns The current environment name
 */
export function getEnvironmentName(): Environment {
  // Check for specific hostnames
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('app-test.bellyfed.com')) {
      return 'test';
    }

    if (window.location.hostname.includes('app-dev.bellyfed.com')) {
      return 'development';
    }

    if (
      window.location.hostname.includes('bellyfed.com') &&
      !window.location.hostname.includes('app-dev') &&
      !window.location.hostname.includes('app-test')
    ) {
      return 'production';
    }
  }

  // Fallback to NODE_ENV
  return (process.env.NODE_ENV as Environment) || 'development';
}

/**
 * Gets the configuration for the current environment
 * @returns The configuration for the current environment
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = getEnvironmentName();
  return environmentConfigs[environment];
}

/**
 * Applies environment-specific configuration
 */
export function applyEnvironmentConfig(): void {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  const environment = getEnvironmentName();
  const config = environmentConfigs[environment];

  // Add environment class to document
  document.documentElement.classList.add(`env-${environment}`);

  // Log environment info
  console.log(`Running in ${environment} environment`);

  // Apply environment-specific settings
  if (config.disableConsole) {
    // Disable console logs in production
    if (window.console) {
      const noop = function () {};
      const methods = ['log', 'debug', 'info'];

      methods.forEach((method) => {
        // Use type assertion with unknown first to avoid type errors
        (console as any)[method] = noop;
      });
    }
  }
}

/**
 * Checks if the application is running in a specific environment
 * @param env The environment to check
 * @returns True if the application is running in the specified environment, false otherwise
 */
export function isEnvironment(env: Environment): boolean {
  return getEnvironmentName() === env;
}

/**
 * Checks if the application is running in a test environment
 * @returns True if the application is running in a test environment, false otherwise
 */
export function isTestEnvironment(): boolean {
  return isEnvironment('test');
}

/**
 * Checks if the application is running in a development environment
 * @returns True if the application is running in a development environment, false otherwise
 */
export function isDevelopmentEnvironment(): boolean {
  return isEnvironment('development');
}

/**
 * Checks if the application is running on the server (SSR)
 * @returns True if the application is running on the server, false otherwise
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Checks if the application is running in the browser
 * @returns True if the application is running in the browser, false otherwise
 */
export function isBrowser(): boolean {
  return !isServer();
}

/**
 * Executes a callback only if the application is running in the browser
 * @param callback The callback to execute
 */
export function onlyInBrowser(callback: () => void): void {
  if (isBrowser()) {
    callback();
  }
}

/**
 * Executes a callback only if the application is running on the server
 * @param callback The callback to execute
 */
export function onlyOnServer(callback: () => void): void {
  if (isServer()) {
    callback();
  }
}

/**
 * Executes a callback only if the application is running in a specific environment
 * @param env The environment to check
 * @param callback The callback to execute
 */
export function onlyInEnvironment(env: Environment, callback: () => void): void {
  if (isEnvironment(env)) {
    callback();
  }
}
