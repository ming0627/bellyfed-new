/**
 * ProtectedRoute Component
 *
 * This component protects routes that require authentication.
 * It checks if the user is authenticated and redirects to the sign-in page if not.
 * It also supports custom redirect paths and loading states.
 *
 * Unlike ClientOnlyAuth which just conditionally renders content,
 * ProtectedRoute handles navigation and redirects for entire routes.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@bellyfed/hooks';
import { shouldProtectPath } from '@bellyfed/utils';
import { LoadingSpinner } from '@bellyfed/ui';

/**
 * ProtectedRoute component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.redirectPath - Path to redirect to if not authenticated (default: '/signin')
 * @param {boolean} props.preserveReturnUrl - Whether to preserve the return URL in query params (default: true)
 * @param {React.ReactNode} props.loadingComponent - Custom loading component
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (optional)
 * @returns {JSX.Element|null} - Rendered component or null during redirect
 */
const ProtectedRoute = ({
  children,
  redirectPath = '/signin',
  preserveReturnUrl = true,
  loadingComponent,
  allowedRoles,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Skip auth check if authentication state is still loading
    if (isLoading) return;

    // Check if the current path should be protected
    const shouldProtect = shouldProtectPath(router.asPath);

    // If the path doesn't need protection, don't redirect
    if (!shouldProtect) {
      setIsCheckingAuth(false);
      return;
    }

    // If user is not authenticated, redirect to sign-in page
    if (!isAuthenticated) {
      // Build the redirect URL with return path if preserveReturnUrl is true
      let redirectTo = redirectPath;
      if (preserveReturnUrl) {
        const returnUrl = encodeURIComponent(router.asPath);
        redirectTo = `${redirectPath}?returnUrl=${returnUrl}`;
      }

      // Redirect to sign-in page
      router.replace(redirectTo);
      return;
    }

    // If roles are specified, check if user has the required role
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role));

      // If user doesn't have the required role, redirect to unauthorized page
      if (!hasRequiredRole) {
        router.replace('/unauthorized');
        return;
      }
    }

    // User is authenticated and has the required role, allow access
    setIsCheckingAuth(false);
  }, [
    router,
    isAuthenticated,
    isLoading,
    user,
    redirectPath,
    preserveReturnUrl,
    allowedRoles,
  ]);

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    // Use custom loading component if provided, otherwise use default
    return loadingComponent || (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
