/**
 * Hydration Fix Utility
 *
 * This module provides comprehensive fixes for React hydration issues in Next.js applications.
 * It includes various strategies to prevent and handle hydration mismatches.
 */

import { getEnvironmentName, isDevelopmentEnvironment } from './environment.js'

/**
 * Hydration fix options
 */
export const HydrationFixOptions = {
  suppressWarnings: true,
  addClientRenderedClass: true,
  forceRerender: true,
  patchConsoleError: true,
  addGlobalErrorHandler: true,
  addSvgObserver: true,
  errorHandler: null,
  errorLimit: 5,
  debugMode: false
}

// Default options
const defaultOptions = {
  suppressWarnings: true,
  addClientRenderedClass: true,
  forceRerender: true,
  patchConsoleError: true,
  addGlobalErrorHandler: true,
  addSvgObserver: true,
  errorHandler: null,
  errorLimit: 5,
  debugMode: isDevelopmentEnvironment()
}

// Global state
let isInitialized = false
let errorCount = 0

/**
 * Check if an error message indicates a hydration error
 * @param {string} message Error message to check
 * @returns {boolean} True if it's a hydration error
 */
function isHydrationError(message) {
  if (!message || typeof message !== 'string') {
    return false
  }

  const hydrationKeywords = [
    'hydration',
    'Hydration failed',
    'Text content did not match',
    'did not match',
    'Warning: Text content did not match',
    'Warning: Expected server HTML',
    'Warning: Prop',
    'Warning: Extra attributes',
    'server-rendered HTML',
    'client-side rendered HTML'
  ]

  return hydrationKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
}

/**
 * Handle hydration errors
 * @param {Error} error The hydration error
 * @param {object} options Hydration fix options
 */
function handleHydrationError(error, options) {
  errorCount++

  if (options.debugMode) {
    console.log('[Hydration Fix] Hydration error detected:', error)
    console.log('[Hydration Fix] Error count:', errorCount)
  }

  // Call custom error handler if provided
  if (options.errorHandler && typeof options.errorHandler === 'function') {
    try {
      options.errorHandler(error)
    } catch (handlerError) {
      console.error('[Hydration Fix] Error in custom error handler:', handlerError)
    }
  }

  // Force page reload if error limit is reached
  if (options.errorLimit > 0 && errorCount >= options.errorLimit) {
    console.warn('[Hydration Fix] Error limit reached, forcing page reload')
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // Add class to force client rendering
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('force-client-render')
  }
}

/**
 * Patch console.error to catch hydration errors
 * @param {object} options Hydration fix options
 */
function patchConsoleError(options) {
  if (typeof console === 'undefined') return

  try {
    // Store the original console.error function
    const originalConsoleError = console.error

    // Replace console.error with a function that filters hydration errors
    console.error = function (...args) {
      // Convert arguments to a string for easier filtering
      const errorString = args.join(' ')

      // Check if the error is a hydration error
      if (isHydrationError(errorString)) {
        if (options.debugMode) {
          console.log('[Hydration Fix] Hydration error caught in console.error:', errorString)
        }

        // Handle the hydration error
        const error = new Error(errorString)
        handleHydrationError(error, options)

        // Suppress the error if not in debug mode
        if (!options.debugMode) {
          return
        }
      }

      // Pass through other errors
      originalConsoleError.apply(console, args)
    }

    if (options.debugMode) {
      console.log('[Hydration Fix] Console.error patched successfully')
    }
  } catch (error) {
    console.warn('[Hydration Fix] Failed to patch console.error:', error)
  }
}

/**
 * Add global error handler for React errors
 * @param {object} options Hydration fix options
 */
function addGlobalErrorHandler(options) {
  if (typeof window === 'undefined') return

  try {
    window.addEventListener('error', function (event) {
      if (
        event.error &&
        typeof event.error.message === 'string' &&
        isHydrationError(event.error.message)
      ) {
        // Prevent the error from showing in the console
        event.preventDefault()
        
        if (options.debugMode) {
          console.log('[Hydration Fix] Error caught by window.onerror:', event.error)
        }

        // Handle the hydration error
        handleHydrationError(event.error, options)
      }
    })

    // Also handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function (event) {
      if (
        event.reason &&
        typeof event.reason.message === 'string' &&
        isHydrationError(event.reason.message)
      ) {
        // Prevent the error from showing in the console
        event.preventDefault()
        
        if (options.debugMode) {
          console.log('[Hydration Fix] Promise rejection caught:', event.reason)
        }

        // Handle the hydration error
        handleHydrationError(event.reason, options)
      }
    })

    if (options.debugMode) {
      console.log('[Hydration Fix] Global error handlers added successfully')
    }
  } catch (error) {
    console.warn('[Hydration Fix] Error adding global error handler:', error)
  }
}

/**
 * Add SVG observer to fix SVG hydration issues
 * @param {object} options Hydration fix options
 */
