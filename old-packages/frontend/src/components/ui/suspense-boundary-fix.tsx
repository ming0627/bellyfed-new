'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { ClientOnly } from './client-only';

interface SuspenseBoundaryFixProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SuspenseBoundaryFix component that handles hydration errors in Suspense boundaries
 * by ensuring they only render on the client side.
 *
 * This component is specifically designed to fix the error:
 * "Error: There was an error while hydrating this Suspense boundary. Switched to client rendering."
 */
export function SuspenseBoundaryFix({
  children,
  fallback = <div>Loading...</div>,
}: SuspenseBoundaryFixProps): React.ReactElement {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Add attribute to help with CSS targeting
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('suspense-boundary-fixed');
    }

    return () => {
      // Clean up
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('suspense-boundary-fixed');
      }
    };
  }, []);

  // Error handler for the Suspense boundary
  const handleError = (error: Error): React.ReactNode => {
    console.log('Suspense boundary error caught:', error);
    setHasError(true);

    // Call the global handler if it exists
    if (typeof window !== 'undefined' && window.__HANDLE_HYDRATION_ERROR) {
      window.__HANDLE_HYDRATION_ERROR(error);
    }

    return null;
  };

  // If we're on the server or initial client render, use a simple fallback
  if (!isClient) {
    return (
      <div data-suspense-boundary="true" suppressHydrationWarning>
        {fallback}
      </div>
    );
  }

  // If there was an error, render the children directly without Suspense
  if (hasError) {
    return (
      <div data-client-fallback="true" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // On client, wrap with error handling and Suspense
  return (
    <ClientOnly fallback={fallback}>
      <ErrorBoundary onError={handleError}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </ErrorBoundary>
    </ClientOnly>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => React.ReactNode;
}> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.onError(this.state.error!);
    }
    return this.props.children;
  }
}

// Add
export default SuspenseBoundaryFix;
