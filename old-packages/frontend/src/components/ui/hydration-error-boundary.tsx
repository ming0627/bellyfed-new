'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface HydrationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface HydrationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * HydrationErrorBoundary component that catches hydration errors and renders a fallback UI.
 * This is a more aggressive approach than DynamicContent for components that consistently cause hydration errors.
 */
class HydrationErrorBoundary extends Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Check if this is a hydration error
    const isHydrationError =
      error.message.includes('hydration') ||
      error.message.includes('Hydration failed') ||
      error.message.includes('did not match') ||
      error.message.includes('Text content did not match') ||
      error.message.includes('Expected server HTML') ||
      error.message.includes('Suspense boundary');

    // Only update state for hydration errors
    if (isHydrationError) {
      // Log the error but don't crash the app
      console.log('Hydration error caught and handled:', error.message);
      return {
        hasError: true,
        error,
      };
    }

    // For other errors, rethrow
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('HydrationErrorBoundary caught an error:', error, errorInfo);

    // Call the global handler if it exists
    if (typeof window !== 'undefined' && window.__HANDLE_HYDRATION_ERROR) {
      window.__HANDLE_HYDRATION_ERROR(error);

      // Add environment-specific error handling
      if (process.env.NODE_ENV === 'production') {
        console.log('Applying production specific error handling');
        // You could add production specific error handling here
        // For example, you might want to reload the page or show a specific error message
      } else {
        console.log('Applying local development error handling');
        // In development, we might want more verbose error information
      }
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise render a minimal div
      return (
        this.props.fallback || (
          <div style={{ minHeight: '1px', minWidth: '1px' }}></div>
        )
      );
    }

    // Otherwise, render children
    return this.props.children;
  }
}

// Type definition for the global window object is in hydration-fix.ts

export default HydrationErrorBoundary;
