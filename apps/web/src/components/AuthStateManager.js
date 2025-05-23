/**
 * AuthStateManager Component
 *
 * This component manages authentication state and handles redirects based on authentication status.
 * It uses the useCognitoUser hook to access authentication state and the authRedirect utilities to handle redirects.
 *
 * The component doesn't render anything visible - it just manages authentication state and redirects.
 * It also handles token refresh to maintain the user's session.
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useCognitoUser } from '@bellyfed/hooks';
import { handleAuthRedirect } from '@bellyfed/utils';
import { cognitoAuthService } from '@bellyfed/services';

// Token refresh interval in milliseconds (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

/**
 * AuthStateManager component
 *
 * @returns {null} This component doesn't render anything
 */
const AuthStateManager = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUser } = useCognitoUser();

  // Handle token refresh at regular intervals
  useEffect(() => {
    // Skip token refresh if not authenticated
    if (!isAuthenticated) return;

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        // Attempt to refresh tokens
        const refreshed = await cognitoAuthService.refreshTokens();

        // If tokens were refreshed successfully, update user data
        if (refreshed) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshUser]);

  // Handle authentication redirects when authentication state changes
  useEffect(() => {
    // Skip redirect handling while authentication state is loading
    if (isLoading) return;

    // Handle redirects based on authentication status
    handleAuthRedirect(router, isAuthenticated, {
      // Default path to redirect to after authentication
      defaultPath: `/${router.query.country || 'my'}`,
      // Default path to redirect to after logout
      logoutPath: '/signin',
    });
  }, [router, isAuthenticated, isLoading]);

  // This component doesn't render anything visible
  return null;
};

export default AuthStateManager;
