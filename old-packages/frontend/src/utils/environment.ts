/**
 * Utility functions for environment detection and handling
 */

/**
 * Checks if the application is running in a production environment
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
 */
export function getEnvironmentName(): 'development' | 'test' | 'production' {
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
  return (
    (process.env.NODE_ENV as 'development' | 'test' | 'production') ||
    'development'
  );
}

/**
 * Applies environment-specific configuration
 */
export function applyEnvironmentConfig(): void {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  const environment = getEnvironmentName();

  // Add environment class to document
  document.documentElement.classList.add(`env-${environment}`);

  // Log environment info
  console.log(`Running in ${environment} environment`);

  // Apply environment-specific settings
  if (environment === 'production') {
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
