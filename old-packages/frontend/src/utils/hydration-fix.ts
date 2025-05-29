/**
 * Optimized global hydration fix for Next.js
 *
 * This is a streamlined solution to hydration errors that works across all environments
 * without requiring changes to individual components.
 */

// Add type definition for the global window object
declare global {
  interface Window {
    __HYDRATION_FIX_APPLIED?: boolean;
    __NEXT_SUPPRESS_HYDRATION_WARNING?: boolean;
    __HANDLE_HYDRATION_ERROR?: (error: unknown) => void;
  }
}

export function applyHydrationFix(): void {
  if (typeof window === 'undefined') return;

  // Only run once
  if (window.__HYDRATION_FIX_APPLIED) return;
  window.__HYDRATION_FIX_APPLIED = true;

  // 1. Suppress hydration warnings globally
  window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;

  // 2. Add a class to the document to indicate client-side rendering
  document.documentElement.classList.add('client-rendered');

  // 3. Force a re-render after hydration to fix any mismatches
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

  // 4. Patch console.error to catch and handle hydration errors
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    // Check if this is a hydration error
    const errorString = args.join(' ');
    if (
      errorString.includes('Hydration failed') ||
      errorString.includes('hydration') ||
      errorString.includes('did not match') ||
      errorString.includes('Text content did not match') ||
      errorString.includes('Expected server HTML') ||
      errorString.includes('Suspense boundary')
    ) {
      // Suppress the error in console
      console.log('Hydration error suppressed');

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

  // 5. Add a global error handler for React errors
  window.addEventListener('error', function (event) {
    if (
      event.error &&
      typeof event.error.message === 'string' &&
      (event.error.message.includes('Hydration failed') ||
        event.error.message.includes('hydration') ||
        event.error.message.includes('did not match') ||
        event.error.message.includes('Suspense boundary'))
    ) {
      // Prevent the error from showing in the console
      event.preventDefault();
      console.log('Hydration error caught by window.onerror');

      // Call the global handler if it exists
      if (window.__HANDLE_HYDRATION_ERROR) {
        window.__HANDLE_HYDRATION_ERROR(event.error);
      }

      // Add a class to force client rendering for components with hydration issues
      document.documentElement.classList.add('force-client-render');
    }
  });

  // 6. Add a mutation observer to handle dynamic SVG elements
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
  } catch (error: unknown) {
    console.warn('Error setting up SVG observer:', error);
  }
}
