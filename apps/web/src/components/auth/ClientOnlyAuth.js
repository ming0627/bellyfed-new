/**
 * ClientOnlyAuth Component
 * 
 * This component provides a way to render content only on the client side based on authentication status.
 * It's useful for components that should only be rendered when the user is authenticated or unauthenticated,
 * and only on the client side to prevent hydration errors.
 * 
 * It uses Next.js dynamic imports with ssr: false to ensure the component is only rendered on the client.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@bellyfed/hooks';
import dynamic from 'next/dynamic';

/**
 * The actual content component that will be dynamically imported
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - Whether authentication is required to render children
 * @param {React.ReactNode} props.fallback - Content to render when authentication requirement is not met
 * @returns {JSX.Element|null} - Rendered component or null
 */
const AuthContent = ({ children, requireAuth, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Only render on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during loading or if not mounted yet
  if (isLoading || !mounted) {
    return null;
  }

  // Render children if authentication status matches requirement
  if (requireAuth === isAuthenticated) {
    return <>{children}</>;
  }

  // Render fallback if provided, otherwise null
  return fallback ? <>{fallback}</> : null;
};

/**
 * Client-only version of the AuthContent component
 * This ensures the component is only rendered on the client side
 */
const ClientOnlyAuthContent = dynamic(() => Promise.resolve(AuthContent), {
  ssr: false,
});

/**
 * ClientOnlyAuth component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - Whether authentication is required to render children (default: true)
 * @param {React.ReactNode} props.fallback - Content to render when authentication requirement is not met
 * @returns {JSX.Element} - Rendered component
 */
const ClientOnlyAuth = ({ children, requireAuth = true, fallback }) => {
  return (
    <ClientOnlyAuthContent
      requireAuth={requireAuth}
      fallback={fallback}
    >
      {children}
    </ClientOnlyAuthContent>
  );
};

export default ClientOnlyAuth;
