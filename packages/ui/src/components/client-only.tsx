'use client';

/**
 * Client-only Component
 * 
 * A component that only renders its children on the client-side.
 * Use this to wrap components that use browser APIs or have different
 * rendering between server and client.
 */

import * as React from 'react';

/**
 * ClientOnly props interface
 */
export interface ClientOnlyProps {
  /**
   * The content to render on the client-side
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback content to render during server-side rendering
   */
  fallback?: React.ReactNode;
  
  /**
   * Optional delay in milliseconds before rendering the children
   * Useful for components that need to wait for browser APIs to be available
   */
  delayMs?: number;
}

/**
 * ClientOnly component
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export function ClientOnly({
  children,
  fallback = null,
  delayMs = 0,
}: ClientOnlyProps): JSX.Element {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // If there's a delay, wait before setting isClient to true
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setIsClient(true);
      }, delayMs);
      
      return () => clearTimeout(timer);
    } else {
      setIsClient(true);
    }
  }, [delayMs]);

  return isClient ? <>{children}</> : <>{fallback}</>;
}

/**
 * withClientOnly higher-order component
 * 
 * Wraps a component to make it client-only
 * 
 * @param Component - The component to wrap
 * @param fallback - Optional fallback content
 * @param delayMs - Optional delay in milliseconds
 * @returns A new component that only renders on the client
 */
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = null,
  delayMs: number = 0
): React.FC<P> {
  const WithClientOnly: React.FC<P> = (props) => (
    <ClientOnly fallback={fallback} delayMs={delayMs}>
      <Component {...props} />
    </ClientOnly>
  );
  
  WithClientOnly.displayName = `withClientOnly(${Component.displayName || Component.name || 'Component'})`;
  
  return WithClientOnly;
}

/**
 * useIsClient hook
 * 
 * A hook that returns whether the code is running on the client
 * 
 * @param delayMs - Optional delay in milliseconds
 * @returns boolean indicating if the code is running on the client
 */
export function useIsClient(delayMs: number = 0): boolean {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    // If there's a delay, wait before setting isClient to true
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setIsClient(true);
      }, delayMs);
      
      return () => clearTimeout(timer);
    } else {
      setIsClient(true);
    }
  }, [delayMs]);
  
  return isClient;
}