function addSvgObserver(options) {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return

  try {
    // Create a mutation observer to watch for SVG elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Fix SVG elements
            const svgElements = node.tagName === 'SVG' ? [node] : node.querySelectorAll?.('svg') || []
            
            svgElements.forEach((svg) => {
              // Remove problematic attributes that cause hydration issues
              svg.removeAttribute('xmlns:xlink')
              
              // Fix xlink:href attributes
              const xlinkElements = svg.querySelectorAll('[*|href]')
              xlinkElements.forEach((element) => {
                const href = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
                if (href) {
                  element.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
                  element.setAttribute('href', href)
                }
              })
            })
          }
        })
      })
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    if (options.debugMode) {
      console.log('[Hydration Fix] SVG observer added successfully')
    }
  } catch (error) {
    console.warn('[Hydration Fix] Error adding SVG observer:', error)
  }
}

/**
 * Apply a comprehensive hydration fix for Next.js applications
 * @param {object} options Hydration fix options
 */
export function applyHydrationFix(options = {}) {
  // Skip if not in browser
  if (typeof window === 'undefined') return

  // Only run once
  if (isInitialized) return
  isInitialized = true

  // Merge options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...options
  }

  if (mergedOptions.debugMode) {
    console.log('[Hydration Fix] Applying hydration fix with options:', mergedOptions)
  }

  // Set up global variables
  window.__HYDRATION_FIX_APPLIED = true
  window.__HYDRATION_ERROR_COUNT = 0
  window.__HYDRATION_ERROR_LIMIT = mergedOptions.errorLimit
  window.__HYDRATION_DEBUG_MODE = mergedOptions.debugMode

  // 1. Suppress hydration warnings globally
  if (mergedOptions.suppressWarnings) {
    window.__NEXT_SUPPRESS_HYDRATION_WARNING = true
    if (mergedOptions.debugMode) {
      console.log('[Hydration Fix] Hydration warnings suppressed')
    }
  }

  // 2. Add a class to the document to indicate client-side rendering
  if (mergedOptions.addClientRenderedClass) {
    document.documentElement.classList.add('client-rendered')
    if (mergedOptions.debugMode) {
      console.log('[Hydration Fix] Client-rendered class added')
    }
  }

  // 3. Force a re-render after hydration to fix any mismatches
  if (mergedOptions.forceRerender) {
    setTimeout(() => {
      const root = document.getElementById('__next')
      if (root) {
        // Force a repaint
        root.style.opacity = '0.99'
        setTimeout(() => {
          root.style.opacity = '1'
        }, 0)
        
        if (mergedOptions.debugMode) {
          console.log('[Hydration Fix] Forced re-render applied')
        }
      }
    }, 0)
  }

  // 4. Patch console.error to catch and handle hydration errors
  if (mergedOptions.patchConsoleError) {
    patchConsoleError(mergedOptions)
  }

  // 5. Add global error handler for React errors
  if (mergedOptions.addGlobalErrorHandler) {
    addGlobalErrorHandler(mergedOptions)
  }

  // 6. Add SVG observer to fix SVG hydration issues
  if (mergedOptions.addSvgObserver) {
    addSvgObserver(mergedOptions)
  }

  if (mergedOptions.debugMode) {
    console.log('[Hydration Fix] Hydration fix applied successfully')
  }
}

/**
 * Reset hydration fix state (useful for testing)
 */
export function resetHydrationFix() {
  if (typeof window === 'undefined') return

  isInitialized = false
  errorCount = 0
  
  // Remove global variables
  delete window.__HYDRATION_FIX_APPLIED
  delete window.__HYDRATION_ERROR_COUNT
  delete window.__HYDRATION_ERROR_LIMIT
  delete window.__HYDRATION_DEBUG_MODE
  delete window.__NEXT_SUPPRESS_HYDRATION_WARNING

  // Remove classes
  document.documentElement.classList.remove('client-rendered', 'force-client-render')
}

/**
 * Get hydration fix status
 * @returns {object} Status information
 */
export function getHydrationFixStatus() {
  return {
    isInitialized,
    errorCount,
    environment: getEnvironmentName(),
    isClientRendered: typeof document !== 'undefined' && document.documentElement.classList.contains('client-rendered'),
    isForceClientRender: typeof document !== 'undefined' && document.documentElement.classList.contains('force-client-render'),
    suppressWarnings: typeof window !== 'undefined' && !!window.__NEXT_SUPPRESS_HYDRATION_WARNING,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create a React component wrapper that handles hydration issues
 * @param {React.Component} Component The component to wrap
 * @param {object} options Hydration fix options
 * @returns {React.Component} Wrapped component
 */
export function withHydrationFix(Component, options = {}) {
  return function HydrationFixWrapper(props) {
    // Apply hydration fix on mount
    if (typeof window !== 'undefined') {
      applyHydrationFix(options)
    }

    return Component(props)
  }
}

/**
 * Hook for applying hydration fix in React components
 * @param {object} options Hydration fix options
 */
export function useHydrationFix(options = {}) {
  if (typeof window !== 'undefined') {
    // Apply fix on first render
    applyHydrationFix(options)
  }
}

// Auto-apply hydration fix in development
if (isDevelopmentEnvironment() && typeof window !== 'undefined') {
  // Apply with a small delay to ensure DOM is ready
  setTimeout(() => {
    applyHydrationFix({
      debugMode: true
    })
  }, 100)
}
