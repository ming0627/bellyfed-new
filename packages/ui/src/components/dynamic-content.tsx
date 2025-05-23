'use client';

/**
 * Dynamic Content Component
 *
 * A component that handles hydration errors by only rendering content on the client side.
 * This is a more aggressive approach than ClientOnly for components that consistently cause hydration errors.
 */

import * as React from 'react';

import { cn } from '../utils.js';

/**
 * DynamicContent props interface
 */
export interface DynamicContentProps {
  /**
   * The content to render on the client side
   */
  children: React.ReactNode;

  /**
   * Optional fallback content to render during SSR
   */
  fallback?: React.ReactNode;

  /**
   * Whether to suppress hydration warnings
   */
  suppressHydrationWarning?: boolean;

  /**
   * Optional delay in milliseconds before rendering the children
   */
  delayMs?: number;

  /**
   * Additional class name for the wrapper
   */
  className?: string;

  /**
   * Whether to preserve the space during SSR
   */
  preserveSpace?: boolean;

  /**
   * Minimum height of the wrapper during SSR
   */
  minHeight?: string | number;

  /**
   * Minimum width of the wrapper during SSR
   */
  minWidth?: string | number;

  /**
   * Whether to use a div wrapper (true) or render children directly (false)
   */
  useWrapper?: boolean;
}

/**
 * DynamicContent component
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function DynamicContent({
  children,
  fallback = null,
  suppressHydrationWarning = true,
  delayMs = 0,
  className,
  preserveSpace = true,
  minHeight = '1px',
  minWidth = '1px',
  useWrapper = true,
}: DynamicContentProps): JSX.Element {
  const [isClient, setIsClient] = React.useState(false);
  const [isDelayComplete, setIsDelayComplete] = React.useState(delayMs === 0);

  React.useEffect(() => {
    setIsClient(true);

    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setIsDelayComplete(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  // During SSR and initial client render, render a div with suppressHydrationWarning
  if (!isClient || !isDelayComplete) {
    return (
      <div
        suppressHydrationWarning={suppressHydrationWarning}
        style={preserveSpace ? { minHeight, minWidth } : undefined}
        className={className}
        data-dynamic-content-fallback=""
      >
        {fallback}
      </div>
    );
  }

  // On client, wrap the children in a div with suppressHydrationWarning if useWrapper is true
  if (useWrapper) {
    return (
      <div
        suppressHydrationWarning={suppressHydrationWarning}
        className={className}
        data-dynamic-content=""
      >
        {children}
      </div>
    );
  }

  // Otherwise, render children directly
  return <>{children}</>;
}

/**
 * withDynamicContent higher-order component
 *
 * Wraps a component to make it dynamic
 *
 * @param Component - The component to wrap
 * @param options - Options for the dynamic content
 * @returns A new component that only renders on the client
 */
export function withDynamicContent<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<DynamicContentProps, 'children'> = {}
): React.FC<P> {
  const WithDynamicContent: React.FC<P> = (props) => (
    <DynamicContent {...options}>
      <Component {...props} />
    </DynamicContent>
  );

  WithDynamicContent.displayName = `withDynamicContent(${Component.displayName || Component.name || 'Component'})`;

  return WithDynamicContent;
}

/**
 * DynamicScript props interface
 */
export interface DynamicScriptProps {
  /**
   * The script content
   */
  content: string;

  /**
   * Whether to suppress hydration warnings
   */
  suppressHydrationWarning?: boolean;

  /**
   * The type of the script
   */
  type?: string;

  /**
   * Whether to run the script asynchronously
   */
  async?: boolean;

  /**
   * Whether to defer the script execution
   */
  defer?: boolean;

  /**
   * Additional attributes for the script tag
   */
  [key: string]: unknown;
}

/**
 * DynamicScript component
 *
 * A component that safely injects a script on the client side
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function DynamicScript({
  content,
  suppressHydrationWarning = true,
  type = 'text/javascript',
  async = false,
  defer = false,
  ...props
}: DynamicScriptProps): JSX.Element {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the script on the client side
  if (!isClient) {
    return <div suppressHydrationWarning={suppressHydrationWarning} />;
  }

  // Create a script element with the provided content
  return (
    <script
      suppressHydrationWarning={suppressHydrationWarning}
      type={type}
      async={async}
      defer={defer}
      dangerouslySetInnerHTML={{ __html: content }}
      {...props}
    />
  );
}

/**
 * DynamicHTML props interface
 */
export interface DynamicHTMLProps {
  /**
   * The HTML content
   */
  html: string;

  /**
   * Whether to suppress hydration warnings
   */
  suppressHydrationWarning?: boolean;

  /**
   * Additional class name for the wrapper
   */
  className?: string;

  /**
   * The tag to use for the wrapper
   */
  as?: keyof JSX.IntrinsicElements;

  /**
   * Additional props for the wrapper
   */
  [key: string]: unknown;
}

/**
 * DynamicHTML component
 *
 * A component that safely renders HTML content on the client side
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function DynamicHTML({
  html,
  suppressHydrationWarning = true,
  className,
  as: Tag = 'div',
  ...props
}: DynamicHTMLProps): JSX.Element {
  return (
    <DynamicContent suppressHydrationWarning={suppressHydrationWarning}>
      <Tag
        className={cn('dynamic-html', className)}
        dangerouslySetInnerHTML={{ __html: html }}
        {...props}
      />
    </DynamicContent>
  );
}
