/**
 * Global environment handler
 *
 * This file contains a single function that handles environment-specific setup.
 * It's imported and called once in _app.tsx, eliminating the need for environment
 * checks throughout the codebase.
 */

// Add type declaration for Next.js hydration warning property
declare global {
  interface Window {
    __NEXT_SUPPRESS_HYDRATION_WARNING?: boolean;
  }
}

/**
 * Sets up the application environment
 * Call this once at application startup
 */
export function setupEnvironment(): void {
  if (typeof window === 'undefined') return;

  // Detect environment
  // We can use NODE_ENV to determine if we're in production if needed in the future
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    window.location.hostname.includes('bellyfed.com');

  // Add a single class to the HTML element
  if (isProduction) {
    document.documentElement.classList.add('production');
  } else {
    document.documentElement.classList.add('local-dev');
  }

  // Set up global hydration error handler
  window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;

  // Add a single global error handler for hydration errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const errorString = args.join(' ');
    if (
      errorString.includes('Hydration failed') ||
      errorString.includes('hydration') ||
      errorString.includes('did not match')
    ) {
      // For hydration errors, just suppress them
      return;
    }
    // Pass through other errors
    originalConsoleError.apply(console, args);
  };
}
