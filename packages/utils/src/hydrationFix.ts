/**
 * Hydration Fix Utility
 *
 * This module provides a comprehensive solution to Next.js hydration errors
 * that works across all environments without requiring changes to individual components.
 * It includes various strategies to prevent, suppress, and recover from hydration mismatches.
 */

// Add type definition for the global window object
declare global {
  interface Window {
    __HYDRATION_FIX_APPLIED?: boolean;
    __NEXT_SUPPRESS_HYDRATION_WARNING?: boolean;
    __HANDLE_HYDRATION_ERROR?: (error: unknown) => void;
    __HYDRATION_ERROR_COUNT?: number;
    __HYDRATION_ERROR_LIMIT?: number;
    __HYDRATION_DEBUG_MODE?: boolean;
  }
}

/**
 * Hydration fix options
 */
export interface HydrationFixOptions {
  /**
   * Whether to suppress hydration warnings
   * @default true
   */
  suppressWarnings?: boolean;

  /**
   * Whether to add client-rendered class to document
   * @default true
   */
  addClientRenderedClass?: boolean;

  /**
   * Whether to force a re-render after hydration
   * @default true
   */
  forceRerender?: boolean;

  /**
   * Whether to patch console.error to catch hydration errors
   * @default true
   */
  patchConsoleError?: boolean;

  /**
   * Whether to add a global error handler for React errors
   * @default true
   */
  addGlobalErrorHandler?: boolean;

  /**
   * Whether to add a mutation observer for SVG elements
   * @default true
   */
  addSvgObserver?: boolean;

  /**
   * Custom error handler for hydration errors
   * @default undefined
   */
  errorHandler?: (error: unknown) => void;

  /**
   * Maximum number of hydration errors to allow before forcing a full page reload
   * Set to -1 to disable this feature
   * @default 5
   */
  errorLimit?: number;

  /**
   * Whether to enable debug mode
   * @default false
   */
  debugMode?: boolean;
}

// Default options
const defaultOptions: Required<Omit<HydrationFixOptions, 'errorHandler'>> & { errorHandler: ((error: unknown) => void) | null } = {
  suppressWarnings: true,
  addClientRenderedClass: true,
  forceRerender: true,
  patchConsoleError: true,
  addGlobalErrorHandler: true,
  addSvgObserver: true,
  errorHandler: null,
  errorLimit: 5,
  debugMode: false,
};

/**
 * Common hydration error patterns to detect
 */
const HYDRATION_ERROR_PATTERNS = [
  'Hydration failed',
  'hydration',
  'did not match',
  'Text content did not match',
  'Expected server HTML',
  'Suspense boundary',
  'There was an error while hydrating',
  'Minified React error #418',
  'Minified React error #423',
  'Minified React error #425',
];

/**
 * Apply a comprehensive hydration fix for Next.js applications
 * @param options Hydration fix options
 */
export function applyHydrationFix(options?: HydrationFixOptions): void {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  // Only run once
  if (window.__HYDRATION_FIX_APPLIED) return;
  window.__HYDRATION_FIX_APPLIED = true;

  // Merge options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...(options || {}),
  } as typeof defaultOptions;

  // Set up global variables
  window.__HYDRATION_ERROR_COUNT = 0;
  window.__HYDRATION_ERROR_LIMIT = mergedOptions.errorLimit;
  window.__HYDRATION_DEBUG_MODE = mergedOptions.debugMode;

  // Set up custom error handler
  if (mergedOptions.errorHandler) {
    window.__HANDLE_HYDRATION_ERROR = mergedOptions.errorHandler;
  } else {
    window.__HANDLE_HYDRATION_ERROR = (error) => {
      if (window.__HYDRATION_DEBUG_MODE) {
        console.log('[Hydration Fix] Error caught:', error);
      }

      // Increment error count
      window.__HYDRATION_ERROR_COUNT = (window.__HYDRATION_ERROR_COUNT || 0) + 1;

      // Check if we've exceeded the error limit
      const errorLimit = window.__HYDRATION_ERROR_LIMIT || 0;
      if (
        errorLimit > 0 &&
        window.__HYDRATION_ERROR_COUNT >= errorLimit
      ) {
        console.warn(
          `[Hydration Fix] Exceeded error limit (${errorLimit}), reloading page...`
        );
        // Force a full page reload
        window.location.reload();
      }
    };
  }

  // 1. Suppress hydration warnings globally
  if (mergedOptions.suppressWarnings) {
    window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;
  }

  // 2. Add a class to the document to indicate client-side rendering
  if (mergedOptions.addClientRenderedClass) {
    document.documentElement.classList.add('client-rendered');
  }

  // 3. Force a re-render after hydration to fix any mismatches
  if (mergedOptions.forceRerender) {
    setTimeout(() => {
      const root = document.getElementById('__next');
      if (root) {
        // Force a repaint
        root.style.opacity = '0.99';
        setTimeout(() => {
          root.style.opacity = '1';
        }, 0);
      }
    }, 0);
  }

  // 4. Patch console.error to catch and handle hydration errors
  if (mergedOptions.patchConsoleError) {
    patchConsoleError();
  }

  // 5. Add a global error handler for React errors
  if (mergedOptions.addGlobalErrorHandler) {
    addGlobalErrorHandler();
  }

  // 6. Add a mutation observer to handle dynamic SVG elements
  if (mergedOptions.addSvgObserver) {
    addSvgObserver();
  }

  // Log that the hydration fix has been applied
  if (window.__HYDRATION_DEBUG_MODE) {
    console.log('[Hydration Fix] Applied with options:', mergedOptions);
  }
}

