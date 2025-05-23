'use client';

/**
 * Hydration Error Boundary Component
 * 
 * A component that catches hydration errors and renders a fallback UI.
 * This is a more aggressive approach than DynamicContent for components that consistently cause hydration errors.
 */

import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Extend the Window interface to include the global error handler
 */
declare global {
  interface Window {
    __HANDLE_HYDRATION_ERROR?: (error: Error) => void;
  }
}

/**
 * HydrationErrorBoundary props interface
 */
export interface HydrationErrorBoundaryProps {
  /**
   * The content to render
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback content to render when an error occurs
   */
  fallback?: React.ReactNode;
  
  /**
   * Whether to log errors to the console
   */
  logErrors?: boolean;
  
  /**
   * Whether to preserve the space when an error occurs
   */
  preserveSpace?: boolean;
  
  /**
   * Minimum height of the fallback
   */
  minHeight?: string | number;
  
  /**
   * Minimum width of the fallback
   */
  minWidth?: string | number;
  
  /**
   * Additional class name for the fallback
   */
  fallbackClassName?: string;
  
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /**
   * Whether to only catch hydration errors
   */
  onlyHydrationErrors?: boolean;
}

/**
 * HydrationErrorBoundary state interface
 */
export interface HydrationErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred
   */
  error: Error | null;
  
  /**
   * Whether the error is a hydration error
   */
  isHydrationError: boolean;
}

/**
 * Check if an error is a hydration error
 * 
 * @param error - The error to check
 * @returns Whether the error is a hydration error
 */
export function isHydrationError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  
  return (
    errorMessage.includes('hydration') ||
    errorMessage.includes('hydration failed') ||
    errorMessage.includes('did not match') ||
    errorMessage.includes('text content did not match') ||
    errorMessage.includes('expected server html') ||
    errorMessage.includes('suspense boundary') ||
    errorMessage.includes('client and server rendered') ||
    errorMessage.includes('client and server html') ||
    errorMessage.includes('mismatch')
  );
}

/**
 * HydrationErrorBoundary component
 * 
 * A component that catches hydration errors and renders a fallback UI.
 */
export class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  /**
   * Constructor
   * 
   * @param props - Component props
   */
  constructor(props: HydrationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isHydrationError: false,
    };
  }

  /**
   * Get derived state from error
   * 
   * @param error - The error that occurred
   * @returns The new state
   */
  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Check if this is a hydration error
    const isHydrationErrorResult = isHydrationError(error);

    // Only update state for hydration errors if onlyHydrationErrors is true
    if (isHydrationErrorResult) {
      return {
        hasError: true,
        error,
        isHydrationError: true,
      };
    }

    // For other errors, return state based on onlyHydrationErrors
    return {
      hasError: true,
      error,
      isHydrationError: false,
    };
  }

  /**
   * Component did catch
   * 
   * @param error - The error that occurred
   * @param errorInfo - Information about the error
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { logErrors = true, onError, onlyHydrationErrors = true } = this.props;
    const { isHydrationError } = this.state;
    
    // If we're only handling hydration errors and this isn't one, rethrow
    if (onlyHydrationErrors && !isHydrationError) {
      throw error;
    }
    
    // Log the error to the console if enabled
    if (logErrors) {
      if (isHydrationError) {
        console.log('Hydration error caught and handled:', error.message);
      } else {
        console.error('HydrationErrorBoundary caught an error:', error, errorInfo);
      }
    }

    // Call the onError callback if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Call the global handler if it exists
    if (typeof window !== 'undefined' && window.__HANDLE_HYDRATION_ERROR) {
      window.__HANDLE_HYDRATION_ERROR(error);

      // Add environment-specific error handling
      if (process.env.NODE_ENV === 'production') {
        // Production-specific error handling
      } else {
        // Development-specific error handling
      }
    }
  }

  /**
   * Render
   * 
   * @returns The rendered component
   */
  render(): React.ReactNode {
    const { 
      children, 
      fallback, 
      preserveSpace = true, 
      minHeight = '1px', 
      minWidth = '1px',
      fallbackClassName,
      onlyHydrationErrors = true
    } = this.props;
    const { hasError, isHydrationError } = this.state;
    
    // If we have an error
    if (hasError) {
      // If we're only handling hydration errors and this isn't one, don't render fallback
      if (onlyHydrationErrors && !isHydrationError) {
        return children;
      }
      
      // Render fallback UI if provided, otherwise render a minimal div
      if (fallback) {
        return fallback;
      }
      
      // Render a minimal div
      return (
        <div 
          className={cn('hydration-error-fallback', fallbackClassName)}
          style={preserveSpace ? { minHeight, minWidth } : undefined}
          data-hydration-error-fallback=""
        />
      );
    }

    // Otherwise, render children
    return children;
  }
}

/**
 * withHydrationErrorBoundary higher-order component
 * 
 * @param Component - The component to wrap
 * @param options - Options for the hydration error boundary
 * @returns A new component wrapped in a hydration error boundary
 */
export function withHydrationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<HydrationErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const WithHydrationErrorBoundary: React.FC<P> = (props) => (
    <HydrationErrorBoundary {...options}>
      <Component {...props} />
    </HydrationErrorBoundary>
  );
  
  WithHydrationErrorBoundary.displayName = `withHydrationErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WithHydrationErrorBoundary;
}

/**
 * Default export
 */
export default HydrationErrorBoundary;
