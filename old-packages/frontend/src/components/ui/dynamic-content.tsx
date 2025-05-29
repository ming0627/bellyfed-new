'use client';

import React, { useEffect, useState } from 'react';

interface DynamicContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

/**
 * DynamicContent component that handles hydration errors by:
 * 1. Only rendering content on the client side
 * 2. Suppressing hydration warnings
 * 3. Providing a fallback during server-side rendering
 *
 * This is a more aggressive approach than ClientOnly for components
 * that consistently cause hydration errors.
 */
export function DynamicContent({
  children,
  fallback = null,
  suppressHydrationWarning = true,
}: DynamicContentProps): React.ReactElement {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial client render, render a div with suppressHydrationWarning
  if (!isClient) {
    return (
      <div
        suppressHydrationWarning={suppressHydrationWarning}
        style={{ minHeight: '1px', minWidth: '1px' }}
      >
        {fallback}
      </div>
    );
  }

  // On client, wrap the children in a div with suppressHydrationWarning
  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>{children}</div>
  );
}