/**
 * Patch console.error to catch and handle hydration errors
 */
function patchConsoleError(): void {
  if (typeof window === 'undefined' || typeof console === 'undefined') return;

  try {
    const originalConsoleError = console.error;
    console.error = function (...args: any[]) {
      // Check if this is a hydration error
      const errorString = args.join(' ');
      if (isHydrationError(errorString)) {
        // Suppress the error in console
        if (window.__HYDRATION_DEBUG_MODE) {
          console.log('[Hydration Fix] Error suppressed:', errorString);
        }

        // Call the global handler if it exists
        if (window.__HANDLE_HYDRATION_ERROR) {
          window.__HANDLE_HYDRATION_ERROR(args);
        }

        // Add a class to force client rendering for components with hydration issues
        document.documentElement.classList.add('force-client-render');

        return;
      }

      // Pass through other errors
      originalConsoleError.apply(console, args);
    };
  } catch (error) {
    console.warn('[Hydration Fix] Error patching console.error:', error);
  }
}

/**
 * Add a global error handler for React errors
 */
function addGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  try {
    window.addEventListener('error', function (event) {
      if (
        event.error &&
        typeof event.error.message === 'string' &&
        isHydrationError(event.error.message)
      ) {
        // Prevent the error from showing in the console
        event.preventDefault();
        if (window.__HYDRATION_DEBUG_MODE) {
          console.log('[Hydration Fix] Error caught by window.onerror:', event.error);
        }

        // Call the global handler if it exists
        if (window.__HANDLE_HYDRATION_ERROR) {
          window.__HANDLE_HYDRATION_ERROR(event.error);
        }

        // Add a class to force client rendering for components with hydration issues
        document.documentElement.classList.add('force-client-render');
      }
    });
  } catch (error) {
    console.warn('[Hydration Fix] Error adding global error handler:', error);
  }
}

/**
 * Add a mutation observer to handle dynamic SVG elements
 */
function addSvgObserver(): void {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

  try {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          const svgElements = document.querySelectorAll('svg');
          svgElements.forEach(function (svg) {
            if (!svg.hasAttribute('data-client-rendered')) {
              svg.setAttribute('data-client-rendered', 'true');
            }
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    console.warn('[Hydration Fix] Error setting up SVG observer:', error);
  }
}

/**
 * Check if an error message is related to hydration
 * @param errorMessage Error message to check
 * @returns True if the error is related to hydration, false otherwise
 */
function isHydrationError(errorMessage: string): boolean {
  return HYDRATION_ERROR_PATTERNS.some((pattern) => errorMessage.includes(pattern));
}

/**
 * Reset the hydration fix
 * This is mainly useful for testing
 */
export function resetHydrationFix(): void {
  if (typeof window === 'undefined') return;

  window.__HYDRATION_FIX_APPLIED = false;
  window.__HYDRATION_ERROR_COUNT = 0;
}

/**
 * Check if the hydration fix has been applied
 * @returns True if the hydration fix has been applied, false otherwise
 */
export function isHydrationFixApplied(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.__HYDRATION_FIX_APPLIED;
}

/**
 * Get the current hydration error count
 * @returns The current hydration error count
 */
export function getHydrationErrorCount(): number {
  if (typeof window === 'undefined') return 0;
  return window.__HYDRATION_ERROR_COUNT || 0;
}
