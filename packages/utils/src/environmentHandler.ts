/**
 * Environment Handler Utility
 *
 * This module provides functions for setting up the application environment.
 * It's designed to be called once at application startup to configure
 * environment-specific settings and handle common issues like hydration errors.
 */

import { getEnvironmentName, isProductionEnvironment } from './environment.js';

// Add type declaration for Next.js hydration warning property
declare global {
  interface Window {
    __NEXT_SUPPRESS_HYDRATION_WARNING?: boolean;
    __BELLYFED_ENV_INITIALIZED?: boolean;
  }
}

/**
 * Environment setup options
 */
export interface EnvironmentSetupOptions {
  /**
   * Whether to suppress hydration warnings
   * @default true
   */
  suppressHydrationWarnings?: boolean;

  /**
   * Whether to add environment classes to the HTML element
   * @default true
   */
  addEnvironmentClasses?: boolean;

  /**
   * Whether to suppress hydration errors in the console
   * @default true
   */
  suppressHydrationErrors?: boolean;

  /**
   * Whether to log environment information
   * @default true
   */
  logEnvironmentInfo?: boolean;

  /**
   * Custom environment classes to add to the HTML element
   * Key is the environment name, value is the class name
   * @default { production: 'production', development: 'local-dev', test: 'test-env' }
   */
  environmentClasses?: Record<string, string>;
}

// Default options
const defaultOptions: Required<EnvironmentSetupOptions> = {
  suppressHydrationWarnings: true,
  addEnvironmentClasses: true,
  suppressHydrationErrors: true,
  logEnvironmentInfo: true,
  environmentClasses: {
    production: 'production',
    development: 'local-dev',
    test: 'test-env',
  },
};

/**
 * Sets up the application environment
 * Call this once at application startup
 * 
 * @param options Environment setup options
 */
export function setupEnvironment(options?: EnvironmentSetupOptions): void {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  // Skip if already initialized
  if (window.__BELLYFED_ENV_INITIALIZED) return;

  // Merge options with defaults
  const mergedOptions: Required<EnvironmentSetupOptions> = {
    ...defaultOptions,
    ...options,
    environmentClasses: {
      ...defaultOptions.environmentClasses,
      ...(options?.environmentClasses || {}),
    },
  };

  // Get environment information
  const environment = getEnvironmentName();
  const isProduction = isProductionEnvironment();

  // Add environment classes to HTML element
  if (mergedOptions.addEnvironmentClasses) {
    addEnvironmentClasses(environment, mergedOptions.environmentClasses);
  }

  // Set up hydration error handling
  if (mergedOptions.suppressHydrationWarnings) {
    suppressHydrationWarnings();
  }

  if (mergedOptions.suppressHydrationErrors) {
    suppressHydrationErrors();
  }

  // Log environment information
  if (mergedOptions.logEnvironmentInfo) {
    logEnvironmentInfo(environment, isProduction);
  }

  // Mark as initialized
  window.__BELLYFED_ENV_INITIALIZED = true;
}

/**
 * Add environment classes to the HTML element
 * 
 * @param environment The current environment
 * @param environmentClasses Map of environment names to class names
 */
export function addEnvironmentClasses(
  environment: string,
  environmentClasses: Record<string, string>
): void {
  if (typeof document === 'undefined') return;

  // Add environment-specific class
  const className = environmentClasses[environment] || `env-${environment}`;
  document.documentElement.classList.add(className);

  // Also add the environment name as a class
  document.documentElement.classList.add(`env-${environment}`);
}

/**
 * Suppress Next.js hydration warnings
 */
export function suppressHydrationWarnings(): void {
  if (typeof window === 'undefined') return;

  // Set up global hydration warning suppression
  window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;
}

/**
 * Suppress hydration errors in the console
 */
export function suppressHydrationErrors(): void {
  if (typeof window === 'undefined' || typeof console === 'undefined') return;

  try {
    // Store the original console.error function
    const originalConsoleError = console.error;

    // Replace console.error with a function that filters hydration errors
    console.error = function (...args: any[]) {
      // Convert arguments to a string for easier filtering
      const errorString = args.join(' ');

      // Check if the error is a hydration error
      if (
        errorString.includes('Hydration failed') ||
        errorString.includes('hydration') ||
        errorString.includes('did not match') ||
        errorString.includes('Warning: Text content did not match')
      ) {
        // Suppress hydration errors
        return;
      }

      // Pass through other errors
      originalConsoleError.apply(console, args);
    };
  } catch (error) {
    // If something goes wrong, log it and continue
    console.warn('Failed to set up hydration error suppression:', error);
  }
}

/**
 * Log environment information
 * 
 * @param environment The current environment
 * @param isProduction Whether the application is running in production
 */
export function logEnvironmentInfo(
  environment: string,
  isProduction: boolean
): void {
  if (typeof console === 'undefined') return;

  console.log(`Running in ${environment} environment`);
  console.log(`Production mode: ${isProduction ? 'Yes' : 'No'}`);

  if (typeof window !== 'undefined') {
    console.log(`Hostname: ${window.location.hostname}`);
    console.log(`User Agent: ${navigator.userAgent}`);
  }
}

/**
 * Reset environment setup
 * This is mainly useful for testing
 */
export function resetEnvironmentSetup(): void {
  if (typeof window === 'undefined') return;

  // Reset initialization flag
  window.__BELLYFED_ENV_INITIALIZED = false;
}

/**
 * Check if environment has been initialized
 * 
 * @returns True if the environment has been initialized, false otherwise
 */
export function isEnvironmentInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.__BELLYFED_ENV_INITIALIZED;
}
