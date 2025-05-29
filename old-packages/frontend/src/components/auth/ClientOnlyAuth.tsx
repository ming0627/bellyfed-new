'use client';

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ClientOnlyAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children on the client side
 * and only if the user is authenticated. This prevents hydration errors
 * with next-auth during static export.
 */
export default function ClientOnlyAuth({
  children,
  fallback = <div>Please sign in to access this content</div>,
  loadingComponent = <div>Loading...</div>,
}: ClientOnlyAuthProps): JSX.Element {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Only run on client side
  useEffect(() => {
    setIsClient(true);

    // Handle unauthenticated state - moved inside the main useEffect to avoid conditional hooks
    if (isClient && !session && status !== 'loading') {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1500);

      return () => clearTimeout(timer);
    }

    // Return a no-op cleanup function for other cases
    return () => {};
  }, [isClient, router, session, status]);

  // If we're still on the server or loading, render a loading placeholder
  if (!isClient || status === 'loading') {
    return <>{loadingComponent}</>;
  }

  // Handle unauthenticated state
  if (!session) {
    return <>{fallback}</>;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
